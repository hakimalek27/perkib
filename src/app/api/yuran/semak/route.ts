import { NextResponse } from "next/server";
import { z } from "zod";
import { fixedWindow, clientIp } from "@/lib/rate-limit";
import { isCmsEnabled, getPegawaiForVerify } from "@/lib/sanity";
import { verifyCaptcha } from "@/lib/captcha";
import { ambilRekodYuran } from "@/lib/yuran";

export const runtime = "nodejs";

const schema = z.object({
  employeeNo: z.string().min(1).max(10),
  icLast4: z.string().regex(/^\d{4}$/),
  captchaToken: z.string().min(1),
  captchaAnswer: z.union([z.string(), z.number()]),
  namaPenuh: z.string().max(0).optional().or(z.literal("")), // honeypot
});

const MISMATCH = "Maklumat tidak sepadan. Sila semak No. Pekerja dan 4 digit akhir kad pengenalan.";

function tooMany(retryAfterMs: number) {
  const mins = Math.max(1, Math.ceil(retryAfterMs / 60000));
  return NextResponse.json(
    { ok: false, error: `Terlalu banyak percubaan. Sila cuba semula dalam ${mins} minit.` },
    { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
  );
}

export async function POST(req: Request) {
  if (!isCmsEnabled()) {
    return NextResponse.json({ ok: false, error: "Sistem belum aktif." }, { status: 503 });
  }

  const ip = clientIp(req);
  const rlIp = fixedWindow(`yuran-ip:${ip}`, { limit: 10, windowMs: 5 * 60 * 1000, cooldownMs: 5 * 60 * 1000 });
  if (!rlIp.allowed) return tooMany(rlIp.retryAfterMs);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload tidak sah" }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Sila lengkapkan borang dengan betul." }, { status: 400 });
  }
  if (parsed.data.namaPenuh) {
    return NextResponse.json({ ok: false, error: MISMATCH }, { status: 401 }); // honeypot
  }
  if (!verifyCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer)) {
    return NextResponse.json(
      { ok: false, error: "Jawapan pengesahan salah. Sila cuba soalan baharu." },
      { status: 400, headers: { "X-Captcha": "fail" } }
    );
  }

  const employeeNo = parsed.data.employeeNo.replace(/\D/g, "").padStart(4, "0");
  const rlEmp = fixedWindow(`yuran-emp:${employeeNo}`, { limit: 5, windowMs: 5 * 60 * 1000, cooldownMs: 5 * 60 * 1000 });
  if (!rlEmp.allowed) return tooMany(rlEmp.retryAfterMs);

  let pegawai;
  try {
    pegawai = await getPegawaiForVerify(employeeNo);
  } catch (err) {
    console.error("[yuran/semak] fetch gagal", err);
    return NextResponse.json({ ok: false, error: "Ralat sistem. Sila cuba lagi." }, { status: 500 });
  }
  if (!pegawai || pegawai.icLast4 !== parsed.data.icLast4 || !pegawai.statusAktif) {
    return NextResponse.json({ ok: false, error: MISMATCH }, { status: 401 });
  }

  // Sah — pulangkan rekod yuran tahun semasa + tahun lepas (TIADA PII lain).
  const tahun = new Date().getFullYear();
  const rekod = await Promise.all([ambilRekodYuran(employeeNo, tahun), ambilRekodYuran(employeeNo, tahun - 1)]);
  return NextResponse.json({ ok: true, nama: pegawai.nama, employeeNo, rekod });
}
