"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { PaparanUtama } from "@/lib/sanity";

// Popup banner homepage — muncul selepas ~1.2s. Tutup: X / klik luar / ESC.
// Kekerapan disimpan ikut kunci `perkib-popup-<_updatedAt>` (banner baru = kunci
// baru = muncul semula walau pernah ditutup).
export function PopupBanner({ data }: { data: PaparanUtama }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const key = `perkib-popup-${data.updatedAt ?? "x"}`;

  const tutup = useCallback(() => {
    setOpen(false);
    try {
      if (data.popupKekerapan === "sesi") sessionStorage.setItem(key, "1");
      else if (data.popupKekerapan === "harian") localStorage.setItem(key, new Date().toDateString());
      // "setiap" → tiada rekod (muncul setiap lawatan)
    } catch {
      /* storage tak tersedia — abaikan */
    }
  }, [data.popupKekerapan, key]);

  // Papar ikut julat masa + kekerapan (baca storage dlm effect — elak hydration mismatch).
  useEffect(() => {
    // Julat masa: jangan papar sebelum popupMula atau selepas popupTamat (auto-off).
    const now = Date.now();
    if (data.popupMula && now < new Date(data.popupMula).getTime()) return;
    if (data.popupTamat && now > new Date(data.popupTamat).getTime()) return;

    let patut = true;
    try {
      if (data.popupKekerapan === "sesi") patut = sessionStorage.getItem(key) !== "1";
      else if (data.popupKekerapan === "harian") patut = localStorage.getItem(key) !== new Date().toDateString();
    } catch {
      patut = true;
    }
    if (!patut) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [data.popupKekerapan, data.popupMula, data.popupTamat, key]);

  // ESC tutup + fokus butang tutup bila buka.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, tutup]);

  if (!open) return null;
  const external = data.popupPautan?.startsWith("http");

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={data.popupTajuk ?? "Hebahan PERKIB"}
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={tutup} aria-hidden />
      {/* Poster portrait 1080×1450 besar. Lebar dihadkan oleh tinggi viewport supaya
          keseluruhan kad (imej + strip butang) tak melimpah skrin; nisbah kekal 1080:1450. */}
      <div
        className="page-enter relative w-[92vw] overflow-hidden rounded-2xl border border-accent/30 bg-card shadow-2xl"
        style={{ maxWidth: "min(28rem, calc((94svh - 6rem) * 1080 / 1450))" }}
      >
        <button
          ref={closeRef}
          onClick={tutup}
          aria-label="Tutup banner"
          className="absolute right-3 top-3 z-10 rounded-full bg-obsidian/50 p-1.5 text-white transition-colors hover:bg-obsidian/80"
        >
          <X className="size-5" />
        </button>
        {data.popupGambar && (
          <div className="relative aspect-[1080/1450] w-full bg-muted">
            <Image
              src={data.popupGambar}
              alt={data.popupTajuk ?? "Hebahan PERKIB"}
              fill
              sizes="(max-width: 640px) 92vw, 28rem"
              className="object-cover"
              priority
            />
          </div>
        )}
        {(data.popupTajuk || data.popupPautan) && (
          <div className="p-5 text-center">
            {data.popupTajuk && (
              <h3 className="font-display text-lg font-bold text-ink">{data.popupTajuk}</h3>
            )}
            {data.popupPautan && (
              <Link
                href={data.popupPautan}
                onClick={tutup}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                {data.popupButang || "Ketahui Lanjut"}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
