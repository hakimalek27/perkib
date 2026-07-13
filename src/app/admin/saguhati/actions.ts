"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWriteClient } from "@/lib/sanity-write";
import { decryptValue } from "@/lib/crypto";
import { writeAudit } from "@/lib/audit";
import { notifyStatusPemohon } from "@/lib/notifikasi";

type StatusEvent = "lulus-pemohon" | "tolak-pemohon" | "dibayar-pemohon";

export type StatusUpdate = {
  status: "baru" | "diproses" | "lulus" | "tolak" | "dibayar";
  catatanAdmin?: string;
  transferBank?: string;
  transferTarikh?: string;
  transferRujukan?: string;
};

const EVENT_FOR: Partial<Record<StatusUpdate["status"], StatusEvent>> = {
  lulus: "lulus-pemohon",
  tolak: "tolak-pemohon",
  dibayar: "dibayar-pemohon",
};

export async function updateStatusAction(
  id: string,
  update: StatusUpdate
): Promise<{ ok: boolean; error?: string; waStatus?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };

  try {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: update.status,
      catatanAdmin: update.catatanAdmin ?? "",
      tarikhKemaskini: now,
    };
    if (update.transferBank || update.transferTarikh || update.transferRujukan) {
      patch.bankTransfer = {
        bank: update.transferBank ?? "",
        tarikh: update.transferTarikh || undefined,
        rujukan: update.transferRujukan ?? "",
      };
    }
    await client.patch(id).set(patch).commit();

    // Ambil semula untuk notifikasi (nama, telefon, bank).
    const doc = await client.fetch<{
      nomborRujukan?: string;
      namaPemohon?: string;
      jenisNama?: string;
      jenisKadar?: number;
      bankNama?: string;
      bankAkaunEnc?: string;
      telefonPemohonEnc?: string;
    } | null>(
      `*[_id==$id][0]{ nomborRujukan, namaPemohon, jenisNama, jenisKadar, bankNama, bankAkaunEnc, telefonPemohonEnc }`,
      { id }
    );

    await writeAudit(
      "kemas-kini-status-saguhati",
      doc?.nomborRujukan ?? id,
      `Status → ${update.status}`
    );

    let waStatus: string | undefined;
    const event = EVENT_FOR[update.status];
    if (event && doc) {
      const telefon = decryptValue(doc.telefonPemohonEnc);
      const bankAkaun = decryptValue(doc.bankAkaunEnc);
      await notifyStatusPemohon(event, telefon, {
        refNo: doc.nomborRujukan ?? "",
        nama: doc.namaPemohon ?? "",
        noPekerja: "",
        masjid: "",
        jenis: doc.jenisNama ?? "",
        kadar: doc.jenisKadar ?? 0,
        bankNama: doc.bankNama ?? "",
        bankAkaun: bankAkaun ?? "",
        catatan: update.catatanAdmin ?? "",
        bankTransfer: update.transferBank ?? "",
        tarikhTransfer: update.transferTarikh ?? "",
        rujukanTransfer: update.transferRujukan ?? "",
        status: update.status,
      });
      waStatus = telefon ? "dihantar" : "tiada-telefon";
    }

    revalidatePath(`/admin/saguhati/${id}`);
    revalidatePath("/admin/saguhati");
    revalidatePath("/admin");
    return { ok: true, waStatus };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateJenisAction(
  id: string,
  fields: { hadMaksimum: number | null; kadar: number; aktif: boolean }
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const patch = client.patch(id).set({ kadar: fields.kadar, aktif: fields.aktif });
    if (fields.hadMaksimum == null) patch.unset(["hadMaksimum"]);
    else patch.set({ hadMaksimum: fields.hadMaksimum });
    await patch.commit();
    await writeAudit("kemas-kini-jenis-saguhati", id, `kadar RM${fields.kadar}, had ${fields.hadMaksimum ?? "∞"}`);
    revalidatePath("/admin/saguhati/tetapan");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
