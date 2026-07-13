// 4 program & inisiatif utama PERKIB (VERBATIM dari BRIEF).

export type Program = {
  id: string;
  icon: string; // nama ikon lucide
  nama: string;
  penerangan: string;
  sasaran: string;
  jadual: string;
  order: number;
};

export const programList: Program[] = [
  {
    id: "program-1",
    icon: "BookOpen",
    nama: "Dakwah & Pendidikan",
    penerangan:
      "Program penerapan dakwah dan pendidikan kepada ahli serta masyarakat, meningkatkan mutu pendakwah yang berketrampilan dan berilmu.",
    sasaran: "Ahli & masyarakat",
    jadual: "Sepanjang tahun",
    order: 1,
  },
  {
    id: "program-2",
    icon: "HeartHandshake",
    nama: "Kebajikan & Hal Ehwal Ahli",
    penerangan:
      "Aktiviti berkebajikan bagi pemantapan ekonomi kendiri dan kekeluargaan ahli, serta menjamin kebajikan Naqib, Imam dan Bilal.",
    sasaran: "Naqib, Imam & Bilal",
    jadual: "Berterusan",
    order: 2,
  },
  {
    id: "program-3",
    icon: "Users",
    nama: "Sosial & Modal Insan",
    penerangan:
      "Aktiviti mempererat hubungan, pembinaan jati diri, kesihatan, riadah dan peningkatan kemahiran insaniah ahli.",
    sasaran: "Ahli & keluarga",
    jadual: "Berkala",
    order: 3,
  },
  {
    id: "program-4",
    icon: "TrendingUp",
    nama: "Ekonomi & Perhubungan",
    penerangan:
      "Agenda menjana ekonomi dan kestabilan kos sara hidup ahli melalui usaha sama pelbagai pihak.",
    sasaran: "Ahli",
    jadual: "Berkala",
    order: 4,
  },
];
