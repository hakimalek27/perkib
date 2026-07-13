import type { Rule } from "./_rule";

export default {
  name: "faq",
  title: "Soalan Lazim",
  type: "document",
  fields: [
    {
      name: "kategori",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Umum", value: "umum" },
          { title: "Keahlian", value: "keahlian" },
          { title: "Saguhati", value: "saguhati" },
          { title: "Infaq", value: "infaq" },
        ],
      },
      initialValue: "umum",
    },
    { name: "soalan", title: "Soalan", type: "string", validation: (R: Rule) => R.required() },
    { name: "jawapan", title: "Jawapan", type: "text", rows: 4, validation: (R: Rule) => R.required() },
    { name: "order", title: "Susunan", type: "number", initialValue: 100 },
  ],
  orderings: [
    { title: "Susunan", name: "byOrder", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "soalan", subtitle: "kategori" } },
};
