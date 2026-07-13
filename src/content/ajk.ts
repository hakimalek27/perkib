// Ahli Jawatankuasa Tertinggi PERKIB sesi 2025/2026 (24 orang, 3 lapis).
// Sumber: BRIEF PERKIB + poster Struktur Organisasi rasmi.
// employeeNo dipadankan TEPAT dengan rekod pegawai (dari nama fail foto rasmi),
// jadi seed boleh link ke dokumen pegawai untuk foto tanpa fuzzy matching.

export type AjkKumpulan = "tertinggi" | "zon" | "kluster";

export type AjkEntry = {
  id: string;
  employeeNo: string;
  nama: string;
  jawatan: string;
  kumpulan: AjkKumpulan;
  order: number;
  sesi: string;
};

const SESI = "2025/2026";

export const ajkList: AjkEntry[] = [
  // ── Majlis Tertinggi (Ahli Jawatankuasa Tertinggi) — 8 ──
  { id: "ajk-t-1", employeeNo: "1743", nama: "Muhammad Rashidi Bin Ab Hamid", jawatan: "Presiden", kumpulan: "tertinggi", order: 1, sesi: SESI },
  { id: "ajk-t-2", employeeNo: "1709", nama: "Ahmad Faidhul Irfan Bin Ahmad Mustaffa Kamal", jawatan: "Timbalan Presiden", kumpulan: "tertinggi", order: 2, sesi: SESI },
  { id: "ajk-t-3", employeeNo: "1875", nama: "Muhammad Fauzan Bin Mohd Dahlan", jawatan: "Naib Presiden I", kumpulan: "tertinggi", order: 3, sesi: SESI },
  { id: "ajk-t-4", employeeNo: "1465", nama: "Wan Mohd Amzar Fitri Bin Wan Mohd Azlan", jawatan: "Naib Presiden II", kumpulan: "tertinggi", order: 4, sesi: SESI },
  { id: "ajk-t-5", employeeNo: "1739", nama: "Andi Mohamad Zulkhairi Bin Muhamad", jawatan: "Setiausaha Agung", kumpulan: "tertinggi", order: 5, sesi: SESI },
  { id: "ajk-t-6", employeeNo: "1715", nama: "Muhamad Ali Fikri Bin Zainudin", jawatan: "Penolong Setiausaha Agung", kumpulan: "tertinggi", order: 6, sesi: SESI },
  { id: "ajk-t-7", employeeNo: "1678", nama: "Shahrulnizam Bin Shah Peri", jawatan: "Bendahari Agung", kumpulan: "tertinggi", order: 7, sesi: SESI },
  { id: "ajk-t-8", employeeNo: "1727", nama: "Muhammad Fauzie Bin Bashah", jawatan: "Penolong Bendahari Agung", kumpulan: "tertinggi", order: 8, sesi: SESI },

  // ── Perwakilan Mengikut Zon — 8 ──
  { id: "ajk-z-1", employeeNo: "1745", nama: "Mohd Arifin Bin Zulkaplay", jawatan: "Perwakilan Zon 1", kumpulan: "zon", order: 1, sesi: SESI },
  { id: "ajk-z-2", employeeNo: "1852", nama: "Mior Ahmad Fitri Bin Mior Shahridan", jawatan: "Perwakilan Zon 2", kumpulan: "zon", order: 2, sesi: SESI },
  { id: "ajk-z-3", employeeNo: "1810", nama: "Mohammad Hanif Syakir Bin Mohd Yusoop", jawatan: "Perwakilan Zon 3", kumpulan: "zon", order: 3, sesi: SESI },
  { id: "ajk-z-4", employeeNo: "1880", nama: "Muhammad Hakim Bin Abd Malek", jawatan: "Perwakilan Zon 4", kumpulan: "zon", order: 4, sesi: SESI },
  { id: "ajk-z-5", employeeNo: "1695", nama: "Ahmad Ammar Muzakir Bin Ahmad Hadiri", jawatan: "Perwakilan Zon 5", kumpulan: "zon", order: 5, sesi: SESI },
  { id: "ajk-z-6", employeeNo: "1703", nama: "Muhammad Amin Firdaus Bin Sabudin", jawatan: "Perwakilan Zon 6", kumpulan: "zon", order: 6, sesi: SESI },
  { id: "ajk-z-7", employeeNo: "1694", nama: "Abu Bakar Bin Mohamad Noor", jawatan: "Perwakilan Zon Putrajaya", kumpulan: "zon", order: 7, sesi: SESI },
  { id: "ajk-z-8", employeeNo: "1821", nama: "Muhammad Nur Izzat Bin Roshidi", jawatan: "Perwakilan Zon Labuan", kumpulan: "zon", order: 8, sesi: SESI },

  // ── AJK Mengikut Kluster — 8 ──
  { id: "ajk-k-1", employeeNo: "1742", nama: "Mohd Khairul Ni'mat Bin Doll Kawaid", jawatan: "AJK Pendidikan & Pencerahan Hukum", kumpulan: "kluster", order: 1, sesi: SESI },
  { id: "ajk-k-2", employeeNo: "1740", nama: "Shafiq Zulkhairi Bin Zainudin", jawatan: "AJK Pendidikan & Pencerahan Hukum", kumpulan: "kluster", order: 2, sesi: SESI },
  { id: "ajk-k-3", employeeNo: "1889", nama: "Muhammad Azan Bin Abd Malek", jawatan: "AJK Komunikasi Korporat", kumpulan: "kluster", order: 3, sesi: SESI },
  { id: "ajk-k-4", employeeNo: "1804", nama: "Muhammad Syammir Izzuddin Bin Shamsuddin", jawatan: "AJK Komunikasi Korporat", kumpulan: "kluster", order: 4, sesi: SESI },
  { id: "ajk-k-5", employeeNo: "1962", nama: "Muhammad Hasanuddin Bin Abdullah", jawatan: "AJK Khazanah & Perbendaharaan", kumpulan: "kluster", order: 5, sesi: SESI },
  { id: "ajk-k-6", employeeNo: "1741", nama: "Mohamad Hasbi Bin Md Akip", jawatan: "AJK Khazanah & Perbendaharaan", kumpulan: "kluster", order: 6, sesi: SESI },
  { id: "ajk-k-7", employeeNo: "1813", nama: "Muhammad Haziq Sulhi Bin Chek", jawatan: "AJK Kebajikan & Kemasyarakatan", kumpulan: "kluster", order: 7, sesi: SESI },
  { id: "ajk-k-8", employeeNo: "1714", nama: "Adam Bin Abd Rashid", jawatan: "AJK Kebajikan & Kemasyarakatan", kumpulan: "kluster", order: 8, sesi: SESI },
];

export const ajkKumpulanLabel: Record<AjkKumpulan, string> = {
  tertinggi: "Ahli Jawatankuasa Tertinggi",
  zon: "Perwakilan Mengikut Zon",
  kluster: "AJK Mengikut Kluster",
};
