import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getMasjidOptions } from "@/lib/admin-data";
import { PegawaiForm } from "../PegawaiForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tambah Pegawai — Admin PERKIB", robots: { index: false } };

export default async function PegawaiBaruPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const masjids = await getMasjidOptions();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/pegawai" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" /> Kembali ke direktori
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-primary-dark md:text-3xl">Tambah Pegawai Baharu</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cipta rekod Imam / Bilal baharu. No. KP dan telefon disimpan terenkripsi.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
        <PegawaiForm mode="cipta" masjids={masjids} />
      </div>
    </div>
  );
}
