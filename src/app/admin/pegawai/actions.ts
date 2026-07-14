"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWriteClient } from "@/lib/sanity-write";
import { writeAudit } from "@/lib/audit";
import { encryptValue, isEncryptionConfigured } from "@/lib/crypto";

export type PegawaiActionResult = {
  ok: boolean;
  error?: string;
  employeeNo?: string;
  referenced?: boolean; // buang gagal kerana pegawai dirujuk rekod lain
};

const KATEGORI = ["ketua-imam", "timbalan-ketua-imam", "bilal"] as const;
const MAX_FOTO = 5 * 1024 * 1024;
const FOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function s(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

type ParsedCore = {
  nama: string;
  kategori: (typeof KATEGORI)[number];
  jawatanPenuh: string;
  emelRasmi: string;
  gred: string;
  masjidId: string;
  noKp: string;
  telefon: string;
  statusAktif: boolean;
};

// Validasi berkongsi cipta/kemas kini. Pulangkan mesej ralat yang MEMBETULKAN.
function parseCore(fd: FormData): { data?: ParsedCore; error?: string } {
  const nama = s(fd, "nama");
  const kategori = s(fd, "kategori");
  const emelRasmi = s(fd, "emelRasmi");
  const noKp = s(fd, "noKp");
  const telefon = s(fd, "telefon");

  if (nama.length < 3) return { error: "Nama mestilah sekurang-kurangnya 3 aksara." };
  if (!(KATEGORI as readonly string[]).includes(kategori))
    return { error: "Sila pilih kategori yang sah (Ketua Imam / Timbalan / Bilal)." };
  if (emelRasmi && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emelRasmi))
    return { error: "Format emel tidak sah (cth. nama@maiwp.gov.my)." };
  if (noKp && !/^\d{12}$/.test(noKp))
    return { error: "No. Kad Pengenalan mestilah 12 digit tanpa sengkang." };
  if (telefon && !/^0\d{8,11}$/.test(telefon))
    return { error: "No. telefon mestilah bermula 0 dan 9–12 digit (cth. 0123456789)." };

  return {
    data: {
      nama,
      kategori: kategori as (typeof KATEGORI)[number],
      jawatanPenuh: s(fd, "jawatanPenuh"),
      emelRasmi,
      gred: s(fd, "gred"),
      masjidId: s(fd, "masjidId"),
      noKp,
      telefon,
      statusAktif: s(fd, "statusAktif") === "on" || s(fd, "statusAktif") === "true",
    },
  };
}

// Muat naik foto (jika ada) → pulangkan _id aset, atau null jika tiada fail.
async function uploadFoto(
  client: NonNullable<ReturnType<typeof getWriteClient>>,
  fd: FormData,
  employeeNo: string
): Promise<{ ref?: string | null; error?: string }> {
  const gambar = fd.get("gambar");
  if (!(gambar instanceof File) || gambar.size === 0) return { ref: null };
  if (gambar.size > MAX_FOTO) return { error: "Foto melebihi had 5MB." };
  if (!FOTO_TYPES.includes(gambar.type)) return { error: "Foto mesti format JPG, PNG atau WEBP." };
  const buffer = Buffer.from(await gambar.arrayBuffer());
  const ext = gambar.type === "image/png" ? "png" : gambar.type === "image/webp" ? "webp" : "jpg";
  const asset = await client.assets.upload("image", buffer, {
    filename: `pegawai-${employeeNo}.${ext}`,
  });
  return { ref: asset._id };
}

function revalidatePegawai() {
  revalidatePath("/admin/pegawai");
  revalidatePath("/admin/penugasan");
  revalidatePath("/admin");
  revalidatePath("/pegawai");
  revalidatePath("/"); // statistik homepage
}

export async function createPegawaiAction(fd: FormData): Promise<PegawaiActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  if (!isEncryptionConfigured())
    return { ok: false, error: "DATA_ENCRYPTION_KEY belum ditetapkan — tidak boleh simpan IC/telefon." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia (token tulis Sanity)." };

  const employeeNo = s(fd, "employeeNo");
  if (!/^\d{2,6}$/.test(employeeNo))
    return { ok: false, error: "No. Pekerja mestilah 2–6 digit." };

  const parsed = parseCore(fd);
  if (parsed.error || !parsed.data) return { ok: false, error: parsed.error };
  const d = parsed.data;

  const docId = `pegawai-${employeeNo}`;
  try {
    const wujud = await client.fetch<string | null>(`*[_id==$id][0]._id`, { id: docId }, { cache: "no-store" });
    if (wujud) return { ok: false, error: `No. Pekerja ${employeeNo} sudah wujud dalam sistem.` };

    const foto = await uploadFoto(client, fd, employeeNo);
    if (foto.error) return { ok: false, error: foto.error };

    const setFields: Record<string, unknown> = {
      employeeNo,
      nama: d.nama,
      kategori: d.kategori,
      jawatanPenuh: d.jawatanPenuh,
      emelRasmi: d.emelRasmi,
      gred: d.gred,
      statusAktif: d.statusAktif,
    };
    if (d.noKp) {
      setFields.noKpEnc = encryptValue(d.noKp);
      setFields.icLast4 = d.noKp.slice(-4);
    }
    if (d.telefon) setFields.telefonEnc = encryptValue(d.telefon);
    if (d.masjidId) setFields.masjid = { _type: "reference", _ref: d.masjidId };
    if (foto.ref) setFields.gambar = { _type: "image", asset: { _type: "reference", _ref: foto.ref } };

    await client.createIfNotExists({ _id: docId, _type: "pegawai", employeeNo });
    await client.patch(docId).set(setFields).commit();
    await writeAudit("cipta-pegawai", employeeNo, `${d.nama} (${d.kategori})`);
    revalidatePegawai();
    return { ok: true, employeeNo };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function updatePegawaiAction(
  employeeNo: string,
  fd: FormData
): Promise<PegawaiActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  if (!isEncryptionConfigured())
    return { ok: false, error: "DATA_ENCRYPTION_KEY belum ditetapkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };

  const parsed = parseCore(fd);
  if (parsed.error || !parsed.data) return { ok: false, error: parsed.error };
  const d = parsed.data;

  const docId = `pegawai-${employeeNo}`;
  try {
    const foto = await uploadFoto(client, fd, employeeNo);
    if (foto.error) return { ok: false, error: foto.error };

    const setFields: Record<string, unknown> = {
      nama: d.nama,
      kategori: d.kategori,
      jawatanPenuh: d.jawatanPenuh,
      emelRasmi: d.emelRasmi,
      gred: d.gred,
      statusAktif: d.statusAktif,
    };
    const unsetFields: string[] = [];
    // IC/telefon: hanya kemas kini jika diisi (kosong = kekalkan sedia ada).
    if (d.noKp) {
      setFields.noKpEnc = encryptValue(d.noKp);
      setFields.icLast4 = d.noKp.slice(-4);
    }
    if (d.telefon) setFields.telefonEnc = encryptValue(d.telefon);
    if (d.masjidId) setFields.masjid = { _type: "reference", _ref: d.masjidId };
    else unsetFields.push("masjid");
    if (foto.ref) setFields.gambar = { _type: "image", asset: { _type: "reference", _ref: foto.ref } };

    let patch = client.patch(docId).set(setFields);
    if (unsetFields.length) patch = patch.unset(unsetFields);
    await patch.commit();
    await writeAudit("kemas-kini-pegawai", employeeNo, d.nama);
    revalidatePegawai();
    return { ok: true, employeeNo };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deletePegawaiAction(employeeNo: string): Promise<PegawaiActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };

  const docId = `pegawai-${employeeNo}`;
  try {
    await client.delete(docId);
    await writeAudit("padam-pegawai", employeeNo, "Dokumen dipadam sepenuhnya");
    revalidatePegawai();
    return { ok: true };
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    const referenced =
      e.statusCode === 409 || /referenc/i.test(e.message ?? "") || /cannot delete/i.test(e.message ?? "");
    if (referenced) {
      return {
        ok: false,
        referenced: true,
        error:
          "Pegawai ini mempunyai rekod (permohonan saguhati / yuran) yang merujuknya, jadi tidak boleh dipadam sepenuhnya. Nyahaktifkan sebaliknya untuk menyembunyikannya dari senarai awam.",
      };
    }
    return { ok: false, error: e.message ?? "Ralat memadam." };
  }
}

export async function setPegawaiAktifAction(
  employeeNo: string,
  aktif: boolean
): Promise<PegawaiActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };

  const docId = `pegawai-${employeeNo}`;
  try {
    if (aktif) {
      await client.patch(docId).set({ statusAktif: true }).commit();
      await writeAudit("aktif-pegawai", employeeNo, "Diaktifkan semula");
    } else {
      // Nyahaktif: sembunyi dari awam + tanggalkan penugasan masjid.
      await client.patch(docId).set({ statusAktif: false }).unset(["masjid"]).commit();
      await writeAudit("nyahaktif-pegawai", employeeNo, "Dinyahaktifkan + ditanggalkan dari masjid");
    }
    revalidatePegawai();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
