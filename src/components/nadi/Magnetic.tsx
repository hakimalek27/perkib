"use client";

import { useRef, type ReactNode } from "react";
import { useTier } from "./useTier";

// Pembalut "magnetic" — elemen tertarik lembut ke arah kursor (≤4px). HANYA pada
// tetikus halus + Tier Enhanced. Reset bila kursor keluar. rAF-throttle.
export function Magnetic({
  children,
  className,
  strength = 4,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const { essential, finePointer } = useTier();
  const ref = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  const active = finePointer && !essential;

  function onMove(e: React.MouseEvent) {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `translate(${nx * strength}px, ${ny * strength}px)`;
    });
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = "translate(0,0)";
  }

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block transition-transform duration-200 ease-out${className ? " " + className : ""}`}
    >
      {children}
    </span>
  );
}
