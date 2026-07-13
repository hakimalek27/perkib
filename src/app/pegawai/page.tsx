import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PegawaiExplorer } from "./PegawaiExplorer";
import { getPegawai, getZones } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Maklumat Pegawai",
  description:
    "Maklumat Ketua Imam, Timbalan Ketua Imam dan Bilal lantikan MAIWP mengikut zon masjid Wilayah Persekutuan.",
};

export const revalidate = 300;

export default async function PegawaiPage() {
  const [pegawai, zones] = await Promise.all([getPegawai(), Promise.resolve(getZones())]);

  return (
    <>
      <PageHero
        eyebrow="Pegawai Masjid"
        title="Maklumat Pegawai"
        description="Barisan Ketua Imam, Timbalan Ketua Imam dan Bilal lantikan MAIWP yang berkhidmat di masjid-masjid Wilayah Persekutuan, tersusun mengikut zon."
        breadcrumb={[{ label: "Pegawai" }]}
      />
      <section className="bg-background py-12 md:py-16">
        <div className="container-wide">
          <PegawaiExplorer pegawai={pegawai} zones={zones} />
        </div>
      </section>
    </>
  );
}
