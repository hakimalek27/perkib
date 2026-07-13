import { Manrope, Marcellus, Amiri } from "next/font/google";

// Body — Manrope (moden, kemas, mudah dibaca).
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// Display / tajuk — Marcellus (klasik, berwibawa).
export const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-marcellus",
  display: "swap",
  preload: false,
});

// Hiasan tipografi Arab sahaja — JANGAN jana teks Arab sendiri.
export const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});
