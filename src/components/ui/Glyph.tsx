// Set glyph jenama PERKIB — geometri arch seragam (viewBox 32×38, stroke 1.7 round).
// Path teras guna stroke semasa (currentColor); aksen emas via kelas text-accent.
// Port dari mockup v2.3 (4 glyph) + tambahan gaya seragam.

const ARCH = "M2,36 L2,15 C2,6.5 8,2.2 15.2,1.3 L16,1 L16.8,1.3 C24,2.2 30,6.5 30,15 L30,36";

export type GlyphName =
  | "saguhati"
  | "semak"
  | "pegawai"
  | "masjid"
  | "zon"
  | "program"
  | "derma"
  | "dokumen";

function inner(name: GlyphName) {
  switch (name) {
    case "saguhati":
      return (
        <>
          <path className="text-accent" d="M16,21 C13.2,18.2 11.4,15.9 13.2,14.1 C14.6,12.8 16,14 16,15 C16,14 17.4,12.8 18.8,14.1 C20.6,15.9 18.8,18.2 16,21 Z" />
          <path d="M8.5,27 C11,30.5 21,30.5 23.5,27" />
        </>
      );
    case "semak":
      return <path className="text-accent" d="M10,19.5 L14.5,24 L22,14.5" />;
    case "pegawai":
      return (
        <>
          <circle cx="16" cy="14.5" r="4.2" />
          <path d="M8.5,29 C8.5,22.5 23.5,22.5 23.5,29" />
        </>
      );
    case "masjid":
      return (
        <>
          <path d="M9,28 L9,20 Q16,13 23,20 L23,28 Z" />
          <path className="text-accent" d="M16,11.5 q-2,-4 2,-6 q-3.4,.4 -4,3 q-.5,2.4 2,3 Z" />
        </>
      );
    case "zon":
      return (
        <>
          <path d="M16,13 L16,27" />
          <path className="text-accent" d="M11,17 L21,17 M12.5,22 L19.5,22" />
        </>
      );
    case "program":
      return (
        <>
          <path d="M10,15 L22,15 M10,20 L22,20 M10,25 L18,25" />
          <path className="text-accent" d="M7.5,15 L8,15 M7.5,20 L8,20 M7.5,25 L8,25" />
        </>
      );
    case "derma":
      return (
        <path className="text-accent" d="M16,26 C11,22 9,19 9,16.2 C9,14 10.8,12.6 13,12.6 C14.5,12.6 15.6,13.4 16,14.2 C16.4,13.4 17.5,12.6 19,12.6 C21.2,12.6 23,14 23,16.2 C23,19 21,22 16,26 Z" />
      );
    case "dokumen":
      return (
        <>
          <path d="M11,12 L18,12 L22,16 L22,28 L11,28 Z" />
          <path className="text-accent" d="M18,12 L18,16 L22,16 M13.5,20 L19,20 M13.5,24 L19,24" />
        </>
      );
  }
}

export function Glyph({ name, className }: { name: GlyphName; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 38"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-9 text-primary"}
    >
      <path d={ARCH} />
      {inner(name)}
    </svg>
  );
}
