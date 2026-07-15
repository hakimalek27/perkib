"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isStafGateAuthenticated } from "@/lib/staf-gate";
import { getWriteClient } from "@/lib/sanity-write";
import { encryptValue, decryptValue } from "@/lib/crypto";
import { writeAudit } from "@/lib/audit";

// ⚠️ Guard BERGANDA: sesi admin + gate kata laluan kedua /admin/staf.
// Fungsi urus rekod (padam/edit permohonan + padam maklum balas) HANYA di sini —
// admin biasa TIDAK boleh padam. Semua action mesti lulus ensureGate() dahulu.
async function ensureGate(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan (sesi admin diperlukan)." };
  if (!(await isStafGateAuthenticated())) return { ok: false, error: "Tidak dibenarkan (gate staf diperlukan)." };
  return { ok: true };
}

export type ActionResult = { ok: boolean; error?: string };

// ── Permohonan saguhati ──────────────────────────────────────────────────
export async function deletePermohonanAction(
  id: string
): Promise<ActionResult & { referenced?: boolean }> {
  const g = await ensureGate();
  if (!g.ok) return g;
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const doc = await client.fetch<{ nomborRujukan?: string } | null>(
      `*[_id==$id][0]{ nomborRujukan }`,
      { id }
    );
    await client.delete(id);
    await writeAudit("padam-saguhati", doc?.nomborRujukan ?? id, "Permohonan dipadam sepenuhnya (gate staf)");
    revalidatePath("/admin/saguhati");
    revalidatePath("/admin/staf");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    const referenced =
      e.statusCode === 409 || /referenc/i.test(e.message ?? "") || /cannot delete/i.test(e.message ?? "");
    if (referenced) return { ok: false, referenced: true, error: "Rekod dirujuk dokumen lain — tidak boleh dipadam." };
    return { ok: false, error: e.message ?? "Ralat memadam." };
  }
}

export type EditButiran = {
  bankNama: string;
  bankAkaun: string; // kosong = tak ubah
  telefon: string; // kosong = tak ubah
  catatanAdmin: string;
};

export async function updatePermohonanAction(id: string, fields: EditButiran): Promise<ActionResult> {
  const g = await ensureGate();
  if (!g.ok) return g;
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };

  const bankAkaun = fields.bankAkaun.replace(/[\s-]/g, "");
  const telefon = fields.telefon.replace(/[\s-]/g, "");
  if (bankAkaun && !/^\d{6,20}$/.test(bankAkaun)) {
    return { ok: false, error: "No. akaun bank tidak sah (6–20 digit)." };
  }
  if (telefon && !/^0\d{8,11}$/.test(telefon)) {
    return { ok: false, error: "No. telefon tidak sah (cth. 0123456789)." };
  }

  try {
    const patch: Record<string, unknown> = {
      bankNama: fields.bankNama.trim(),
      catatanAdmin: fields.catatanAdmin.trim(),
    };
    // Kosong = tak ubah (kekalkan nilai enkripsi sedia ada).
    if (bankAkaun) patch.bankAkaunEnc = encryptValue(bankAkaun);
    if (telefon) patch.telefonPemohonEnc = encryptValue(telefon);
    await client.patch(id).set(patch).commit();
    const doc = await client.fetch<{ nomborRujukan?: string } | null>(
      `*[_id==$id][0]{ nomborRujukan }`,
      { id }
    );
    await writeAudit(
      "kemas-kini-butiran-saguhati",
      doc?.nomborRujukan ?? id,
      "Butiran bank/telefon/catatan dikemas kini (gate staf)"
    );
    revalidatePath(`/admin/saguhati/${id}`);
    revalidatePath("/admin/saguhati");
    revalidatePath("/admin/staf");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export type ButiranPermohonan = {
  bankNama: string;
  bankAkaun: string;
  telefon: string;
  catatanAdmin: string;
};

// Dekripsi butiran SATU rekod atas permintaan (elak hantar semua PII sekali gus).
export async function bacaButiranPermohonanAction(
  id: string
): Promise<{ ok: boolean; butiran?: ButiranPermohonan; error?: string }> {
  const g = await ensureGate();
  if (!g.ok) return { ok: false, error: g.error };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const doc = await client.fetch<{
      bankNama?: string;
      bankAkaunEnc?: string;
      telefonPemohonEnc?: string;
      catatanAdmin?: string;
    } | null>(
      `*[_id==$id][0]{ bankNama, bankAkaunEnc, telefonPemohonEnc, catatanAdmin }`,
      { id }
    );
    if (!doc) return { ok: false, error: "Rekod tidak dijumpai." };
    return {
      ok: true,
      butiran: {
        bankNama: doc.bankNama ?? "",
        bankAkaun: decryptValue(doc.bankAkaunEnc) ?? "",
        telefon: decryptValue(doc.telefonPemohonEnc) ?? "",
        catatanAdmin: doc.catatanAdmin ?? "",
      },
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ── Maklum balas ─────────────────────────────────────────────────────────
export async function deleteMaklumBalasAction(id: string): Promise<ActionResult> {
  const g = await ensureGate();
  if (!g.ok) return g;
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    await client.delete(id);
    await writeAudit("padam-maklumbalas", id, "Mesej maklum balas dipadam (gate staf)");
    revalidatePath("/admin/maklum-balas");
    revalidatePath("/admin/staf");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
