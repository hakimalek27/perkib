// Singleton — tetapan notifikasi WhatsApp (sasaran admin + templat mesej + toggle).
// Keseluruhan konfigurasi disimpan sebagai SATU blob terenkripsi (dataEnc) kerana
// mengandungi nombor telefon admin. Diurus HANYA melalui /admin/notifikasi.
export default {
  name: "notifikasiTetapan",
  title: "Tetapan Notifikasi WhatsApp",
  type: "document",
  fields: [
    {
      name: "dataEnc",
      title: "Konfigurasi (terenkripsi)",
      type: "text",
      readOnly: true,
      hidden: true,
    },
    {
      name: "nota",
      title: "Nota",
      type: "string",
      readOnly: true,
      initialValue: "Diurus melalui panel /admin/notifikasi. Jangan edit di sini.",
    },
  ],
  preview: {
    prepare() {
      return { title: "Tetapan Notifikasi WhatsApp" };
    },
  },
};
