import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/saguhati");
  }
  const configured = isAdminConfigured();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Kiri — panel obsidian (≥1024px) */}
      <div className="surface-obsidian relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pattern-star8 pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <svg aria-hidden viewBox="0 0 100 120" preserveAspectRatio="none" className="pointer-events-none absolute -right-10 top-0 h-full w-80 opacity-[0.06]">
          <path d="M2,120 L2,48 C2,20 22,4 47,1 L50,0 L53,1 C78,4 98,20 98,48 L98,120" stroke="var(--accent-bright)" strokeWidth={1.5} fill="none" />
        </svg>
        <div className="relative flex items-center gap-3">
          <Image src="/logo.png" alt="Logo PERKIB" width={48} height={48} className="size-12 object-contain" />
          <div>
            <p className="font-display text-xl font-extrabold text-white">PERKIB</p>
            <p className="text-xs text-white/60">Imam &amp; Bilal MAIWP</p>
          </div>
        </div>
        <div className="relative">
          <p className="font-display text-2xl font-bold leading-snug text-white">
            &ldquo;Merealisasikan Perkhidmatan Pegawai Masjid Kontemporari&rdquo;
          </p>
          <p className="mt-4 text-sm text-white/50">Sistem pentadbiran dalaman — akses terhad.</p>
        </div>
      </div>

      {/* Kanan — borang */}
      <div className="flex items-center justify-center bg-background px-6 py-16">
        {configured ? (
          <LoginForm />
        ) : (
          <div className="w-full max-w-md rounded-2xl border border-warning/30 bg-warning/10 p-8 text-center">
            <h1 className="font-display text-xl font-bold text-ink">Panel Admin Belum Dikonfigurasi</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Tetapkan <code className="rounded bg-black/10 px-1 py-0.5">ADMIN_PASSWORD</code> dalam{" "}
              <code className="rounded bg-black/10 px-1 py-0.5">.env.local</code>, kemudian mulakan semula pelayan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
