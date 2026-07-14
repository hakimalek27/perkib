// Integrasi WhatsApp melalui wassap.wehdah.my (projek Whatsapp Multi Tenant).
// POST {base}/v1/messages/send  header X-API-Key: sk_...  body {to, message}.
// (Nota: deployment live wassap.wehdah.my guna prefix /v1, bukan /api/v1.)
// `to` = nombor 60xxxxxxxxxx ATAU JID group ...@g.us.
// Kegagalan TIDAK PERNAH menggagalkan permohonan (fire-and-forget + log outbox).
// Server-only.

import { getWriteClient } from "./sanity-write";
import { encryptValue } from "./crypto";

// Baca env secara lazy (dalam fungsi) supaya sentiasa mencerminkan process.env
// terkini — elak isu susunan pemuatan modul.
const apiUrl = () => process.env.WASSAP_API_URL || "https://wassap.wehdah.my";
const apiKey = () => process.env.WASSAP_API_KEY || "";
const isDryRun = () =>
  process.env.WASSAP_DRY_RUN === "1" || process.env.WASSAP_DRY_RUN === "true";
// Pin sesi WhatsApp tertentu (nombor penghantar). Perlu bila kunci API tidak
// terikat pada sesi DAN sasaran ialah group — penghantar mesti ahli group itu.
// Kosong = biar gateway pilih (round-robin) seperti sedia ada.
const sessionId = () => process.env.WASSAP_SESSION_ID || "";

export function isWhatsAppConfigured(): boolean {
  return Boolean(apiKey()) || isDryRun();
}

/** Normalisasi nombor MY → 60xxxxxxxxx. JID group (...@g.us) dilalukan terus. */
export function normalizePhone(to: string): string {
  const t = (to ?? "").trim();
  if (!t) return "";
  if (t.includes("@")) return t; // JID group / DM
  const digits = t.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return "60" + digits.slice(1);
  if (digits.startsWith("6")) return digits;
  return "60" + digits;
}

/** Topeng penerima untuk paparan (60••••8226 / group ...@g.us). */
export function maskRecipient(to: string): string {
  if (to.includes("@g.us")) return "Group " + to.slice(0, 8) + "…";
  if (to.length <= 4) return "••••";
  return to.slice(0, 2) + "••••" + to.slice(-4);
}

export type SendResult = { ok: boolean; status: "sent" | "dry-run" | "failed"; error?: string };

async function postSend(to: string, message: string, retriesLeft = 1): Promise<SendResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const sid = sessionId();
    const res = await fetch(`${apiUrl()}/v1/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey() },
      body: JSON.stringify(sid ? { to, message, session_id: sid } : { to, message }),
      signal: ctrl.signal,
    });
    if (res.status === 429 && retriesLeft > 0) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "2");
      await new Promise((r) => setTimeout(r, Math.min(10_000, (retryAfter || 2) * 1000)));
      return postSend(to, message, retriesLeft - 1);
    }
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        if (j?.error) detail = String(j.error);
      } catch {}
      return { ok: false, status: "failed", error: detail };
    }
    return { ok: true, status: "sent" };
  } catch (err) {
    return { ok: false, status: "failed", error: (err as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

/** Hantar mesej WhatsApp. Mod dry-run hanya log. */
export async function sendWhatsApp(to: string, message: string): Promise<SendResult> {
  const norm = normalizePhone(to);
  if (!norm) return { ok: false, status: "failed", error: "Nombor tidak sah" };
  if (isDryRun()) {
    console.log(`[wassap:dry-run] → ${norm}\n${message}\n---`);
    return { ok: true, status: "dry-run" };
  }
  if (!apiKey()) return { ok: false, status: "failed", error: "WASSAP_API_KEY belum ditetapkan" };
  return postSend(norm, message);
}

/** Hantar + log ke outbox (untuk pemantauan + hantar semula). */
export async function dispatchWhatsApp(opts: {
  to: string;
  message: string;
  peristiwa: string;
  refPermohonan?: string;
}): Promise<SendResult> {
  const result = await sendWhatsApp(opts.to, opts.message);
  const client = getWriteClient();
  if (client) {
    try {
      await client.create({
        _type: "waOutbox",
        masa: new Date().toISOString(),
        peristiwa: opts.peristiwa,
        status: result.status,
        toMask: maskRecipient(normalizePhone(opts.to)),
        toEnc: encryptValue(normalizePhone(opts.to)),
        mesejEnc: encryptValue(opts.message),
        ralat: result.error ?? undefined,
        refPermohonan: opts.refPermohonan ?? undefined,
      });
    } catch (err) {
      console.error("[wassap] gagal log outbox", err);
    }
  }
  return result;
}

/** Ganti placeholder {{key}} dengan nilai. */
export function renderTemplate(tpl: string, vars: Record<string, string | number | undefined>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_m, k) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}
