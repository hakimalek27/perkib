import type { Metadata } from "next";
import { Toaster } from "sonner";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Panel Admin PERKIB",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();

  // Halaman login (tidak authed) — tanpa sidebar.
  if (!authed) {
    return (
      <div className="min-h-screen bg-bg-alt">
        {children}
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt">
      <AdminSidebar />
      <div className="lg:pl-60">
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
