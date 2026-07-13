import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { Clock, Mail } from "lucide-react";
import { sukarelawan } from "@/content/pages";
import { siteInfo } from "@/content/site";

export const metadata: Metadata = {
  title: "Sukarelawan",
  description:
    "Sertai barisan sukarelawan PERKIB dalam program dakwah, kebajikan dan pembangunan modal insan.",
};

export default function SukarelawanPage() {
  return (
    <>
      <PageHero
        eyebrow={sukarelawan.eyebrow}
        title={sukarelawan.title}
        description={sukarelawan.pengenalan}
        breadcrumb={[{ label: "Sukarelawan" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-2">
            {sukarelawan.bidang.map((b, i) => (
              <Reveal key={b.bidang} delay={i * 0.1}>
                <article className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-8 shadow-soft">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <Icon name={b.icon} className="size-7" />
                  </span>
                  <h2 className="font-display mt-5 text-xl font-semibold text-primary-dark">
                    {b.bidang}
                  </h2>
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4 text-accent" />
                    Komitmen masa: <span className="font-medium text-ink">{b.komitmen}</span>
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col items-center rounded-2xl bg-primary-dark p-10 text-center text-white">
              <h2 className="font-display text-2xl font-semibold">Sertai Kami</h2>
              <p className="mt-3 max-w-xl text-white/75">
                Berminat menjadi sukarelawan PERKIB? Hubungi urus setia kami untuk maklumat lanjut.
              </p>
              <p className="mt-4 font-semibold text-accent-bright">{sukarelawan.hubungi}</p>
              <Button asChild variant="gold" className="mt-6">
                <a href={`mailto:${siteInfo.email}`}>
                  <Mail className="size-4" /> Hubungi Urus Setia
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
