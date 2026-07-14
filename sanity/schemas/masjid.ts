import type { Rule } from "./_rule";

export default {
  name: "masjid",
  title: "Masjid",
  type: "document",
  fields: [
    {
      name: "nama",
      title: "Nama Masjid",
      type: "string",
      validation: (R: Rule) => R.required(),
    },
    {
      name: "zon",
      title: "Zon",
      type: "reference",
      to: [{ type: "zon" }],
      validation: (R: Rule) => R.required(),
    },
    { name: "lokasi", title: "Lokasi / Alamat", type: "string" },
    {
      name: "jenisTempat",
      title: "Jenis Tempat",
      type: "string",
      options: {
        list: [
          { title: "Masjid", value: "masjid" },
          { title: "Surau", value: "surau" },
          { title: "Pejabat", value: "pejabat" },
        ],
      },
      initialValue: "masjid",
      description: "Direktori masjid awam hanya papar 'masjid'. Surau/pejabat untuk Posting Khas.",
    },
    {
      name: "isInduk",
      title: "Masjid Induk Zon",
      type: "boolean",
      initialValue: false,
      description: "Masjid induk / pejabat pentadbiran zon.",
    },
    {
      name: "isNegeri",
      title: "Masjid Negeri",
      type: "boolean",
      initialValue: false,
      description: "Masjid negeri Wilayah Persekutuan.",
    },
    { name: "catatan", title: "Catatan", type: "text", rows: 2 },
    // v3: koordinat peta (opsyenal, additive) — dijana skrip geocode + semakan manual.
    { name: "latitude", title: "Latitude", type: "number", description: "Koordinat peta (opsyenal)." },
    { name: "longitude", title: "Longitude", type: "number", description: "Koordinat peta (opsyenal)." },
  ],
  orderings: [
    {
      title: "Zon kemudian Nama",
      name: "byZon",
      by: [
        { field: "zon->nombor", direction: "asc" },
        { field: "nama", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "nama", subtitle: "lokasi", zon: "zon.nama" },
    prepare(sel: { title?: string; subtitle?: string; zon?: string }) {
      return {
        title: sel.title,
        subtitle: [sel.zon, sel.subtitle].filter(Boolean).join(" · "),
      };
    },
  },
};
