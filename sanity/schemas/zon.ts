import type { Rule } from "./_rule";

export default {
  name: "zon",
  title: "Zon JAWI",
  type: "document",
  fields: [
    {
      name: "nombor",
      title: "Nombor Zon",
      type: "number",
      validation: (R: Rule) => R.required().integer().min(1).max(8),
    },
    {
      name: "nama",
      title: "Nama Zon",
      type: "string",
      description: "Contoh: Zon 4 — Keramat / Setiawangsa / Titiwangsa / Wangsa Maju",
      validation: (R: Rule) => R.required(),
    },
    { name: "kawasan", title: "Kawasan", type: "string" },
    {
      name: "wilayah",
      title: "Wilayah",
      type: "string",
      options: {
        list: [
          { title: "WP Kuala Lumpur", value: "kl" },
          { title: "WP Putrajaya", value: "putrajaya" },
          { title: "WP Labuan", value: "labuan" },
        ],
      },
      initialValue: "kl",
    },
    { name: "masjidInduk", title: "Masjid Induk Zon", type: "string" },
  ],
  orderings: [
    {
      title: "Nombor Zon",
      name: "byNombor",
      by: [{ field: "nombor", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "nama", subtitle: "kawasan" },
  },
};
