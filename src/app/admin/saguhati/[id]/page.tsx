import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, FileText, Download, Phone, Landmark } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPermohonanById, STATUS_LABEL } from "@/lib/admin-data";
import { decryptValue } from "@/lib/crypto";
import { normalizePhone } from "@/lib/whatsapp";
import { cn, formatRM } from "@/lib/utils";
import { Badge, STATUS_TONE } from "@/components/ui/badge";
import { StatusForm } from "./StatusForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Butiran Permohonan — Admin PERKIB", robots: { index: false } };

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
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const p = await getPermohonanById(decodeURIComponent(id));
  if (!p) notFound();

  const bankAkaun = decryptValue(p.bankAkaunEnc);
  const telefon = decryptValue(p.telefonPemohonEnc);
  const waNombor = telefon ? normalizePhone(telefon) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/saguhati"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Kembali ke senarai
      </Link>

      <div className="mt-5 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elev md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nombor Rujukan
              </p>
              <p className="font-display text-2xl font-semibold text-primary">{p.nomborRujukan}</p>
            </div>
            <Badge tone={STATUS_TONE[p.status] ?? "neutral"} className="px-4 py-1.5 text-sm">
              {STATUS_LABEL[p.status] ?? p.status}
            </Badge>
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
          </dl>
        </div>

        {/* Bank & hubungan */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-dark">
            <Landmark className="size-5 text-accent" /> Maklumat Bank &amp; Hubungan
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <Field label="Nama Bank" value={p.bankNama ?? "—"} />
            <Field label="No. Akaun" value={bankAkaun ?? "—"} />
            <div className="border-b border-border/60 pb-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">No. Telefon</dt>
              <dd className="mt-1 flex items-center gap-3 text-ink">
                {telefon ?? "—"}
                {waNombor && (
                  <a
                    href={`https://wa.me/${waNombor}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/20"
                  >
                    <Phone className="size-3" /> WhatsApp
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {p.catatan && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catatan Pemohon</p>
            <p className="mt-1 text-sm text-ink">{p.catatan}</p>
          </div>
        )}

        {/* Dokumen (via proksi admin) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dokumen Sokongan ({p.dokumen.length})
          </p>
          <ul className="mt-3 space-y-2">
            {p.dokumen.length === 0 && <li className="text-sm text-muted-foreground italic">Tiada dokumen.</li>}
            {p.dokumen.map((d, i) => (
              <li key={i}>
                <a
                  href={`/api/admin/dokumen/${encodeURIComponent(d.ref)}`}
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

        {/* Borang kemas kini status */}
        <StatusForm
          id={p._id}
          initial={{
            status: p.status,
            catatanAdmin: p.catatanAdmin ?? "",
            transferBank: p.bankTransfer?.bank ?? "",
            transferTarikh: p.bankTransfer?.tarikh ?? "",
            transferRujukan: p.bankTransfer?.rujukan ?? "",
          }}
        />
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
