import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { ArchOutline } from "@/components/nadi/ArchOutline";
import { CinematicSlot } from "@/components/nadi/CinematicSlot";
import { homepageContent } from "@/content/homepage";

// Hero Spatial Mihrab — latar ivory (teks gelap), panel arch obsidian di kanan.
// compact: bila jalur aktiviti hadir di atas (ia sudah ambil ruang header),
// kurangkan padding atas supaya tiada jurang berganda.
export function HeroMihrab({ compact = false }: { compact?: boolean }) {
  const { hero } = homepageContent;
  return (
    <section
      id="utama"
      className={`relative overflow-hidden bg-background ${compact ? "pt-8 md:pt-10" : "pt-[104px]"}`}
    >
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />
      <div className="container-wide relative grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        {/* Kiri — teks */}
        <div className="reveal in">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="heading-display mt-6 text-ink">
            Memartabatkan
            <br />
            <span className="text-primary">Pegawai Masjid</span>
            <br />
            Wilayah Persekutuan
          </h1>
          <div className="mt-6 h-px w-40 bg-gradient-to-r from-accent via-accent-bright to-transparent" />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{hero.lede}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15.5px] font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              <HeartHandshake className="size-5" />
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg border border-[#C9CCD2] px-6 text-[15.5px] font-semibold text-ink transition-colors hover:border-ink"
            >
              {hero.secondaryCta.label}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Di bawah naungan{" "}
            <span className="font-semibold text-ink">Majlis Agama Islam Wilayah Persekutuan (MAIWP)</span>
          </p>
        </div>

        {/* Kanan — panel arch obsidian */}
        <div className="relative mx-auto hidden w-full max-w-md lg:block">
          {/* Echo emas di belakang */}
          <ArchOutline
            className="absolute -right-4 top-4 h-full w-full"
            stroke="var(--gold-soft)"
            strokeWidth={1}
          />
          <ArchFrame ratio="5 / 6" className="relative">
            {/* Slot sinematik — fallback = corak bintang + logo */}
            <CinematicSlot srcWide="/media/perkib-hero-wide.mp4" srcVert="/media/perkib-hero-vert.mp4" className="size-full">
              <div className="pattern-star8 size-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Medali emas — logo diangkat dari panel gelap: cakera bercincin
                    emas + sinaran radial berdenyut supaya logo tidak "tenggelam". */}
                <div className="relative">
                  <div
                    className="medali-halo pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    aria-hidden
                  />
                  <div className="relative grid size-44 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_32%,#222a34,#090c11)] shadow-[0_12px_44px_-10px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-[color:var(--accent)]/70">
                    <span
                      className="pointer-events-none absolute inset-[6px] rounded-full ring-1 ring-[color:var(--accent-bright)]/35"
                      aria-hidden
                    />
                    <Image
                      src="/logo-mark.png"
                      alt="Logo PERKIB"
                      width={200}
                      height={200}
                      className="size-[88%] object-contain drop-shadow-[0_2px_10px_rgba(198,162,93,0.35)]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </CinematicSlot>
            {/* Gradien legibiliti bawah */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
            {/* Panel petikan smoked glass */}
            <div className="smoked absolute inset-x-4 bottom-4 rounded-xl p-4">
              <p className="text-center font-display text-[15px] leading-snug text-accent-bright">
                &ldquo;Merealisasikan Perkhidmatan Pegawai Masjid Kontemporari&rdquo;
              </p>
            </div>
          </ArchFrame>
        </div>
      </div>
    </section>
  );
}
