"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTier } from "./useTier";

// Slot media sinematik — video latar lazy (muat hanya bila hampir viewport) dgn
// fallback anggun (children = corak/siluet). Jika fail tiada / ralat / Essential,
// kekal fallback TANPA UI pecah. Video: muted, loop, playsinline, tiada audio.
export function CinematicSlot({
  srcWide,
  srcVert,
  poster,
  className,
  children,
}: {
  srcWide?: string;
  srcVert?: string;
  poster?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { essential } = useTier();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (essential) return; // Essential → jangan muat video langsung
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video || (!srcWide && !srcVert)) return;

    let loaded = false;
    const loadIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !loaded) {
            loaded = true;
            const vert = matchMedia("(max-width: 720px)").matches;
            const src = (vert ? srcVert : srcWide) || srcWide || srcVert;
            if (src) video.src = src;
            loadIO.disconnect();
          }
        }
      },
      { rootMargin: "220px" }
    );
    loadIO.observe(wrap);

    // Main/jeda ikut keterlihatan
    const playIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0.1 }
    );
    playIO.observe(wrap);

    const onCanPlay = () => setLive(true);
    const onError = () => setLive(false);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    return () => {
      loadIO.disconnect();
      playIO.disconnect();
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, [essential, srcWide, srcVert]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden${className ? " " + className : ""}`}>
      {/* Fallback (corak/siluet) — sentiasa ada di bawah */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}>
        {children}
      </div>
      {!essential && (srcWide || srcVert) && (
        <video
          ref={videoRef}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            live ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
