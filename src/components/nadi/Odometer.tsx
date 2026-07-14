"use client";

import { useEffect, useRef, useState } from "react";

// Odometer digit gaya meter Nadi — setiap digit = reel 0–9 ×2 (20 span). Bila
// masuk viewport, reel bergolek satu pusingan penuh ke digit sasaran (stagger
// 120ms). Tier Essential (kelas .tier-essential dlm CSS) → transition:none →
// terus ke nilai akhir. Nilai penuh diumumkan via aria-label.
export function Odometer({ value, className }: { value: number; className?: string }) {
  const digits = String(value).split("");
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setStarted(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`odo${className ? " " + className : ""}`} role="text" aria-label={String(value)}>
      {digits.map((d, i) => (
        <span key={i} className="odo-digit" aria-hidden="true">
          <span
            className="odo-reel"
            style={{
              transform: started ? `translateY(-${10 + Number(d)}em)` : "translateY(0)",
              transitionDelay: `${i * 0.12}s`,
            }}
          >
            {Array.from({ length: 20 }, (_, k) => (
              <span key={k}>{k % 10}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
