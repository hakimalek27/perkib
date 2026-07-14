import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isStafGateAuthenticated } from "@/lib/staf-gate";
import { searchStafLain } from "@/lib/staf-lain";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESULTS = 30;

export async function GET(req: Request) {
  // Guard berlapis: admin dahulu, kemudian gate staf.
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "admin" }, { status: 401 });
  }
  if (!(await isStafGateAuthenticated())) {
    return NextResponse.json({ error: "gate" }, { status: 401 });
  }

  // Anti-scrape: had kadar longgar (carian interaktif) tetapi menghalang muat pukal.
  const ip = clientIp(req);
  const rl = rateLimit(`staf-cari:${ip}`, { capacity: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak carian. Perlahan sedikit." },
      { status: 429, headers: { "Retry-After": "5" } }
    );
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json(
      { results: [], total: 0 },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  }

  const { results, total } = searchStafLain(q, MAX_RESULTS);
  // Projeksi selamat: JANGAN dedah photoFile (nama fail cakera); hantar hasPhoto sahaja.
  const safe = results.map((s) => ({
    employeeNo: s.employeeNo,
    nama: s.nama,
    noKp: s.noKp,
    noTel: s.noTel,
    emel: s.emel,
    gred: s.gred,
    jawatan: s.jawatan,
    bahagian: s.bahagian,
    hasPhoto: Boolean(s.photoFile),
  }));

  return NextResponse.json(
    { results: safe, total, capped: total > MAX_RESULTS },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
