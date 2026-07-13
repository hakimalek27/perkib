import Link from "next/link";
import { redirect } from "next/navigation";
import { SlidersHorizontal, Wallet, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getYuranMatrix, getKadarYuran, ringkasan } from "@/lib/yuran";
import { zones } from "@/content/zon-masjid";
import { formatRM } from "@/lib/utils";
import { YuranMatrix } from "./YuranMatrix";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yuran Keahlian — Admin PERKIB", robots: { index: false } };

export default async function YuranPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string; zon?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sp = await searchParams;
  const now = new Date();
  const tahun = Number(sp.tahun) || now.getFullYear();
  const zon = sp.zon ? Number(sp.zon) : undefined;
  const bulanSemasa = now.getMonth() + 1;

  const [rows, kadar] = await Promise.all([getYuranMatrix(tahun, zon), getKadarYuran()]);
  const r = ringkasan(rows, bulanSemasa);
  const adaKadar = kadar.length > 0;

  const tahunPilihan = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  const cards = [
    { label: `Kutipan ${tahun}`, value: formatRM(r.kutipanTahun), icon: Wallet, tone: "text-success", bg: "bg-success/10" },
    { label: "Kutipan Bulan Ini", value: formatRM(r.kutipanBulanIni), icon: TrendingUp, tone: "text-primary", bg: "bg-primary/8" },
    { label: "Bilangan Pegawai", value: r.bilPegawai, icon: Users, tone: "text-accent-deep", bg: "bg-accent/10" },
    { label: "Lunas Setahun", value: `${r.bilLunas}/${r.bilPegawai}`, icon: CheckCircle2, tone: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark md:text-3xl">Yuran Keahlian</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rekod bayaran yuran bulanan/tahunan setiap pegawai. Klik sel untuk tanda bayar.
          </p>
        </div>
        <Link
          href="/admin/yuran/tetapan"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-soft hover:border-primary/40"
        >
          <SlidersHorizontal className="size-4" /> Kadar Yuran (Gred)
        </Link>
      </div>

      {!adaKadar && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-ink">
          ⚠️ Kadar yuran belum ditetapkan. Sila{" "}
          <Link href="/admin/yuran/tetapan" className="font-semibold underline">
            tetapkan kadar mengikut gred
          </Link>{" "}
          dahulu (cth: S1 = RM10, S5 &amp; S9 = RM15).
        </div>
      )}

      {/* Kad ringkasan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className={`flex size-10 items-center justify-center rounded-xl ${c.bg} ${c.tone}`}>
                <Icon className="size-5" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-ink">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Penapis tahun + zon */}
      <form action="/admin/yuran" method="get" className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink">Tahun</label>
        <select
          name="tahun"
          defaultValue={tahun}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-ink"
        >
          {tahunPilihan.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="text-sm font-medium text-ink">Zon</label>
        <select
          name="zon"
          defaultValue={zon ?? ""}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-ink"
        >
          <option value="">Semua Zon</option>
          {zones.map((z) => (
            <option key={z.nombor} value={z.nombor}>
              {z.nombor === 9 ? "Posting Khas" : `Zon ${z.nombor}`}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
          Papar
        </button>
      </form>

      <YuranMatrix rows={rows} tahun={tahun} />
    </div>
  );
}
