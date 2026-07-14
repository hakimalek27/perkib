import type { ReactNode } from "react";

// Eyebrow Nadi — glyph arch emas 14×17 + teks uppercase. Maroon atas terang,
// emas atas gelap. Tanpa pill (motif tunggal = arch).
export function Eyebrow({
  children,
  dark = false,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-[12.5px] font-bold uppercase tracking-[0.14em] ${
        dark ? "text-accent-bright" : "text-primary"
      }${className ? " " + className : ""}`}
    >
      <svg width="12" height="15" viewBox="0 0 14 17" aria-hidden="true" className="shrink-0">
        <path
          d="M0,17 L0,6.8 C0,2.7 2.8,.5 6.6,.1 L7,0 L7.4,.1 C11.2,.5 14,2.7 14,6.8 L14,17 Z"
          fill="var(--accent)"
        />
      </svg>
      {children}
    </span>
  );
}
