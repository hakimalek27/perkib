import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Gift, Mail } from "lucide-react";
import { keahlian } from "@/content/pages";
import { siteInfo } from "@/content/site";

export const metadata: Metadata = {
  title: "Keahlian",
  description:
    "Syarat dan kelayakan keahlian PERKIB — terbuka kepada Naqib Masjid, Imam dan Ketua Bilal lantikan MAIWP.",
};

export default function KeahlianPage() {
  return (
    <>
      <PageHero
        eyebrow={keahlian.eyebrow}
        title={keahlian.title}
        description="Keahlian terbuka kepada pegawai masjid lantikan MAIWP yang sedang berkhidmat di Wilayah Persekutuan."
        breadcrumb={[{ label: "Keahlian" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-wide grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-primary-dark">
                Syarat Keahlian
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {keahlian.syarat}
              </p>
              <h3 className="font-display mt-8 text-lg font-semibold text-ink">Kelayakan</h3>
              <ul className="mt-4 space-y-3">
                {keahlian.kelayakan.map((k, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink/85">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl bg-primary p-8 text-white shadow-deep">
              <div className="flex items-center gap-3">
                <Gift className="size-7 text-accent-bright" />
                <h2 className="font-display text-2xl font-semibold">Manfaat Ahli</h2>
              </div>
              <ul className="mt-6 space-y-3">
                {keahlian.manfaat.map((m, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/85">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-bright" />
                    {m}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-white/15 bg-white/5 p-5">
                <p className="text-sm text-white/70">Untuk mendaftar sebagai ahli, hubungi:</p>
                <p className="mt-2 font-semibold text-accent-bright">{keahlian.hubungi}</p>
                <Button asChild variant="gold" className="mt-4">
                  <a href={`mailto:${siteInfo.email}`}>
                    <Mail className="size-4" /> Hubungi Urus Setia
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
