import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getMaklumBalasList } from "@/lib/admin-data";
import { MaklumBalasList } from "./MaklumBalasList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Maklum Balas — Admin PERKIB", robots: { index: false } };

export default async function MaklumBalasPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const items = await getMaklumBalasList();
  const baru = items.filter((i) => i.status === "baru").length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Maklum Balas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pertanyaan &amp; maklum balas daripada borang Hubungi.{" "}
          {baru > 0 ? `${baru} baharu belum dibaca.` : "Tiada yang baharu."}
        </p>
      </div>
      <MaklumBalasList items={items} />
    </div>
  );
}
