import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { Quote } from "lucide-react";
import { initials } from "@/lib/utils";
import { perutusan } from "@/content/pages";
import { getAjk } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Perutusan Presiden",
  description: "Perutusan Presiden Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB).",
};

export default async function PerutusanPage() {
  const ajk = await getAjk();
  const presiden = ajk.find((a) => a.employeeNo === perutusan.employeeNo);

  return (
    <>
      <PageHero
        eyebrow={perutusan.eyebrow}
        title={perutusan.title}
        breadcrumb={[{ label: "Perutusan" }]}
      />

      <section className="relative overflow-hidden bg-primary-deep py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 pattern-geometric-dark opacity-50" />
        <div className="pointer-events-none absolute -right-24 top-10 size-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="container-narrow relative text-center">
          <Reveal>
            <Quote className="mx-auto size-14 text-accent/60" />
            <blockquote className="font-display mt-8 text-2xl leading-relaxed text-white md:text-3xl">
              &ldquo;{perutusan.teks}&rdquo;
            </blockquote>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-col items-center">
              <div className="relative size-28 overflow-hidden rounded-full ring-4 ring-accent/30">
                {presiden?.photoUrl ? (
                  <Image src={presiden.photoUrl} alt={perutusan.nama} fill sizes="112px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/10">
                    <span className="font-display text-3xl text-accent-bright">
                      {initials(perutusan.nama)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-5 ornament-divider" aria-hidden>
                <span className="ornament-mark" />
              </div>
              <p className="mt-4 font-display text-xl text-white">{perutusan.nama}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wide text-accent-bright">
                {perutusan.jawatan}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
