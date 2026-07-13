import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { profil } from "@/content/pages";

export const metadata: Metadata = {
  title: "Profil & Sejarah",
  description:
    "Profil dan sejarah Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB), ditubuhkan 2021 di bawah naungan MAIWP.",
};

export default function ProfilPage() {
  return (
    <>
      <PageHero
        eyebrow={profil.eyebrow}
        title={profil.title}
        description="Mengenali latar belakang, sejarah dan identiti korporat PERKIB."
        breadcrumb={[{ label: "Profil & Sejarah" }]}
      />

      {/* Profil + fakta */}
      <section className="bg-background py-16 md:py-20">
        <div className="container-wide grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="prose-dropcap max-w-none space-y-5 text-base leading-relaxed text-ink/85">
              {profil.perenggan.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-7 shadow-soft gold-topline">
              <h2 className="font-display text-xl font-semibold text-primary-dark">
                Maklumat Pertubuhan
              </h2>
              <dl className="mt-5 space-y-4">
                {profil.fakta.map((f) => (
                  <div key={f.label} className="border-b border-border pb-3 last:border-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Makna logo */}
      <section className="bg-primary-dark py-16 md:py-20">
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
                <Image
                  src="/logo.png"
                  alt="Logo PERKIB"
                  width={220}
                  height={220}
                  className="mx-auto size-48 object-contain"
                />
                <span className="eyebrow eyebrow--on-dark mt-6">{profil.logo.title}</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-base leading-relaxed text-white/75">{profil.logo.intro}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {profil.logo.elemen.map((e) => (
                  <div key={e.tajuk} className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-display text-lg text-accent-bright">{e.tajuk}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{e.makna}</p>
                  </div>
                ))}
              </div>
              <h3 className="font-display mt-8 text-lg text-white">Makna Tiga Warna</h3>
              <div className="mt-3 space-y-2.5">
                {profil.logo.warna.map((w) => (
                  <div key={w.nama} className="flex gap-3 text-sm text-white/75">
                    <span className="mt-1 size-3 shrink-0 rounded-full bg-accent" />
                    <span>
                      <span className="font-semibold text-white">{w.nama}:</span> {w.makna}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
