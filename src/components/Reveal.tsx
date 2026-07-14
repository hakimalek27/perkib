"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Pembungkus fade-in-atas semasa skrol masuk — IntersectionObserver + kelas CSS
// (.reveal / .in dalam globals.css), tiada framer-motion. Hormati reduced-motion
// (dikendali oleh CSS @media dalam globals). API prop kekal sama.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Dikekalkan utk keserasian API; transform kini dikendali CSS (.reveal). */
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      className={`reveal${shown ? " in" : ""}${className ? " " + className : ""}`}
      style={delay ? { "--d": `${delay}s` } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
