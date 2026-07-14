// Motif KUBAH (dome) — mahkota hiasan emas di atas kad pegawai/AJK.
// Memperkaya motif tunggal PERKIB: arch (mihrab) + kubah bawang (ogee) + finial.
// Statik, halus, seragam. Tiada animasi (hormati reduced-motion secara lalai).
export function Kubah({
  className,
  bright = false,
}: {
  className?: string;
  bright?: boolean;
}) {
  const stroke = bright ? "var(--accent-bright)" : "var(--accent)";
  return (
    <svg
      viewBox="0 0 48 46"
      aria-hidden="true"
      className={className}
      fill="none"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Finial (pucuk) */}
      <line x1="24" y1="2" x2="24" y2="8" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="2" r="1.7" fill={stroke} />
      {/* Kubah bawang (ogee) */}
      <path
        d="M24 8 C29 14 31 18 28.5 22 C26.5 25.5 34 29 33 38 L15 38 C14 29 21.5 25.5 19.5 22 C17 18 19 14 24 8 Z"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill="color-mix(in srgb, var(--accent) 14%, transparent)"
      />
      {/* Drum / tapak */}
      <path d="M14 38 H34 M16.5 42 H31.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
