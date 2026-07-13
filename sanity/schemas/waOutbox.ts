// Outbox WhatsApp — satu dokumen per cubaan hantar. Membolehkan admin nampak
// kegagalan & hantar semula (tiada kehilangan senyap). Penerima & mesej penuh
// (mungkin mengandungi IC/bank) disimpan terenkripsi; hanya versi bertopeng dipapar.
export default {
  name: "waOutbox",
  title: "Outbox WhatsApp",
  type: "document",
  fields: [
    { name: "masa", title: "Masa", type: "datetime", readOnly: true },
    { name: "peristiwa", title: "Peristiwa", type: "string", readOnly: true },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Dihantar", value: "sent" },
          { title: "Gagal", value: "failed" },
          { title: "Mod Ujian", value: "dry-run" },
        ],
      },
      readOnly: true,
    },
    { name: "toMask", title: "Penerima (bertopeng)", type: "string", readOnly: true },
    { name: "toEnc", title: "Penerima (terenkripsi)", type: "string", readOnly: true, hidden: true },
    { name: "mesejEnc", title: "Mesej (terenkripsi)", type: "text", readOnly: true, hidden: true },
    { name: "ralat", title: "Ralat", type: "text", rows: 2, readOnly: true },
    { name: "refPermohonan", title: "No. Rujukan Permohonan", type: "string", readOnly: true },
  ],
  orderings: [
    { title: "Terbaru", name: "byMasa", by: [{ field: "masa", direction: "desc" }] },
  ],
  preview: {
    select: { peristiwa: "peristiwa", status: "status", toMask: "toMask", masa: "masa" },
    prepare(sel: { peristiwa?: string; status?: string; toMask?: string; masa?: string }) {
      const icon: Record<string, string> = { sent: "✅", failed: "❌", "dry-run": "🧪" };
      return {
        title: `${icon[sel.status ?? ""] ?? ""} ${sel.peristiwa ?? ""} → ${sel.toMask ?? ""}`,
        subtitle: sel.masa ? new Date(sel.masa).toLocaleString("ms-MY") : "",
      };
    },
  },
};
