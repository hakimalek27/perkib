import type { Rule } from "./_rule";

// Singleton — kadar yuran keahlian bulanan mengikut gred. Admin/bendahari boleh ubah.
export default {
  name: "yuranTetapan",
  title: "Tetapan Yuran",
  type: "document",
  fields: [
    {
      name: "kadar",
      title: "Kadar Yuran Bulanan (mengikut gred)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "gred", title: "Gred", type: "string", validation: (R: Rule) => R.required() },
            {
              name: "bulanan",
              title: "Kadar Sebulan (RM)",
              type: "number",
              validation: (R: Rule) => R.required().min(0),
            },
          ],
          preview: {
            select: { gred: "gred", bulanan: "bulanan" },
            prepare(sel: { gred?: string; bulanan?: number }) {
              return { title: sel.gred ?? "—", subtitle: `RM${sel.bulanan ?? 0} / bulan` };
            },
          },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Tetapan Yuran" };
    },
  },
};
