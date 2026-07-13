// 9 jenis saguhati yang layak diperolehi ahli PERKIB.
// Sumber VERBATIM: "MAKLUMAN SAGUHATI — Yang Layak Diperolehi oleh Ahli PERKIB".

export type JenisSaguhati = {
  id: string;
  kod: string;
  bil: number;
  nama: string;
  kadar: number; // RM
  dokumenSokongan: string[];
  oneOff: boolean;
  catatan?: string;
};

export const jenisSaguhatiList: JenisSaguhati[] = [
  {
    id: "jenis-saguhati-1",
    kod: "S1",
    bil: 1,
    nama: "Kemalangan / Dimasukkan ke Wad / Musibah",
    kadar: 100,
    dokumenSokongan: ["Laporan Polis atau Slip Kemasukan ke Wad"],
    oneOff: false,
    catatan: "Tempoh kemasukan ke wad tidak kurang 3 hari.",
  },
  {
    id: "jenis-saguhati-2",
    kod: "S2",
    bil: 2,
    nama: "Mendapat Cahayamata",
    kadar: 100,
    dokumenSokongan: ["Sijil Kelahiran Anak"],
    oneOff: false,
  },
  {
    id: "jenis-saguhati-3",
    kod: "S3",
    bil: 3,
    nama: "Bertukar / Berhenti Kerja / Bersara",
    kadar: 50,
    dokumenSokongan: ["Surat Pengesahan Tamat Perkhidmatan dari Majikan"],
    oneOff: false,
  },
  {
    id: "jenis-saguhati-4",
    kod: "S4",
    bil: 4,
    nama: "Berkahwin (Kali Pertama Sahaja)",
    kadar: 100,
    dokumenSokongan: ["Sijil Perkahwinan"],
    oneOff: true,
    catatan: "Kali pertama sahaja.",
  },
  {
    id: "jenis-saguhati-5",
    kod: "S5",
    bil: 5,
    nama: "Menunaikan Haji",
    kadar: 100,
    dokumenSokongan: ["Surat Tawaran Mengerjakan Haji"],
    oneOff: true,
    catatan: "One-off.",
  },
  {
    id: "jenis-saguhati-6",
    kod: "S6",
    bil: 6,
    nama: "Kematian Ahli Keluarga Terdekat",
    kadar: 200,
    dokumenSokongan: ["Sijil Kematian"],
    oneOff: false,
    catatan: "Suami / Isteri / Anak, atau (bagi bujang) Mak / Ayah.",
  },
  {
    id: "jenis-saguhati-7",
    kod: "S7",
    bil: 7,
    nama: "Anak Ahli Hafaz 30 Juzuk Al-Quran",
    kadar: 100,
    dokumenSokongan: ["Sijil Khatam Hafazan Al-Quran"],
    oneOff: true,
    catatan: "One-off.",
  },
  {
    id: "jenis-saguhati-8",
    kod: "S8",
    bil: 8,
    nama: "Saguhati Akademik Ahli Tamat Pengajian",
    kadar: 100,
    dokumenSokongan: ["Sijil Tamat Pengajian"],
    oneOff: false,
    catatan: "Diploma, Ijazah Sarjana Muda, Ijazah Sarjana, Ijazah Kedoktoran.",
  },
  {
    id: "jenis-saguhati-9",
    kod: "S9",
    bil: 9,
    nama: "Saguhati Akademik Anak Ahli Straight A's",
    kadar: 100,
    dokumenSokongan: ["Slip Keputusan Peperiksaan"],
    oneOff: false,
    catatan: "UPSR, PT3, SPM, UPSRA, UPKK, STPM, STAM.",
  },
];
