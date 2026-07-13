// Enkripsi data sensitif at-rest (AES-256-GCM).
// Dataset Sanity boleh dibaca sesiapa yang ada project ID (jika public) — maka
// IC penuh, telefon, dan no. akaun bank TIDAK PERNAH disimpan plaintext.
// Format ciphertext berversi: "v1:<iv b64url>:<tag b64url>:<data b64url>"
// (versi membolehkan rotasi kunci/algoritma pada masa depan).
// Server-only — JANGAN import dari client component.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const VERSION = "v1";

function getKey(): Buffer | null {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) return null;
  // Terima hex 64-aksara (32 bait) ATAU sebarang rentetan (di-derive via SHA-256).
  if (/^[0-9a-f]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  return createHash("sha256").update(raw, "utf8").digest();
}

export function isEncryptionConfigured(): boolean {
  return getKey() !== null;
}

/** Enkrip satu nilai sensitif. Pulangkan null jika nilai kosong. */
export function encryptValue(plain: string | null | undefined): string | null {
  if (plain === null || plain === undefined) return null;
  const value = String(plain).trim();
  if (!value) return null;
  const key = getKey();
  if (!key) throw new Error("DATA_ENCRYPTION_KEY belum ditetapkan — tidak boleh menyimpan data sensitif.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), data.toString("base64url")].join(":");
}

/** Dekrip nilai; pulangkan null jika input kosong/tidak sah/kunci salah (jangan crash halaman admin). */
export function decryptValue(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  const key = getKey();
  if (!key) return null;
  try {
    const parts = ciphertext.split(":");
    if (parts.length !== 4 || parts[0] !== VERSION) return null;
    const [, ivB64, tagB64, dataB64] = parts;
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const plain = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64url")), decipher.final()]);
    return plain.toString("utf8");
  } catch {
    return null;
  }
}

/** Kenal pasti sama ada rentetan kelihatan seperti ciphertext kita. */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(`${VERSION}:`) && value.split(":").length === 4;
}

/** Self-test ringkas (dipanggil oleh skrip; elak dipanggil pada import laluan panas). */
export function cryptoSelfTest(): void {
  const sample = "ujian-perkib-😀-0123456789";
  const enc = encryptValue(sample);
  if (!enc || decryptValue(enc) !== sample) {
    throw new Error("Self-test enkripsi GAGAL — semak DATA_ENCRYPTION_KEY.");
  }
}
