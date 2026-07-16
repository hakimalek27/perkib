// Hash kata laluan (scrypt) — untuk simpan hash kata laluan admin/gate dalam Sanity
// (bukan plaintext). Format: `scrypt:N:r:p:<saltB64>:<hashB64>`.
// Server-only (guna node:crypto).

import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const N = 16384; // 2^14 — kos memori ~16MB (128*N*r), seimbang utk borang admin
const R = 8;
const P = 1;
const KEYLEN = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt:${N}:${R}:${P}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split(":");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const n = parseInt(parts[1], 10);
    const r = parseInt(parts[2], 10);
    const p = parseInt(parts[3], 10);
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    if (!n || !r || !p || salt.length === 0 || expected.length === 0) return false;
    const actual = scryptSync(password, salt, expected.length, { N: n, r, p });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
