import { redirect } from "next/navigation";
import { Search, Phone, Mail, User } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { searchStafLain, stafLainCount } from "@/lib/staf-lain";
import { normalizePhone } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staf MAIWP — Admin PERKIB", robots: { index: false } };

export default async function StafPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const total = stafLainCount();
  const { results, total: found } = query
    ? searchStafLain(query, 60)
    : { results: [], total: 0 };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold text-primary-dark md:text-3xl">
          Direktori Staf MAIWP
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Carian maklumat {total.toLocaleString("ms-MY")} kakitangan MAIWP lain — nama, IC, telefon
          (klik terus WhatsApp), gred dan bahagian. Akses admin sahaja.
        </p>
      </div>

      <form action="/admin/staf" method="get" className="max-w-md">
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

      {!query && (
        <p className="mt-6 text-sm text-muted-foreground italic">
          Masukkan nama untuk mencari. (Senarai tidak dipaparkan sepenuhnya atas sebab privasi.)
        </p>
      )}

      {query && (
        <>
          <p className="mt-4 text-xs text-muted-foreground">
            {found} hasil{found > 60 ? " (papar 60 pertama)" : ""}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => {
              const wa = s.noTel ? normalizePhone(s.noTel) : null;
              return (
                <div key={s.employeeNo} className="rounded-xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-start gap-3">
                    <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {s.photoFile ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/admin/staf-foto/${s.employeeNo}`}
                          alt={s.nama}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <User className="size-6 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{s.nama}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.jawatan || "—"}</p>
                      <p className="truncate text-[11px] text-muted-foreground/80">
                        {s.gred || "—"} · {s.employeeNo}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-muted-foreground">No. KP</dt>
                      <dd className="text-ink">{s.noKp || "—"}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="w-16 shrink-0 text-muted-foreground">Telefon</dt>
                      <dd className="flex items-center gap-2 text-ink">
                        {s.noTel || "—"}
                        {wa && (
                          <a
                            href={`https://wa.me/${wa}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success hover:bg-success/20"
                          >
                            <Phone className="size-2.5" /> WA
                          </a>
                        )}
                      </dd>
                    </div>
                    {s.emel && (
                      <div className="flex items-center gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Emel</dt>
                        <dd className="flex min-w-0 items-center gap-1 text-ink">
                          <Mail className="size-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{s.emel}</span>
                        </dd>
                      </div>
                    )}
                    {s.bahagian && (
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Bahagian</dt>
                        <dd className="text-ink">{s.bahagian}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              );
            })}
          </div>
          {results.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">Tiada staf sepadan dengan &ldquo;{query}&rdquo;.</p>
          )}
        </>
      )}
    </div>
  );
}
