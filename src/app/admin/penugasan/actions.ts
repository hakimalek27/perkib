"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWriteClient } from "@/lib/sanity-write";
import { writeAudit } from "@/lib/audit";

export async function assignPegawaiAction(
  employeeNo: string,
  masjidId: string | null,
  masjidNama?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  const docId = `pegawai-${employeeNo}`;
  try {
    if (masjidId) {
      await client.patch(docId).set({ masjid: { _type: "reference", _ref: masjidId } }).commit();
      await writeAudit("tugaskan-pegawai", employeeNo, `→ ${masjidNama ?? masjidId}`);
    } else {
      await client.patch(docId).unset(["masjid"]).commit();
      await writeAudit("nyahtugas-pegawai", employeeNo, "→ Belum Ditugaskan");
    }
    revalidatePath("/admin/penugasan");
    revalidatePath("/pegawai");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
