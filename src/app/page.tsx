import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  HeartHandshake,
  Building2,
  Users2,
  MapPinned,
  BadgeCheck,
  Landmark,
} from "lucide-react";
import { HomeHero } from "@/components/sections/HomeHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { initials, formatRM } from "@/lib/utils";
import { getPrograms, getAjk, getJenisSaguhati, getSiteSettings } from "@/lib/sanity";
import { homepageContent } from "@/content/homepage";
import { visiMisi } from "@/content/pages";

export default async function HomePage() {
  const [programs, ajk, jenis, settings] = await Promise.all([
    getPrograms(),
    getAjk(),
    getJenisSaguhati(),
    getSiteSettings(),
  ]);
  const tertinggi = ajk.filter((a) => a.kumpulan === "tertinggi");

  return (
    <>
      <HomeHero />

      {/* Tentang / Visi & Misi — latar gelap dramatik */}
      <section className="relative overflow-hidden bg-primary-dark py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 pattern-geometric-dark opacity-60" />
        <div className="container-wide relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow eyebrow--on-dark">Tentang PERKIB</span>
            <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
              Wadah Kebajikan Pegawai Masjid Wilayah Persekutuan
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/75">
              PERKIB ialah pertubuhan kebajikan bagi Naqib Masjid, Imam dan Bilal lantikan
              Majlis Agama Islam Wilayah Persekutuan yang bertugas di masjid-masjid Wilayah
              Persekutuan. Ditubuhkan pada 2021, PERKIB komited memartabatkan peranan pegawai
              masjid sebagai pemacu inovasi dan perkhidmatan kontemporari.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold">
                <Link href="/profil">
                  Profil Penuh <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/visi-misi">Visi &amp; Misi</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="font-display text-xl text-accent-bright">Visi</h3>
              <p className="mt-2 text-white/85">{visiMisi.visi}</p>
              <h3 className="font-display mt-6 text-xl text-accent-bright">Misi</h3>
              <ul className="mt-3 space-y-2.5">
                {visiMisi.misi.map((m, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/80">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[11px] font-bold text-accent-bright">
                      {i + 1}
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Skop perkhidmatan — kad ringkas */}
      <section className="bg-background py-20 md:py-24">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Skop Perkhidmatan"
            title="Menyeluruh di Seluruh Wilayah Persekutuan"
            description="Daripada direktori masjid mengikut zon JAWI sehinggalah kebajikan setiap pegawai — semuanya di satu tempat."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPinned, tajuk: "8 Zon JAWI", teks: "Direktori masjid tersusun mengikut lapan zon rasmi JAWI di KL, Putrajaya & Labuan.", href: "/direktori-masjid" },
              { icon: Building2, tajuk: "89 Masjid", teks: "Senarai lengkap masjid Wilayah Persekutuan di bawah seliaan JAWI.", href: "/direktori-masjid" },
              { icon: Users2, tajuk: "91 Pegawai", teks: "Maklumat Ketua Imam, Timbalan Ketua Imam dan Bilal mengikut zon.", href: "/pegawai" },
              { icon: HeartHandshake, tajuk: "9 Saguhati", teks: "Saguhati kebajikan untuk detik penting dan musibah ahli.", href: "/saguhati" },
            ].map((c, i) => (
              <Reveal key={c.tajuk} delay={i * 0.08}>
                <Link
                  href={c.href}
                  className="card-hover group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <c.icon className="size-6" />
                  </span>
                  <h3 className="font-display mt-5 text-lg font-semibold text-ink">{c.tajuk}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.teks}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Lihat <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Program */}
      <section className="bg-bg-alt py-20 md:py-24">
        <div className="container-wide">
          <SectionHeading
            eyebrow={homepageContent.programHeader.eyebrow}
            title={homepageContent.programHeader.title}
            description={homepageContent.programHeader.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {programs.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <article className="card-hover gold-topline flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft">
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                      <Icon name={p.icon} className="size-7" />
                    </span>
                    <h3 className="font-display text-xl font-semibold text-primary-dark">{p.nama}</h3>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{p.penerangan}</p>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4 text-xs">
                    <span className="rounded-full bg-primary/8 px-3 py-1 font-medium text-primary">
                      Sasaran: {p.sasaran}
                    </span>
                    <span className="rounded-full bg-accent/12 px-3 py-1 font-medium text-accent-deep">
                      {p.jadual}
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AJK preview — Majlis Tertinggi */}
      <section className="bg-background py-20 md:py-24">
        <div className="container-wide">
          <SectionHeading
            eyebrow={homepageContent.ajkHeader.eyebrow}
            title={homepageContent.ajkHeader.title}
            description={homepageContent.ajkHeader.description}
          />
          <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {tertinggi.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <div className="card-hover flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center shadow-soft">
                  <div className="relative size-24 overflow-hidden rounded-full ring-2 ring-accent/30">
                    {m.photoUrl ? (
                      <Image src={m.photoUrl} alt={m.nama} fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/8">
                        <span className="font-display text-2xl font-semibold text-primary/50">
                          {initials(m.nama)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 font-semibold leading-tight text-accent-deep text-sm">{m.jawatan}</p>
                  <p className="mt-1 font-display text-sm text-ink">{m.nama}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="primary">
              <Link href="/ajk">
                Lihat Carta Organisasi Penuh <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Saguhati CTA */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 pattern-geometric-dark opacity-40" />
        <div className="pointer-events-none absolute -right-20 top-0 size-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="container-wide relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow eyebrow--on-dark">{homepageContent.saguhatiHeader.eyebrow}</span>
            <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
              {homepageContent.saguhatiHeader.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              {homepageContent.saguhatiHeader.description} Permohonan dibuat dalam talian —
              masukkan nombor pekerja, sahkan identiti, dan muat naik dokumen sokongan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/saguhati/mohon">
                  <HeartHandshake className="size-5" /> Mohon Sekarang
                </Link>
              </Button>
              <Button asChild variant="white" size="lg">
                <Link href="/saguhati/semak">Semak Status</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {jenis.slice(0, 6).map((j) => (
                <div key={j.id} className="rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
                  <BadgeCheck className="size-5 text-accent-bright" />
                  <p className="mt-2 text-sm font-medium leading-snug text-white">{j.nama}</p>
                  <p className="mt-1 font-display text-lg text-accent-bright">{formatRM(j.kadar)}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Derma teaser */}
      <section className="bg-bg-alt py-20 md:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow">Sumbangan</span>
            <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-primary-dark md:text-4xl">
              Salurkan Sumbangan Anda
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Sumbangan anda menyokong agenda kebajikan, pendidikan dan bantuan asnaf PERKIB.
              Salurkan melalui akaun Bank Rakyat atau imbas DuitNow QR rasmi.
            </p>
            <div className="mt-7 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <Landmark className="size-6 text-accent" />
                <div>
                  <p className="font-semibold text-ink">{settings.bank.name}</p>
                  <p className="font-display text-2xl tracking-wide text-primary">{settings.bank.account}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{settings.bank.holder}</p>
            </div>
            <Button asChild variant="primary" className="mt-6">
              <Link href="/derma">
                Cara Menyumbang <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.15} className="flex justify-center">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-deep">
              <Image
                src="/duitnow-qr.jpg"
                alt="DuitNow QR PERKIB-MAIWP"
                width={320}
                height={440}
                className="h-auto w-full max-w-[280px] rounded-xl"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
