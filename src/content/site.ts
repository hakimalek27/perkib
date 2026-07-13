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
  // Alamat: Ibu Pejabat MAIWP (Bangunan PERKIM), di bawah naungan MAIWP.
  address: {
    line1: "Aras 1, 7, 9–11, Bangunan PERKIM",
    line2: "No. 150, Jalan Ipoh",
    postcode: "51200",
    city: "Kuala Lumpur",
    state: "W.P. Kuala Lumpur",
    country: "Malaysia",
  },
  // Telefon rasmi masih placeholder dalam brief. Dibiarkan kosong supaya UI
  // papar "akan dikemas kini" — admin isi kemudian.
  phone: "",
  email: "admin@perkib.my",
  facebook:
    "https://www.facebook.com/p/Pertubuhan-Kebajikan-Imam-Bilal-MAIWP-Perkib-100075687771921/",
  geo: { lat: 3.1796, lng: 101.6872 },
  googleMaps: "https://www.google.com/maps?q=3.1796,101.6872",
  bank: {
    name: "Bank Rakyat",
    account: "11-0175647-7",
    holder: "PERTUBUHAN KEBAJIKAN IMAM BILAL MAIWP",
    duitNowRef: "PERKIB-MAIWP",
  },
  // Waktu pejabat tidak dipaparkan (atas permintaan).
  officeHours: [] as { day: string; time: string }[],
} as const;

export type SiteInfo = typeof siteInfo;
