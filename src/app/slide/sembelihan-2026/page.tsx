import type { Metadata } from "next";
import { SembelihanSlides } from "./SembelihanSlides";
import { getDeck } from "@/content/slides";

const deck = getDeck("sembelihan-2026");
const og = deck?.og ?? "/og/perkib-og.png";

export const metadata: Metadata = {
  title: "Penyembelihan Halal 2026",
  description:
    "Persembahan interaktif PERKIB — konsep, rukun, syarat, kajian sains dan hukum penyembelihan halal dalam Islam.",
  alternates: { canonical: "/slide/sembelihan-2026" },
  openGraph: {
    type: "article",
    url: "/slide/sembelihan-2026",
    title: "Penyembelihan Halal 2026 — PERKIB",
    description:
      "Pengembaraan visual melalui ilmu penyembelihan halal: rukun, syarat, dalil, kajian sains dan hukum.",
    images: [
      {
        url: og,
        width: 1200,
        height: 630,
        alt: "Modul latihan Penyembelihan Halal PERKIB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Penyembelihan Halal 2026 — PERKIB",
    description:
      "Pengembaraan visual melalui ilmu penyembelihan halal: rukun, syarat, dalil, kajian sains dan hukum.",
    images: [og],
  },
};

export default function Page() {
  return <SembelihanSlides />;
}
