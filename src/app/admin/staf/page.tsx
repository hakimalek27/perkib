import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isStafGateAuthenticated, isStafGateConfigured } from "@/lib/staf-gate";
import { stafLainCount } from "@/lib/staf-lain";
import { getPermohonanList, getMaklumBalasList, getPermohonanDibatalkan } from "@/lib/admin-data";
import { StafGateForm } from "./StafGateForm";
import { StafTabs } from "./StafTabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staf MAIWP — Admin PERKIB", robots: { index: false } };

export default async function StafPage() {
  // Lapisan 1: sesi admin.
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  // Amaran jika gate belum dikonfigurasi — JANGAN buka tanpa kata laluan.
  if (!isStafGateConfigured()) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-warning/30 bg-warning/10 p-6 text-sm text-warning">
        <p className="font-semibold">Gate staf belum dikonfigurasi.</p>
        <p className="mt-1">
          Tetapkan <code className="rounded bg-black/10 px-1">STAF_GATE_PASSWORD</code> dalam{" "}
          <code className="rounded bg-black/10 px-1">.env.local</code> untuk membuka halaman ini.
        </p>
      </div>
    );
  }

  // Lapisan 2: gate kata laluan kedua.
  if (!(await isStafGateAuthenticated())) {
    return <StafGateForm />;
  }

  // Di sebalik gate: 5 tab — cari staf MAIWP, urus permohonan, maklum balas,
  // pantau rekod dibatalkan, tukar kata laluan. (Padam/edit/batal rekod HANYA di sini.)
  const [permohonan, maklumBalas, dibatalkan] = await Promise.all([
    getPermohonanList(),
    getMaklumBalasList(),
    getPermohonanDibatalkan(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Kawalan Staf</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Akses terhad (gate kedua). Carian direktori staf MAIWP, urus rekod permohonan &amp; maklum balas,
          dan tukar kata laluan halaman admin.
        </p>
      </div>
      <StafTabs
        total={stafLainCount()}
        permohonan={permohonan}
        maklumBalas={maklumBalas}
        dibatalkan={dibatalkan}
      />
    </div>
  );
}
