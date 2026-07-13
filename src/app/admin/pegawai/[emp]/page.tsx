import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, User, FileText } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getPegawaiAdminDetail,
  getPermohonanByEmployee,
  getYuranPegawaiTahun,
  STATUS_LABEL,
} from "@/lib/admin-data";
import { decryptValue } from "@/lib/crypto";
import { normalizePhone } from "@/lib/whatsapp";
import { formatRM } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil Pegawai — Admin PERKIB", robots: { index: false } };

const KAT_LABEL: Record<string, string> = {
  "ketua-imam": "Ketua Imam",
  "timbalan-ketua-imam": "Timbalan Ketua Imam",
  bilal: "Bilal",
};
const BULAN = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

export default async function PegawaiDetailPage({ params }: { params: Promise<{ emp: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { emp } = await params;
  const tahun = new Date().getFullYear();
  const [p, sejarah, yuran] = await Promise.all([
    getPegawaiAdminDetail(emp),
    getPermohonanByEmployee(emp),
    getYuranPegawaiTahun(emp, tahun),
  ]);
  if (!p) notFound();

  const noKp = decryptValue(p.noKpEnc);
  const telefon = decryptValue(p.telefonEnc);
  const wa = telefon ? normalizePhone(telefon) : null;
  const bulanDibayar = yuran
    ? Array.from({ length: 12 }, (_, i) => Boolean((yuran[`m${String(i + 1).padStart(2, "0")}`] as { dibayar?: boolean })?.dibayar))
    : Array(12).fill(false);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/pegawai" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" /> Kembali ke direktori
      </Link>

      {/* Profil */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-elev md:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <span className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
            {p.photoUrl ? (
              <Image src={p.photoUrl} alt={p.nama} fill sizes="96px" className="object-cover" />
            ) : (
              <User className="size-10 text-muted-foreground" />
            )}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-primary-dark">{p.nama}</h1>
            <p className="text-sm text-muted-foreground">
              {KAT_LABEL[p.kategori] ?? p.kategori} · {p.jawatanPenuh}
            </p>
            <p className="mt-1 text-sm text-ink">
              {p.masjidNama ?? "Belum ditugaskan"}
              {p.zonNama ? ` · ${p.zonNama}` : ""}
            </p>
            {!p.statusAktif && (
              <span className="mt-2 inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                Tidak Aktif
              </span>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-border pt-6 text-sm sm:grid-cols-2">
          <Field label="No. Pekerja" value={p.employeeNo} />
          <Field label="Gred" value={p.gred} />
          <Field label="No. Kad Pengenalan" value={noKp ?? "—"} />
          <div className="border-b border-border/60 pb-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">No. Telefon</dt>
            <dd className="mt-1 flex items-center gap-3 text-ink">
              {telefon ?? "—"}
              {wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/20"
                >
                  <Phone className="size-3" /> WhatsApp
                </a>
              )}
            </dd>
          </div>
          <div className="border-b border-border/60 pb-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emel</dt>
            <dd className="mt-1 flex items-center gap-2 text-ink">
              <Mail className="size-3.5 text-muted-foreground" />
              <a href={`mailto:${p.emelRasmi}`} className="hover:underline">{p.emelRasmi}</a>
            </dd>
          </div>
          <Field label="Bahagian" value={p.bahagian ?? "—"} />
          <Field label="Status Perjawatan" value={p.statusPerjawatan ?? "—"} />
        </dl>
      </div>

      {/* Rekod yuran */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary-dark">Rekod Yuran {tahun}</h2>
          <Link href="/admin/yuran" className="text-xs font-medium text-primary hover:underline">
            Urus di modul yuran →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-12">
          {BULAN.map((b, i) => (
            <div key={b} className="text-center">
              <div
                className={`mx-auto flex size-8 items-center justify-center rounded-md text-[11px] font-semibold ${
                  bulanDibayar[i] ? "bg-success text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {bulanDibayar[i] ? "✓" : "—"}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sejarah permohonan */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-primary-dark">
          Sejarah Permohonan Saguhati ({sejarah.length})
        </h2>
        <ul className="mt-4 space-y-2">
          {sejarah.length === 0 && (
            <li className="text-sm text-muted-foreground italic">Tiada permohonan direkodkan.</li>
          )}
          {sejarah.map((s) => (
            <li key={s._id}>
              <Link
                href={`/admin/saguhati/${encodeURIComponent(s._id)}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-primary/40"
              >
                <span className="flex items-center gap-2 truncate text-sm text-ink">
                  <FileText className="size-4 shrink-0 text-accent" />
                  <span className="truncate">
                    {s.nomborRujukan} · {s.jenisNama} · {formatRM(s.jenisKadar)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/60 pb-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
