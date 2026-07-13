export default {
  name: "siteSettings",
  title: "Tetapan Laman",
  type: "document",
  fields: [
    { name: "footerDescription", title: "Penerangan Footer", type: "text", rows: 3 },
    { name: "phone", title: "Telefon Rasmi", type: "string" },
    { name: "email", title: "Emel Rasmi", type: "string" },
    { name: "facebookUrl", title: "Facebook", type: "url" },
    {
      name: "bankInfo",
      title: "Maklumat Bank",
      type: "object",
      fields: [
        { name: "name", title: "Nama Bank", type: "string" },
        { name: "account", title: "No. Akaun", type: "string" },
        { name: "holder", title: "Pemegang Akaun", type: "string" },
        { name: "duitNowRef", title: "Rujukan DuitNow QR", type: "string" },
        { name: "qrImage", title: "Imej DuitNow QR", type: "image" },
      ],
    },
    {
      name: "officeHours",
      title: "Waktu Pejabat",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "day", title: "Hari", type: "string" },
            { name: "time", title: "Masa", type: "string" },
          ],
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Tetapan Laman PERKIB" };
    },
  },
};
