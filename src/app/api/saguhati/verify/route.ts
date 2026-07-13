import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isCmsEnabled, getPegawaiForVerify } from "@/lib/sanity";
import { mintToken } from "@/lib/saguhati-token";

const schema = z.object({
  employeeNo: z.string().min(1).max(10),
  icLast4: z.string().regex(/^\d{4}$/),
});

// Ralat seragam elak enumerasi (tidak dedah sama ada no. pekerja wujud).
const MISMATCH = "Maklumat tidak sepadan. Sila semak No. Pekerja dan 4 digit akhir kad pengenalan.";

export async function POST(req: Request) {
  if (!isCmsEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Sistem permohonan belum aktif. Sila hubungi urus setia PERKIB." },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  const rlIp = rateLimit(`verify-ip:${ip}`, { capacity: 10, windowMs: 15 * 60 * 1000 });
  if (!rlIp.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rlIp.resetAt - Date.now()) / 1000)) } }
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
      { ok: false, error: "Sila masukkan No. Pekerja dan 4 digit akhir kad pengenalan yang sah." },
      { status: 400 }
    );
  }

  // Normalisasi: buang ruang, padkan ke 4 digit ("281" -> "0281").
  const employeeNo = parsed.data.employeeNo.replace(/\D/g, "").padStart(4, "0");
  const icLast4 = parsed.data.icLast4;

  // Had kadar tambahan per-employeeNo (elak brute-force 4 digit IC).
  const rlEmp = rateLimit(`verify-emp:${employeeNo}`, { capacity: 5, windowMs: 15 * 60 * 1000 });
  if (!rlEmp.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rlEmp.resetAt - Date.now()) / 1000)) } }
    );
  }

  let pegawai;
  try {
    pegawai = await getPegawaiForVerify(employeeNo);
  } catch (err) {
    console.error("[verify] fetch gagal", err);
    return NextResponse.json({ ok: false, error: "Ralat sistem. Sila cuba lagi." }, { status: 500 });
  }

  if (!pegawai || pegawai.icLast4 !== icLast4 || !pegawai.statusAktif) {
    return NextResponse.json({ ok: false, error: MISMATCH }, { status: 401 });
  }

  const token = mintToken(employeeNo);
  return NextResponse.json({
    ok: true,
    token,
    pegawai: {
      employeeNo: pegawai.employeeNo,
      nama: pegawai.nama,
      kategori: pegawai.kategori,
      jawatanPenuh: pegawai.jawatanPenuh,
      emelRasmi: pegawai.emelRasmi,
      masjidNama: pegawai.masjidNama ?? null,
      masjidZonNama: pegawai.masjidZonNama ?? null,
    },
  });
}
