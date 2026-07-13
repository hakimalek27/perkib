import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/sections/StatsBar";
import { homepageContent } from "@/content/homepage";

export function HomeHero() {
  const { hero, stats } = homepageContent;
  return (
    <section className="relative overflow-hidden bg-primary-deep pattern-geometric-dark pt-[112px]">
      {/* Cahaya latar */}
      <div className="pointer-events-none absolute -right-40 -top-20 size-[32rem] rounded-full bg-accent/12 blur-[100px]" />
      <div className="pointer-events-none absolute -left-32 top-40 size-96 rounded-full bg-primary-light/25 blur-[90px]" />

      <div className="container-wide relative grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Teks */}
        <div>
          <span className="eyebrow eyebrow--on-dark">{hero.eyebrow}</span>
          <h1 className="heading-display mt-6 text-white">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            {hero.lede}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href={hero.primaryCta.href}>
                <HeartHandshake className="size-5" />
                {hero.primaryCta.label}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              <Link href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Emblem */}
        <div className="relative mx-auto hidden max-w-sm lg:block">
          <div className="absolute inset-0 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-10 shadow-deep backdrop-blur-sm">
            <div className="ornament-divider mb-6" aria-hidden>
              <span className="ornament-mark" />
            </div>
            <Image
              src="/logo.png"
              alt="Logo PERKIB"
              width={260}
              height={260}
              className="mx-auto size-56 object-contain drop-shadow-2xl"
              priority
            />
            <p className="mt-6 text-center font-display text-lg text-accent-bright">
              &ldquo;Merealisasikan Perkhidmatan Pegawai Masjid Kontemporari&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="container-wide relative pb-14 md:pb-20">
        <StatsBar stats={stats} />
      </div>
    </section>
  );
}
