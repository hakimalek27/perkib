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
  // Alamat: Menara MAIWP (HQ baharu, 2026), di bawah naungan MAIWP.
  address: {
    line1: "Menara MAIWP",
    line2: "No. 55, Lorong Haji Hussein 2",
    postcode: "50300",
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
  // Koordinat Menara MAIWP (anggaran — sahkan di Google Maps jika perlu).
  geo: { lat: 3.1665, lng: 101.7008 },
  googleMaps: "https://www.google.com/maps/search/?api=1&query=Menara+MAIWP+Kuala+Lumpur",
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
