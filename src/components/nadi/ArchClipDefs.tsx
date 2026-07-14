// Definisi clipPath arch — diletak SEKALI dalam root layout. Digunakan semula
// oleh <ArchFrame> (mask foto/panel) melalui clip-path:url(#archClip).
export function ArchClipDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <clipPath id="archClip" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.40 C0,0.16 0.20,0.03 0.47,0.006 L0.5,0 L0.53,0.006 C0.80,0.03 1,0.16 1,0.40 L1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
