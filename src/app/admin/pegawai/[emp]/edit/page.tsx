import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPegawaiAdminDetail, getMasjidOptions } from "@/lib/admin-data";
import { PegawaiForm } from "../../PegawaiForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sunting Pegawai — Admin PERKIB", robots: { index: false } };

export default async function PegawaiEditPage({ params }: { params: Promise<{ emp: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { emp } = await params;
  const [p, masjids] = await Promise.all([getPegawaiAdminDetail(emp), getMasjidOptions()]);
  if (!p) notFound();

  const masjidId = p.masjidId;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/admin/pegawai/${emp}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" /> Kembali ke profil
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-primary-dark md:text-3xl">Sunting Pegawai</h1>
      <p className="mt-1 text-sm text-muted-foreground">{p.nama} · {p.employeeNo}</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
        <PegawaiForm
          mode="kemas-kini"
          masjids={masjids}
          initial={{
            employeeNo: p.employeeNo,
            nama: p.nama,
            kategori: p.kategori,
            jawatanPenuh: p.jawatanPenuh,
            emelRasmi: p.emelRasmi,
            gred: p.gred,
            masjidId,
            statusAktif: p.statusAktif,
            photoUrl: p.photoUrl,
            icLast4: p.icLast4,
            hasTelefon: Boolean(p.telefonEnc),
          }}
        />
      </div>
    </div>
  );
}
