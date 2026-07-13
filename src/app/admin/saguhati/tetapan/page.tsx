import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getJenisForAdmin } from "@/lib/admin-data";
import { JenisTetapanForm } from "./JenisTetapanForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tetapan Saguhati — Admin PERKIB", robots: { index: false } };

export default async function TetapanSaguhatiPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const jenis = await getJenisForAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/saguhati"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Kembali ke permohonan
      </Link>
      <div className="mt-4 mb-6">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Tetapan Had &amp; Kadar Saguhati</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tetapkan kadar (RM) dan had maksimum permohonan (seumur hidup) bagi setiap jenis saguhati.
          Contoh: Cahayamata had 6 kali. Kosongkan had untuk tanpa had.
        </p>
      </div>
      {jenis.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          Tiada jenis saguhati. Jalankan seed data terlebih dahulu.
        </div>
      ) : (
        <JenisTetapanForm initial={jenis} />
      )}
    </div>
  );
}
