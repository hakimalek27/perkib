// Auth admin ringkas — kuki ditandatangani HMAC. Tiada middleware (Next 16);
// guard dilakukan dalam src/app/admin/layout.tsx sebagai server component.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "perkib_admin";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

function password(): string | null {
  return process.env.ADMIN_PASSWORD ?? null;
}

function secret(): string {
  return process.env.ADMIN_PASSWORD ?? "perkib-dev-admin-secret";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export function isAdminConfigured(): boolean {
  return Boolean(password());
}

export function checkPassword(input: string): boolean {
  const pw = password();
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeSessionValue(): string {
  const body = b64url(Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS }), "utf8"));
  return `${body}.${sign(body)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
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

// Semak sesi semasa (server component / route handler). cookies() async di Next 16.
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(ADMIN_COOKIE)?.value);
}
