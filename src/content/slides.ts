/* Registry deck slaid PERKIB — satu sumber kebenaran untuk halaman senarai
   `/slide` dan pautan dari laman utama. Tambah deck baharu = tambah satu entri
   di sini (dan folder route `/slide/<slug>` yang sepadan).

   Kiraan slaid/video diambil terus daripada `deck-data` deck berkenaan supaya
   angka pada senarai tidak pernah basi bila kandungan deck berubah. */

import {
  SLIDE_COUNT as SEMBELIHAN_SLAID,
  TOTAL as SEMBELIHAN_ITEM,
  CHAPTERS as SEMBELIHAN_BAB,
} from "@/app/slide/sembelihan-2026/deck-data";

export type Deck = {
  slug: string;
  tajuk: string;
  eyebrow: string;
  tahun: string;
  ringkasan: string;
  /** Bilangan slaid asal (imej) */
  jumlahSlaid: number;
  /** Bilangan video amali yang disisip sebagai slaid tersendiri */
  jumlahVideo: number;
  /** Jumlah keseluruhan item boleh navigasi dalam deck */
  jumlahItem: number;
  bab: string[];
  kover: string;
  koverAlt: string;
  /** Imej Open Graph khusus deck (1200×630) untuk perkongsian WhatsApp/FB */
  og: string;
};

export const DECKS: Deck[] = [
  {
    slug: "sembelihan-2026",
    tajuk: "Penyembelihan Halal",
    eyebrow: "Modul Latihan",
    tahun: "2026",
    ringkasan:
      "Modul latihan penuh mengenai penyembelihan halal — rukun dan syarat sembelihan, anatomi leher, teknik amali, kajian saintifik, perkara sunat, makruh dan haram, serta hukum dan fatwa berkaitan.",
    jumlahSlaid: SEMBELIHAN_SLAID,
    jumlahVideo: SEMBELIHAN_ITEM - SEMBELIHAN_SLAID,
    jumlahItem: SEMBELIHAN_ITEM,
    bab: SEMBELIHAN_BAB.map((b) => b.nama),
    kover: "/slide/sembelihan-2026/s00.webp",
    koverAlt: "Slaid pembuka modul latihan Penyembelihan Halal PERKIB",
    og: "/og/slide-sembelihan-2026.png",
  },
];

export function getDeck(slug: string): Deck | undefined {
  return DECKS.find((d) => d.slug === slug);
}
