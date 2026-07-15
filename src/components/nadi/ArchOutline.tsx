import type { CSSProperties } from "react";

// Outline arch (garis emas) untuk hiasan hero / echo. Boleh "dilukis" melalui
// CSS (pathLength=1 + stroke-dashoffset) bila kelas .arch-draw digunakan.
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
      className={className}
      style={style}
    >
      <path
        d="M2,120 L2,48 C2,20 22,4 47,1 L50,0 L53,1 C78,4 98,20 98,48 L98,120"
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
