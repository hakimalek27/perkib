import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/sections/StatsBar";
import { homepageContent } from "@/content/homepage";

export function HomeHero() {
  const { hero, stats } = homepageContent;
  return (
    <section className="relative overflow-hidden mesh-royal noise pt-[112px]">
      {/* Corak geometri Islamik halus di atas mesh */}
      <div className="pointer-events-none absolute inset-0 pattern-geometric-dark opacity-40" aria-hidden />
      {/* Blob aurora */}
      <div className="aurora-blob -right-40 -top-24 size-[34rem] bg-accent/20" aria-hidden />
      <div className="aurora-blob -left-32 top-40 size-96 bg-primary-light/30 [animation-delay:-5s]" aria-hidden />

      <div className="container-wide relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Teks */}
        <div>
          <span className="eyebrow eyebrow--on-dark">{hero.eyebrow}</span>
          <h1 className="heading-display mt-6 text-white">{hero.title}</h1>
          <div className="mt-5 h-px w-40 bg-gradient-to-r from-accent via-accent-bright to-transparent" />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{hero.lede}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg" className="glow-gold">
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

        {/* Emblem — cincin emas berputar + kaca */}
        <div className="relative mx-auto hidden max-w-sm lg:block">
          <div className="absolute inset-0 rounded-full bg-accent/12 blur-3xl" aria-hidden />
          <div
            className="animate-spin-slow pointer-events-none absolute -inset-6 rounded-full border border-dashed border-accent-bright/30"
            aria-hidden
          />
          <div className="glass-dark relative animate-float rounded-[2rem] p-10 shadow-deep">
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
            <p className="mt-6 text-center font-display text-lg text-gradient-gold-anim">
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
