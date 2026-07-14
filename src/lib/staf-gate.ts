// Gate kata laluan KEDUA untuk /admin/staf (direktori 1,122 staf MAIWP).
// Berasingan daripada sesi admin utama: walau seseorang berjaya log masuk admin,
// halaman staf memerlukan kata laluan tambahan (STAF_GATE_PASSWORD).
// Kuki ditandatangani HMAC dengan rahsia diperoleh daripada ADMIN_SESSION_SECRET
// + garam tetap, supaya kuki gate tidak boleh diguna sebagai kuki sesi admin.
// Server-only.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const STAF_COOKIE = "perkib_staf";
const TTL_MS = 2 * 60 * 60 * 1000; // 2 jam — lebih pendek drpd sesi admin (8j)

function gatePassword(): string | null {
  return process.env.STAF_GATE_PASSWORD ?? null;
}

// Rahsia tandatangan gate — berasingan drpd tandatangan sesi admin (garam berbeza)
// supaya kuki gate ≠ kuki admin walau kedua-dua guna ADMIN_SESSION_SECRET sebagai asas.
function secret(): string {
  const base =
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "perkib-dev-admin-secret";
  return createHmac("sha256", base).update("staf-gate:v1").digest("hex");
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export function isStafGateConfigured(): boolean {
  return Boolean(gatePassword());
}

export function checkStafPassword(input: string): boolean {
  const pw = gatePassword();
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeStafSessionValue(): string {
  const body = b64url(Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS }), "utf8"));
  return `${body}.${sign(body)}`;
}

export function verifyStafSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const pad = body.length % 4 === 0 ? "" : "=".repeat(4 - (body.length % 4));
    const json = JSON.parse(
      Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf8")
    ) as { exp: number };
    return typeof json.exp === "number" && Date.now() < json.exp;
  } catch {
    return false;
  }
}

/** Semak kuki gate staf semasa (server component / route handler). */
export async function isStafGateAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyStafSessionValue(store.get(STAF_COOKIE)?.value);
}
