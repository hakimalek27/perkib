// Kategori derma + maklumat bank (VERBATIM dari BRIEF).

export type DermaKategori = {
  id: string;
  icon: string;
  tajuk: string;
  penerangan: string;
};

export const dermaKategori: DermaKategori[] = [
  {
    id: "derma-am",
    icon: "HeartHandshake",
    tajuk: "Derma Am",
    penerangan: "Sumbangan am untuk operasi & aktiviti.",
  },
  {
    id: "dana-operasi",
    icon: "Building2",
    tajuk: "Dana Operasi",
    penerangan: "Menampung kos operasi pertubuhan.",
  },
];
