import type { Rule } from "./_rule";

// Paparan Utama (singleton, _id tetap "paparanUtama") — kawalan homepage yang boleh
// disunting admin: (1) jalur aktiviti auto-skrol di atas hero; (2) popup banner iklan.
// Kedua-dua ada suis on/off. Bila doc tiada / suis off → homepage seperti biasa.

export default {
  name: "paparanUtama",
  title: "Paparan Utama (Homepage)",
  type: "document",
  groups: [
    { name: "scroller", title: "Jalur Aktiviti", default: true },
    { name: "popup", title: "Popup Banner" },
  ],
  fields: [
    // ── Jalur aktiviti (marquee atas homepage) ──
    {
      name: "scrollerAktif",
      title: "Papar Jalur Aktiviti?",
      type: "boolean",
      initialValue: false,
      group: "scroller",
      description: "Hidupkan untuk papar jalur gambar aktiviti auto-skrol di atas homepage.",
    },
    {
      name: "scrollerGambar",
      title: "Gambar Aktiviti",
      type: "array",
      group: "scroller",
      validation: (R: Rule) => R.max(12),
      of: [
        {
          type: "object",
          fields: [
            { name: "gambar", title: "Gambar", type: "image", options: { hotspot: true } },
            { name: "keterangan", title: "Keterangan (opsyenal)", type: "string" },
          ],
          preview: { select: { title: "keterangan", media: "gambar" } },
        },
      ],
    },
    // ── Popup banner ──
    {
      name: "popupAktif",
      title: "Papar Popup Banner?",
      type: "boolean",
      initialValue: false,
      group: "popup",
      description: "Hidupkan untuk papar popup banner bila pelawat buka homepage.",
    },
    { name: "popupTajuk", title: "Tajuk Popup", type: "string", group: "popup" },
    {
      name: "popupGambar",
      title: "Gambar Popup",
      type: "image",
      options: { hotspot: true },
      group: "popup",
    },
    {
      name: "popupPautan",
      title: "Pautan Butang (URL) — opsyenal",
      type: "url",
      group: "popup",
      description: "Bila diisi, butang popup akan ke pautan ini.",
    },
    { name: "popupButang", title: "Teks Butang (opsyenal)", type: "string", group: "popup" },
    {
      name: "popupKekerapan",
      title: "Kekerapan Papar",
      type: "string",
      group: "popup",
      initialValue: "sesi",
      options: {
        list: [
          { title: "Sekali per sesi pelayar", value: "sesi" },
          { title: "Sekali sehari", value: "harian" },
          { title: "Setiap lawatan", value: "setiap" },
        ],
        layout: "radio",
      },
    },
  ],
  preview: {
    prepare() {
      return { title: "Paparan Utama (Homepage)" };
    },
  },
};
