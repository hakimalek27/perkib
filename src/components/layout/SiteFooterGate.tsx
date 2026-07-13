"use client";

import { usePathname } from "next/navigation";

// Sembunyikan footer awam pada panel admin & Studio (UI tersendiri).
export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/studio")) return null;
  return <>{children}</>;
}
