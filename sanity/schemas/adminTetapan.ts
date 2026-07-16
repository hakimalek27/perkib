// Tetapan admin sistem (singleton, _id tetap "adminTetapan"). Menyimpan HASH
// kata laluan (scrypt) admin & gate staf yang ditukar melalui UI /admin/staf.
// Disembunyikan daripada struktur Studio (bukan kandungan editorial). Bila hash
// tiada → sistem fallback ke env ADMIN_PASSWORD / STAF_GATE_PASSWORD.

export default {
  name: "adminTetapan",
  title: "Tetapan Admin (Sistem)",
  type: "document",
  fields: [
    {
      name: "adminPasswordHash",
      title: "Hash Kata Laluan Admin",
      type: "string",
      readOnly: true,
      hidden: true,
    },
    {
      name: "stafGatePasswordHash",
      title: "Hash Kata Laluan Gate Staf",
      type: "string",
      readOnly: true,
      hidden: true,
    },
  ],
  preview: {
    prepare() {
      return { title: "Tetapan Admin (sistem)" };
    },
  },
};
