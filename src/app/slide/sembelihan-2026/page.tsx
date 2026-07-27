import type { Metadata } from "next";
import { SembelihanSlides } from "./SembelihanSlides";

export const metadata: Metadata = {
  title: "Penyembelihan Halal 2026",
  description:
    "Persembahan interaktif PERKIB — konsep, rukun, syarat, kajian sains dan hukum penyembelihan halal dalam Islam.",
  openGraph: {
    title: "Penyembelihan Halal 2026 — PERKIB",
    description:
      "Pengembaraan visual melalui ilmu penyembelihan halal: rukun, syarat, dalil, kajian sains dan hukum.",
  },
};

export default function Page() {
  return <SembelihanSlides />;
}
