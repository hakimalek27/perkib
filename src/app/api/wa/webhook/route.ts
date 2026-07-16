import { NextResponse, after } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getPegawaiAdminDetail } from "@/lib/admin-data";
import { decryptValue } from "@/lib/crypto";
import { sendWhatsApp, normalizePhone, maskRecipient } from "@/lib/whatsapp";
import { fixedWindow } from "@/lib/rate-limit";
import { ambilRekodYuran, formatYuranMesej } from "@/lib/yuran";

export const runtime = "nodejs";

// Webhook masuk daripada gateway wassap (fan-out message.received). Membalas HANYA
// kepada keyword "yuran <noPekerja>" dari chat PERIBADI — dan hanya jika nombor
// penghantar = nombor telefon pegawai berdaftar (PDPA). Mesej lain → 200 senyap
// (nombor ini juga terima mesej manusia biasa; JANGAN auto-reply sewenang-wenang).

const secret = () => process.env.WASSAP_WEBHOOK_SECRET || "";

// Dedup ID penghantaran (X-Webhook-Id) — proses tunggal pm2. TTL 10 minit.
const seen = new Map<string, number>();
function sudahProses(id: string): boolean {
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 600_000) seen.delete(k);
  if (seen.has(id)) return true;
  seen.set(id, now);
  return false;
}

function verifySig(raw: string, header: string | null): boolean {
  const s = secret();
  if (!s || !header) return false;
  const expected = "sha256=" + createHmac("sha256", s).update(raw).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text();
  // 1. Sahkan tandatangan HMAC (raw body). Gagal → 401.
  if (!verifySig(raw, req.headers.get("x-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // 2. Dedup.
  const webhookId = req.headers.get("x-webhook-id") ?? "";
  if (webhookId && sudahProses(webhookId)) return NextResponse.json({ ok: true, dedup: true });

  let body: { event?: string; data?: Record<string, unknown> };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // 3. Hanya event mesej masuk.
  if (body.event !== "message.received") return NextResponse.json({ ok: true });

  const data = body.data ?? {};
  const chatJid = String(data.chat_jid ?? "");
  const text = String(data.text ?? "");
  const fromPhone = String(data.from_phone ?? "");

  // 4. Hanya chat peribadi (bukan group / broadcast).
  if (!chatJid.endsWith("@s.whatsapp.net")) return NextResponse.json({ ok: true });

  // 5. Keyword ketat: "yuran <2-6 digit>". Selain itu → 200 senyap.
  const m = text.match(/^\s*yuran\s+(\d{2,6})\s*$/i);
  if (!m) return NextResponse.json({ ok: true });
  const employeeNo = m[1].padStart(4, "0");

  // 6. Rate limit per penghantar (5 / 10 min) — senyap bila melebihi.
  const penghantar = normalizePhone(fromPhone);
  const rl = fixedWindow(`wa-yuran:${penghantar}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
    cooldownMs: 10 * 60 * 1000,
  });
  if (!rl.allowed) return NextResponse.json({ ok: true });

  // 7. ACK SEGERA, proses berat SELEPAS response. Gateway wassap ada timeout
  //    webhook pendek (~2-7s); jika kita `await` Sanity + sendWhatsApp (timeout
  //    10s, +retry) sebelum jawab, gateway anggap "gagal" + retry 3× walaupun
  //    balasan akhirnya terhantar (punca: balasan tak konsisten/tergugur).
  //    `after()` menjalankan kerja ini selepas 200 dihantar — ACK <50ms.
  after(async () => {
    try {
      // Banding nombor penghantar dengan telefon pegawai berdaftar (PDPA).
      const pegawai = await getPegawaiAdminDetail(employeeNo);
      const telefonPegawai = pegawai ? normalizePhone(decryptValue(pegawai.telefonEnc) ?? "") : "";

      if (!pegawai || !telefonPegawai || telefonPegawai !== penghantar) {
        const r = await sendWhatsApp(
          fromPhone,
          `Maaf, nombor WhatsApp anda tidak sepadan dengan rekod No. Pekerja ${employeeNo}.\n\nUntuk keselamatan, semak rekod yuran anda di *perkib.my/yuran/semak* (No. Pekerja + 4 digit akhir IC).`
        );
        console.log(
          `[wa/webhook] tolak emp=${employeeNo} dari=${maskRecipient(penghantar)} pegawai=${pegawai ? "ada" : "tiada"} telefonPadan=${telefonPegawai === penghantar} balas=${r.status}`
        );
        return;
      }

      // Sah — hantar rekod yuran (tahun semasa + lepas).
      const tahun = new Date().getFullYear();
      const rekod = await Promise.all([
        ambilRekodYuran(employeeNo, tahun),
        ambilRekodYuran(employeeNo, tahun - 1),
      ]);
      const r = await sendWhatsApp(fromPhone, formatYuranMesej(pegawai.nama, employeeNo, rekod));
      console.log(`[wa/webhook] rekod emp=${employeeNo} dari=${maskRecipient(penghantar)} balas=${r.status}`);
    } catch (err) {
      console.error("[wa/webhook] gagal proses yuran", err);
    }
  });

  // Balas segera — gateway dapat ACK pantas (elak timeout + retry 3×).
  return NextResponse.json({ ok: true });
}
