// Kandungan halaman utama (hero + statistik + tajuk seksyen).

export type Stat = { value: number; suffix?: string; label: string };

export const homepageContent = {
  hero: {
    eyebrow: "Pertubuhan Kebajikan Imam dan Bilal MAIWP",
    title: "Memartabatkan Pegawai Masjid Wilayah Persekutuan",
    lede: "PERKIB menghimpun Naqib Masjid, Imam dan Bilal lantikan MAIWP dalam satu wadah kebajikan — merancang, mengurus dan melaksanakan agenda kebajikan serta pembangunan modal insan ahli.",
    primaryCta: { label: "Mohon Saguhati", href: "/saguhati" },
    secondaryCta: { label: "Sertai Keahlian", href: "/keahlian" },
  },
  stats: [
    { value: 92, label: "Pegawai Masjid" },
    { value: 8, label: "Zon JAWI" },
    { value: 94, label: "Masjid Wilayah Persekutuan" },
    { value: 24, label: "Ahli Jawatankuasa" },
  ] as Stat[],
  aboutHeader: {
    eyebrow: "Tentang PERKIB",
    title: "Wadah Kebajikan Pegawai Masjid",
  },
  programHeader: {
    eyebrow: "Program & Inisiatif",
    title: "Agenda Utama Pertubuhan",
    description:
      "Empat teras program yang menyeluruh — daripada dakwah dan pendidikan hinggalah kebajikan, sosial dan ekonomi ahli.",
  },
  ajkHeader: {
    eyebrow: "Kepimpinan",
    title: "Struktur Organisasi 2025/2026",
    description:
      "Barisan kepimpinan PERKIB yang komited memacu perkhidmatan pegawai masjid kontemporari.",
  },
  saguhatiHeader: {
    eyebrow: "Kebajikan Ahli",
    title: "Saguhati untuk Ahli",
    description:
      "Sembilan jenis saguhati kebajikan disediakan untuk meraikan detik penting dan meringankan musibah ahli.",
  },
};
