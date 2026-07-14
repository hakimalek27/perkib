"use client";

import { useEffect, useState } from "react";
import { useTier } from "./useTier";

export type RailItem = { id: string; label: string };

// Nadi Scroll Rail — rail menegak (≥1150px) satu node arch per seksyen. Node aktif
// disegerak melalui IntersectionObserver. Klik = scroll ke seksyen. Disorok di bawah
// 1150px. Tier Essential → tiada animasi (node statik, kekal berfungsi).
export function ScrollRail({ items }: { items: RailItem[] }) {
  const { essential } = useTier();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Navigasi seksyen"
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 min-[1150px]:flex"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--gold-soft)]" />
      {items.map((it) => {
        const on = active === it.id;
        return (
          <a
            key={it.id}
            href={`#${it.id}`}
            aria-label={it.label}
            aria-current={on ? "true" : undefined}
            className="group relative flex items-center"
          >
            <span
              className={`relative z-10 block size-3 rounded-[3px_3px_3px_3px] border transition-all ${
                essential ? "" : "duration-300"
              } ${
                on
                  ? "scale-125 border-primary bg-primary"
                  : "border-[var(--gold-soft)] bg-background"
              }`}
              style={{ clipPath: "url(#archClip)" }}
            />
            <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-md bg-obsidian px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {it.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
