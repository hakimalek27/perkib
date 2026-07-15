"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, MapPin, Navigation, Star, Landmark } from "lucide-react";
import type { MasjidView } from "@/lib/sanity";

type Region = "semua" | "kl" | "putrajaya" | "labuan";

// Sempadan kasar setiap wilayah [SW, NE] (longitude, latitude) — utk fokus butang.
const REGION_BOUNDS: Record<Exclude<Region, "semua">, [[number, number], [number, number]]> = {
  kl: [
    [101.55, 3.0],
    [101.78, 3.3],
  ],
  putrajaya: [
    [101.62, 2.87],
    [101.75, 3.0],
  ],
  labuan: [
    [115.1, 5.15],
    [115.36, 5.45],
  ],
};

const REGION_BTN: { key: Region; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "kl", label: "KL" },
  { key: "putrajaya", label: "Putrajaya" },
  { key: "labuan", label: "Labuan" },
];

// Peta direktori masjid — MapLibre GL + OpenFreeMap (positron). Marker arch maroon;
// klik → drawer. Fokus wilayah (KL/Putrajaya/Labuan) + sempadan. Hanya masjid dgn
// koordinat dipaparkan. Ralat muat → onError (fallback senarai).
export function MasjidMap({ masjids, onError }: { masjids: MasjidView[]; onError?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const [selected, setSelected] = useState<MasjidView | null>(null);
  // Default fokus KL (majoriti masjid + permintaan "highlight sempadan KL sahaja").
  // Putrajaya/Labuan diakses via butang (peta berasingan).
  const [region, setRegion] = useState<Region>("kl");

  const withCoords = useMemo(
    () => masjids.filter((m) => typeof m.latitude === "number" && typeof m.longitude === "number"),
    [masjids]
  );
  const visible = useMemo(
    () => (region === "semua" ? withCoords : withCoords.filter((m) => m.wilayah === region)),
    [withCoords, region]
  );

  // Init peta (sekali).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const essential = matchMedia("(max-width: 720px)").matches;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [101.6869, 3.139], // KL — diganti fitBounds bila koordinat ada
        zoom: 10,
        pitch: essential ? 0 : 30,
        attributionControl: { compact: true },
      });
    } catch {
      onError?.();
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: !essential }), "top-right");
    map.on("error", (e) => {
      if (e?.error && String(e.error).match(/style|tiles|fetch/i)) onError?.();
    });
    map.on("load", () => {
      loadedRef.current = true;
      // Fokus awal = KL (default region) — bukan center tetap.
      map.fitBounds(REGION_BOUNDS.kl, { padding: 60, maxZoom: 12, duration: 0 });
      loadBoundaries(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marker: cipta semula bila senarai visible berubah.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: maplibregl.Marker[] = [];
    for (const m of visible) {
      const el = document.createElement("button");
      el.setAttribute("aria-label", m.nama);
      el.className = "perkib-pin";
      el.style.cssText =
        "width:22px;height:26px;background:var(--primary);clip-path:url(#archClip);border:1.5px solid #fff;box-shadow:0 2px 6px rgba(13,17,23,.4);cursor:pointer;";
      el.addEventListener("click", () => setSelected(m));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.longitude!, m.latitude!])
        .addTo(map);
      markers.push(marker);
    }
    return () => markers.forEach((mk) => mk.remove());
  }, [visible]);

  // Fokus wilayah bila butang ditukar.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if (region === "semua") {
      if (withCoords.length > 0) {
        const b = new maplibregl.LngLatBounds();
        withCoords.forEach((m) => b.extend([m.longitude!, m.latitude!]));
        map.fitBounds(b, { padding: 60, maxZoom: 13, duration: 800 });
      }
    } else {
      map.fitBounds(REGION_BOUNDS[region], { padding: 60, maxZoom: 13, duration: 800 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[560px] w-full overflow-hidden rounded-2xl border border-border"
        style={{ background: "var(--muted)" }}
      />

      {/* Butang fokus wilayah */}
      <div className="absolute left-3 top-3 z-10 flex gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-soft backdrop-blur">
        {REGION_BTN.map((r) => (
          <button
            key={r.key}
            onClick={() => setRegion(r.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              region === r.key ? "bg-primary text-white" : "text-ink/70 hover:bg-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {withCoords.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-lg bg-card/90 px-4 py-2 text-sm text-muted-foreground shadow-soft">
            Koordinat masjid belum ditetapkan. Sila guna paparan senarai.
          </p>
        </div>
      )}

      {/* Drawer butiran */}
      {selected && (
        <div className="absolute inset-y-0 right-0 z-10 w-full max-w-sm overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
          <button
            onClick={() => setSelected(null)}
            aria-label="Tutup"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Zon {selected.zonNombor} · {selected.zonNama}
          </span>
          <h3 className="mt-3 font-display text-xl font-bold text-ink">{selected.nama}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {selected.isInduk && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent-deep">
                <Star className="size-3" /> Induk
              </span>
            )}
            {selected.isNegeri && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <Landmark className="size-3" /> Negeri
              </span>
            )}
          </div>
          {selected.lokasi && (
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              {selected.lokasi}
            </p>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Navigation className="size-4" /> Dapatkan Arah
          </a>
        </div>
      )}
    </div>
  );
}

// Muat sempadan wilayah dari public/map/boundaries/*.json — layer line maroon +
// fill nipis. Graceful skip jika fail tiada / gagal (peta tetap berfungsi).
async function loadBoundaries(map: maplibregl.Map) {
  for (const r of ["kl", "putrajaya", "labuan"]) {
    try {
      const res = await fetch(`/map/boundaries/${r}.json`, { cache: "force-cache" });
      if (!res.ok) continue;
      const geojson = await res.json();
      const srcId = `sempadan-${r}`;
      if (map.getSource(srcId)) continue;
      map.addSource(srcId, { type: "geojson", data: geojson });
      map.addLayer({
        id: `${srcId}-fill`,
        type: "fill",
        source: srcId,
        paint: { "fill-color": "#9E1F2E", "fill-opacity": 0.05 },
      });
      map.addLayer({
        id: `${srcId}-line`,
        type: "line",
        source: srcId,
        paint: { "line-color": "#9E1F2E", "line-width": 1.5, "line-opacity": 0.45 },
      });
    } catch {
      /* skip senyap — sempadan hiasan sahaja */
    }
  }
}
