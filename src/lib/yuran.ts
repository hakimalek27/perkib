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

// ── Semakan yuran individu (UI /yuran/semak + webhook WhatsApp) ───────────
export const BULAN_PENUH = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

export type RekodYuranTahun = {
  tahun: number;
  bulan: YuranBulan[]; // 12 (indeks 0 = Januari)
  bilDibayar: number;
  jumlahDibayar: number;
};

export async function ambilRekodYuran(employeeNo: string, tahun: number): Promise<RekodYuranTahun> {
  const client = getWriteClient();
  const doc = client
    ? await client.fetch<Record<string, YuranBulan> | null>(
        `*[_id==$id][0]{ ${MONTH_KEYS.join(", ")} }`,
        { id: `yuran-${employeeNo}-${tahun}` },
        { cache: "no-store" }
      )
    : null;
  const bulan: YuranBulan[] = MONTH_KEYS.map((k) => {
    const m = (doc?.[k] as YuranBulan | undefined) ?? { dibayar: false };
    return { dibayar: Boolean(m.dibayar), tarikh: m.tarikh, amaun: m.amaun, kaedah: m.kaedah };
  });
  const bilDibayar = bulan.filter((b) => b.dibayar).length;
  const jumlahDibayar = bulan.reduce((s, b) => s + (b.dibayar ? b.amaun ?? 0 : 0), 0);
  return { tahun, bulan, bilDibayar, jumlahDibayar };
}

// Teks WhatsApp BM ringkas untuk balasan keyword "yuran".
export function formatYuranMesej(nama: string, employeeNo: string, rekod: RekodYuranTahun[]): string {
  const baris: string[] = ["*Rekod Yuran Keahlian PERKIB*", `Nama: ${nama}`, `No. Pekerja: ${employeeNo}`];
  for (const r of rekod) {
    baris.push("", `*Tahun ${r.tahun}*`);
    baris.push(r.bulan.map((b, i) => `${b.dibayar ? "✅" : "⬜"} ${BULAN_PENDEK[i]}`).join("  "));
    baris.push(
      r.bilDibayar > 0
        ? `Dibayar: ${r.bilDibayar}/12 bulan${r.jumlahDibayar > 0 ? ` (RM${r.jumlahDibayar.toFixed(2)})` : ""}`
        : "Belum ada rekod bayaran."
    );
  }
  baris.push("", "_Semakan rasmi: perkib.my/yuran/semak_");
  return baris.join("\n");
}
