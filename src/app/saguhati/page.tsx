import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { FileText, BadgeCheck, HeartHandshake, Search, Info } from "lucide-react";
import { formatRM } from "@/lib/utils";
import { getJenisSaguhati } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Saguhati Kebajikan",
  description:
    "Sembilan jenis saguhati kebajikan yang layak diperolehi ahli PERKIB — kadar dan dokumen sokongan yang diperlukan.",
};

export const revalidate = 300;

export default async function SaguhatiPage() {
  const jenis = await getJenisSaguhati();

  return (
    <>
      <PageHero
        eyebrow="Kebajikan Ahli"
        title="Saguhati Kebajikan PERKIB"
        description="Sembilan jenis saguhati disediakan untuk meraikan detik penting dan meringankan musibah ahli. Setiap permohonan hendaklah disertakan dokumen sokongan yang ditetapkan."
        breadcrumb={[{ label: "Saguhati" }]}
      />

      {/* CTA jalur */}
      <section className="border-b border-border bg-bg-alt py-8">
        <div className="container-wide flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-ink/80">
            Ahli PERKIB boleh memohon saguhati dalam talian — pantas dan setiap permohonan direkodkan.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="primary">
              <Link href="/saguhati/mohon">
                <HeartHandshake className="size-4" /> Mohon Sekarang
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/saguhati/semak">
                <Search className="size-4" /> Semak Status
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Kad jenis */}
      <section className="bg-background py-16 md:py-20">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jenis.map((j, i) => (
              <Reveal key={j.id} delay={Math.min(i * 0.05, 0.3)}>
                <article className="hover-glow flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 font-display text-lg font-semibold text-primary">
                      {j.bil}
                    </span>
                    {j.oneOff && (
                      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase text-accent-deep">
                        Sekali sahaja
                      </span>
                    )}
                  </div>
                  <h3 className="font-display mt-4 text-lg font-semibold leading-tight text-primary-dark">
                    {j.nama}
                  </h3>
                  {j.catatan && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      {j.catatan}
                    </p>
                  )}
                  <div className="my-4 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-semibold text-accent-deep">
                      {formatRM(j.kadar)}
                    </span>
                  </div>
                  <div className="mt-auto border-t border-border pt-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <FileText className="size-3.5 text-accent" /> Dokumen sokongan:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {j.dokumenSokongan.map((d) => (
                        <li key={d} className="flex gap-1.5 text-xs text-muted-foreground">
                          <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
            <p className="text-sm text-ink/80">
              <span className="font-semibold">Nota:</span> Semua permohonan hendaklah dilampirkan
              bersama dokumen sokongan yang ditetapkan. Permohonan tanpa dokumen lengkap mungkin
              ditolak.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
