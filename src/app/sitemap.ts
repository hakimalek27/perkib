import type { MetadataRoute } from "next";
import { DECKS } from "@/content/slides";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const ROUTES = [
  "",
  "/profil",
  "/perutusan",
  "/visi-misi",
  "/ajk",
  "/direktori-masjid",
  "/pegawai",
  "/program",
  "/keahlian",
  "/saguhati",
  "/saguhati/semak",
  "/derma",
  "/soalan-lazim",
  "/hubungi",
  "/slide",
  // Setiap deck slaid — didaftarkan dari registry supaya deck baharu masuk sitemap
  // secara automatik.
  ...DECKS.map((d) => `/slide/${d.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
