import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Search, ChevronRight, User, UserPlus } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPegawaiAdminAll } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Direktori Pegawai — Admin PERKIB", robots: { index: false } };

const KAT_LABEL: Record<string, string> = {
  "ketua-imam": "Ketua Imam",
  "timbalan-ketua-imam": "Timbalan Ketua Imam",
  bilal: "Bilal",
};

export default async function AdminPegawaiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const all = await getPegawaiAdminAll();
  const list = query
    ? all.filter((p) => p.nama.toLowerCase().includes(query) || p.employeeNo.includes(query))
    : all;

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

      <form action="/admin/pegawai" method="get" className="max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Taip nama atau no. pekerja…"
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">{list.length} pegawai</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link
            key={p.employeeNo}
            href={`/admin/pegawai/${p.employeeNo}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft transition-colors hover:border-primary/40"
          >
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {p.photoUrl ? (
                <Image src={p.photoUrl} alt={p.nama} fill sizes="48px" className="object-cover" />
              ) : (
                <User className="size-5 text-muted-foreground" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{p.nama}</p>
              <p className="truncate text-xs text-muted-foreground">
                {KAT_LABEL[p.kategori] ?? p.kategori} · {p.gred} · {p.employeeNo}
              </p>
              <p className="truncate text-xs text-muted-foreground/80">
                {p.masjidNama ?? "Belum ditugaskan"}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">Tiada pegawai sepadan.</p>
        )}
      </div>
    </div>
  );
}
