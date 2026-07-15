import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPegawaiAdminAll } from "@/lib/admin-data";
import { PegawaiAdminList } from "./PegawaiAdminList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Direktori Pegawai — Admin PERKIB", robots: { index: false } };

export default async function AdminPegawaiPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const all = await getPegawaiAdminAll();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark md:text-3xl">Direktori Pegawai</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cari Imam / Bilal — lihat butiran penuh termasuk IC, telefon (klik terus WhatsApp) dan
            sejarah permohonan saguhati.
          </p>
        </div>
        <Link
          href="/admin/pegawai/baru"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <UserPlus className="size-4" /> Tambah Pegawai
        </Link>
      </div>

      <PegawaiAdminList pegawai={all} />
    </div>
  );
}
