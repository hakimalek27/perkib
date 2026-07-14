import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fixedWindow, fixedWindowReset, clientIp } from "@/lib/rate-limit";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  STAF_COOKIE,
  checkStafPassword,
  isStafGateConfigured,
  makeStafSessionValue,
} from "@/lib/staf-gate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Lapisan 1: mesti sudah log masuk admin dahulu.
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "admin" }, { status: 401 });
  }

  if (!isStafGateConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Gate staf belum dikonfigurasi (STAF_GATE_PASSWORD)." },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  // Spek Hakim: 5 cubaan / 5 minit, kemudian sejuk 5 minit.
  const rl = fixedWindow(`staf-gate:${ip}`, {
    limit: 5,
    windowMs: 5 * 60 * 1000,
    cooldownMs: 5 * 60 * 1000,
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

  if (!body.password || !checkStafPassword(body.password)) {
    return NextResponse.json({ ok: false, error: "Kata laluan gate tidak sah." }, { status: 401 });
  }

  // Berjaya → buang kiraan gagal.
  fixedWindowReset(`staf-gate:${ip}`);

  const store = await cookies();
  store.set(STAF_COOKIE, makeStafSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 2 * 60 * 60,
  });

  return NextResponse.json({ ok: true });
}
