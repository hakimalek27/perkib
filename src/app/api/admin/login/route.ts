import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fixedWindow, fixedWindowReset, clientIp } from "@/lib/rate-limit";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
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
  // 5 cubaan / 15 min, kemudian kunci 30 minit (anti brute-force kata laluan).
  const rl = fixedWindow(`admin-login:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    cooldownMs: 30 * 60 * 1000,
  });
  if (!rl.allowed) {
    const mins = Math.ceil(rl.retryAfterMs / 60000);
    return NextResponse.json(
      { ok: false, error: `Terlalu banyak percubaan. Cuba semula dalam ${mins} minit.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload tidak sah" }, { status: 400 });
  }

  if (!body.password || !(await checkAdminPassword(body.password))) {
    return NextResponse.json({ ok: false, error: "Kata laluan tidak sah." }, { status: 401 });
  }

  // Login berjaya → buang kiraan gagal supaya pentadbir sah tidak dikunci.
  fixedWindowReset(`admin-login:${ip}`);

  const store = await cookies();
  store.set(ADMIN_COOKIE, makeSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  return NextResponse.json({ ok: true });
}
