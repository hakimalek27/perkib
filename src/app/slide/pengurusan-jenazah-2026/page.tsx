import type { Metadata } from "next";
import { JenazahSlides } from "./JenazahSlides";
import { getDeck } from "@/content/slides";

const deck = getDeck("pengurusan-jenazah-2026");
const og = deck?.og ?? "/og/perkib-og.png";

export const metadata: Metadata = {
  title: "Kursus Intensif Pengurusan Jenazah 2026",
  description:
    "Modul latihan PERKIB — mandi, kafan, solat dan pengebumian jenazah mengikut hukum syarak, beserta talkin, takziah, tahlil dan iddah. 131 slaid boleh dilayari terus dalam pelayar.",
  alternates: { canonical: "/slide/pengurusan-jenazah-2026" },
  openGraph: {
    type: "article",
    url: "/slide/pengurusan-jenazah-2026",
    title: "Kursus Intensif Pengurusan Jenazah — PERKIB",
    description:
      "131 slaid: mandi, kafan, solat dan pengebumian jenazah mengikut hukum syarak, beserta talkin, takziah, tahlil dan iddah.",
    images: [
      {
        url: og,
        width: 1200,
        height: 630,
        alt: "Kursus Intensif Pengurusan Jenazah Wilayah Persekutuan — PERKIB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kursus Intensif Pengurusan Jenazah — PERKIB",
    description:
      "131 slaid: mandi, kafan, solat dan pengebumian jenazah mengikut hukum syarak.",
    images: [og],
  },
};

export default function Page() {
  return <JenazahSlides />;
}
