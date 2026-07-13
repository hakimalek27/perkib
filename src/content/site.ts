// Maklumat teras organisasi PERKIB — sumber kebenaran tunggal untuk fallback
// bila Sanity tidak dikonfigurasi. Semua fakta diambil VERBATIM dari BRIEF PERKIB
// + Perlembagaan (ROS PPM-013-14-08022021).

export const siteInfo = {
  name: "Pertubuhan Kebajikan Imam dan Bilal MAIWP",
  shortName: "PERKIB",
  fullName:
    "Pertubuhan Kebajikan Imam dan Bilal Majlis Agama Islam Wilayah Persekutuan",
  tagline: "Merealisasikan Perkhidmatan Pegawai Masjid Kontemporari",
  authority: "Majlis Agama Islam Wilayah Persekutuan (MAIWP)",
  rosNumber: "PPM-013-14-08022021",
  foundedYear: 2021,
  address: {
    line1: "Blok F1, Tingkat Bawah, Unit 2",
    line2: "Taman Melati Kawasan 8, Wangsa Maju",
    postcode: "53100",
    city: "Kuala Lumpur",
    state: "W.P. Kuala Lumpur",
    country: "Malaysia",
  },
  // Telefon rasmi masih placeholder dalam brief (03-0000 0000). Dibiarkan
  // kosong supaya UI papar "akan dikemas kini" — admin isi kemudian.
  phone: "",
  email: "azanmalek@maiwp.gov.my",
  facebook:
    "https://www.facebook.com/p/Pertubuhan-Kebajikan-Imam-Bilal-MAIWP-Perkib-100075687771921/",
  geo: { lat: 3.2107, lng: 101.7395 },
  googleMaps: "https://www.google.com/maps?q=3.2107,101.7395",
  bank: {
    name: "Bank Rakyat",
    account: "11-0175647-7",
    holder: "PERTUBUHAN KEBAJIKAN IMAM BILAL MAIWP",
    duitNowRef: "PERKIB-MAIWP",
  },
  officeHours: [{ day: "Isnin – Jumaat", time: "8:00 pagi – 5:00 petang" }],
} as const;

export type SiteInfo = typeof siteInfo;
