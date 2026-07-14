"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Star, Landmark, Building2, List, Map as MapIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MasjidView } from "@/lib/sanity";
import type { Zon } from "@/content/zon-masjid";

// Peta dimuat malas (dynamic, ssr:false) — hanya bila tab Peta dibuka.
const MasjidMap = dynamic(() => import("./MasjidMap").then((m) => m.MasjidMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] items-center justify-center rounded-2xl border border-border bg-muted">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  ),
});

const WILAYAH_LABEL: Record<string, string> = {
  kl: "WP Kuala Lumpur",
  putrajaya: "WP Putrajaya",
  labuan: "WP Labuan",
};

export function MasjidExplorer({
  masjids,
  zones,
}: {
  masjids: MasjidView[];
  zones: Zon[];
}) {
  const [zon, setZon] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"senarai" | "peta">("senarai");

  // Segerak `view` dari URL (?view=peta) sekali semasa mount (deep-link boleh dikongsi).
  useEffect(() => {
    const v = new URL(window.location.href).searchParams.get("view");
    if (v === "peta") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView("peta");
    }
  }, []);

  function changeView(v: "senarai" | "peta") {
    setView(v);
    try {
      const url = new URL(window.location.href);
      if (v === "peta") url.searchParams.set("view", "peta");
      else url.searchParams.delete("view");
      window.history.replaceState(null, "", url.toString());
    } catch {}
  }


  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const x of masjids) m.set(x.zonNombor, (m.get(x.zonNombor) ?? 0) + 1);
    return m;
  }, [masjids]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return masjids.filter((x) => {
      if (zon !== "all" && x.zonNombor !== zon) return false;
      if (q && !`${x.nama} ${x.lokasi}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [masjids, zon, query]);

  const byZon = useMemo(() => {
    const map = new Map<number, MasjidView[]>();
    for (const x of filtered) {
      if (!map.has(x.zonNombor)) map.set(x.zonNombor, []);
      map.get(x.zonNombor)!.push(x);
    }
    return map;
  }, [filtered]);

  const zonList = [...byZon.keys()].sort((a, b) => a - b);

  return (
    <div>
      {/* Kawalan */}
      <div className="sticky top-[76px] z-20 -mx-4 mb-8 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-lg">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari masjid atau lokasi…"
                className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {/* Segmented control Senarai | Peta */}
            <div className="flex shrink-0 rounded-full border border-border bg-card p-1 shadow-soft" role="tablist" aria-label="Mod paparan">
              <button
                role="tab"
                aria-selected={view === "senarai"}
                onClick={() => changeView("senarai")}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", view === "senarai" ? "bg-primary text-white" : "text-ink/70")}
              >
                <List className="size-3.5" /> <span className="hidden sm:inline">Senarai</span>
              </button>
              <button
                role="tab"
                aria-selected={view === "peta"}
                onClick={() => changeView("peta")}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", view === "peta" ? "bg-primary text-white" : "text-ink/70")}
              >
                <MapIcon className="size-3.5" /> <span className="hidden sm:inline">Peta</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setZon("all")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                zon === "all"
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-ink/70 hover:border-primary/40"
              )}
            >
              Semua ({masjids.length})
            </button>
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setZon(z.nombor)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  zon === z.nombor
                    ? "bg-primary text-white"
                    : "border border-border bg-card text-ink/70 hover:border-primary/40"
                )}
              >
                Zon {z.nombor} ({counts.get(z.nombor) ?? 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Memaparkan <span className="font-semibold text-primary">{filtered.length}</span> masjid
        {view === "peta" && (
          <span className="ml-2 text-xs">
            ({filtered.filter((m) => typeof m.latitude === "number" && typeof m.longitude === "number").length}{" "}
            daripada {filtered.length} mempunyai koordinat peta)
          </span>
        )}
      </p>

      {view === "peta" ? (
        <MasjidMap masjids={filtered} onError={() => changeView("senarai")} />
      ) : zonList.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
          <Building2 className="mx-auto size-10 text-accent" />
          <p className="mt-4 font-display text-lg font-semibold text-ink">Tiada Padanan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuba tukar zon atau kata carian.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {zonList.map((zn) => {
            const z = zones.find((zz) => zz.nombor === zn);
            const list = byZon.get(zn)!;
            return (
              <div key={zn}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-primary-dark">
                      {z?.nama ?? `Zon ${zn}`}
                    </h2>
                    {z && (
                      <p className="text-xs text-muted-foreground">
                        {WILAYAH_LABEL[z.wilayah]} · Induk: {z.masjidInduk}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {list.length} masjid
                  </span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((m) => (
                    <article
                      key={m.id}
                      className="hover-glow flex flex-col rounded-xl border border-border bg-card p-5 shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base font-semibold leading-tight text-ink">
                          {m.nama}
                        </h3>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {m.isInduk && (
                            <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent-deep">
                              <Star className="size-3" /> Induk
                            </span>
                          )}
                          {m.isNegeri && (
                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              <Landmark className="size-3" /> Negeri
                            </span>
                          )}
                        </div>
                      </div>
                      {m.lokasi && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" />
                          {m.lokasi}
                        </p>
                      )}
                    </article>
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
