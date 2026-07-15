"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronRight, User } from "lucide-react";
import type { PegawaiAdminRingkas } from "@/lib/admin-data";

const KAT_LABEL: Record<string, string> = {
  "ketua-imam": "Ketua Imam",
  "timbalan-ketua-imam": "Timbalan Ketua Imam",
  bilal: "Bilal",
};

// Live search (taip terus tapis — tiada perlu Enter). Tiru corak PegawaiExplorer awam.
export function PegawaiAdminList({ pegawai }: { pegawai: PegawaiAdminRingkas[] }) {
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pegawai;
    return pegawai.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.employeeNo.includes(q) ||
        (p.masjidNama ?? "").toLowerCase().includes(q)
    );
  }, [pegawai, query]);

  return (
    <div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Taip nama, no. pekerja atau masjid…"
          className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

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
        {list.length === 0 && <p className="text-sm text-muted-foreground">Tiada pegawai sepadan.</p>}
      </div>
    </div>
  );
}
