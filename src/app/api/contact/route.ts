import { NextResponse, after } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { siteInfo } from "@/content/site";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getWriteClient } from "@/lib/sanity-write";
import { encryptValue } from "@/lib/crypto";
import { notifyMaklumBalas } from "@/lib/notifikasi";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(7).max(20),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

const RL_CAPACITY = 5;
const RL_WINDOW_MS = 60 * 60 * 1000;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (origin === site) return true;
  const stripWww = (h: string) => h.replace(/^www\./, "");
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (stripWww(u.hostname) === stripWww(new URL(site).hostname)) return true;
  } catch {
    return false;
  }
  return false;
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ ok: false, error: "Origin tidak dibenarkan." }, { status: 403 });
  }

  const ip = clientIp(req);
  const rl = rateLimit(`contact:${ip}`, { capacity: RL_CAPACITY, windowMs: RL_WINDOW_MS });
  if (!rl.allowed) {
    const retryAfterSecs = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSecs),
          "X-RateLimit-Limit": String(RL_CAPACITY),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 100_000) {
    return NextResponse.json({ ok: false, error: "Mesej terlalu besar." }, { status: 413 });
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
      { ok: false, error: "Maklumat tidak lengkap atau tidak sah." },
      { status: 400 }
    );
  }

  const { name, email, phone, subject, message } = parsed.data;

  // ── 1. Simpan ke Sanity (rekod kekal — jaring keselamatan; PII terenkripsi). ──
  let savedToSanity = false;
  const client = getWriteClient();
  if (client) {
    try {
      await client.create({
        _type: "maklumBalas",
        masa: new Date().toISOString(),
        status: "baru",
        dataEnc: encryptValue(
          JSON.stringify({ nama: name, emel: email, telefon: phone, subjek: subject, mesej: message })
        ),
      });
      savedToSanity = true;
    } catch (err) {
      console.error("[contact] gagal simpan ke Sanity:", err);
    }
  }

  // ── 2. Emel ke admin@perkib.my (jika Resend dikonfigurasi). ──
  let emailed = false;
  const apiKey = process.env.RESEND_API_KEY;
  const resendReady = Boolean(apiKey) && apiKey !== "dev";
  if (resendReady) {
    try {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "PERKIB <onboarding@resend.dev>",
        to: [siteInfo.email],
        replyTo: email,
        subject: `[Maklum Balas PERKIB] ${subject}`,
        text: `Nama: ${name}\nEmel: ${email}\nTel: ${phone}\n\n${message}`,
      });
      if ("error" in result && result.error) {
        console.error("[contact] resend gagal:", result.error);
      } else {
        emailed = true;
      }
    } catch (err) {
      console.error("[contact] resend gagal:", err);
    }
  }

  // ── 3. Cetus WhatsApp ke sasaran admin sedia ada (fire-and-forget). ──
  after(() =>
    notifyMaklumBalas({
      nama: name,
      subjek: subject,
      telefon: phone,
      emel: email,
      mesejRingkas: message.length > 500 ? message.slice(0, 500) + "…" : message,
    })
  );

  // Berjaya jika sekurang-kurangnya satu saluran kekal terhasil (Sanity atau emel).
  if (savedToSanity || emailed) {
    return NextResponse.json({ ok: true });
  }
  // Tiada Sanity & tiada Resend = mod pembangunan (log sahaja).
  if (!client && !resendReady) {
    console.log("[contact] mod dev — maklum balas:", { name, email, phone, subject, message });
    return NextResponse.json({ ok: true, dev: true });
  }
  return NextResponse.json(
    { ok: false, error: "Gagal menghantar mesej. Sila cuba semula." },
    { status: 500 }
  );
}
