import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { siteInfo } from "@/content/site";
import { rateLimit, clientIp } from "@/lib/rate-limit";

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
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "dev") {
    console.log("[contact] mod dev — akan hantar emel:", { name, email, phone, subject, message });
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "PERKIB <onboarding@resend.dev>",
      to: [siteInfo.email],
      replyTo: email,
      subject: `[Borang Hubungi PERKIB] ${subject}`,
      text: `Nama: ${name}\nEmel: ${email}\nTel: ${phone}\n\n${message}`,
    });
    if ("error" in result && result.error) {
      throw new Error(result.error.message ?? "Resend error");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] resend gagal:", err);
    return NextResponse.json(
      { ok: false, error: "Gagal menghantar emel. Sila cuba lagi." },
      { status: 500 }
    );
  }
}
