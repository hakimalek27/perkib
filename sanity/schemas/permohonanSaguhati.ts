import type { Rule } from "./_rule";

export default {
  name: "permohonanSaguhati",
  title: "Permohonan Saguhati",
  type: "document",
  fields: [
    {
      name: "nomborRujukan",
      title: "No. Rujukan",
      type: "string",
      readOnly: true,
      validation: (R: Rule) => R.required(),
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Baru", value: "baru" },
          { title: "Diproses", value: "diproses" },
          { title: "Lulus", value: "lulus" },
          { title: "Tolak", value: "tolak" },
          { title: "Dibayar", value: "dibayar" },
        ],
        layout: "radio",
      },
      initialValue: "baru",
      validation: (R: Rule) => R.required(),
    },
    // ── Snapshot pemohon (kekal walaupun rekod pegawai berubah) ──
    { name: "employeeNo", title: "No. Pekerja", type: "string", readOnly: true },
    { name: "namaPemohon", title: "Nama Pemohon", type: "string", readOnly: true },
    { name: "emelPemohon", title: "Emel Pemohon", type: "string", readOnly: true },
    { name: "jawatanPemohon", title: "Jawatan Pemohon", type: "string", readOnly: true },
    { name: "masjidPemohon", title: "Masjid Pemohon", type: "string", readOnly: true },
    // ── Jenis saguhati ──
    { name: "jenisKod", title: "Kod Jenis", type: "string", readOnly: true },
    { name: "jenisNama", title: "Jenis Saguhati", type: "string", readOnly: true },
    { name: "jenisKadar", title: "Kadar (RM)", type: "number", readOnly: true },
    {
      name: "pegawai",
      title: "Pautan Pegawai",
      type: "reference",
      to: [{ type: "pegawai" }],
      readOnly: true,
    },
    {
      name: "jenis",
      title: "Pautan Jenis Saguhati",
      type: "reference",
      to: [{ type: "jenisSaguhati" }],
      readOnly: true,
    },
    { name: "catatan", title: "Catatan Pemohon", type: "text", rows: 3, readOnly: true },
    {
      name: "dokumen",
      title: "Dokumen Sokongan",
      type: "array",
      of: [{ type: "file" }],
      readOnly: true,
    },
    { name: "catatanAdmin", title: "Catatan Admin", type: "text", rows: 3 },
    { name: "tarikhMohon", title: "Tarikh Mohon", type: "datetime", readOnly: true },
    { name: "tarikhKemaskini", title: "Tarikh Kemas Kini", type: "datetime" },
  ],
  orderings: [
    {
      title: "Terbaru Dahulu",
      name: "byTarikh",
      by: [{ field: "tarikhMohon", direction: "desc" }],
    },
    {
      title: "Status",
      name: "byStatus",
      by: [
        { field: "status", direction: "asc" },
        { field: "tarikhMohon", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: { ruj: "nomborRujukan", nama: "namaPemohon", status: "status", jenis: "jenisNama" },
    prepare(sel: { ruj?: string; nama?: string; status?: string; jenis?: string }) {
      const statusLabel: Record<string, string> = {
        baru: "🆕 Baru",
        diproses: "⏳ Diproses",
        lulus: "✅ Lulus",
        tolak: "❌ Tolak",
        dibayar: "💰 Dibayar",
      };
      return {
        title: `${sel.ruj} — ${sel.nama ?? ""}`,
        subtitle: `${statusLabel[sel.status ?? ""] ?? sel.status} · ${sel.jenis ?? ""}`,
      };
    },
  },
};
