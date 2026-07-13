// Token HMAC pendek untuk aliran permohonan saguhati.
// Selepas verify (no. pekerja + 4 digit IC), pemohon dapat token 15 minit
// yang membuktikan mereka telah disahkan — submit route sahkan token ini
// supaya orang tidak boleh hantar permohonan bagi pegawai lain tanpa verify.
// Guna node:crypto sahaja (tiada lib JWT).

import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 15 * 60 * 1000;

function secret(): string {
  return (
    process.env.SAGUHATI_TOKEN_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "perkib-dev-secret-localhost"
  );
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export type SaguhatiTokenPayload = { emp: string; exp: number };

export function mintToken(employeeNo: string): string {
  const payload: SaguhatiTokenPayload = { emp: employeeNo, exp: Date.now() + TTL_MS };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | null | undefined): SaguhatiTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString("utf8")) as SaguhatiTokenPayload;
    if (!payload.emp || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
