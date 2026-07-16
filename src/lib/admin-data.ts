// Data permohonan saguhati untuk panel admin. Guna klien tulis (token, tanpa
// CDN) supaya permohonan baru terus kelihatan.

import { getWriteClient } from "@/lib/sanity-write";
import { decryptValue } from "@/lib/crypto";

export type PermohonanRingkas = {
  _id: string;
  nomborRujukan: string;
  namaPemohon: string;
  employeeNo: string;
  jenisNama: string;
  jenisKadar: number;
  status: string;
  tarikhMohon: string;
  masjidPemohon: string;
};

export type PermohonanPenuh = PermohonanRingkas & {
  emelPemohon: string;
  jawatanPemohon: string;
  jenisKod: string;
  catatan: string;
  catatanAdmin: string | null;
  tarikhKemaskini: string;
  dokumen: { ref: string; filename: string }[];
  bankNama: string | null;
  bankAkaunEnc: string | null;
  telefonPemohonEnc: string | null;
  bankTransfer: { bank?: string; tarikh?: string; rujukan?: string } | null;
};

export const STATUS_LIST = ["baru", "diproses", "lulus", "tolak", "dibayar"] as const;
export type StatusPermohonan = (typeof STATUS_LIST)[number];

export const STATUS_LABEL: Record<string, string> = {
  baru: "Baru",
  diproses: "Diproses",
  lulus: "Lulus",
  tolak: "Tolak",
  dibayar: "Dibayar",
};

const RINGKAS_FIELDS = `
  "_id": _id, nomborRujukan, namaPemohon, employeeNo,
  jenisNama, jenisKadar, status, tarikhMohon, masjidPemohon
`;

export async function getPermohonanList(status?: string): Promise<PermohonanRingkas[]> {
  const client = getWriteClient();
  if (!client) return [];
  // dibatalkan != true → permohonan yang di-soft-delete TERSEMBUNYI dari admin biasa.
  const filter =
    status && STATUS_LIST.includes(status as StatusPermohonan)
      ? `_type=="permohonanSaguhati" && status==$status && dibatalkan != true && !(_id in path("drafts.**"))`
      : `_type=="permohonanSaguhati" && dibatalkan != true && !(_id in path("drafts.**"))`;
  return client.fetch(
    `*[${filter}]|order(tarikhMohon desc){${RINGKAS_FIELDS}}`,
    status ? { status } : {},
    { cache: "no-store" }
  );
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  const client = getWriteClient();
  if (!client) return {};
  // GROQ tiada groupBy mudah — ambil semua status dan kira di JS.
  const all = await client.fetch<{ status: string }[]>(
    `*[_type=="permohonanSaguhati" && dibatalkan != true && !(_id in path("drafts.**"))]{ status }`,
    {},
    { cache: "no-store" }
  );
  const counts: Record<string, number> = { semua: all.length };
  for (const s of STATUS_LIST) counts[s] = 0;
  for (const r of all) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export async function getPermohonanById(id: string): Promise<PermohonanPenuh | null> {
  const client = getWriteClient();
  if (!client) return null;
  // dibatalkan != true → rekod di-soft-delete TAK boleh dibuka admin biasa
  // walaupun _id diketahui (URL terus). Pengurusan hanya di /admin/staf (gate kedua).
  return client.fetch(
    `*[_type=="permohonanSaguhati" && _id==$id && dibatalkan != true][0]{
       ${RINGKAS_FIELDS},
       emelPemohon, jawatanPemohon, jenisKod, catatan, catatanAdmin, tarikhKemaskini,
       bankNama, bankAkaunEnc, telefonPemohonEnc,
       bankTransfer{ bank, tarikh, rujukan },
       "dokumen": dokumen[]{ "ref": asset._ref, "filename": asset->originalFilename }
     }`,
    { id },
    { cache: "no-store" }
  );
}

// Sejarah permohonan seorang pegawai (untuk profil admin). Yang dibatalkan disorok.
export async function getPermohonanByEmployee(employeeNo: string): Promise<PermohonanRingkas[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="permohonanSaguhati" && employeeNo==$emp && dibatalkan != true && !(_id in path("drafts.**"))]|order(tarikhMohon desc){${RINGKAS_FIELDS}}`,
    { emp: employeeNo },
    { cache: "no-store" }
  );
}

export type PermohonanDibatalkan = PermohonanRingkas & {
  dibatalkanPada: string | null;
  sebabBatal: string | null;
};

// Permohonan yang DIBATALKAN (soft delete) — HANYA untuk pantauan /admin/staf
// (gate kedua). Admin biasa tidak nampak rekod ini di mana-mana.
export async function getPermohonanDibatalkan(): Promise<PermohonanDibatalkan[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="permohonanSaguhati" && dibatalkan == true && !(_id in path("drafts.**"))]|order(dibatalkanPada desc){
       ${RINGKAS_FIELDS}, "dibatalkanPada": dibatalkanPada, "sebabBatal": sebabBatal
     }`,
    {},
    { cache: "no-store" }
  );
}

export type PegawaiAdminRingkas = {
  employeeNo: string;
  nama: string;
  kategori: string;
  gred: string;
  masjidNama: string | null;
  zonNombor: number | null;
  photoUrl: string | null;
};

export async function getPegawaiAdminAll(): Promise<PegawaiAdminRingkas[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="pegawai" && !(_id in path("drafts.**"))]|order(nama asc){
       employeeNo, nama, kategori, gred,
       "masjidNama": masjid->nama, "zonNombor": masjid->zon->nombor,
       "photoUrl": gambar.asset->url
     }`,
    {},
    { cache: "no-store" }
  );
}

export type PegawaiAdminDetail = PegawaiAdminRingkas & {
  jawatanPenuh: string;
  emelRasmi: string;
  bahagian: string | null;
  statusPerjawatan: string | null;
  statusAktif: boolean;
  masjidId: string | null;
  zonNama: string | null;
  noKpEnc: string | null;
  telefonEnc: string | null;
  icLast4: string | null;
};

export async function getPegawaiAdminDetail(employeeNo: string): Promise<PegawaiAdminDetail | null> {
  const client = getWriteClient();
  if (!client) return null;
  return client.fetch(
    `*[_type=="pegawai" && employeeNo==$emp && !(_id in path("drafts.**"))][0]{
       employeeNo, nama, kategori, gred, jawatanPenuh, emelRasmi, bahagian, statusPerjawatan,
       "statusAktif": statusAktif != false,
       "masjidId": masjid._ref,
       "masjidNama": masjid->nama, "zonNombor": masjid->zon->nombor, "zonNama": masjid->zon->nama,
       "photoUrl": gambar.asset->url,
       noKpEnc, telefonEnc, icLast4
     }`,
    { emp: employeeNo },
    { cache: "no-store" }
  );
}

export async function getYuranPegawaiTahun(
  employeeNo: string,
  tahun: number
): Promise<Record<string, { dibayar?: boolean; amaun?: number; tarikh?: string }> | null> {
  const client = getWriteClient();
  if (!client) return null;
  return client.fetch(
    `*[_id==$id][0]{ m01,m02,m03,m04,m05,m06,m07,m08,m09,m10,m11,m12 }`,
    { id: `yuran-${employeeNo}-${tahun}` },
    { cache: "no-store" }
  );
}

export type PegawaiPenugasan = {
  employeeNo: string;
  nama: string;
  kategori: string;
  gred: string;
  masjidId: string | null;
  masjidNama: string | null;
  zonNombor: number | null;
};

export async function getPegawaiForPenugasan(): Promise<PegawaiPenugasan[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="pegawai" && !(_id in path("drafts.**"))]|order(nama asc){
       employeeNo, nama, kategori, gred,
       "masjidId": masjid._ref,
       "masjidNama": masjid->nama,
       "zonNombor": masjid->zon->nombor
     }`,
    {},
    { cache: "no-store" }
  );
}

export type MasjidOption = {
  id: string;
  nama: string;
  zonNombor: number | null;
  zonNama: string | null;
};

// Senarai semua tempat (masjid/surau/pejabat) untuk dropdown penugasan dlm borang CRUD pegawai.
export async function getMasjidOptions(): Promise<MasjidOption[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="masjid"]|order(zon->nombor asc, nama asc){
       "id": _id, nama, "zonNombor": zon->nombor, "zonNama": zon->nama
     }`,
    {},
    { cache: "no-store" }
  );
}

export type JenisAdmin = {
  _id: string;
  kod: string;
  bil: number;
  nama: string;
  kadar: number;
  hadMaksimum: number | null;
  aktif: boolean;
};

export async function getJenisForAdmin(): Promise<JenisAdmin[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="jenisSaguhati"]|order(bil asc){
       "_id": _id, kod, bil, nama, kadar, hadMaksimum, "aktif": aktif != false
     }`,
    {},
    { cache: "no-store" }
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────
export type DashboardStats = {
  permohonanBaru: number;
  permohonanSemua: number;
  belumDitugaskan: number;
  waGagal: number;
  kutipanTahunIni: number;
  tahun: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const client = getWriteClient();
  const tahun = new Date().getFullYear();
  if (!client) {
    return { permohonanBaru: 0, permohonanSemua: 0, belumDitugaskan: 0, waGagal: 0, kutipanTahunIni: 0, tahun };
  }
  const [permohonanBaru, permohonanSemua, belumDitugaskan, waGagal, yuranDocs] = await Promise.all([
    client.fetch<number>(`count(*[_type=="permohonanSaguhati" && status=="baru" && dibatalkan != true && !(_id in path("drafts.**"))])`, {}, { cache: "no-store" }),
    client.fetch<number>(`count(*[_type=="permohonanSaguhati" && dibatalkan != true && !(_id in path("drafts.**"))])`, {}, { cache: "no-store" }),
    client.fetch<number>(`count(*[_type=="pegawai" && !defined(masjid) && !(_id in path("drafts.**"))])`, {}, { cache: "no-store" }),
    client.fetch<number>(`count(*[_type=="waOutbox" && status=="failed"])`, {}, { cache: "no-store" }),
    client.fetch<Array<Record<string, { dibayar?: boolean; amaun?: number }>>>(
      `*[_type=="yuranTahunan" && tahun==$t]{ m01,m02,m03,m04,m05,m06,m07,m08,m09,m10,m11,m12 }`,
      { t: tahun },
      { cache: "no-store" }
    ),
  ]);
  let kutipanTahunIni = 0;
  for (const doc of yuranDocs) {
    for (const k of Object.keys(doc)) {
      const m = doc[k];
      if (m?.dibayar) kutipanTahunIni += m.amaun ?? 0;
    }
  }
  return { permohonanBaru, permohonanSemua, belumDitugaskan, waGagal, kutipanTahunIni, tahun };
}

export type AuditEntry = { _id: string; masa: string; aksi: string; sasaran: string; ringkasan: string };

export async function getRecentAudit(limit = 8): Promise<AuditEntry[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="auditLog"]|order(masa desc)[0...$n]{ "_id": _id, masa, aksi, sasaran, ringkasan }`,
    { n: limit },
    { cache: "no-store" }
  );
}

export type OutboxEntry = {
  _id: string;
  masa: string;
  peristiwa: string;
  status: string;
  toMask: string;
  ralat: string | null;
  refPermohonan: string | null;
};

export async function getRecentOutbox(limit = 10): Promise<OutboxEntry[]> {
  const client = getWriteClient();
  if (!client) return [];
  return client.fetch(
    `*[_type=="waOutbox"]|order(masa desc)[0...$n]{
       "_id": _id, masa, peristiwa, status, toMask, ralat, refPermohonan
     }`,
    { n: limit },
    { cache: "no-store" }
  );
}

// ── Maklum balas (borang /hubungi) ─────────────────────────────────────
export type MaklumBalasItem = {
  _id: string;
  masa: string;
  status: string;
  nama: string;
  emel: string;
  telefon: string;
  subjek: string;
  mesej: string;
};

export async function getMaklumBalasList(): Promise<MaklumBalasItem[]> {
  const client = getWriteClient();
  if (!client) return [];
  const rows = await client.fetch<{ _id: string; masa: string; status: string; dataEnc: string }[]>(
    `*[_type=="maklumBalas" && !(_id in path("drafts.**"))]|order(masa desc){ "_id": _id, masa, status, dataEnc }`,
    {},
    { cache: "no-store" }
  );
  return rows.map((r) => {
    let d: { nama?: string; emel?: string; telefon?: string; subjek?: string; mesej?: string } = {};
    try {
      const json = decryptValue(r.dataEnc);
      if (json) d = JSON.parse(json);
    } catch {
      /* biar kosong jika nyahsulit gagal */
    }
    return {
      _id: r._id,
      masa: r.masa,
      status: r.status ?? "baru",
      nama: d.nama ?? "",
      emel: d.emel ?? "",
      telefon: d.telefon ?? "",
      subjek: d.subjek ?? "",
      mesej: d.mesej ?? "",
    };
  });
}

export async function getMaklumBalasBaruCount(): Promise<number> {
  const client = getWriteClient();
  if (!client) return 0;
  return client.fetch<number>(
    `count(*[_type=="maklumBalas" && status=="baru" && !(_id in path("drafts.**"))])`,
    {},
    { cache: "no-store" }
  );
}
