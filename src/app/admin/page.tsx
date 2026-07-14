import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  UserX,
  Wallet,
  MessageCircleWarning,
  ArrowLeftRight,
  Users,
  Bell,
  Clock,
} from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDashboardStats, getRecentAudit, getRecentOutbox } from "@/lib/admin-data";
import { formatRM } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Admin PERKIB", robots: { index: false } };

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [stats, audit, outbox] = await Promise.all([
    getDashboardStats(),
    getRecentAudit(8),
    getRecentOutbox(6),
  ]);

  const cards = [
    {
      label: "Permohonan Baru",
      value: stats.permohonanBaru,
      icon: FileText,
      href: "/admin/saguhati?status=baru",
      tone: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Pegawai Belum Ditugaskan",
      value: stats.belumDitugaskan,
      icon: UserX,
      href: "/admin/penugasan",
      tone: "text-accent-deep",
      bg: "bg-accent/10",
    },
    {
      label: `Kutipan Yuran ${stats.tahun}`,
      value: formatRM(stats.kutipanTahunIni),
      icon: Wallet,
      href: "/admin/yuran",
      tone: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Notifikasi WA Gagal",
      value: stats.waGagal,
      icon: MessageCircleWarning,
      href: "/admin/notifikasi",
      tone: stats.waGagal > 0 ? "text-destructive" : "text-muted-foreground",
      bg: stats.waGagal > 0 ? "bg-destructive/10" : "bg-muted",
    },
  ];

  const quick = [
    { href: "/admin/saguhati", label: "Urus Permohonan", icon: FileText },
    { href: "/admin/penugasan", label: "Penugasan Pegawai", icon: ArrowLeftRight },
    { href: "/admin/yuran", label: "Rekod Yuran", icon: Wallet },
    { href: "/admin/pegawai", label: "Cari Pegawai", icon: Users },
    // /admin/staf sengaja tidak dipautkan (halaman terlindung gate — akses URL manual).
    { href: "/admin/notifikasi", label: "Tetapan Notifikasi", icon: Bell },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan permohonan saguhati, penugasan, yuran dan notifikasi PERKIB.
        </p>
      </div>

      {/* Kad statistik */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elev"
            >
              <div className={`flex size-11 items-center justify-center rounded-xl ${c.bg} ${c.tone}`}>
                <Icon className="size-5" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold text-ink">{c.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Pautan pantas */}
      <div>
        <h2 className="font-display text-lg font-semibold text-primary-dark">Pautan Pantas</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-ink shadow-soft transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <Icon className="size-5 text-primary" />
                {q.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aktiviti terkini */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-dark">
            <Clock className="size-5 text-accent" /> Aktiviti Terkini
          </h2>
          <ul className="mt-4 space-y-3">
            {audit.length === 0 && (
              <li className="text-sm text-muted-foreground italic">Belum ada aktiviti direkodkan.</li>
            )}
            {audit.map((a) => (
              <li key={a._id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm text-ink">
                    <span className="font-medium">{a.aksi}</span>
                    {a.sasaran ? ` · ${a.sasaran}` : ""}
                  </p>
                  {a.ringkasan && <p className="truncate text-xs text-muted-foreground">{a.ringkasan}</p>}
                  <p className="text-[11px] text-muted-foreground">
                    {a.masa ? new Date(a.masa).toLocaleString("ms-MY") : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Outbox WhatsApp */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-dark">
            <MessageCircleWarning className="size-5 text-accent" /> Notifikasi WhatsApp Terkini
          </h2>
          <ul className="mt-4 space-y-3">
            {outbox.length === 0 && (
              <li className="text-sm text-muted-foreground italic">Belum ada notifikasi dihantar.</li>
            )}
            {outbox.map((o) => (
              <li key={o._id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">
                    {o.peristiwa} → {o.toMask}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.masa ? new Date(o.masa).toLocaleString("ms-MY") : ""}
                    {o.refPermohonan ? ` · ${o.refPermohonan}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    o.status === "sent"
                      ? "bg-success/10 text-success"
                      : o.status === "dry-run"
                        ? "bg-accent/10 text-accent-deep"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {o.status === "sent" ? "Dihantar" : o.status === "dry-run" ? "Ujian" : "Gagal"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
