"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Transisi masuk halaman (Arch Morph — kesinambungan brand tanpa flash putih).
// Template remount setiap navigasi → animasi masuk sahaja (fade + rise 12px, 250ms).
// Reduced-motion: tiada (dikendali .page-enter dlm globals).
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Studio & slide TIDAK dibalut .page-enter — transform animasinya mencipta
  // containing block yang memecahkan layout `fixed` (Studio & galaxy slide full-screen).
  if (pathname?.startsWith("/studio") || pathname?.startsWith("/slide")) return <>{children}</>;
  return <div className="page-enter">{children}</div>;
}
