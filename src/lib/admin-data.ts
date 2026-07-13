// Data permohonan saguhati untuk panel admin. Guna klien tulis (token, tanpa
// CDN) supaya permohonan baru terus kelihatan.

import { getWriteClient } from "@/lib/sanity-write";

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
  dokumen: { url: string; filename: string }[];
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
  const filter =
    status && STATUS_LIST.includes(status as StatusPermohonan)
      ? `_type=="permohonanSaguhati" && status==$status`
      : `_type=="permohonanSaguhati"`;
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
    `*[_type=="permohonanSaguhati"]{ status }`,
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
  return client.fetch(
    `*[_type=="permohonanSaguhati" && _id==$id][0]{
       ${RINGKAS_FIELDS},
       emelPemohon, jawatanPemohon, jenisKod, catatan, catatanAdmin, tarikhKemaskini,
       "dokumen": dokumen[]{ "url": asset->url, "filename": asset->originalFilename }
     }`,
    { id },
    { cache: "no-store" }
  );
}
