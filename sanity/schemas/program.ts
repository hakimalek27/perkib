import type { Rule } from "./_rule";

export default {
  name: "program",
  title: "Program & Inisiatif",
  type: "document",
  fields: [
    {
      name: "icon",
      title: "Ikon (lucide)",
      type: "string",
      description: "Nama ikon lucide, cth: BookOpen, HeartHandshake, Users, TrendingUp",
    },
    { name: "nama", title: "Nama Program", type: "string", validation: (R: Rule) => R.required() },
    { name: "penerangan", title: "Penerangan", type: "text", rows: 3 },
    { name: "sasaran", title: "Sasaran", type: "string" },
    { name: "jadual", title: "Jadual / Kekerapan", type: "string" },
    { name: "order", title: "Susunan", type: "number", initialValue: 100 },
  ],
  orderings: [
    { title: "Susunan", name: "byOrder", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "nama", subtitle: "sasaran" } },
};
