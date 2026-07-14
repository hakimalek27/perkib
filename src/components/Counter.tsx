"use client";

import { useEffect, useRef, useState } from "react";

// Kaunter angka beranimasi bila masuk viewport — IntersectionObserver + rAF,
// tiada framer-motion. Hormati prefers-reduced-motion.
export function Counter({
  to,
  duration = 1600,
  className,
  suffix = "",
}: {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduce) {
        setValue(to);
        return;
      }
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setValue(Math.round(eased * to));
        if (progress < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "-40px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
