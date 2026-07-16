"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated, checkAdminPassword } from "@/lib/admin-auth";
import { isStafGateAuthenticated, checkStafGatePassword } from "@/lib/staf-gate";
import { getWriteClient } from "@/lib/sanity-write";
import { encryptValue, decryptValue } from "@/lib/crypto";
import { hashPassword } from "@/lib/password-hash";
import { fixedWindow, fixedWindowReset } from "@/lib/rate-limit";
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

// Soft delete — batalkan permohonan (bukan padam kekal). Selepas ini rekod
// TERSEMBUNYI dari admin biasa + semak pemohon; hanya /admin/staf boleh pantau
// & pulihkan. Boleh dipulihkan (pulihPermohonanAction) atau dipadam kekal.
export async function batalPermohonanAction(id: string, sebab?: string): Promise<ActionResult> {
  const g = await ensureGate();
  if (!g.ok) return g;
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const doc = await client.fetch<{ nomborRujukan?: string } | null>(`*[_id==$id][0]{ nomborRujukan }`, { id });
    const sebabBersih = (sebab ?? "").trim().slice(0, 300);
    await client
      .patch(id)
      .set({ dibatalkan: true, dibatalkanPada: new Date().toISOString(), sebabBatal: sebabBersih })
      .commit();
    await writeAudit(
      "batal-saguhati",
      doc?.nomborRujukan ?? id,
      `Permohonan dibatalkan (soft delete, gate staf)${sebabBersih ? ` — ${sebabBersih.slice(0, 120)}` : ""}`
    );
    revalidatePath("/admin/saguhati");
    revalidatePath("/admin/staf");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// Pulihkan permohonan yang dibatalkan (undo soft delete) — kembali kelihatan.
export async function pulihPermohonanAction(id: string): Promise<ActionResult> {
  const g = await ensureGate();
  if (!g.ok) return g;
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const doc = await client.fetch<{ nomborRujukan?: string } | null>(`*[_id==$id][0]{ nomborRujukan }`, { id });
    await client.patch(id).set({ dibatalkan: false }).unset(["dibatalkanPada", "sebabBatal"]).commit();
    await writeAudit("pulih-saguhati", doc?.nomborRujukan ?? id, "Permohonan dipulihkan (nyahbatal, gate staf)");
    revalidatePath("/admin/saguhati");
    revalidatePath("/admin/staf");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
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

// ── Tukar kata laluan (admin / gate staf) ────────────────────────────────
// Simpan HASH scrypt dlm singleton adminTetapan (bukan plaintext). Selepas ini,
// env ADMIN_PASSWORD / STAF_GATE_PASSWORD jadi fallback tak aktif (kekal sbg
// bootstrap / talian penyelamat bila Sanity gagal dibaca). Guard BERGANDA +
// sahkan kata laluan semasa + rate limit + audit.
export async function tukarKataLaluanAction(
  jenis: "admin" | "staf",
  semasa: string,
  baru: string,
  sahkan: string
): Promise<ActionResult> {
  const g = await ensureGate();
  if (!g.ok) return g;

  // Rate limit — sudah di sebalik gate berganda, jadi kunci global (bukan per-IP).
  const rlKey = `tukar-kl:${jenis}`;
  const rl = fixedWindow(rlKey, { limit: 5, windowMs: 15 * 60 * 1000, cooldownMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    const mins = Math.ceil(rl.retryAfterMs / 60000);
    return { ok: false, error: `Terlalu banyak percubaan. Cuba semula dalam ${mins} minit.` };
  }

  if (typeof baru !== "string" || baru.length < 12) {
    return { ok: false, error: "Kata laluan baharu mesti sekurang-kurangnya 12 aksara." };
  }
  if (baru !== sahkan) return { ok: false, error: "Kata laluan baharu & pengesahan tidak sepadan." };
  if (baru === semasa) return { ok: false, error: "Kata laluan baharu mesti berbeza daripada kata laluan semasa." };

  // Sahkan kata laluan semasa (hash Sanity atau env).
  const semasaBetul = jenis === "admin"
    ? await checkAdminPassword(semasa)
    : await checkStafGatePassword(semasa);
  if (!semasaBetul) return { ok: false, error: "Kata laluan semasa tidak betul." };

  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };

  const field = jenis === "admin" ? "adminPasswordHash" : "stafGatePasswordHash";
  try {
    await client.createIfNotExists({ _id: "adminTetapan", _type: "adminTetapan" });
    await client.patch("adminTetapan").set({ [field]: hashPassword(baru) }).commit();
    fixedWindowReset(rlKey);
    await writeAudit(
      "tukar-kata-laluan",
      jenis,
      `Kata laluan ${jenis === "admin" ? "admin" : "gate staf"} ditukar (gate staf)`
    );
    return { ok: true };
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
