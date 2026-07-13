import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  ADMIN_COOKIE,
  checkPassword,
  isAdminConfigured,
  makeSessionValue,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Panel admin belum dikonfigurasi (ADMIN_PASSWORD)." },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  const rl = rateLimit(`admin-login:${ip}`, { capacity: 8, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload tidak sah" }, { status: 400 });
  }

  if (!body.password || !checkPassword(body.password)) {
    return NextResponse.json({ ok: false, error: "Kata laluan tidak sah." }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, makeSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  return NextResponse.json({ ok: true });
}
