import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Presentation, Maximize2, Keyboard, ZoomIn, LayoutGrid } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { DECKS } from "@/content/slides";

export const metadata: Metadata = {
  title: "Slaid & Modul",
  description:
    "Deck pembentangan dan modul latihan PERKIB — bahan ilmiah untuk pegawai masjid, ahli dan orang awam. Boleh dilayari terus dalam pelayar, percuma.",
  alternates: { canonical: "/slide" },
  openGraph: {
    title: "Slaid & Modul — PERKIB",
    description:
      "Deck pembentangan dan modul latihan PERKIB yang boleh dilayari terus dalam pelayar.",
    url: "/slide",
  },
};

const PANDUAN = [
  {
    icon: ArrowRight,
    tajuk: "Navigasi",
    teks: "Klik anak panah kiri/kanan, atau guna kekunci ← → ↑ ↓, Space dan PageUp/PageDown. Home ke slaid pertama, End ke slaid akhir.",
  },
  {
    icon: ZoomIn,
    tajuk: "Zum & geser",
    teks: "Deck Pengurusan Jenazah boleh dizum sehingga 400%: butang + −, kekunci + − 0, dwi-klik, Ctrl+skrol atau cubit dua jari. Seret untuk menggeser semasa dizum.",
  },
  {
    icon: LayoutGrid,
    tajuk: "Semua slaid",
    teks: "Tekan G atau butang grid untuk melihat semua slaid sekali gus, cari mengikut tajuk atau nombor, dan lompat terus ke slaid itu.",
  },
  {
    icon: Maximize2,
    tajuk: "Skrin penuh",
    teks: "Tekan kekunci F atau butang skrin penuh. Slaid akan memenuhi skrin dan semua kawalan disorok — gerakkan tetikus ke tepi skrin (bawah, kiri, kanan atau atas) untuk memunculkannya semula.",
  },
  {
    icon: Play,
    tajuk: "Video amali",
    teks: "Dalam deck Penyembelihan Halal, video tidak dimainkan sendiri. Tekan ▶ atau Enter untuk main; ia berhenti automatik apabila anda beralih slaid.",
  },
  {
    icon: Keyboard,
    tajuk: "Bab & auto-main",
    teks: "Bar bab di bawah membolehkan lompat terus ke bahagian yang dikehendaki. Butang main mengaktifkan tayangan automatik.",
  },
];

export default function SlideIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Slaid & Modul"
        title="Bahan Pembentangan PERKIB"
        description="Deck pembentangan dan modul latihan PERKIB yang boleh dilayari terus dalam pelayar — tanpa muat turun, tanpa pendaftaran. Terbuka untuk pegawai masjid, ahli dan orang awam."
        breadcrumb={[{ label: "Slaid & Modul" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-wide">
          <div className="flex flex-col gap-10">
            {DECKS.map((d, i) => (
              <Reveal key={d.slug} delay={i * 0.08}>
                <article className="hover-glow gold-topline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <div className="grid gap-0 md:grid-cols-[minmax(0,46%)_1fr]">
                    <Link
                      href={`/slide/${d.slug}`}
                      aria-label={`Buka deck ${d.tajuk} ${d.tahun}`}
                      className="group relative block aspect-video overflow-hidden bg-obsidian md:aspect-auto md:h-full"
                    >
                      <Image
                        src={d.kover}
                        alt={d.koverAlt}
                        fill
                        sizes="(min-width: 768px) 46vw, 100vw"
                        // contain: slaid kekal utuh (tiada crop) — ruang lebih diisi obsidian.
                        className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                        priority={i === 0}
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/55 to-transparent" />
                      <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-obsidian/80 px-3 py-1.5 text-xs font-semibold text-accent-bright backdrop-blur">
                        <Presentation className="size-3.5" />
                        {d.jumlahItem} slaid interaktif
                      </span>
                    </Link>

                    <div className="flex flex-col p-7 md:p-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--tint)] px-3 py-1 text-xs font-semibold text-primary">
                          {d.eyebrow}
                        </span>
                        <span className="rounded-full bg-accent/12 px-3 py-1 text-xs font-semibold text-accent-deep">
                          {d.tahun}
                        </span>
                      </div>

                      <h2 className="mt-4 font-display text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight text-ink">
                        {d.tajuk}
                      </h2>
                      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted-foreground">
                        {d.ringkasan}
                      </p>

                      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5">
                        <div>
                          <dt className="text-xs text-muted-foreground">Slaid</dt>
                          <dd className="font-display text-lg font-bold tabular-nums text-ink">
                            {d.jumlahSlaid}
                          </dd>
                        </div>
                        {d.jumlahVideo > 0 && (
                          <div>
                            <dt className="text-xs text-muted-foreground">Video amali</dt>
                            <dd className="font-display text-lg font-bold tabular-nums text-ink">
                              {d.jumlahVideo}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-xs text-muted-foreground">Bab</dt>
                          <dd className="font-display text-lg font-bold tabular-nums text-ink">
                            {d.bab.length}
                          </dd>
                        </div>
                      </dl>

                      <ul className="mt-5 flex flex-wrap gap-2">
                        {d.bab.map((b) => (
                          <li
                            key={b}
                            className="rounded-md border border-border px-2.5 py-1 text-xs text-ink/70"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>

                      {d.sumber && (
                        <p className="mt-5 text-xs text-muted-foreground">{d.sumber}</p>
                      )}

                      <div className="mt-7">
                        <Link
                          href={`/slide/${d.slug}`}
                          className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                        >
                          Buka Deck <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Panduan kawalan deck */}
      <section className="border-t border-border bg-card py-16 md:py-20">
        <div className="container-wide">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Cara Menggunakan Deck
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Setiap deck dipaparkan seperti fail asalnya. Kawalan berikut tersedia pada komputer
            riba, tablet dan telefon.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PANDUAN.map((p, i) => (
              <Reveal key={p.tajuk} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-border bg-background p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">{p.tajuk}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.teks}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
