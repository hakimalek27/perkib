"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import type { ScrollerItem } from "@/lib/sanity";

// Jalur aktiviti auto-skrol di atas homepage (marquee CSS, dikomposit GPU).
// Ambil ruang header terapung (pt-[104px]) supaya HeroMihrab boleh jadi compact.
// reduced-motion / tier-essential → boleh skrol manual (overflow-x).
// `lajuSaat` = durasi 1 pusingan (kecil = laju) — diset admin dari Sanity.
export function AktivitiScroller({ items, lajuSaat = 42 }: { items: ScrollerItem[]; lajuSaat?: number }) {
  if (!items.length) return null;
  const loop = [...items, ...items]; // gandakan utk gelung lancar

  return (
    <section
      aria-label="Aktiviti terkini PERKIB"
      className="marquee-mask surface-obsidian relative border-b border-line-dark pt-[104px]"
    >
      <div className="pattern-girih-dark pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div
        className="marquee-track flex w-max gap-4 px-4 py-4"
        style={{ "--marquee-duration": `${lajuSaat}s` } as CSSProperties}
      >
        {loop.map((it, i) => (
          <figure
            key={i}
            className="relative h-[140px] w-56 shrink-0 overflow-hidden rounded-xl border border-line-dark md:h-[180px] md:w-72"
            aria-hidden={i >= items.length}
          >
            <Image
              src={it.url}
              alt={i < items.length ? it.keterangan ?? "Aktiviti PERKIB" : ""}
              fill
              sizes="288px"
              className="object-cover"
            />
            {it.keterangan && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/90 to-transparent p-2 text-xs font-medium text-white">
                {it.keterangan}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
