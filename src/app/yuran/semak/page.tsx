import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SemakYuranForm } from "./SemakYuranForm";

export const metadata: Metadata = {
  title: "Semak Yuran Keahlian",
  description: "Semak rekod bayaran yuran keahlian PERKIB anda (pegawai masjid).",
};

export default function SemakYuranPage() {
  return (
    <>
      <PageHero
        eyebrow="Semakan"
        title="Semak Yuran Keahlian"
        description="Pegawai masjid boleh menyemak rekod bayaran yuran keahlian dengan mengesahkan No. Pekerja dan 4 digit akhir kad pengenalan."
        breadcrumb={[{ label: "Semak Yuran" }]}
      />
      <section className="bg-background py-12 md:py-16">
        <div className="container-narrow">
          <div className="mb-6 rounded-xl border border-accent/25 bg-accent/[0.06] p-4 text-sm text-muted-foreground">
            💬 <strong className="text-ink">Melalui WhatsApp:</strong> hantar <code className="rounded bg-black/10 px-1">yuran &lt;No. Pekerja&gt;</code>{" "}
            ke nombor rasmi PERKIB dari nombor telefon berdaftar anda — rekod yuran akan dibalas automatik.
          </div>
          <SemakYuranForm />
        </div>
      </section>
    </>
  );
}
