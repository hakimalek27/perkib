import { NextResponse } from "next/server";
import { makeCaptcha } from "@/lib/captcha";
import { fixedWindow, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Had ringan supaya tidak boleh dijana beribu captcha untuk cuba pukul.
  const ip = clientIp(req);
  const rl = fixedWindow(`captcha:${ip}`, { limit: 40, windowMs: 5 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }
  const c = makeCaptcha();
  return NextResponse.json(c, { headers: { "Cache-Control": "no-store" } });
}
