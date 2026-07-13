import type { Rule } from "./_rule";

// Rekod bayaran yuran seorang pegawai untuk satu tahun.
// _id deterministik: yuran-<employeeNo>-<tahun>.
// 12 medan bulan BERNAMA (m01..m12) — bukan array — untuk elak race _key/indeks
// bila banyak toggle serentak; setiap patch ke dokumen ini diserialize oleh Sanity.

const BULAN = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

function monthField(n: number) {
  const key = `m${String(n).padStart(2, "0")}`;
  return {
    name: key,
    title: BULAN[n - 1],
    type: "object",
    fields: [
      { name: "dibayar", title: "Dibayar", type: "boolean", initialValue: false },
      { name: "tarikh", title: "Tarikh Bayar", type: "date" },
      { name: "amaun", title: "Amaun (RM)", type: "number" },
      {
        name: "kaedah",
        title: "Kaedah",
        type: "string",
        options: {
          list: [
            { title: "Bulanan", value: "bulanan" },
            { title: "Tahunan (sekali gus)", value: "tahunan" },
            { title: "Penaja", value: "penaja" },
          ],
        },
      },
    ],
    options: { collapsible: true, collapsed: true },
  };
}

export default {
  name: "yuranTahunan",
  title: "Rekod Yuran Tahunan",
  type: "document",
  fields: [
    {
      name: "pegawai",
      title: "Pegawai",
      type: "reference",
      to: [{ type: "pegawai" }],
      readOnly: true,
    },
    { name: "employeeNo", title: "No. Pekerja", type: "string", readOnly: true },
    {
      name: "tahun",
      title: "Tahun",
      type: "number",
      readOnly: true,
      validation: (R: Rule) => R.required().integer().min(2020).max(2100),
    },
    ...Array.from({ length: 12 }, (_, i) => monthField(i + 1)),
    { name: "catatan", title: "Catatan", type: "text", rows: 2 },
  ],
  preview: {
    select: { emp: "employeeNo", tahun: "tahun", nama: "pegawai.nama" },
    prepare(sel: { emp?: string; tahun?: number; nama?: string }) {
      return {
        title: `${sel.nama ?? sel.emp ?? "?"} — ${sel.tahun ?? ""}`,
        subtitle: "Rekod Yuran",
      };
    },
  },
};
