import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getKadarYuran } from "@/lib/yuran";
import { KadarForm } from "./KadarForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kadar Yuran — Admin PERKIB", robots: { index: false } };

export default async function TetapanKadarPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const kadar = await getKadarYuran();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/yuran" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" /> Kembali ke yuran
      </Link>
      <div className="mt-4 mb-6">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Kadar Yuran Mengikut Gred</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tetapkan kadar yuran bulanan bagi setiap gred. Contoh: S1 = RM10, S5 &amp; S9 = RM15.
          Kadar boleh diubah bila-bila masa.
        </p>
      </div>
      <KadarForm initial={kadar} />
    </div>
  );
}
