import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { MohonWizard } from "./MohonWizard";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { getJenisSaguhati, isCmsEnabled } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Mohon Saguhati",
  description: "Borang permohonan saguhati kebajikan PERKIB untuk ahli.",
};

export const dynamic = "force-dynamic";

export default async function MohonPage() {
  const jenis = await getJenisSaguhati();
  const active = isCmsEnabled();

  return (
    <>
      <PageHero
        eyebrow="Permohonan"
        title="Mohon Saguhati Kebajikan"
        description="Lengkapkan lima langkah mudah — sahkan identiti, pilih jenis saguhati, isi maklumat, muat naik dokumen dan hantar."
        breadcrumb={[{ label: "Saguhati", href: "/saguhati" }, { label: "Mohon" }]}
      />

      <section className="bg-background py-12 md:py-16">
        <div className="container-wide">
          {active ? (
            <MohonWizard jenis={jenis} />
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-accent/30 bg-accent/5 p-10 text-center">
              <Clock className="mx-auto size-12 text-accent" />
              <h2 className="font-display mt-4 text-2xl font-semibold text-primary-dark">
                Sistem Permohonan Belum Aktif
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Sistem permohonan saguhati dalam talian sedang disediakan. Sementara itu, sila hubungi
                urus setia PERKIB untuk memohon saguhati.
              </p>
              <Button asChild variant="primary" className="mt-6">
                <Link href="/hubungi">Hubungi Urus Setia</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
