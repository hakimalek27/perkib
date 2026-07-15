import type { CSSProperties } from "react";

// Outline arch (garis emas) untuk hiasan hero / echo + bingkai tepi potret kad.
// Path FULL-BLEED (x=0..100) yang PADAN tepat dgn #archClip (ArchClipDefs) supaya
// garis emas duduk betul-betul di tepi foto (tiada bocor). svg overflow-visible
// supaya stroke tengah-tepi tidak terpotong. Boleh "dilukis" (pathLength=1 +
// stroke-dashoffset) bila kelas .arch-draw digunakan.
export function ArchOutline({
  className,
  stroke = "var(--gold-soft)",
  strokeWidth = 1,
  draw = false,
  style,
}: {
  className?: string;
  stroke?: string;
  strokeWidth?: number;
  draw?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className ? `overflow-visible ${className}` : "overflow-visible"}
      style={style}
    >
      <path
        d="M0,120 L0,48 C0,19.2 20,3.6 47,0.72 L50,0 L53,0.72 C80,3.6 100,19.2 100,48 L100,120"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={draw ? "arch-draw" : undefined}
      />
    </svg>
  );
}
