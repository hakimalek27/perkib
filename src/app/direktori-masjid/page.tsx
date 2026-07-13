import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { MasjidExplorer } from "./MasjidExplorer";
import { getMasjids, getZones } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Direktori Masjid WP",
  description:
    "Direktori masjid Wilayah Persekutuan (Kuala Lumpur, Putrajaya, Labuan) mengikut 8 zon rasmi JAWI.",
};

export const revalidate = 300;

export default async function DirektoriMasjidPage() {
  const [masjids, zones] = await Promise.all([getMasjids(), Promise.resolve(getZones())]);

  return (
    <>
      <PageHero
        eyebrow="Direktori"
        title="Direktori Masjid Wilayah Persekutuan"
        description="Senarai masjid di bawah seliaan JAWI, tersusun mengikut 8 zon rasmi merangkumi Kuala Lumpur, Putrajaya dan Labuan — tempat Naqib, Imam dan Bilal PERKIB berkhidmat."
        breadcrumb={[{ label: "Direktori Masjid" }]}
      />
      <section className="bg-background py-12 md:py-16">
        <div className="container-wide">
          <MasjidExplorer masjids={masjids} zones={zones} />
        </div>
      </section>
    </>
  );
}
