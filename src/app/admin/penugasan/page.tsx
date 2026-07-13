import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPegawaiForPenugasan } from "@/lib/admin-data";
import { zones, masjids } from "@/content/zon-masjid";
import { PenugasanBoard } from "./PenugasanBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Penugasan Pegawai — Admin PERKIB", robots: { index: false } };

export default async function PenugasanPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const pegawai = await getPegawaiForPenugasan();

  const masjidData = masjids.map((m) => ({
    id: m.id,
    nama: m.nama,
    zonNombor: m.zonNombor,
    jenisTempat: m.jenisTempat,
  }));
  const zonData = zones.map((z) => ({ nombor: z.nombor, nama: z.nama }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-primary-dark md:text-3xl">
          Penugasan Pegawai
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tetapkan pegawai (Imam / Bilal) ke masjid — seret &amp; lepas atau guna menu. Imam &amp; Bilal
          kerap bertukar; ubah di sini bila-bila masa tanpa log masuk Studio.
        </p>
      </div>
      <PenugasanBoard
        pegawai={pegawai.map((p) => ({
          employeeNo: p.employeeNo,
          nama: p.nama,
          kategori: p.kategori,
          gred: p.gred,
          masjidId: p.masjidId,
        }))}
        masjids={masjidData}
        zones={zonData}
      />
    </div>
  );
}
