import { NextResponse } from "next/server";
import { z } from "zod";
import { fixedWindow, clientIp } from "@/lib/rate-limit";
import { isCmsEnabled, getPegawaiForVerify, getSaguhatiUsage } from "@/lib/sanity";
import { mintToken } from "@/lib/saguhati-token";
import { verifyCaptcha } from "@/lib/captcha";

const schema = z.object({
  employeeNo: z.string().min(1).max(10),
  icLast4: z.string().regex(/^\d{4}$/),
  captchaToken: z.string().min(1),
  captchaAnswer: z.union([z.string(), z.number()]),
  // Honeypot — mesti kosong (medan tersembunyi; bot cenderung mengisinya).
  namaPenuh: z.string().max(0).optional().or(z.literal("")),
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
  // 5 percubaan / 5 minit, kemudian sejuk 5 minit (spek Hakim).
  const rlIp = fixedWindow(`verify-ip:${ip}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
    cooldownMs: 5 * 60 * 1000,
  });
  if (!rlIp.allowed) {
    return tooMany(rlIp.retryAfterMs);
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
      { ok: false, error: "Sila lengkapkan borang dengan betul (termasuk soalan pengesahan)." },
      { status: 400 }
    );
  }

  // Honeypot terisi → layan sebagai jaya-palsu senyap (jangan beri petunjuk).
  if (parsed.data.namaPenuh) {
    return NextResponse.json({ ok: false, error: MISMATCH }, { status: 401 });
  }

  // Captcha mesti betul.
  if (!verifyCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer)) {
    return NextResponse.json(
      { ok: false, error: "Jawapan pengesahan salah. Sila cuba soalan baharu." },
      { status: 400, headers: { "X-Captcha": "fail" } }
    );
  }

  // Normalisasi: buang ruang, padkan ke 4 digit ("281" -> "0281").
  const employeeNo = parsed.data.employeeNo.replace(/\D/g, "").padStart(4, "0");
  const icLast4 = parsed.data.icLast4;

  // Had kadar per-employeeNo: 5 / 5 minit + sejuk 5 minit (anti brute-force IC).
  const rlEmp = fixedWindow(`verify-emp:${employeeNo}`, {
    limit: 5,
    windowMs: 5 * 60 * 1000,
    cooldownMs: 5 * 60 * 1000,
  });
  if (!rlEmp.allowed) {
    return tooMany(rlEmp.retryAfterMs);
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

  // Kuota jenis (permohonan sedia ada per kod, tidak termasuk yang ditolak).
  const usage = await getSaguhatiUsage(employeeNo);

  const token = mintToken(employeeNo);
  return NextResponse.json({
    ok: true,
    token,
    usage,
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

function tooMany(retryAfterMs: number) {
  const mins = Math.max(1, Math.ceil(retryAfterMs / 60000));
  return NextResponse.json(
    { ok: false, error: `Terlalu banyak percubaan. Sila cuba semula dalam ${mins} minit.` },
    { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
  );
}
