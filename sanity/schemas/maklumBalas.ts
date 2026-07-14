// Maklum balas / pertanyaan awam dari borang /hubungi.
// PII (nama, emel, telefon, subjek, mesej) disimpan sebagai SATU blob terenkripsi
// (dataEnc) supaya tidak bocor walau dataset public. Hanya `masa` + `status` plain
// untuk penyusunan/tapisan. Dibaca + dinyahsulit di /admin/maklum-balas.
export default {
  name: "maklumBalas",
  title: "Maklum Balas",
  type: "document",
  fields: [
    { name: "masa", title: "Masa", type: "datetime", readOnly: true },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Baru", value: "baru" },
          { title: "Dibaca", value: "dibaca" },
          { title: "Selesai", value: "selesai" },
        ],
        layout: "radio",
      },
      initialValue: "baru",
    },
    {
      name: "dataEnc",
      title: "Kandungan (terenkripsi)",
      type: "text",
      readOnly: true,
      hidden: true,
    },
  ],
  orderings: [
    { title: "Terbaru", name: "byMasa", by: [{ field: "masa", direction: "desc" }] },
  ],
  preview: {
    select: { masa: "masa", status: "status" },
    prepare(sel: { masa?: string; status?: string }) {
      return {
        title: `Maklum Balas · ${sel.status ?? "baru"}`,
        subtitle: sel.masa ? new Date(sel.masa).toLocaleString("ms-MY") : "",
      };
    },
  },
};
