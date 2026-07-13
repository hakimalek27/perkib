"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PegawaiCard } from "@/components/pegawai/PegawaiCard";
import { kategoriLabel, type KategoriPegawai, type PegawaiView } from "@/lib/sanity";
import type { Zon } from "@/content/zon-masjid";

const KATEGORI: (KategoriPegawai | "all")[] = [
  "all",
  "ketua-imam",
  "timbalan-ketua-imam",
  "bilal",
];

const BELUM = -1; // kunci untuk kumpulan "Belum Ditugaskan"

export function PegawaiExplorer({
  pegawai,
  zones,
}: {
  pegawai: PegawaiView[];
  zones: Zon[];
}) {
  const [zon, setZon] = useState<number | "all">("all");
  const [kategori, setKategori] = useState<KategoriPegawai | "all">("all");
  const [query, setQuery] = useState("");

  const zonOf = (p: PegawaiView) => p.masjidZonNombor ?? BELUM;

  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of pegawai) m.set(zonOf(p), (m.get(zonOf(p)) ?? 0) + 1);
    return m;
  }, [pegawai]);

  const kategoriCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pegawai) m.set(p.kategori, (m.get(p.kategori) ?? 0) + 1);
    return m;
  }, [pegawai]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pegawai.filter((p) => {
      if (zon !== "all" && zonOf(p) !== zon) return false;
      if (kategori !== "all" && p.kategori !== kategori) return false;
      if (q && !p.nama.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pegawai, zon, kategori, query]);

  const byZon = useMemo(() => {
    const map = new Map<number, PegawaiView[]>();
    for (const p of filtered) {
      const k = zonOf(p);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    return map;
  }, [filtered]);

  // Susun: zon 1..8 dahulu, "Belum Ditugaskan" akhir.
  const groupKeys = [...byZon.keys()].sort((a, b) => {
    if (a === BELUM) return 1;
    if (b === BELUM) return -1;
    return a - b;
  });

  const zonName = (k: number) =>
    k === BELUM ? "Belum Ditugaskan" : zones.find((z) => z.nombor === k)?.nama ?? `Zon ${k}`;

  const pill = (active: boolean) =>
    cn(
      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
      active
        ? "bg-primary text-white"
        : "border border-border bg-card text-ink/70 hover:border-primary/40"
    );

  return (
    <div>
      {/* Kawalan */}
      <div className="sticky top-[76px] z-20 -mx-4 mb-8 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-lg">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama pegawai…"
              className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {KATEGORI.map((k) => (
              <button key={k} onClick={() => setKategori(k)} className={pill(kategori === k)}>
                {k === "all"
                  ? `Semua Kategori (${pegawai.length})`
                  : `${kategoriLabel[k]} (${kategoriCounts.get(k) ?? 0})`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setZon("all")} className={pill(zon === "all")}>
              Semua Zon
            </button>
            {zones.map((z) => (
              <button key={z.id} onClick={() => setZon(z.nombor)} className={pill(zon === z.nombor)}>
                Zon {z.nombor} ({counts.get(z.nombor) ?? 0})
              </button>
            ))}
            <button onClick={() => setZon(BELUM)} className={pill(zon === BELUM)}>
              Belum Ditugaskan ({counts.get(BELUM) ?? 0})
            </button>
          </div>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Memaparkan <span className="font-semibold text-primary">{filtered.length}</span> pegawai
      </p>

      {groupKeys.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
          <Users className="mx-auto size-10 text-accent" />
          <p className="mt-4 font-display text-lg font-semibold text-ink">Tiada Padanan</p>
          <p className="mt-1 text-sm text-muted-foreground">Cuba tukar penapis atau carian.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupKeys.map((k) => {
            const list = byZon.get(k)!;
            return (
              <div key={k}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                  <h2
                    className={cn(
                      "font-display text-2xl font-semibold",
                      k === BELUM ? "text-accent-deep" : "text-primary-dark"
                    )}
                  >
                    {zonName(k)}
                  </h2>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {list.length} pegawai
                  </span>
                </div>
                {k === BELUM && (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    Pegawai ini belum ditugaskan ke mana-mana masjid. Admin akan menetapkan penugasan
                    melalui sistem pengurusan kandungan.
                  </p>
                )}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {list.map((p) => (
                    <PegawaiCard key={p.employeeNo} pegawai={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
