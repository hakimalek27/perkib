import type { MetadataRoute } from "next";

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
  "/sukarelawan",
  "/saguhati",
  "/saguhati/semak",
  "/derma",
  "/soalan-lazim",
  "/hubungi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
