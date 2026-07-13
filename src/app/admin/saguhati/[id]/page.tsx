import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, FileText, ExternalLink, Download, Pencil } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPermohonanById, STATUS_LABEL } from "@/lib/admin-data";
import { cn, formatRM } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  baru: "bg-primary/10 text-primary",
  diproses: "bg-accent/15 text-accent-deep",
  lulus: "bg-success/15 text-success",
  tolak: "bg-destructive/10 text-destructive",
  dibayar: "bg-success/20 text-success",
};

function tarikh(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("ms-MY", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AdminPermohonanDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  const { id } = await params;
  const p = await getPermohonanById(decodeURIComponent(id));
  if (!p) notFound();

  const studioUrl = `/studio/intent/edit/id=${encodeURIComponent(p._id)};type=permohonanSaguhati/`;

  return (
    <div className="container-narrow py-10">
      <Link
        href="/admin/saguhati"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Kembali ke senarai
      </Link>

      <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-elev md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nombor Rujukan
            </p>
            <p className="font-display text-2xl font-semibold text-primary">{p.nomborRujukan}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              STATUS_TONE[p.status] ?? "bg-muted text-muted-foreground"
            )}
          >
            {STATUS_LABEL[p.status] ?? p.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <Field label="Nama Pemohon" value={p.namaPemohon} />
          <Field label="No. Pekerja" value={p.employeeNo} />
          <Field label="Jawatan" value={p.jawatanPemohon} />
          <Field label="Masjid" value={p.masjidPemohon} />
          <Field label="Emel" value={p.emelPemohon} />
          <Field label="Jenis Saguhati" value={`${p.jenisNama} (${p.jenisKod})`} />
          <Field label="Kadar" value={formatRM(p.jenisKadar)} highlight />
          <Field label="Tarikh Mohon" value={tarikh(p.tarikhMohon)} />
          <Field label="Kemas Kini Terakhir" value={tarikh(p.tarikhKemaskini)} />
        </dl>

        {p.catatan && (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Catatan Pemohon
            </p>
            <p className="mt-1 text-sm text-ink">{p.catatan}</p>
          </div>
        )}

        {p.catatanAdmin && (
          <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-deep">
              Catatan Admin
            </p>
            <p className="mt-1 text-sm text-ink">{p.catatanAdmin}</p>
          </div>
        )}

        {/* Dokumen */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dokumen Sokongan ({p.dokumen.length})
          </p>
          <ul className="mt-3 space-y-2">
            {p.dokumen.map((d, i) => (
              <li key={i}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <span className="flex items-center gap-2 truncate text-sm text-ink">
                    <FileText className="size-4 shrink-0 text-accent" />
                    <span className="truncate">{d.filename ?? `Dokumen ${i + 1}`}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                    <Download className="size-3.5" /> Buka
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Tindakan */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
          <a
            href={studioUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-dark"
          >
            <Pencil className="size-4" /> Kemas Kini Status di Studio
            <ExternalLink className="size-3.5" />
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Status dan catatan admin dikemas kini melalui Sanity Studio. Perubahan akan dipaparkan di sini
          dan pada semakan status pemohon.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border-b border-border/60 pb-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1", highlight ? "font-display text-lg font-semibold text-accent-deep" : "text-ink")}>
        {value}
      </dd>
    </div>
  );
}
