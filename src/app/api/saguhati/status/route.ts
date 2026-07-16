import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isCmsEnabled } from "@/lib/sanity";
import { getWriteClient } from "@/lib/sanity-write";

export const runtime = "nodejs";

const schema = z.object({
  refNo: z.string().min(4).max(40),
  employeeNo: z.string().min(1).max(10),
});

const STATUS_LABEL: Record<string, string> = {
  baru: "Baru Diterima",
  diproses: "Sedang Diproses",
  lulus: "Diluluskan",
  tolak: "Tidak Diluluskan",
  dibayar: "Telah Dibayar",
};

export async function POST(req: Request) {
  if (!isCmsEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Sistem semakan belum aktif. Sila hubungi urus setia PERKIB." },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  const rl = rateLimit(`status:${ip}`, { capacity: 20, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload tidak sah" }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Sila masukkan No. Rujukan dan No. Pekerja." },
      { status: 400 }
    );
  }

  const refNo = parsed.data.refNo.trim().toUpperCase();
  const employeeNo = parsed.data.employeeNo.replace(/\D/g, "").padStart(4, "0");

  const client = getWriteClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "Sistem tidak tersedia." }, { status: 503 });
  }

  let row: {
    nomborRujukan?: string;
    status?: string;
    jenisNama?: string;
    jenisKadar?: number;
    tarikhMohon?: string;
    tarikhKemaskini?: string;
    catatanAdmin?: string;
  } | null;
  try {
    row = await client.fetch(
      `*[_type=="permohonanSaguhati" && nomborRujukan==$ref && employeeNo==$emp && dibatalkan != true][0]{
         nomborRujukan, status, jenisNama, jenisKadar, tarikhMohon, tarikhKemaskini, catatanAdmin
       }`,
      { ref: refNo, emp: employeeNo }
    );
  } catch (err) {
    console.error("[status] fetch gagal", err);
    return NextResponse.json({ ok: false, error: "Ralat sistem. Sila cuba lagi." }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json(
      { ok: false, error: "Permohonan tidak dijumpai. Sila semak No. Rujukan dan No. Pekerja." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    permohonan: {
      nomborRujukan: row.nomborRujukan,
      status: row.status ?? "baru",
      statusLabel: STATUS_LABEL[row.status ?? "baru"] ?? row.status,
      jenisNama: row.jenisNama,
      jenisKadar: row.jenisKadar,
      tarikhMohon: row.tarikhMohon,
      tarikhKemaskini: row.tarikhKemaskini,
      catatanAdmin: row.catatanAdmin ?? null,
    },
  });
}
