export default {
  name: "counter",
  title: "Kaunter (sistem)",
  type: "document",
  fields: [
    { name: "seq", title: "Nombor Urutan", type: "number", initialValue: 0 },
  ],
  preview: {
    select: { seq: "seq", id: "_id" },
    prepare(sel: { seq?: number; id?: string }) {
      return { title: sel.id, subtitle: `seq: ${sel.seq ?? 0}` };
    },
  },
};
