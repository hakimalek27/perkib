import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getNotifConfig } from "@/lib/notifikasi";
import { NotifikasiForm } from "./NotifikasiForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifikasi WhatsApp — Admin PERKIB", robots: { index: false } };

export default async function NotifikasiPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const config = await getNotifConfig();
  const dryRun = process.env.WASSAP_DRY_RUN === "1" || process.env.WASSAP_DRY_RUN === "true";
  const configured = Boolean(process.env.WASSAP_API_KEY) || dryRun;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Notifikasi WhatsApp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tetapkan sasaran (nombor / group WhatsApp) dan templat mesej untuk permohonan saguhati.
          Notifikasi dihantar melalui wassap.wehdah.my.
        </p>
      </div>
      {dryRun && (
        <div className="mb-6 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-ink">
          ⚙️ <strong>Mod Ujian (DRY RUN)</strong> aktif — mesej hanya dilog, tidak dihantar sebenar.
          Tetapkan <code>WASSAP_DRY_RUN=0</code> untuk menghantar betul.
        </div>
      )}
      {!configured && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          WASSAP_API_KEY belum ditetapkan. Notifikasi tidak akan dihantar.
        </div>
      )}
      <NotifikasiForm initial={config} />
    </div>
  );
}
