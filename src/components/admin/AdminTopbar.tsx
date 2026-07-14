"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Admin",
  saguhati: "Permohonan Saguhati",
  penugasan: "Penugasan Pegawai",
  yuran: "Yuran Keahlian",
  pegawai: "Direktori Pegawai",
  staf: "Staf MAIWP",
  notifikasi: "Notifikasi WhatsApp",
  tetapan: "Tetapan",
  baru: "Tambah",
  edit: "Sunting",
};

export function AdminTopbar() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean); // ["admin", ...]
  const crumbs = parts.map((p, i) => ({
    label: LABELS[p] ?? decodeURIComponent(p),
    href: "/" + parts.slice(0, i + 1).join("/"),
    last: i === parts.length - 1,
  }));

  return (
    <div className="sticky top-0 z-30 hidden border-b border-border bg-background/85 px-6 py-3 backdrop-blur lg:block">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((c) => (
          <span key={c.href} className="flex items-center gap-1.5">
            {c.last ? (
              <span className="font-semibold text-ink">{c.label}</span>
            ) : (
              <Link href={c.href} className="transition-colors hover:text-primary">
                {c.label}
              </Link>
            )}
            {!c.last && <ChevronRight className="size-3.5" />}
          </span>
        ))}
      </nav>
    </div>
  );
}
