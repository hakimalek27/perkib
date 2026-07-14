import type { ReactNode, CSSProperties } from "react";

// Bingkai arch (motif tunggal PERKIB) — mask kandungan dgn clip-path arch.
// Nisbah lalai 5:6 (potret kepimpinan/pegawai). Memerlukan <ArchClipDefs/> dlm layout.
export function ArchFrame({
  children,
  ratio = "5 / 6",
  className,
  style,
}: {
  children: ReactNode;
  ratio?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden${className ? " " + className : ""}`}
      style={{ aspectRatio: ratio, clipPath: "url(#archClip)", ...style }}
    >
      {children}
    </div>
  );
}
