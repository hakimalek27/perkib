import { Bricolage_Grotesque, Plus_Jakarta_Sans, Amiri } from "next/font/google";

// Display / tajuk — Bricolage Grotesque (moden, berkarakter, tegas).
// Variable --font-bricolage (BUKAN --font-display supaya tak berlanggar token @theme).
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

// Body — Plus Jakarta Sans (kemas, mudah dibaca, neutral).
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

// Hiasan tipografi Arab sahaja — JANGAN jana teks Arab sendiri.
export const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});
