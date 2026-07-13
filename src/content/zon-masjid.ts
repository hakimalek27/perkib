// Direktori 8 zon JAWI + 89 masjid Wilayah Persekutuan (KL, Putrajaya, Labuan).
// Sumber: "Senarai Masjid di Tiga Wilayah Persekutuan mengikut Zon JAWI".
// Fail ini menjadi sumber tunggal untuk seed Sanity DAN fallback statik.

export type Wilayah = "kl" | "putrajaya" | "labuan";

export type Zon = {
  id: string;
  nombor: number;
  nama: string;
  kawasan: string;
  wilayah: Wilayah;
  masjidInduk: string;
};

export type Masjid = {
  id: string;
  nama: string;
  zonNombor: number;
  lokasi: string;
  isInduk: boolean;
  isNegeri: boolean;
};

export function slugifyMasjid(s: string): string {
  return s
    .toLowerCase()
    .replace(/['@.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const zones: Zon[] = [
  {
    id: "zon-1",
    nombor: 1,
    nama: "Zon 1 — Kepong / Batu / Segambut",
    kawasan: "Kepong, Batu, Segambut",
    wilayah: "kl",
    masjidInduk: "Masjid Al-Imam Al-Ghazali",
  },
  {
    id: "zon-2",
    nombor: 2,
    nama: "Zon 2 — Sentul / Gombak / Setapak",
    kawasan: "Sentul, Gombak, Setapak Utara",
    wilayah: "kl",
    masjidInduk: "Masjid Salahuddin Al-Ayyubi",
  },
  {
    id: "zon-3",
    nombor: 3,
    nama: "Zon 3 — Bandar / Kampung Baru / Kampung Pandan",
    kawasan: "Bandar KL, Kampung Baru, Kampung Pandan",
    wilayah: "kl",
    masjidInduk: "Masjid Al-Imam Ash-Shafie",
  },
  {
    id: "zon-4",
    nombor: 4,
    nama: "Zon 4 — Keramat / Setiawangsa / Titiwangsa / Wangsa Maju",
    kawasan: "Keramat, Setiawangsa, Titiwangsa, Wangsa Maju",
    wilayah: "kl",
    masjidInduk: "Masjid Usamah bin Zaid",
  },
  {
    id: "zon-5",
    nombor: 5,
    nama: "Zon 5 — Sri Petaling / Bandar Tun Razak / Cheras Selatan / Sungai Besi",
    kawasan: "Sri Petaling, Bandar Tun Razak, Cheras Selatan, Sungai Besi",
    wilayah: "kl",
    masjidInduk: "Masjid Al-Muqarrabin",
  },
  {
    id: "zon-6",
    nombor: 6,
    nama: "Zon 6 — Bangsar / Lembah Pantai / TTDI / Bukit Damansara",
    kawasan: "Bangsar, Lembah Pantai, TTDI, Bukit Damansara",
    wilayah: "kl",
    masjidInduk: "Masjid Ar-Rahman",
  },
  {
    id: "zon-7",
    nombor: 7,
    nama: "Zon 7 — WP Putrajaya",
    kawasan: "Wilayah Persekutuan Putrajaya",
    wilayah: "putrajaya",
    masjidInduk: "Masjid Mahmoodiah",
  },
  {
    id: "zon-8",
    nombor: 8,
    nama: "Zon 8 — WP Labuan",
    kawasan: "Wilayah Persekutuan Labuan",
    wilayah: "labuan",
    masjidInduk: "Masjid Jamek An-Nur",
  },
];

type MasjidSeed = Omit<Masjid, "id" | "isInduk" | "isNegeri"> & {
  isInduk?: boolean;
  isNegeri?: boolean;
};

const masjidSeed: MasjidSeed[] = [
  // ── ZON 1 — Kepong / Batu / Segambut (10) ──
  { nama: "Masjid Al-Imam Al-Ghazali", zonNombor: 1, lokasi: "Bandar Menjalara, Kepong", isInduk: true },
  { nama: "Masjid Amaniah", zonNombor: 1, lokasi: "Jalan Besar, Kepong" },
  { nama: "Masjid Abu Hurairah", zonNombor: 1, lokasi: "Kampung Batu, Batu 5, Jalan Ipoh" },
  { nama: "Masjid Al-Firdaus", zonNombor: 1, lokasi: "Segambut Luar" },
  { nama: "Masjid Al-Qurtubi", zonNombor: 1, lokasi: "Taman Sri Segambut" },
  { nama: "Masjid Saidina Hamzah", zonNombor: 1, lokasi: "Kampung Batu Muda, Batu 4½ Jalan Ipoh" },
  { nama: "Masjid Anas Bin Malik", zonNombor: 1, lokasi: "Kampung Selayang Lama, Batu Caves" },
  { nama: "Masjid Abi Ayyub Al-Ansari", zonNombor: 1, lokasi: "Taman Batu Muda, Batu Caves" },
  { nama: "Masjid Al-Zakirin", zonNombor: 1, lokasi: "Taman Wilayah Selayang" },
  { nama: "Masjid Ubudiah", zonNombor: 1, lokasi: "Segambut Dalam" },

  // ── ZON 2 — Sentul / Gombak / Setapak (9) ──
  { nama: "Masjid Salahuddin Al-Ayyubi", zonNombor: 2, lokasi: "Taman Melati, Setapak", isInduk: true },
  { nama: "Masjid Al-Hidayah (Sentul)", zonNombor: 2, lokasi: "Sentul Pasar, Sentul" },
  { nama: "Masjid Amru bin Al-'As", zonNombor: 2, lokasi: "Bandar Baru Sentul" },
  { nama: "Masjid Bilal bin Rabah", zonNombor: 2, lokasi: "Taman Koperasi Polis Fasa 1, Batu Caves" },
  { nama: "Masjid Ibn Abbas", zonNombor: 2, lokasi: "Taman Ibu Kota" },
  { nama: "Masjid Jamek Pekan Sentul", zonNombor: 2, lokasi: "Jalan Haji Salleh, Sentul" },
  { nama: "Masjid Jamek Saad Ibn Waqqas", zonNombor: 2, lokasi: "Jalan Gombak" },
  { nama: "Masjid Saidina Ali KW", zonNombor: 2, lokasi: "Kampung Padang Balang, Sentul" },
  { nama: "Masjid Zaid bin Haritsah", zonNombor: 2, lokasi: "KM 8, Jalan Gombak" },

  // ── ZON 3 — Bandar / Kampung Baru / Kampung Pandan (10) ──
  { nama: "Masjid Al-Imam Ash-Shafie", zonNombor: 3, lokasi: "Jalan Perkasa, Taman Maluri, Kampung Pandan", isInduk: true },
  { nama: "Masjid Al-Bukhary", zonNombor: 3, lokasi: "Jalan Hang Tuah" },
  { nama: "Masjid Ar-Rahimah", zonNombor: 3, lokasi: "Kampung Pandan" },
  { nama: "Masjid Asy-Syakirin", zonNombor: 3, lokasi: "Menara Berkembar Petronas, KLCC" },
  { nama: "Masjid Bukit Aman", zonNombor: 3, lokasi: "Jalan Bukit Aman" },
  { nama: "Masjid India", zonNombor: 3, lokasi: "Jalan Melayu" },
  { nama: "Masjid Jamek Alam Shah", zonNombor: 3, lokasi: "Jalan Tun Razak / Jalan Pasar" },
  { nama: "Masjid Jamek Kampung Baru", zonNombor: 3, lokasi: "Jalan Raja Alang, Kampung Baru" },
  { nama: "Masjid Jamek Pakistan", zonNombor: 3, lokasi: "Jalan Raja Muda Abd. Aziz" },
  { nama: "Masjid Jamek Sultan Abdul Samad", zonNombor: 3, lokasi: "Jalan Tun Perak" },

  // ── ZON 4 — Keramat / Setiawangsa / Titiwangsa / Wangsa Maju (12) ──
  { nama: "Masjid Usamah bin Zaid", zonNombor: 4, lokasi: "Wangsa Maju, Setapak", isInduk: true },
  { nama: "Masjid Abu Ubaidah Al-Jarrah", zonNombor: 4, lokasi: "Taman Sri Rampai, Setapak Jaya" },
  { nama: "Masjid Al-Akram", zonNombor: 4, lokasi: "Datuk Keramat, Jalan Datuk Keramat" },
  { nama: "Masjid Al-Muttaqin", zonNombor: 4, lokasi: "Taman Wangsa Melawati" },
  { nama: "Masjid Ibn Mas'ud", zonNombor: 4, lokasi: "Jalan Damai, off Jalan Ampang" },
  { nama: "Masjid Ibnu Sina", zonNombor: 4, lokasi: "Taman Tasik Titiwangsa" },
  { nama: "Masjid Jamiul Ehsan", zonNombor: 4, lokasi: "Jalan Pahang, Pekan Setapak" },
  { nama: "Masjid Khalid bin Al-Walid", zonNombor: 4, lokasi: "Jalan Padang Tembak" },
  { nama: "Masjid Muadz bin Jabal", zonNombor: 4, lokasi: "Persiaran Setiawangsa, Taman Setiawangsa" },
  { nama: "Masjid Muhammad Al-Fateh", zonNombor: 4, lokasi: "Kem Wardieburn, Setapak" },
  { nama: "Masjid Solehin", zonNombor: 4, lokasi: "Pusat Latihan Polis Depoh, Jalan Semarak" },
  { nama: "Masjid Universiti Teknologi Malaysia", zonNombor: 4, lokasi: "Jalan Semarak" },

  // ── ZON 5 — Sri Petaling / Bandar Tun Razak / Cheras Selatan / Sungai Besi (16) ──
  { nama: "Masjid Al-Muqarrabin", zonNombor: 5, lokasi: "Bandar Tasik Selatan", isInduk: true },
  { nama: "Masjid Abdul Rahman bin Auf", zonNombor: 5, lokasi: "Batu 5½ Jalan Puchong" },
  { nama: "Masjid Abdullah bin Zubair", zonNombor: 5, lokasi: "Jalan Lapangan Terbang Lama" },
  { nama: "Masjid Al-Imam At-Tirmizi", zonNombor: 5, lokasi: "Taman Sri Sentosa, Jalan Klang Lama" },
  { nama: "Masjid Al-Khasyi'in", zonNombor: 5, lokasi: "Taman Desa Petaling" },
  { nama: "Masjid Al-Muhsinin", zonNombor: 5, lokasi: "Taman Desa, off Jalan Klang Lama" },
  { nama: "Masjid Al-Mukhlisin", zonNombor: 5, lokasi: "Taman Alam Damai, Cheras" },
  { nama: "Masjid Al-Najihin", zonNombor: 5, lokasi: "Bandar Seri Permaisuri, Cheras" },
  { nama: "Masjid Az-Zubair Ibnu Awwam", zonNombor: 5, lokasi: "KM 6 Jalan Cheras" },
  { nama: "Masjid Jamek Bandar Baru Sri Petaling", zonNombor: 5, lokasi: "Bandar Baru Sri Petaling" },
  { nama: "Masjid Jamek Ibnu Khaldun", zonNombor: 5, lokasi: "Pekan Sungai Besi" },
  { nama: "Masjid Jamek Petaling", zonNombor: 5, lokasi: "Batu 6, Jalan Puchong" },
  { nama: "Masjid Saidina Othman Ibnu Affan", zonNombor: 5, lokasi: "Bandar Tun Razak" },
  { nama: "Masjid Talhah bin Ubaidillah", zonNombor: 5, lokasi: "Jalan Alam Sutera, Bukit Jalil" },
  { nama: "Masjid Thoriq bin Ziyad", zonNombor: 5, lokasi: "Kem Sungai Besi" },
  { nama: "Masjid Zaid bin Thabit", zonNombor: 5, lokasi: "Desa Tun Razak" },

  // ── ZON 6 — Bangsar / Lembah Pantai / TTDI / Bukit Damansara (15) ──
  { nama: "Masjid Ar-Rahman", zonNombor: 6, lokasi: "Jalan Pantai Baharu", isInduk: true },
  { nama: "Masjid Wilayah Persekutuan", zonNombor: 6, lokasi: "Jalan Tuanku Abdul Halim (Jalan Duta)", isNegeri: true },
  { nama: "Masjid Al-Ghufran", zonNombor: 6, lokasi: "Kompleks Balai Islam, Pinggiran TTDI" },
  { nama: "Masjid Al-Hidayah", zonNombor: 6, lokasi: "Kampung Sungai Penchala" },
  { nama: "Masjid Al-Ikhlasiah", zonNombor: 6, lokasi: "Bukit Kerinchi, Pantai Hill Park" },
  { nama: "Masjid Ar-Rahah", zonNombor: 6, lokasi: "Kampung Kerinchi" },
  { nama: "Masjid At-Taqwa", zonNombor: 6, lokasi: "Taman Tun Dr. Ismail" },
  { nama: "Masjid Jamek Abdullah Hukum Eco City", zonNombor: 6, lokasi: "KL Eco City, Jalan Bangsar" },
  { nama: "Masjid Jamek Al-Khadijiah", zonNombor: 6, lokasi: "Pantai Dalam" },
  { nama: "Masjid Jamek Tengku Abdul Aziz Shah", zonNombor: 6, lokasi: "Kampung Sungai Penchala" },
  { nama: "Masjid Muhammadi", zonNombor: 6, lokasi: "Angkasapuri, Bukit Putra" },
  { nama: "Masjid Saidina Abu Bakar As-Siddiq", zonNombor: 6, lokasi: "Jalan Ara, Bangsar" },
  { nama: "Masjid Saidina Umar Al-Khattab", zonNombor: 6, lokasi: "Jalan Setiabudi, Bukit Damansara" },
  { nama: "Masjid TNB", zonNombor: 6, lokasi: "Bangsar" },
  { nama: "Masjid Az-Zahrawi", zonNombor: 6, lokasi: "Hospital Kuala Lumpur" },

  // ── ZON 7 — WP Putrajaya (1) ──
  { nama: "Masjid Mahmoodiah", zonNombor: 7, lokasi: "Presint 18, Putrajaya", isInduk: true },

  // ── ZON 8 — WP Labuan (16) ──
  { nama: "Masjid Jamek An-Nur", zonNombor: 8, lokasi: "Bandar Labuan", isInduk: true, isNegeri: true },
  { nama: "Masjid Jamek Adam", zonNombor: 8, lokasi: "Kampung Lajau" },
  { nama: "Masjid Al-Muttakin", zonNombor: 8, lokasi: "Taman 10FC, Kampung Kerupang 2" },
  { nama: "Masjid Al-Munawwar", zonNombor: 8, lokasi: "Kampung Pohon Batu" },
  { nama: "Masjid Al-Ehsan", zonNombor: 8, lokasi: "Kampung Sungai Labu" },
  { nama: "Masjid Al-Falah", zonNombor: 8, lokasi: "Jalan Mohd Salleh, Kampung Bukit Kalam" },
  { nama: "Masjid Al-Muzakirullah", zonNombor: 8, lokasi: "Jalan Tanjung Kubong, Kampung Lubok Temiang" },
  { nama: "Masjid Ar-Rahman (Labuan)", zonNombor: 8, lokasi: "Kampung Sungai Lada" },
  { nama: "Masjid Bebuloh Darat", zonNombor: 8, lokasi: "Kampung Bebuloh Darat" },
  { nama: "Masjid Nur Iman", zonNombor: 8, lokasi: "Kampung Ganggarak" },
  { nama: "Masjid Nurul Iman", zonNombor: 8, lokasi: "Kampung Sungai Bedaun" },
  { nama: "Masjid Rancha-Rancha Darat", zonNombor: 8, lokasi: "Kampung Ranca-Ranca" },
  { nama: "Masjid Sirajul Islam", zonNombor: 8, lokasi: "Kampung Tanjung Aru" },
  { nama: "Masjid Sultan Muhammad V", zonNombor: 8, lokasi: "Jalan Pohon Batu, Kampung Lajau" },
  { nama: "Masjid Al-Sultan Abdullah", zonNombor: 8, lokasi: "Kampung Sungai Bedaun" },
  { nama: "Masjid Al-Hijrah", zonNombor: 8, lokasi: "Kampung Sungai Miri" },
];

export const masjids: Masjid[] = masjidSeed.map((m) => ({
  id: `masjid-${m.zonNombor}-${slugifyMasjid(m.nama)}`,
  nama: m.nama,
  zonNombor: m.zonNombor,
  lokasi: m.lokasi,
  isInduk: m.isInduk ?? false,
  isNegeri: m.isNegeri ?? false,
}));

export const zoneByNombor = (n: number): Zon | undefined =>
  zones.find((z) => z.nombor === n);
