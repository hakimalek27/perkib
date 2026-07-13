// Log audit — direkod oleh setiap server action admin yang mengubah data.
// Dipapar di dashboard admin sebagai "aktiviti terkini".
export default {
  name: "auditLog",
  title: "Log Audit",
  type: "document",
  fields: [
    { name: "masa", title: "Masa", type: "datetime", readOnly: true },
    { name: "aksi", title: "Aksi", type: "string", readOnly: true },
    { name: "sasaran", title: "Sasaran", type: "string", readOnly: true },
    { name: "ringkasan", title: "Ringkasan", type: "text", rows: 2, readOnly: true },
  ],
  orderings: [
    { title: "Terbaru", name: "byMasa", by: [{ field: "masa", direction: "desc" }] },
  ],
  preview: {
    select: { aksi: "aksi", sasaran: "sasaran", masa: "masa" },
    prepare(sel: { aksi?: string; sasaran?: string; masa?: string }) {
      return {
        title: `${sel.aksi ?? "?"} · ${sel.sasaran ?? ""}`,
        subtitle: sel.masa ? new Date(sel.masa).toLocaleString("ms-MY") : "",
      };
    },
  },
};
