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
            {
              name: "gambar",
              title: "Gambar (nisbah 16:10)",
              type: "image",
              options: { hotspot: { previews: [{ title: "Jalur 16:10", aspectRatio: 16 / 10 }] } },
              description:
                "Klik ikon crop pada gambar → pratonton \"Jalur 16:10\" menunjukkan TEPAT apa yang akan dipaparkan dalam jalur. Gerakkan kawasan crop / titik fokus untuk pilih sudut — itulah yang keluar selepas publish.",
            },
            { name: "keterangan", title: "Keterangan (opsyenal)", type: "string" },
          ],
          preview: { select: { title: "keterangan", media: "gambar" } },
        },
      ],
    },
    {
      name: "scrollerKelajuan",
      title: "Kelajuan Pergerakan Jalur",
      type: "string",
      group: "scroller",
      initialValue: "sederhana",
      description: "Seberapa laju jalur aktiviti bergerak (skrol) di atas homepage.",
      options: {
        list: [
          { title: "Perlahan", value: "perlahan" },
          { title: "Sederhana", value: "sederhana" },
          { title: "Laju", value: "laju" },
          { title: "Sangat Laju", value: "sangat-laju" },
        ],
        layout: "radio",
      },
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
    {
      name: "popupMula",
      title: "Mula Papar (opsyenal)",
      type: "datetime",
      group: "popup",
      description: "Popup hanya muncul BERMULA tarikh/masa ini. Biar kosong = mula serta-merta.",
    },
    {
      name: "popupTamat",
      title: "Tamat Papar / Auto-Off (opsyenal)",
      type: "datetime",
      group: "popup",
      description: "Popup berhenti muncul SELEPAS tarikh/masa ini (auto-off). Biar kosong = tiada tamat.",
      validation: (R: Rule) =>
        R.custom((tamat: unknown, ctx: { parent?: Record<string, unknown> }) => {
          const mula = ctx?.parent?.popupMula as string | undefined;
          if (tamat && mula && new Date(tamat as string) <= new Date(mula)) {
            return "Masa tamat mesti selepas masa mula.";
          }
          return true;
        }),
    },
    { name: "popupTajuk", title: "Tajuk Popup", type: "string", group: "popup" },
    {
      name: "popupGambar",
      title: "Gambar Popup (portrait 1080×1450)",
      type: "image",
      options: { hotspot: { previews: [{ title: "Popup 1080×1450", aspectRatio: 1080 / 1450 }] } },
      group: "popup",
      description:
        "Muat naik gambar (elok saiz 1080×1450 atau lebih besar). Klik ikon crop pada gambar → pratonton \"Popup 1080×1450\" menunjukkan TEPAT apa yang akan dipaparkan di homepage. Gerakkan kawasan crop / titik fokus untuk pilih sudut — itulah yang keluar selepas publish (bukan agak-agak).",
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
