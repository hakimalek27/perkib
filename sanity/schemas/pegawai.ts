import type { Rule } from "./_rule";

export default {
  name: "pegawai",
  title: "Pegawai (Imam/Bilal)",
  type: "document",
  groups: [
    { name: "umum", title: "Umum", default: true },
    { name: "tugas", title: "Penugasan" },
    { name: "sulit", title: "Sulit (tidak dipapar awam)" },
  ],
  fields: [
    {
      name: "employeeNo",
      title: "No. Pekerja",
      type: "string",
      group: "umum",
      readOnly: true,
      validation: (R: Rule) => R.required(),
    },
    {
      name: "nama",
      title: "Nama",
      type: "string",
      group: "umum",
      validation: (R: Rule) => R.required(),
    },
    {
      name: "kategori",
      title: "Kategori",
      type: "string",
      group: "umum",
      options: {
        list: [
          { title: "Ketua Imam", value: "ketua-imam" },
          { title: "Timbalan Ketua Imam", value: "timbalan-ketua-imam" },
          { title: "Bilal", value: "bilal" },
        ],
      },
      validation: (R: Rule) => R.required(),
    },
    { name: "jawatanPenuh", title: "Jawatan Penuh (API)", type: "string", group: "umum" },
    {
      name: "gambar",
      title: "Gambar Rasmi",
      type: "image",
      group: "umum",
      options: { hotspot: true },
    },
    { name: "emelRasmi", title: "Emel Rasmi", type: "string", group: "umum" },
    { name: "gred", title: "Gred", type: "string", group: "umum" },
    {
      name: "statusAktif",
      title: "Status Aktif",
      type: "boolean",
      group: "umum",
      initialValue: true,
    },
    {
      name: "masjid",
      title: "Masjid Bertugas",
      type: "reference",
      group: "tugas",
      to: [{ type: "masjid" }],
      description:
        "Tugaskan pegawai ini ke masjid. Boleh dikosongkan — pegawai akan disenaraikan di bawah 'Belum Ditugaskan'. Tukar masjid di sini bila pegawai bertukar.",
    },
    // ── Medan sulit — TIDAK diproject ke halaman awam ──
    {
      name: "icLast4",
      title: "4 Digit Akhir Kad Pengenalan",
      type: "string",
      group: "sulit",
      readOnly: true,
      description: "Untuk pengesahan permohonan saguhati sahaja. IC penuh disimpan terenkripsi.",
    },
    { name: "bahagian", title: "Bahagian", type: "string", group: "sulit" },
    { name: "statusPerjawatan", title: "Status Perjawatan", type: "string", group: "sulit" },
    // ── Medan terenkripsi (AES-256-GCM) — diurus HANYA melalui panel admin ──
    // Disembunyikan dari Studio supaya editor tidak merosakkan sifer.
    {
      name: "noKpEnc",
      title: "No. KP (terenkripsi)",
      type: "string",
      group: "sulit",
      readOnly: true,
      hidden: true,
    },
    {
      name: "telefonEnc",
      title: "No. Telefon (terenkripsi)",
      type: "string",
      group: "sulit",
      readOnly: true,
      hidden: true,
    },
    // Medan telefon plain LAMA — dikekalkan supaya migrasi boleh unset; jangan guna.
    {
      name: "telefon",
      title: "No. Telefon (lama — jangan guna)",
      type: "string",
      group: "sulit",
      readOnly: true,
      hidden: true,
    },
  ],
  orderings: [
    { title: "Nama (A-Z)", name: "byNama", by: [{ field: "nama", direction: "asc" }] },
    {
      title: "Kategori",
      name: "byKategori",
      by: [
        { field: "kategori", direction: "asc" },
        { field: "nama", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "nama",
      kategori: "kategori",
      masjid: "masjid.nama",
      media: "gambar",
    },
    prepare(sel: { title?: string; kategori?: string; masjid?: string; media?: unknown }) {
      const kat: Record<string, string> = {
        "ketua-imam": "Ketua Imam",
        "timbalan-ketua-imam": "Timbalan Ketua Imam",
        bilal: "Bilal",
      };
      return {
        title: sel.title,
        subtitle: [kat[sel.kategori ?? ""] ?? sel.kategori, sel.masjid ?? "Belum ditugaskan"]
          .filter(Boolean)
          .join(" · "),
        media: sel.media,
      };
    },
  },
};
