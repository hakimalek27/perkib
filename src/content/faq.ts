// Soalan Lazim (VERBATIM dari BRIEF).

export type FaqEntry = {
  id: string;
  kategori: string;
  soalan: string;
  jawapan: string;
  order: number;
};

export const faqList: FaqEntry[] = [
  {
    id: "faq-1",
    kategori: "umum",
    soalan: "Apakah itu PERKIB?",
    jawapan:
      "PERKIB ialah Pertubuhan Kebajikan Imam dan Bilal Majlis Agama Islam Wilayah Persekutuan — pertubuhan kebajikan bagi Naqib Masjid, Imam dan Bilal lantikan MAIWP yang berkhidmat di masjid-masjid Wilayah Persekutuan.",
    order: 1,
  },
  {
    id: "faq-2",
    kategori: "keahlian",
    soalan: "Siapakah yang layak menjadi ahli?",
    jawapan:
      "Keahlian terbuka kepada Naqib Masjid, Imam dan Ketua Bilal lantikan MAIWP yang sedang berkhidmat di masjid-masjid Wilayah Persekutuan.",
    order: 2,
  },
  {
    id: "faq-3",
    kategori: "saguhati",
    soalan: "Bagaimana untuk memohon saguhati kebajikan?",
    jawapan:
      "Ahli boleh memohon melalui halaman Saguhati di laman ini — masukkan nombor pekerja dan 4 digit akhir kad pengenalan untuk pengesahan, pilih jenis saguhati, muat naik dokumen sokongan, dan hantar. Setiap permohonan akan direkodkan dan boleh disemak statusnya.",
    order: 3,
  },
  {
    id: "faq-4",
    kategori: "infaq",
    soalan: "Bagaimana untuk menyumbang kepada PERKIB?",
    jawapan:
      "Sumbangan boleh disalurkan melalui akaun Bank Rakyat 11-0175647-7 (Pertubuhan Kebajikan Imam Bilal MAIWP) atau imbas DuitNow QR PERKIB-MAIWP.",
    order: 4,
  },
  {
    id: "faq-5",
    kategori: "umum",
    soalan: "Bagaimana untuk menghubungi PERKIB?",
    jawapan:
      "Hubungi urus setia PERKIB melalui emel azanmalek@maiwp.gov.my atau borang hubungan di laman ini.",
    order: 5,
  },
];
