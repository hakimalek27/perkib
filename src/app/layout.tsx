import type { Metadata } from "next";
import "./globals.css";
import { bricolage, jakarta, amiri } from "./fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteFooterGate } from "@/components/layout/SiteFooterGate";
import { JsonLd } from "@/components/JsonLd";
import { getSiteSettings } from "@/lib/sanity";
import { siteInfo } from "@/content/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PERKIB — Pertubuhan Kebajikan Imam dan Bilal MAIWP",
    template: "%s | PERKIB",
  },
  description:
    "Laman rasmi Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB) — wadah kebajikan Naqib Masjid, Imam dan Bilal lantikan MAIWP. Direktori masjid, maklumat pegawai, permohonan saguhati dan derma.",
  keywords: [
    "PERKIB",
    "Imam Bilal MAIWP",
    "kebajikan pegawai masjid",
    "saguhati",
    "masjid Wilayah Persekutuan",
  ],
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: siteUrl,
    siteName: siteInfo.shortName,
    title: "PERKIB — Pertubuhan Kebajikan Imam dan Bilal MAIWP",
    description:
      "Wadah kebajikan Naqib Masjid, Imam dan Bilal lantikan MAIWP di masjid-masjid Wilayah Persekutuan.",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <html
      lang="ms"
      className={`${bricolage.variable} ${jakarta.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Langkau ke kandungan utama
        </a>
        <JsonLd />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooterGate>
          <Footer settings={settings} />
        </SiteFooterGate>
      </body>
    </html>
  );
}
