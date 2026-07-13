import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getFaqs } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Soalan Lazim",
  description: "Soalan lazim mengenai PERKIB, keahlian, saguhati dan sumbangan.",
};

const KATEGORI_LABEL: Record<string, string> = {
  umum: "Umum",
  keahlian: "Keahlian",
  saguhati: "Saguhati",
  infaq: "Infaq & Sumbangan",
};

export default async function SoalanLazimPage() {
  const faqs = await getFaqs();

  return (
    <>
      <PageHero
        eyebrow="Bantuan"
        title="Soalan Lazim"
        description="Jawapan kepada soalan yang kerap ditanya mengenai PERKIB dan perkhidmatannya."
        breadcrumb={[{ label: "Soalan Lazim" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-narrow">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger>
                  <span className="flex flex-col items-start gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-deep">
                      {KATEGORI_LABEL[f.kategori] ?? f.kategori}
                    </span>
                    {f.soalan}
                  </span>
                </AccordionTrigger>
                <AccordionContent>{f.jawapan}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
