import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { Eye, Target, Award } from "lucide-react";
import { visiMisi } from "@/content/pages";

export const metadata: Metadata = {
  title: "Visi & Misi",
  description: "Visi, misi dan moto Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB).",
};

export default function VisiMisiPage() {
  return (
    <>
      <PageHero
        eyebrow={visiMisi.eyebrow}
        title={visiMisi.title}
        description="Hala tuju PERKIB dalam memartabatkan perkhidmatan pegawai masjid."
        breadcrumb={[{ label: "Visi & Misi" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-wide space-y-8">
          {/* Visi */}
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-center shadow-deep md:p-14">
              <div className="pointer-events-none absolute inset-0 pattern-geometric-dark opacity-40" />
              <div className="relative">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/10 text-accent-bright">
                  <Eye className="size-8" />
                </span>
                <h2 className="font-display mt-6 text-2xl font-semibold text-accent-bright">Visi</h2>
                <p className="font-display mx-auto mt-4 max-w-3xl text-2xl leading-relaxed text-white md:text-3xl">
                  {visiMisi.visi}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Misi */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft md:p-12">
              <div className="flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/12 text-accent-deep">
                  <Target className="size-7" />
                </span>
                <h2 className="font-display text-2xl font-semibold text-primary-dark">Misi</h2>
              </div>
              <ol className="mt-8 grid gap-4 md:grid-cols-2">
                {visiMisi.misi.map((m, i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-xl border border-border bg-background p-5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-ink/85">{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          {/* Moto */}
          <Reveal delay={0.15}>
            <div className="flex flex-col items-center rounded-3xl border-2 border-accent/30 bg-accent/5 p-10 text-center">
              <Award className="size-10 text-accent" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-accent-deep">
                Moto Pertubuhan
              </p>
              <p className="font-display mt-3 text-2xl text-primary-dark md:text-3xl">
                &ldquo;{visiMisi.moto}&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
