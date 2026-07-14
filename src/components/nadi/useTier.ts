"use client";

import { useEffect, useState } from "react";

export type Tier = { essential: boolean; finePointer: boolean };

// Kesan tier peranti: Essential (statik) jika reduced-motion / peranti lemah /
// save-data. finePointer = tetikus halus (untuk kesan hover spatial). Dikira
// sekali di klien; SSR mula sebagai Enhanced+finePointer supaya tiada flash.
export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>({ essential: false, finePointer: true });

  useEffect(() => {
    // Tangguh melalui rAF supaya bukan setState segerak dlm badan effect
    // (selamat SSR — hidrasi mula sebagai Enhanced+finePointer).
    const raf = requestAnimationFrame(() => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
      };
      const weak =
        (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) ||
        Boolean(nav.connection?.saveData);
      const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
      setTier({ essential: reduce || weak, finePointer });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return tier;
}
