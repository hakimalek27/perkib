/**
 * Rate limiter token-bucket dalam-memori.
 *
 * Satu-proses sahaja — kaunter hidup dalam closure modul ini dan reset bila
 * proses Node restart. Sesuai untuk deploy `output: standalone` (satu proses).
 * Tukar ke @upstash/ratelimit (Redis) jika perlu berbilang instance.
 */

type Bucket = { tokens: number; updatedAt: number };

const STORE: Map<string, Bucket> = new Map();
const GC_INTERVAL_MS = 10 * 60 * 1000;
let lastGcAt = Date.now();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  { capacity, windowMs }: { capacity: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  maybeGc(now, windowMs);

  const refillPerMs = capacity / windowMs;
  const bucket = STORE.get(key);

  if (!bucket) {
    STORE.set(key, { tokens: capacity - 1, updatedAt: now });
    return { allowed: true, remaining: capacity - 1, resetAt: now };
  }

  const elapsed = Math.max(0, now - bucket.updatedAt);
  const replenished = Math.min(capacity, bucket.tokens + elapsed * refillPerMs);

  if (replenished < 1) {
    const msUntilNext = Math.ceil((1 - replenished) / refillPerMs);
    return { allowed: false, remaining: 0, resetAt: now + msUntilNext };
  }

  bucket.tokens = replenished - 1;
  bucket.updatedAt = now;
  return { allowed: true, remaining: Math.floor(bucket.tokens), resetAt: now };
}

function maybeGc(now: number, windowMs: number) {
  if (now - lastGcAt < GC_INTERVAL_MS) return;
  lastGcAt = now;
  const cutoff = now - windowMs * 2;
  for (const [k, v] of STORE) {
    if (v.updatedAt < cutoff) STORE.delete(k);
  }
}

/**
 * Kaunter tetingkap-tetap dengan tempoh sejuk (cooldown) — semantik
 * "N cubaan setiap tetingkap, kemudian kunci selama cooldown".
 * Lebih sesuai untuk had "5 kali / 5 minit" berbanding token-bucket yang
 * mengisi semula berterusan (spek Hakim untuk semak no. pekerja + login admin).
 */
type Window = { count: number; windowStart: number; lockedUntil: number };
const WINDOWS: Map<string, Window> = new Map();

export type FixedWindowResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number; // > 0 jika disekat
};

export function fixedWindow(
  key: string,
  { limit, windowMs, cooldownMs }: { limit: number; windowMs: number; cooldownMs?: number }
): FixedWindowResult {
  const now = Date.now();
  const cool = cooldownMs ?? windowMs;
  const w = WINDOWS.get(key);

  // GC ringan: guna semula laluan maybeGc STORE tidak meliputi WINDOWS, jadi
  // buang entri lapuk secara oportunistik bila diakses.
  if (w && now - w.windowStart > windowMs && now >= w.lockedUntil) {
    WINDOWS.delete(key);
  }

  const cur = WINDOWS.get(key);
  if (!cur) {
    WINDOWS.set(key, { count: 1, windowStart: now, lockedUntil: 0 });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (now < cur.lockedUntil) {
    return { allowed: false, remaining: 0, retryAfterMs: cur.lockedUntil - now };
  }

  // Tetingkap tamat → set semula.
  if (now - cur.windowStart > windowMs) {
    cur.count = 1;
    cur.windowStart = now;
    cur.lockedUntil = 0;
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (cur.count >= limit) {
    cur.lockedUntil = now + cool;
    return { allowed: false, remaining: 0, retryAfterMs: cool };
  }

  cur.count += 1;
  return { allowed: true, remaining: limit - cur.count, retryAfterMs: 0 };
}

/** Reset manual (mis. selepas login admin berjaya, buang kiraan gagal). */
export function fixedWindowReset(key: string): void {
  WINDOWS.delete(key);
}

/**
 * IP klien terbaik dari header proksi. Utamakan cf-connecting-ip (Cloudflare),
 * kemudian x-real-ip (nginx), akhir sekali hop TERAKHIR x-forwarded-for.
 */
export function clientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1]!;
  }
  return "unknown";
}
