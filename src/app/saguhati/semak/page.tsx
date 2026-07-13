import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SemakForm } from "./SemakForm";

export const metadata: Metadata = {
  title: "Semak Status Saguhati",
  description: "Semak status permohonan saguhati kebajikan PERKIB anda.",
};

export default function SemakPage() {
  return (
    <>
      <PageHero
        eyebrow="Semakan"
        title="Semak Status Permohonan"
        description="Semak status permohonan saguhati anda menggunakan nombor rujukan yang diberikan semasa permohonan."
        breadcrumb={[{ label: "Saguhati", href: "/saguhati" }, { label: "Semak Status" }]}
      />
      <section className="bg-background py-12 md:py-16">
        <div className="container-narrow">
          <SemakForm />
        </div>
      </section>
    </>
  );
}
