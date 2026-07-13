import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "Panel Admin PERKIB",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();
  return (
    <div className="min-h-screen bg-bg-alt pt-[88px]">
      {authed && (
        <div className="bg-primary-deep text-white shadow-elev">
          <div className="container-wide flex h-14 items-center justify-between">
            <Link href="/admin/saguhati" className="flex items-center gap-2 font-display text-lg">
              <ShieldCheck className="size-5 text-accent-bright" />
              PERKIB Admin
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs text-white/70 hover:text-white">
                Laman Utama
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
