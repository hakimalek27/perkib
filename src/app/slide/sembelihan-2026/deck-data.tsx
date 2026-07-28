/* Slaid "Penyembelihan Halal" — modul latihan PERKIB (Mohd Jabal B Abdul Rahim).
   Setiap slaid dirender daripada deck asal (1920×1080 → webp) supaya paparan
   KEKAL SAMA seperti fail asal. Animasi galaxy/3D ialah pembalut sahaja. */

export const SLIDE_COUNT = 60;

export const TAJUK: string[] = [
  "Penyembelihan Halal — Modul Latihan PERKIB",
  "Objektif Program",
  "Pengenalan — Surah Al-Ma'idah 5:3",
  "Hukum Menyembelih",
  "Bahagian Satu — Rukun Sembelihan",
  "Rukun 01 — Penyembelih",
  "Rukun 02 — Alat Sembelihan",
  "Dalil — Alat Sembelihan (Riwayat Muslim)",
  "Rukun 03 — Definisi Proses Penyembelihan",
  "Perlaksanaan — Empat Kaedah",
  "Kaedah 01 — الذبح (Al-Zabh)",
  "Kaedah 02 — النحر (Al-Nahr)",
  "النحر — Kedudukan Labbah",
  "Rujukan Visual",
  "Syarat Sembelihan (Proses)",
  "Kalimah Sembelihan",
  "Anatomi Leher",
  "Rujukan Visual — Kawasan Sembelihan",
  "Rujukan Visual",
  "Kawasan Penyembelihan Lembu",
  "Anatomi — Istilah",
  "Keratan Rentas Leher Ayam",
  "Rujukan Visual — Anatomi",
  "Amali — Kedudukan Sembelihan",
  "Amali — Teknik",
  "Amali — Sembelihan Ayam",
  "Amali — Perbandingan",
  "Amali — Rumah Sembelih",
  "Amali — Pengendalian",
  "Amali — Proses",
  "Rukun 04 — Haiwan Sembelihan",
  "Dua Keadaan — Haiwan Mampu Dikuasai",
  "Dua Keadaan — Haiwan Tidak Mampu Dikuasai",
  "Situasi Sembelihan",
  "Pemeriksaan Ayam",
  "Hikmah Sembelihan (1/2)",
  "Hikmah Sembelihan (2/2)",
  "Kajian Sains (1/5) — Latar Kajian",
  "Kajian Sains (2/5) — Metodologi",
  "Kajian Sains (3/5) — Hasil Syarak",
  "Kajian Sains (4/5) — Selepas Enam Saat",
  "Kajian Sains (5/5) — Electrical Stunning",
  "Ehsan Dalam Penyembelihan",
  "Bahagian Dua — Sunat, Makruh & Haram",
  "Perkara Sunat (1/2)",
  "Perkara Sunat (2/2)",
  "Perkara Makruh (1/2)",
  "Perkara Makruh (2/2)",
  "Perkara Haram",
  "Bahagian Tiga — Hukum Berkaitan Sembelihan",
  "Sembelihan Menggunakan Batu (1/2)",
  "Sembelihan Menggunakan Batu (2/2)",
  "Hukum Janin (1/2)",
  "Hukum Janin (2/2)",
  "Hukum Penggunaan Stunning — Fatwa Kebangsaan",
  "Senarai Fatwa",
  "Fatwa Thoracic Sticking (1/2)",
  "Fatwa Thoracic Sticking (2/2)",
  "Kesimpulan",
  "Terima Kasih",
];

export const CHAPTERS = [
  { nama: "Pembukaan", mula: 0 },
  { nama: "Rukun", mula: 4 },
  { nama: "Anatomi & Amali", mula: 16 },
  { nama: "Haiwan & Situasi", mula: 30 },
  { nama: "Hikmah & Sains", mula: 35 },
  { nama: "Adab", mula: 43 },
  { nama: "Hukum & Fatwa", mula: 49 },
  { nama: "Penutup", mula: 58 },
];

export const src = (i: number) => `/slide/sembelihan-2026/s${String(i).padStart(2, "0")}.webp`;
export const videoSrc = (fail: string) => `/slide/sembelihan-2026/video/${fail}`;
export const videoPoster = (fail: string) =>
  `/slide/sembelihan-2026/video/poster/${fail.replace(/\.mp4$/, ".webp")}`;

/* ── Video amali ──────────────────────────────────────────────────────────
   Rakaman sebenar yang disisip sebagai slaid TERSENDIRI selepas slaid induk.
   Kunci = indeks slaid (0-based); `page` = nombor bercetak pada slaid (indeks+1).
   Nota: video "haiwan yang mampu dikuasai" dinamakan "page 34" pada fail asal,
   tetapi topik itu berada pada page 32 ("Haiwan yang mampu dikuasai") — page 34
   ialah "Situasi Sembelihan" (bangkai). Diletak ikut TOPIK, bukan nama fail.
   Dimensi (w×h) direkod tepat dari metadata fail supaya bingkai boleh dikunci
   dengan `aspect-ratio` sebenar — sifar anjakan layout & sifar jalur hitam. */
type VideoInfo = { fail: string; w: number; h: number };
const VIDEO_SISIP: Record<number, { label: string; senarai: VideoInfo[] }> = {
  31: {
    label: "Haiwan yang mampu dikuasai",
    senarai: [
      { fail: "kuasai-1.mp4", w: 362, h: 640 },
      { fail: "kuasai-2.mp4", w: 640, h: 360 },
      { fail: "kuasai-3.mp4", w: 352, h: 640 },
      { fail: "kuasai-4.mp4", w: 352, h: 640 },
      { fail: "kuasai-5.mp4", w: 848, h: 478 },
    ],
  },
  45: {
    label: "Sunat — Menajamkan mata pisau",
    senarai: [{ fail: "pisau-1.mp4", w: 480, h: 864 }],
  },
  48: {
    label: "Perkara Haram dalam Sembelihan",
    senarai: [
      { fail: "haram-1.mp4", w: 406, h: 720 },
      { fail: "haram-2.mp4", w: 480, h: 848 },
      { fail: "haram-3.mp4", w: 640, h: 352 },
    ],
  },
};

export type DeckItem =
  | { jenis: "imej"; idx: number; page: number }
  | {
      jenis: "video";
      fail: string;
      label: string;
      page: number;
      ke: number;
      jumlah: number;
      w: number;
      h: number;
    };

/* Susunan sebenar deck: 60 slaid asal + video disisip selepas slaid induknya. */
export const ITEMS: DeckItem[] = (() => {
  const out: DeckItem[] = [];
  for (let i = 0; i < SLIDE_COUNT; i++) {
    out.push({ jenis: "imej", idx: i, page: i + 1 });
    const sisip = VIDEO_SISIP[i];
    if (sisip) {
      sisip.senarai.forEach((v, k) =>
        out.push({
          jenis: "video",
          fail: v.fail,
          w: v.w,
          h: v.h,
          label: sisip.label,
          page: i + 1,
          ke: k + 1,
          jumlah: sisip.senarai.length,
        })
      );
    }
  }
  return out;
})();

export const TOTAL = ITEMS.length;

/* Indeks item bagi setiap slaid imej — untuk memetakan bab tanpa offset manual. */
const ITEM_BAGI_SLAID = new Map<number, number>();
ITEMS.forEach((it, i) => {
  if (it.jenis === "imej") ITEM_BAGI_SLAID.set(it.idx, i);
});

/* Bab dalam ruang ITEM (bukan ruang slaid) — dikira automatik. */
export const CHAPTERS_ITEM = CHAPTERS.map((c) => ({
  nama: c.nama,
  mula: ITEM_BAGI_SLAID.get(c.mula) ?? 0,
}));
