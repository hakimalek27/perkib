"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWriteClient } from "@/lib/sanity-write";
import { writeAudit } from "@/lib/audit";

const STATUS = ["baru", "dibaca", "selesai"] as const;

export async function setMaklumBalasStatusAction(
  id: string,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  if (!(STATUS as readonly string[]).includes(status)) {
    return { ok: false, error: "Status tidak sah." };
  }
  if (!/^[\w.-]{6,80}$/.test(id)) return { ok: false, error: "ID tidak sah." };

  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    await client.patch(id).set({ status }).commit();
    await writeAudit("kemas-status-maklumbalas", id, `Status maklum balas → ${status}`);
    revalidatePath("/admin/maklum-balas");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[maklum-balas] gagal set status", err);
    return { ok: false, error: "Gagal mengemas kini status." };
  }
}
