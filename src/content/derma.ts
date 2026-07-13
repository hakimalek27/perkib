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
    id: "dana-pendidikan",
    icon: "BookOpen",
    tajuk: "Dana Pendidikan",
    penerangan: "Bantuan pendidikan & biasiswa.",
  },
  {
    id: "bantuan-asnaf",
    icon: "Users",
    tajuk: "Bantuan Asnaf",
    penerangan: "Bantuan untuk asnaf & keluarga memerlukan.",
  },
  {
    id: "dana-operasi",
    icon: "Building2",
    tajuk: "Dana Operasi",
    penerangan: "Menampung kos operasi pertubuhan.",
  },
];
