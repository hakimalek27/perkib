import Link from "next/link";
import Image from "next/image";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { HeroMihrab } from "@/components/sections/HeroMihrab";
import { DermaCopy } from "@/components/sections/DermaCopy";
import { Reveal } from "@/components/Reveal";
import { Odometer } from "@/components/nadi/Odometer";
import { Glyph, type GlyphName } from "@/components/ui/Glyph";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHead } from "@/components/ui/SectionHead";
import { Magnetic } from "@/components/nadi/Magnetic";
import { CinematicSlot } from "@/components/nadi/CinematicSlot";
import { ScrollRail } from "@/components/nadi/ScrollRail";
import { Icon } from "@/components/Icon";
import { initials, formatRM } from "@/lib/utils";
import { getPrograms, getAjk, getJenisSaguhati, getSiteSettings } from "@/lib/sanity";
import { visiMisi } from "@/content/pages";

const RAIL = [
  { id: "utama", label: "Utama" },
  { id: "statistik", label: "Statistik" },
  { id: "tindakan", label: "Tindakan Pantas" },
  { id: "tentang", label: "Tentang" },
  { id: "program", label: "Program" },
  { id: "kepimpinan", label: "Kepimpinan" },
  { id: "saguhati", label: "Saguhati" },
  { id: "derma", label: "Derma" },
];

const STATS = [
  { value: 94, label: "Masjid Wilayah Persekutuan", note: "KL, Putrajaya & Labuan" },
  { value: 92, label: "Pegawai Masjid", note: "Ketua Imam · Timbalan · Bilal" },
  { value: 8, label: "Zon JAWI", note: "Seliaan rasmi" },
  { value: 9, label: "Jenis Saguhati", note: "Kebajikan ahli" },
];

const QUICK: { glyph: GlyphName; title: string; desc: string; href: string; cta: string; main?: boolean }[] = [
  { glyph: "saguhati", title: "Mohon Saguhati", desc: "Sembilan jenis saguhati untuk detik penting dan musibah ahli — permohonan sepenuhnya dalam talian.", href: "/saguhati", cta: "Mohon sekarang", main: true },
  { glyph: "semak", title: "Semak Status", desc: "Jejak permohonan anda dari penghantaran hingga pembayaran.", href: "/saguhati/semak", cta: "Semak" },
  { glyph: "pegawai", title: "Maklumat Pegawai", desc: "Ketua Imam, Timbalan dan Bilal mengikut zon dan masjid.", href: "/pegawai", cta: "Cari pegawai" },
  { glyph: "masjid", title: "Direktori Masjid", desc: "94 masjid tersusun mengikut lapan zon rasmi JAWI.", href: "/direktori-masjid", cta: "Lihat direktori" },
];

export default async function HomePage() {
  const [programs, ajk, jenis, settings] = await Promise.all([
    getPrograms(),
    getAjk(),
    getJenisSaguhati(),
    getSiteSettings(),
  ]);
  const tertinggi = ajk.filter((a) => a.kumpulan === "tertinggi");
  const presiden = tertinggi[0];
  const timbalan = tertinggi[1];
  const lain = tertinggi.slice(2);

  return (
    <>
      <ScrollRail items={RAIL} />
      <HeroMihrab />

      {/* (3) Strip statistik odometer — obsidian */}
      <section id="statistik" className="surface-obsidian border-y border-line-dark py-14 md:py-16">
        <div className="container-wide grid grid-cols-2 gap-8 text-white lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <p className="font-display text-[clamp(3rem,6vw,4.5rem)] font-extrabold leading-none tabular-nums text-accent-bright">
                <Odometer value={s.value} />
              </p>
              <p className="mt-3 text-sm font-semibold text-white">{s.label}</p>
              <p className="mt-1 text-xs text-white/50">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* (4) Quick Actions mosaic */}
      <section id="tindakan" className="bg-background py-20 md:py-24">
        <div className="container-wide">
          <SectionHead
            eyebrow="Akses Pantas"
            title="Semua yang Anda Perlu, Satu Sentuhan"
            lead="Perkhidmatan teras PERKIB untuk pegawai masjid dan ahli — mudah, pantas, dalam talian."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {QUICK.map((q, i) => (
              <Reveal
                key={q.title}
                delay={i * 0.08}
                className={q.main ? "lg:col-span-1 lg:row-span-2" : ""}
              >
                <Link
                  href={q.href}
                  className={`card-lift group flex h-full flex-col rounded-2xl border p-6 ${
                    q.main ? "border-primary/18 bg-[var(--tint)]" : "border-border bg-card"
                  }`}
                >
                  <Glyph name={q.glyph} className={q.main ? "size-12 text-primary" : "size-10 text-primary"} />
                  <h3 className={`mt-4 font-display font-bold text-ink ${q.main ? "text-2xl" : "text-lg"}`}>
                    {q.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{q.desc}</p>
                  {q.main ? (
                    <Magnetic className="mt-5">
                      <span className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-primary px-5 text-[15px] font-semibold text-white transition-colors group-hover:bg-primary-dark">
                        {q.cta} <ArrowRight className="size-4" />
                      </span>
                    </Magnetic>
                  ) : (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      {q.cta}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* (5) Tentang — pinned + misi 01–05 */}
      <section id="tentang" className="border-y border-border bg-card py-20 md:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-2">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Eyebrow>Tentang PERKIB</Eyebrow>
            <blockquote className="mt-5 border-l-[3px] border-accent pl-5">
              <p className="font-display text-2xl font-semibold leading-snug text-ink md:text-[28px]">
                Wadah kebajikan bagi Naqib Masjid, Imam dan Bilal lantikan MAIWP.
              </p>
            </blockquote>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Ditubuhkan pada 2021, PERKIB komited memartabatkan peranan pegawai masjid sebagai
              pemacu inovasi dan perkhidmatan kontemporari di seluruh Wilayah Persekutuan.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{visiMisi.visi}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/profil" className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark">
                Profil Penuh <ArrowRight className="size-4" />
              </Link>
              <Link href="/visi-misi" className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-[#C9CCD2] px-5 text-sm font-semibold text-ink hover:border-ink">
                Visi &amp; Misi
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-deep">Misi Pertubuhan</p>
            <ol className="mt-6 space-y-6">
              {visiMisi.misi.map((m, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <li className="flex gap-5">
                    <span className="font-display text-[22px] font-extrabold text-accent-deep">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-1 leading-relaxed text-ink">{m}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* (6) Program koridor */}
      <section id="program" className="bg-background py-20 md:py-24">
        <div className="container-wide">
          <SectionHead
            eyebrow="Program & Inisiatif"
            title="Empat Teras Agenda Pertubuhan"
            lead="Daripada dakwah dan pendidikan hinggalah kebajikan, sosial dan ekonomi ahli."
          />
          <div className="mt-12 divide-y divide-border border-y border-border">
            {programs.map((p, i) => (
              <Reveal key={p.id}>
                <article className="group grid items-center gap-4 py-6 transition-colors hover:bg-card md:grid-cols-[110px_1fr_240px] md:px-4">
                  <span className="font-display text-[44px] font-extrabold leading-none text-accent-deep transition-transform group-hover:translate-x-1.5 group-hover:text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <Icon name={p.icon} className="size-6 text-primary" />
                      <h3 className="font-display text-xl font-bold text-ink">{p.nama}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.penerangan}</p>
                  </div>
                  <div className="flex flex-col gap-2 text-xs md:items-end">
                    <span className="rounded-full bg-[var(--tint)] px-3 py-1 font-medium text-primary">Sasaran: {p.sasaran}</span>
                    <span className="rounded-full bg-accent/12 px-3 py-1 font-medium text-accent-deep">{p.jadual}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* (7) Photo break sinematik */}
      <section className="relative min-h-[340px] overflow-hidden">
        <CinematicSlot srcWide="/media/perkib-break-wide.mp4" srcVert="/media/perkib-break-vert.mp4" className="absolute inset-0 size-full">
          <div className="surface-obsidian size-full" />
          <div className="pattern-star8 absolute inset-0 opacity-60" />
        </CinematicSlot>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/80 to-obsidian/40" />
        <div className="container-wide relative flex min-h-[340px] flex-col items-center justify-center py-20 text-center">
          <Eyebrow dark>Khidmat &amp; Amanah</Eyebrow>
          <p className="mt-4 max-w-2xl font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-tight text-white">
            Imam dan bilal yang memakmurkan rumah Allah di seluruh Wilayah Persekutuan.
          </p>
        </div>
      </section>

      {/* (8) Kepimpinan */}
      <section id="kepimpinan" className="bg-background py-20 md:py-24">
        <div className="container-wide">
          <SectionHead
            eyebrow="Kepimpinan"
            title="Barisan Majlis Tertinggi 2025/2026"
            lead="Kepimpinan PERKIB yang memacu perkhidmatan pegawai masjid kontemporari."
          />
          {(presiden || timbalan) && (
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[presiden, timbalan].filter(Boolean).map((m) => (
                <Reveal key={m!.id}>
                  <div className="card-lift flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
                    <ArchFrame ratio="5 / 6" className="w-28 shrink-0">
                      {m!.photoUrl ? (
                        <Image src={m!.photoUrl} alt={m!.nama} fill sizes="112px" className="object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[var(--tint)]">
                          <span className="font-display text-3xl font-bold text-primary/50">{initials(m!.nama)}</span>
                        </div>
                      )}
                    </ArchFrame>
                    <div>
                      <p className="text-sm font-semibold text-accent-deep">{m!.jawatan}</p>
                      <p className="mt-1 font-display text-lg font-bold text-ink">{m!.nama}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {lain.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <div className="card-lift flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
                  <ArchFrame ratio="5 / 6" className="w-24">
                    {m.photoUrl ? (
                      <Image src={m.photoUrl} alt={m.nama} fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-[var(--tint)]">
                        <span className="font-display text-2xl font-bold text-primary/50">{initials(m.nama)}</span>
                      </div>
                    )}
                  </ArchFrame>
                  <p className="mt-4 text-xs font-semibold leading-tight text-accent-deep">{m.jawatan}</p>
                  <p className="mt-1 font-display text-sm font-bold text-ink">{m.nama}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/ajk" className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">
              Lihat Carta Organisasi Penuh <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* (9) Chamber masuk */}
      <div aria-hidden className="h-20 bg-gradient-to-b from-background to-obsidian md:h-28" />

      {/* (10) Saguhati 9 kad — obsidian */}
      <section id="saguhati" className="surface-obsidian py-20 md:py-24">
        <div className="container-wide">
          <SectionHead
            dark
            eyebrow="Kebajikan Ahli"
            title="Sembilan Saguhati untuk Ahli"
            lead="Saguhati kebajikan untuk meraikan detik penting dan meringankan musibah ahli PERKIB."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jenis.map((j, i) => (
              <Reveal key={j.id} delay={(i % 3) * 0.06}>
                <div className="group h-full rounded-2xl border border-line-dark bg-charcoal p-5 transition-all hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-sm font-bold text-accent-bright">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-lg font-bold text-accent-bright">{formatRM(j.kadar)}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">{j.nama}</h3>
                  {j.dokumenSokongan?.[0] && (
                    <p className="mt-2 hidden text-xs text-white/50 sm:block">Dokumen: {j.dokumenSokongan[0]}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/saguhati/mohon" className="inline-flex min-h-[50px] items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white hover:bg-primary-dark">
              <HeartHandshake className="size-5" /> Mohon Sekarang
            </Link>
            <Link href="/saguhati/semak" className="inline-flex min-h-[50px] items-center gap-2 rounded-lg border border-[#3A4250] px-6 font-semibold text-[#F7F3EB] hover:border-accent hover:text-accent">
              Semak Status
            </Link>
          </div>
        </div>
      </section>

      {/* (11) Chamber keluar */}
      <div aria-hidden className="h-20 bg-gradient-to-b from-obsidian to-background md:h-28" />

      {/* (12) Derma */}
      <section id="derma" className="bg-background py-20 md:py-24">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Sumbangan</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(1.875rem,4vw,2.625rem)] font-bold leading-tight text-ink">
              Salurkan Sumbangan Anda
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Sumbangan anda menyokong agenda kebajikan, pendidikan dan bantuan asnaf PERKIB.
              Salurkan melalui akaun Bank Rakyat atau imbas DuitNow QR rasmi.
            </p>
            <div className="mt-7">
              <DermaCopy bankName={settings.bank.name} account={settings.bank.account} holder={settings.bank.holder} />
            </div>
            <Link href="/derma" className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-[#C9CCD2] px-5 text-sm font-semibold text-ink hover:border-ink">
              Cara Menyumbang <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="flex justify-center">
            <div className="surface-obsidian rounded-3xl border border-line-dark p-6 shadow-deep">
              <div className="rounded-xl border-2 border-[var(--gold-soft)] bg-white p-3">
                <Image
                  src="/duitnow-qr.jpg"
                  alt="DuitNow QR PERKIB-MAIWP"
                  width={320}
                  height={440}
                  className="h-auto w-full max-w-[260px] rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
