// Captcha matematik ringkas (tambah/tolak) — stateless via HMAC.
// Nilai sebenar = penghalang bot mudah + digabung honeypot + had kadar.
// Token = base64url({ans, exp, nonce}) + "." + HMAC. Nonce sekali-guna (in-memory).
// Server-only.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TTL_MS = 5 * 60 * 1000;

function secret(): string {
  return (
    process.env.SAGUHATI_TOKEN_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "perkib-dev-captcha-secret"
  );
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}
function sign(body: string): string {
  return b64url(createHmac("sha256", secret()).update(body).digest());
}

// Nonce yang telah digunakan (elak main semula token yang sama).
const usedNonces = new Map<string, number>();
function gcNonces(now: number) {
  if (usedNonces.size < 500) return;
  for (const [n, exp] of usedNonces) if (exp < now) usedNonces.delete(n);
}

export type Captcha = { soalan: string; token: string };

export function makeCaptcha(): Captcha {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const tambah = Math.random() < 0.5;
  const [x, y] = tambah ? [a, b] : [Math.max(a, b), Math.min(a, b)];
  const ans = tambah ? x + y : x - y;
  const op = tambah ? "+" : "−";
  const nonce = b64url(randomBytes(9));
  const body = b64url(Buffer.from(JSON.stringify({ ans, exp: Date.now() + TTL_MS, nonce }), "utf8"));
  return { soalan: `${x} ${op} ${y}`, token: `${body}.${sign(body)}` };
}

/** Sahkan jawapan captcha. Nonce sekali-guna. Kembalikan true jika sah. */
export function verifyCaptcha(token: string | null | undefined, answer: string | number): boolean {
  // Pintasan ujian E2E (jika CAPTCHA_BYPASS_SECRET ditetapkan).
  const bypass = process.env.CAPTCHA_BYPASS_SECRET;
  if (bypass && String(answer) === bypass) return true;

  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { ans, exp, nonce } = JSON.parse(b64urlDecode(body).toString("utf8")) as {
      ans: number;
      exp: number;
      nonce: string;
    };
    const now = Date.now();
    if (typeof exp !== "number" || now > exp) return false;
    if (usedNonces.has(nonce)) return false;
    const given = Number(String(answer).trim());
    if (!Number.isFinite(given) || given !== ans) return false;
    gcNonces(now);
    usedNonces.set(nonce, exp);
    return true;
  } catch {
    return false;
  }
}
