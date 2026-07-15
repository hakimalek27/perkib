import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { AjkPersonCard } from "@/components/ajk/AjkPersonCard";
import { getAjk, ajkKumpulanLabel, type AjkView } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Ahli Jawatankuasa",
  description:
    "Struktur organisasi dan Ahli Jawatankuasa Tertinggi PERKIB sesi 2025/2026 — Majlis Tertinggi, Perwakilan Zon dan AJK Kluster.",
};

export const revalidate = 300;

function Tier({
  title,
  subtitle,
  members,
  highlightPresident = false,
}: {
  title: string;
  subtitle: string;
  members: AjkView[];
  highlightPresident?: boolean;
}) {
  return (
    <div>
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide text-white">
          {title}
        </span>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((m, i) => (
          <Reveal key={m.id} delay={Math.min(i * 0.04, 0.3)}>
            <AjkPersonCard
              member={m}
              featured={
                highlightPresident &&
                ["presiden", "timbalan presiden"].includes(m.jawatan.toLowerCase())
              }
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default async function AjkPage() {
  const ajk = await getAjk();
  const tertinggi = ajk.filter((a) => a.kumpulan === "tertinggi");
  const zon = ajk.filter((a) => a.kumpulan === "zon");
  const kluster = ajk.filter((a) => a.kumpulan === "kluster");

  return (
    <>
      <PageHero
        eyebrow="Kepimpinan"
        title="Struktur Organisasi PERKIB"
        description="Ahli Jawatankuasa Tertinggi PERKIB sesi 2025/2026 yang komited memacu perkhidmatan pegawai masjid kontemporari."
        breadcrumb={[{ label: "Ahli Jawatankuasa" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-wide space-y-20">
          <Tier
            title={ajkKumpulanLabel.tertinggi}
            subtitle="Barisan pimpinan utama pertubuhan"
            members={tertinggi}
            highlightPresident
          />
          <Tier
            title={ajkKumpulanLabel.zon}
            subtitle="Perwakilan bagi setiap zon di Wilayah Persekutuan"
            members={zon}
          />
          <Tier
            title={ajkKumpulanLabel.kluster}
            subtitle="Ahli jawatankuasa mengikut kluster fungsian"
            members={kluster}
          />
        </div>
      </section>
    </>
  );
}
