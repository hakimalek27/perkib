import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, ChevronRight, Inbox, Search, SlidersHorizontal } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getPermohonanList,
  getStatusCounts,
  STATUS_LIST,
  STATUS_LABEL,
} from "@/lib/admin-data";
import { cn, formatRM } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Permohonan Saguhati — Admin PERKIB", robots: { index: false } };

const STATUS_TONE: Record<string, string> = {
  baru: "bg-primary/10 text-primary",
  diproses: "bg-accent/15 text-accent-deep",
  lulus: "bg-success/15 text-success",
  tolak: "bg-destructive/10 text-destructive",
  dibayar: "bg-success/20 text-success",
};

function tarikh(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ms-MY", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AdminSaguhatiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { status, q } = await searchParams;
  const active = status && STATUS_LIST.includes(status as (typeof STATUS_LIST)[number]) ? status : undefined;
  const query = (q ?? "").trim().toLowerCase();

  const [listRaw, counts] = await Promise.all([getPermohonanList(active), getStatusCounts()]);
  const list = query
    ? listRaw.filter(
        (p) =>
          p.namaPemohon.toLowerCase().includes(query) ||
          p.nomborRujukan.toLowerCase().includes(query) ||
          p.employeeNo.includes(query)
      )
    : listRaw;

  const filters: { key?: string; label: string; count: number }[] = [
    { key: undefined, label: "Semua", count: counts.semua ?? 0 },
    ...STATUS_LIST.map((s) => ({ key: s as string, label: STATUS_LABEL[s], count: counts[s] ?? 0 })),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark md:text-3xl">
            Permohonan Saguhati
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Urus dan semak semua permohonan saguhati kebajikan ahli.
          </p>
        </div>
        <Link
          href="/admin/saguhati/tetapan"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-soft hover:border-primary/40"
        >
          <SlidersHorizontal className="size-4" /> Tetapan Had &amp; Kadar
        </Link>
      </div>

      {/* Carian */}
      <form className="mt-5" action="/admin/saguhati" method="get">
        {active && <input type="hidden" name="status" value={active} />}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari nama, no. rujukan atau no. pekerja…"
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>

      {/* Statistik ringkas */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/admin/saguhati?status=${f.key}` : "/admin/saguhati"}
            className={cn(
              "rounded-xl border bg-card p-4 text-center shadow-soft transition-colors",
              (active ?? undefined) === (f.key ?? undefined)
                ? "border-primary ring-2 ring-primary/15"
                : "border-border hover:border-primary/40"
            )}
          >
            <p className="font-display text-2xl font-semibold text-primary-dark">{f.count}</p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{f.label}</p>
          </Link>
        ))}
      </div>

      {/* Senarai */}
      <div className="mt-8">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
            <Inbox className="mx-auto size-10 text-accent" />
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              Tiada permohonan {active ? `berstatus "${STATUS_LABEL[active]}"` : "buat masa ini"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Permohonan baru akan dipaparkan di sini secara automatik.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <ul className="divide-y divide-border">
              {list.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/admin/saguhati/${encodeURIComponent(p._id)}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                      <FileText className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-semibold text-ink">{p.nomborRujukan}</span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            STATUS_TONE[p.status] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {p.namaPemohon} ({p.employeeNo}) · {p.jenisNama} · {formatRM(p.jenisKadar)}
                      </p>
                      <p className="text-xs text-muted-foreground/80">{tarikh(p.tarikhMohon)}</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
