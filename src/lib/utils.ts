import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tukar nama HURUF BESAR (dari rekod rasmi) kepada Huruf Tajuk yang kemas,
// mengekalkan partikel Melayu ("bin", "binti", "al-") huruf kecil.
const LOWER_PARTICLES = new Set(["bin", "binti", "al", "@"]);
export function formatName(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  return cleaned
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (LOWER_PARTICLES.has(lower)) return lower === "@" ? "@" : lower;
      // Kendali sempang: "AL-GHAZALI" -> "Al-Ghazali"
      return word
        .split("-")
        .map((part) =>
          part.length === 0
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-");
    })
    .join(" ");
}

// Inisial untuk avatar fallback (tanpa foto).
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => !LOWER_PARTICLES.has(w.toLowerCase()));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function formatRM(n: number): string {
  return `RM${n.toFixed(0)}`;
}
