import type { StructureBuilder, StructureResolverContext } from "sanity/structure";

// Struktur Studio tersuai — Permohonan Saguhati dipin di atas, senarai Pegawai
// "Belum Ditugaskan" untuk memudahkan admin, singleton siteSettings, dan
// dokumen sistem (counter) disembunyikan.

export const structure = (S: StructureBuilder, _context: StructureResolverContext) =>
  S.list()
    .title("Kandungan PERKIB")
    .items([
      S.listItem()
        .id("permohonanSaguhati")
        .title("📋 Permohonan Saguhati")
        .icon(() => "📋")
        .child(
          S.documentTypeList("permohonanSaguhati")
            .title("Permohonan Saguhati")
            .defaultOrdering([{ field: "tarikhMohon", direction: "desc" }])
        ),
      S.divider(),
      // Pegawai — semua + tapisan "Belum Ditugaskan"
      S.listItem()
        .id("pegawai")
        .title("Pegawai (Imam/Bilal)")
        .icon(() => "🧑")
        .child(
          S.list()
            .title("Pegawai")
            .items([
              S.listItem()
                .id("pegawaiSemua")
                .title("Semua Pegawai")
                .child(
                  S.documentTypeList("pegawai")
                    .title("Semua Pegawai")
                    .defaultOrdering([{ field: "nama", direction: "asc" }])
                ),
              S.listItem()
                .id("pegawaiBelum")
                .title("⚠️ Belum Ditugaskan")
                .child(
                  S.documentList()
                    .title("Belum Ditugaskan")
                    .filter('_type == "pegawai" && !defined(masjid)')
                    .defaultOrdering([{ field: "nama", direction: "asc" }])
                ),
            ])
        ),
      S.listItem()
        .id("masjid")
        .title("Masjid")
        .icon(() => "🕌")
        .child(
          S.documentTypeList("masjid")
            .title("Masjid")
            .defaultOrdering([
              { field: "zon->nombor", direction: "asc" },
              { field: "nama", direction: "asc" },
            ])
        ),
      S.listItem()
        .id("zon")
        .title("Zon JAWI")
        .child(
          S.documentTypeList("zon")
            .title("Zon JAWI")
            .defaultOrdering([{ field: "nombor", direction: "asc" }])
        ),
      S.listItem()
        .id("ajkEntry")
        .title("Ahli Jawatankuasa")
        .child(
          S.documentTypeList("ajkEntry")
            .title("Ahli Jawatankuasa")
            .defaultOrdering([
              { field: "kumpulan", direction: "asc" },
              { field: "order", direction: "asc" },
            ])
        ),
      S.divider(),
      S.listItem()
        .id("jenisSaguhati")
        .title("Jenis Saguhati")
        .child(
          S.documentTypeList("jenisSaguhati")
            .title("Jenis Saguhati")
            .defaultOrdering([{ field: "bil", direction: "asc" }])
        ),
      S.listItem()
        .id("program")
        .title("Program & Inisiatif")
        .child(S.documentTypeList("program").title("Program & Inisiatif")),
      S.listItem()
        .id("faq")
        .title("Soalan Lazim")
        .child(S.documentTypeList("faq").title("Soalan Lazim")),
      S.divider(),
      // siteSettings — singleton
      S.listItem()
        .id("siteSettings")
        .title("⚙️ Tetapan Laman")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
