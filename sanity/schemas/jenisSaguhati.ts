import type { Rule } from "./_rule";

export default {
  name: "jenisSaguhati",
  title: "Jenis Saguhati",
  type: "document",
  fields: [
    { name: "kod", title: "Kod", type: "string", validation: (R: Rule) => R.required() },
    { name: "bil", title: "Bil.", type: "number", validation: (R: Rule) => R.required().integer() },
    { name: "nama", title: "Jenis Saguhati", type: "string", validation: (R: Rule) => R.required() },
    { name: "kadar", title: "Kadar (RM)", type: "number", validation: (R: Rule) => R.required().min(0) },
    {
      name: "dokumenSokongan",
      title: "Dokumen Sokongan",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "oneOff",
      title: "Sekali Sahaja (one-off)",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "hadMaksimum",
      title: "Had Maksimum Permohonan (seumur hidup)",
      type: "number",
      description:
        "Berapa kali seorang pegawai boleh memohon jenis ini. Kosongkan = tiada had. Contoh: Cahayamata = 6.",
      validation: (R: Rule) => R.min(1).integer(),
    },
    { name: "catatan", title: "Catatan", type: "text", rows: 2 },
    { name: "aktif", title: "Aktif", type: "boolean", initialValue: true },
  ],
  orderings: [
    { title: "Bil.", name: "byBil", by: [{ field: "bil", direction: "asc" }] },
  ],
  preview: {
    select: { title: "nama", kadar: "kadar", kod: "kod" },
    prepare(sel: { title?: string; kadar?: number; kod?: string }) {
      return {
        title: `${sel.kod ? sel.kod + " · " : ""}${sel.title}`,
        subtitle: sel.kadar != null ? `RM${sel.kadar}` : "",
      };
    },
  },
};
