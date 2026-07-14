"use client";

import { useEffect } from "react";

// Menetapkan kelas `tier-essential` pada <html> bila peranti lemah / reduced-motion /
// save-data — supaya CSS boleh mematikan animasi spatial (lihat globals / mockup).
// Tiada render. Letak sekali dalam root layout.
export function TierInit() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const weak =
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) ||
      Boolean(nav.connection?.saveData);
    document.documentElement.classList.toggle("tier-essential", reduce || weak);
  }, []);

  return null;
}
