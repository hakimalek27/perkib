"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { saveNotifConfig, type NotifConfig } from "@/lib/notifikasi";
import { dispatchWhatsApp } from "@/lib/whatsapp";
import { writeAudit } from "@/lib/audit";

export async function saveNotifAction(
  config: NotifConfig
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  try {
    // Bersihkan sasaran kosong.
    const clean: NotifConfig = {
      ...config,
      targets: (config.targets ?? []).filter((t) => t.to?.trim()).map((t) => ({
        label: (t.label ?? "").trim().slice(0, 60),
        to: t.to.trim(),
      })),
    };
    await saveNotifConfig(clean);
    await writeAudit("kemas-kini-notifikasi", "notifikasiTetapan", `${clean.targets.length} sasaran`);
    revalidatePath("/admin/notifikasi");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function testSendAction(
  to: string
): Promise<{ ok: boolean; status?: string; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  if (!to?.trim()) return { ok: false, error: "Sila masukkan nombor telefon atau JID group." };
  const r = await dispatchWhatsApp({
    to: to.trim(),
    message:
      "🧪 *Ujian Notifikasi PERKIB*\n\nJika anda menerima mesej ini, konfigurasi WhatsApp berjaya. — PERKIB",
    peristiwa: "ujian",
  });
  await writeAudit("ujian-notifikasi", to.trim(), `status: ${r.status}`);
  return { ok: r.ok, status: r.status, error: r.error };
}
