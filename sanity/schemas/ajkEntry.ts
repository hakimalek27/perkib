import type { Rule } from "./_rule";

export default {
  name: "ajkEntry",
  title: "Ahli Jawatankuasa",
  type: "document",
  fields: [
    {
      name: "nama",
      title: "Nama",
      type: "string",
      validation: (R: Rule) => R.required(),
    },
    {
      name: "jawatan",
      title: "Jawatan dalam AJK",
      type: "string",
      validation: (R: Rule) => R.required(),
    },
    {
      name: "kumpulan",
      title: "Kumpulan",
      type: "string",
      options: {
        list: [
          { title: "Ahli Jawatankuasa Tertinggi", value: "tertinggi" },
          { title: "Perwakilan Mengikut Zon", value: "zon" },
          { title: "AJK Mengikut Kluster", value: "kluster" },
        ],
      },
      validation: (R: Rule) => R.required(),
    },
    {
      name: "pegawai",
      title: "Pautan Pegawai (untuk foto)",
      type: "reference",
      to: [{ type: "pegawai" }],
      description: "Pautan ke rekod pegawai untuk memaparkan foto rasmi.",
    },
    { name: "employeeNo", title: "No. Pekerja", type: "string" },
    { name: "order", title: "Susunan", type: "number", initialValue: 100 },
    { name: "sesi", title: "Sesi", type: "string", initialValue: "2025/2026" },
  ],
  orderings: [
    {
      title: "Kumpulan & Susunan",
      name: "byKumpulan",
      by: [
        { field: "kumpulan", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "nama", subtitle: "jawatan", media: "pegawai.gambar" },
  },
};
