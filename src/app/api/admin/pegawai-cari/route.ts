import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { searchPegawaiAdmin } from "@/lib/admin-data";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESULTS = 30;

// Carian pegawai (Imam/Bilal) termasuk telefon (dekripsi di server) + emel.
// Gate TUNGGAL admin — konsisten dgn halaman butiran pegawai (telefon sudah
// didedah kepada admin di sana). Telefon plaintext HANYA untuk hits (bukan pukal).
export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "admin" }, { status: 401 });
  }

  // Anti-scrape: had kadar longgar (carian interaktif) tetapi menghalang muat pukal.
  const ip = clientIp(req);
  const rl = rateLimit(`pegawai-cari:${ip}`, { capacity: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak carian. Perlahan sedikit." },
      { status: 429, headers: { "Retry-After": "5" } }
    );
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json(
      { results: [], total: 0, capped: false },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  }

  const { results, total } = await searchPegawaiAdmin(q, MAX_RESULTS);
  return NextResponse.json(
    { results, total, capped: total > MAX_RESULTS },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
