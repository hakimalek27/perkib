// Data yuran keahlian — untuk bendahari. Server-only (guna klien tulis Sanity).

import { getWriteClient } from "./sanity-write";

export type KadarGred = { gred: string; bulanan: number };
export type YuranBulan = { dibayar: boolean; tarikh?: string; amaun?: number; kaedah?: string };

export type YuranRow = {
  employeeNo: string;
  nama: string;
  gred: string;
  masjidNama: string | null;
  zonNombor: number | null;
  kadar: number; // kadar bulanan untuk gred pegawai (0 jika tidak ditetapkan)
  bulan: YuranBulan[]; // 12 (indeks 0 = Januari)
  jumlah: number; // jumlah dibayar tahun ini
};

export const BULAN_PENDEK = [
  "Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis",
];

export async function getKadarYuran(): Promise<KadarGred[]> {
  const client = getWriteClient();
  if (!client) return [];
  const doc = await client.fetch<{ kadar?: KadarGred[] } | null>(
    `*[_id=="yuranTetapan"][0]{ kadar }`,
    {},
    { cache: "no-store" }
  );
  return doc?.kadar ?? [];
}

const MONTH_KEYS = Array.from({ length: 12 }, (_, i) => `m${String(i + 1).padStart(2, "0")}`);

export async function getYuranMatrix(
  tahun: number,
  zon?: number
): Promise<YuranRow[]> {
  const client = getWriteClient();
  if (!client) return [];

  const zonFilter = zon ? ` && masjid->zon->nombor==$zon` : "";
  const [pegawai, yuranDocs, kadarList] = await Promise.all([
    client.fetch<Array<{ employeeNo: string; nama: string; gred: string; masjidNama: string | null; zonNombor: number | null }>>(
      `*[_type=="pegawai"${zonFilter}]|order(masjid->zon->nombor asc, nama asc){
         employeeNo, nama, gred, "masjidNama": masjid->nama, "zonNombor": masjid->zon->nombor
       }`,
      zon ? { zon } : {},
      { cache: "no-store" }
    ),
    client.fetch<Array<Record<string, unknown>>>(
      `*[_type=="yuranTahunan" && tahun==$t]{ employeeNo, ${MONTH_KEYS.join(", ")} }`,
      { t: tahun },
      { cache: "no-store" }
    ),
    getKadarYuran(),
  ]);

  const kadarByGred = new Map(kadarList.map((k) => [k.gred, k.bulanan]));
  const yuranByEmp = new Map(yuranDocs.map((d) => [String(d.employeeNo), d]));

  return pegawai.map((p) => {
    const doc = yuranByEmp.get(p.employeeNo);
    const bulan: YuranBulan[] = MONTH_KEYS.map((k) => {
      const m = (doc?.[k] as YuranBulan | undefined) ?? { dibayar: false };
      return { dibayar: Boolean(m.dibayar), tarikh: m.tarikh, amaun: m.amaun, kaedah: m.kaedah };
    });
    const jumlah = bulan.reduce((s, m) => s + (m.dibayar ? m.amaun ?? 0 : 0), 0);
    return {
      employeeNo: p.employeeNo,
      nama: p.nama,
      gred: p.gred,
      masjidNama: p.masjidNama,
      zonNombor: p.zonNombor,
      kadar: kadarByGred.get(p.gred) ?? 0,
      bulan,
      jumlah,
    };
  });
}

export type YuranRingkasan = {
  kutipanTahun: number;
  kutipanBulanIni: number;
  bilPegawai: number;
  bilLunas: number; // pegawai yang bayar penuh 12 bulan
};

export function ringkasan(rows: YuranRow[], bulanSemasa: number): YuranRingkasan {
  let kutipanTahun = 0;
  let kutipanBulanIni = 0;
  let bilLunas = 0;
  for (const r of rows) {
    kutipanTahun += r.jumlah;
    const m = r.bulan[bulanSemasa - 1];
    if (m?.dibayar) kutipanBulanIni += m.amaun ?? 0;
    if (r.bulan.every((b) => b.dibayar)) bilLunas++;
  }
  return { kutipanTahun, kutipanBulanIni, bilPegawai: rows.length, bilLunas };
}
