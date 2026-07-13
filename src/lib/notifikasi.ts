// Tetapan + penghantaran notifikasi WhatsApp untuk permohonan saguhati.
// Konfigurasi (sasaran admin + templat + toggle) disimpan sebagai SATU blob
// terenkripsi dalam singleton `notifikasiTetapan`. Server-only.

import { getWriteClient } from "./sanity-write";
import { encryptValue, decryptValue } from "./crypto";
import { dispatchWhatsApp, renderTemplate } from "./whatsapp";

export type NotifEvent =
  | "baru-admin"
  | "baru-pemohon"
  | "lulus-pemohon"
  | "tolak-pemohon"
  | "dibayar-pemohon";

export type NotifTarget = { label: string; to: string };

export type NotifConfig = {
  targets: NotifTarget[];
  templates: Record<NotifEvent, string>;
  enabled: Record<NotifEvent, boolean>;
};

export const NOTIF_EVENTS: { key: NotifEvent; label: string }[] = [
  { key: "baru-admin", label: "Permohonan Baharu → Admin/Group" },
  { key: "baru-pemohon", label: "Permohonan Baharu → Pemohon" },
  { key: "lulus-pemohon", label: "Diluluskan → Pemohon" },
  { key: "tolak-pemohon", label: "Ditolak → Pemohon" },
  { key: "dibayar-pemohon", label: "Telah Dibayar → Pemohon" },
];

const DEFAULT_TEMPLATES: Record<NotifEvent, string> = {
  "baru-admin":
    "🔔 *Permohonan Saguhati Baharu*\n\nNo. Rujukan: {{refNo}}\nNama: {{nama}}\nNo. Pekerja: {{noPekerja}}\nNo. KP: {{noKp}}\nBertugas: {{masjid}}\nJenis: {{jenis}} (RM{{kadar}})\nBank: {{bankNama}} — {{bankAkaun}}\nTelefon: {{telefon}}\n\nSila semak di panel admin PERKIB.",
  "baru-pemohon":
    "Assalamualaikum {{nama}},\n\nPermohonan saguhati anda telah *DITERIMA*.\n\nNo. Rujukan: *{{refNo}}*\nJenis: {{jenis}} (RM{{kadar}})\nBertugas: {{masjid}}\nBank: {{bankNama}} — {{bankAkaun}}\nStatus: Baru Diterima\n\nSimpan nombor rujukan ini untuk semakan status. Terima kasih.\n— PERKIB",
  "lulus-pemohon":
    "Assalamualaikum {{nama}},\n\nPermohonan saguhati anda ({{refNo}}) telah *DILULUSKAN*. ✅\n\nJenis: {{jenis}} (RM{{kadar}})\nPembayaran akan diproses ke akaun {{bankNama}} — {{bankAkaun}}.\n\n— PERKIB",
  "tolak-pemohon":
    "Assalamualaikum {{nama}},\n\nDukacita dimaklumkan permohonan saguhati anda ({{refNo}}) *TIDAK DILULUSKAN*.\n\nJenis: {{jenis}}\nCatatan: {{catatan}}\n\nSila hubungi urus setia PERKIB untuk pertanyaan lanjut.\n— PERKIB",
  "dibayar-pemohon":
    "Assalamualaikum {{nama}},\n\nSaguhati anda ({{refNo}}) telah *DIBAYAR*. 💰\n\nJenis: {{jenis}} (RM{{kadar}})\nDitransfer ke: {{bankTransfer}}\nTarikh: {{tarikhTransfer}}\nRujukan: {{rujukanTransfer}}\n\nTerima kasih.\n— PERKIB",
};

function defaultConfig(): NotifConfig {
  return {
    targets: [],
    templates: { ...DEFAULT_TEMPLATES },
    enabled: {
      "baru-admin": true,
      "baru-pemohon": true,
      "lulus-pemohon": true,
      "tolak-pemohon": true,
      "dibayar-pemohon": true,
    },
  };
}

export async function getNotifConfig(): Promise<NotifConfig> {
  const client = getWriteClient();
  const base = defaultConfig();
  if (!client) return base;
  try {
    const doc = await client.fetch<{ dataEnc?: string } | null>(
      `*[_id=="notifikasiTetapan"][0]{ dataEnc }`
    );
    if (!doc?.dataEnc) return base;
    const json = decryptValue(doc.dataEnc);
    if (!json) return base;
    const parsed = JSON.parse(json) as Partial<NotifConfig>;
    return {
      targets: Array.isArray(parsed.targets) ? parsed.targets : base.targets,
      templates: { ...base.templates, ...(parsed.templates ?? {}) },
      enabled: { ...base.enabled, ...(parsed.enabled ?? {}) },
    };
  } catch (err) {
    console.error("[notifikasi] gagal baca config", err);
    return base;
  }
}

export async function saveNotifConfig(config: NotifConfig): Promise<void> {
  const client = getWriteClient();
  if (!client) throw new Error("Sistem tidak tersedia.");
  const enc = encryptValue(JSON.stringify(config));
  await client.createOrReplace({
    _id: "notifikasiTetapan",
    _type: "notifikasiTetapan",
    dataEnc: enc,
    nota: "Diurus melalui panel /admin/notifikasi. Jangan edit di sini.",
  });
}

export type PermohonanVars = {
  refNo: string;
  nama: string;
  noPekerja: string;
  noKp?: string;
  masjid: string;
  jenis: string;
  kadar: number | string;
  bankNama?: string;
  bankAkaun?: string;
  telefon?: string;
  catatan?: string;
  bankTransfer?: string;
  tarikhTransfer?: string;
  rujukanTransfer?: string;
  status?: string;
};

/** Notifikasi permohonan baharu — ke sasaran admin + pemohon. */
export async function notifyPermohonanBaru(vars: PermohonanVars & { telefonPemohon?: string }): Promise<void> {
  const cfg = await getNotifConfig();
  const jobs: Promise<unknown>[] = [];

  if (cfg.enabled["baru-admin"] && cfg.targets.length) {
    const msg = renderTemplate(cfg.templates["baru-admin"], vars);
    for (const t of cfg.targets) {
      jobs.push(dispatchWhatsApp({ to: t.to, message: msg, peristiwa: "baru-admin", refPermohonan: vars.refNo }));
    }
  }
  if (cfg.enabled["baru-pemohon"] && vars.telefonPemohon) {
    const msg = renderTemplate(cfg.templates["baru-pemohon"], vars);
    jobs.push(dispatchWhatsApp({ to: vars.telefonPemohon, message: msg, peristiwa: "baru-pemohon", refPermohonan: vars.refNo }));
  }
  await Promise.allSettled(jobs);
}

/** Notifikasi perubahan status — ke pemohon. */
export async function notifyStatusPemohon(
  event: Extract<NotifEvent, "lulus-pemohon" | "tolak-pemohon" | "dibayar-pemohon">,
  telefonPemohon: string | null | undefined,
  vars: PermohonanVars
): Promise<void> {
  if (!telefonPemohon) return;
  const cfg = await getNotifConfig();
  if (!cfg.enabled[event]) return;
  const msg = renderTemplate(cfg.templates[event], vars);
  await dispatchWhatsApp({ to: telefonPemohon, message: msg, peristiwa: event, refPermohonan: vars.refNo });
}
