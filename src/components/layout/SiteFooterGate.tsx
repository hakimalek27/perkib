"use client";

import { usePathname } from "next/navigation";

// Sembunyikan footer awam pada panel admin, Studio & deck slaid (UI tersendiri).
// Senarai /slide ialah halaman biasa — footer kekal dipapar di situ.
export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/slide/")
  )
    return null;
  return <>{children}</>;
}
