"use client";

import type { ReactNode } from "react";

// Transisi masuk halaman (Arch Morph — kesinambungan brand tanpa flash putih).
// Template remount setiap navigasi → animasi masuk sahaja (fade + rise 12px, 250ms).
// Reduced-motion: tiada (dikendali .page-enter dlm globals).
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
