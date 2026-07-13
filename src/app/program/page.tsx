import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Target, CalendarClock } from "lucide-react";
import { getPrograms } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Program & Inisiatif",
  description:
    "Empat teras program utama PERKIB — dakwah & pendidikan, kebajikan, sosial & modal insan, serta ekonomi & perhubungan.",
};

export default async function ProgramPage() {
  const programs = await getPrograms();
  return (
    <>
      <PageHero
        eyebrow="Program & Inisiatif"
        title="Agenda Utama PERKIB"
        description="Empat teras program yang menyeluruh — daripada dakwah dan pendidikan hinggalah kebajikan, sosial dan ekonomi ahli."
        breadcrumb={[{ label: "Program" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-wide grid gap-6 md:grid-cols-2">
          {programs.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <article className="hover-glow gold-topline flex h-full flex-col rounded-2xl border border-border bg-card p-8 shadow-soft">
                <div className="flex items-center gap-4">
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <Icon name={p.icon} className="size-8" />
                  </span>
                  <h2 className="font-display text-2xl font-semibold text-primary-dark">{p.nama}</h2>
                </div>
                <p className="mt-5 flex-1 text-base leading-relaxed text-muted-foreground">
                  {p.penerangan}
                </p>
                <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-5 text-sm">
                  <span className="flex items-center gap-2 text-ink/80">
                    <Target className="size-4 text-accent" />
                    <span className="font-medium">Sasaran:</span> {p.sasaran}
                  </span>
                  <span className="flex items-center gap-2 text-ink/80">
                    <CalendarClock className="size-4 text-accent" />
                    <span className="font-medium">Jadual:</span> {p.jadual}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
