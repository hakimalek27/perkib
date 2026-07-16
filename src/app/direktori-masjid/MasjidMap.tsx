"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, MapPin, Navigation, Star, Landmark, Phone, Mail, Box } from "lucide-react";
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

const LABEL_SRC = "masjid-labels";
const LABEL_LAYER = "masjid-labels";
const B3D_LAYER = "bangunan-3d";

// Marker kubah emas — dome bawang (ogee) + finial + tapak titik (anchor bottom).
// Menggantikan pin arch maroon; motif kubah PERKIB (rujuk Kubah.tsx). Emas #C6A25D
// + outline putih supaya jelas atas peta positron yang cerah.
const KUBAH_MARKER_SVG = `<svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="15" cy="3.4" r="1.9" fill="#C6A25D"/><rect x="14.1" y="3.8" width="1.8" height="3.6" rx="0.9" fill="#C6A25D"/><path d="M15 7C20.6 12.6 22.2 16.6 19.8 20.2C17.9 23.1 23.2 26.2 22 32.2L8 32.2C6.8 26.2 12.1 23.1 10.2 20.2C7.8 16.6 9.4 12.6 15 7Z" fill="#C6A25D" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 10.6C18 14 19 17 17.6 19.6" stroke="#EBDCB4" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/><path d="M8 32.2H22L15 37.6Z" fill="#C6A25D" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

// Peta direktori masjid — MapLibre GL + OpenFreeMap (positron). Marker arch maroon
// (klik → drawer) + LABEL nama (symbol layer, collision auto). Fokus wilayah + toggle
// 3D bangunan. Hanya masjid dgn koordinat dipaparkan. Ralat muat → onError (fallback).
export function MasjidMap({ masjids, onError }: { masjids: MasjidView[]; onError?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const essentialRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<MasjidView | null>(null);
  // Default fokus KL (majoriti masjid + permintaan "highlight sempadan KL sahaja").
  const [region, setRegion] = useState<Region>("kl");
  const [is3D, setIs3D] = useState(false);

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
    essentialRef.current = essential;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [101.6869, 3.139],
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
      map.fitBounds(REGION_BOUNDS.kl, { padding: 60, maxZoom: 12, duration: 0 });
      addLabelLayer(map);
      loadBoundaries(map);
      setReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marker (klik → drawer) + label data: cipta semula bila visible/ready berubah.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const markers: maplibregl.Marker[] = [];
    for (const m of visible) {
      const el = document.createElement("button");
      el.setAttribute("aria-label", m.nama);
      el.className = "perkib-pin";
      // Marker kubah emas (dome ogee + finial + tapak) — motif kubah PERKIB.
      el.innerHTML = KUBAH_MARKER_SVG;
      el.style.cssText =
        "width:30px;height:38px;padding:0;border:0;background:transparent;cursor:pointer;line-height:0;filter:drop-shadow(0 2px 3px rgba(13,17,23,.45));";
      el.addEventListener("click", () => setSelected(m));
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([m.longitude!, m.latitude!])
        .addTo(map);
      markers.push(marker);
    }
    const src = map.getSource(LABEL_SRC) as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(labelGeojson(visible));
    return () => markers.forEach((mk) => mk.remove());
  }, [visible, ready]);

  // Fokus wilayah bila butang ditukar.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
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
  }, [region, ready]);

  // Toggle 3D — condongkan peta + layer fill-extrusion bangunan (graceful skip).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || essentialRef.current) return;
    if (is3D) {
      addBuildings(map);
      map.easeTo({ pitch: 58, duration: 600 });
    } else {
      if (map.getLayer(B3D_LAYER)) map.setLayoutProperty(B3D_LAYER, "visibility", "none");
      map.easeTo({ pitch: 30, duration: 600 });
    }
  }, [is3D, ready]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[560px] w-full overflow-hidden rounded-2xl border border-border"
        style={{ background: "var(--muted)" }}
      />

      {/* Kawalan: butang fokus wilayah + toggle 3D */}
      <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-2">
        <div className="flex gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-soft backdrop-blur">
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
        <button
          onClick={() => setIs3D((v) => !v)}
          aria-pressed={is3D}
          className={`hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-soft backdrop-blur transition-colors sm:inline-flex ${
            is3D ? "border-primary bg-primary text-white" : "border-border bg-card/95 text-ink/70 hover:bg-muted"
          }`}
        >
          <Box className="size-3.5" /> {is3D ? "Paparan 2D" : "Paparan 3D"}
        </button>
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
          {selected.telefon && (
            <a
              href={`tel:${selected.telefon.split("/")[0].replace(/[^\d+]/g, "")}`}
              className="mt-3 flex items-center gap-2 text-sm text-ink transition-colors hover:text-primary"
            >
              <Phone className="size-4 shrink-0 text-accent" />
              {selected.telefon}
            </a>
          )}
          {selected.emel && (
            <a
              href={`mailto:${selected.emel}`}
              className="mt-2 flex items-center gap-2 break-all text-sm text-ink transition-colors hover:text-primary"
            >
              <Mail className="size-4 shrink-0 text-accent" />
              {selected.emel}
            </a>
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

// GeoJSON label daripada senarai masjid visible.
function labelGeojson(list: MasjidView[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: list.map((m) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [m.longitude!, m.latitude!] },
      properties: { nama: m.nama },
    })),
  };
}

// Ambil text-font daripada layer symbol sedia ada dlm style — elak glyph tak wujud.
function styleTextFont(map: maplibregl.Map): string[] {
  try {
    const layers = map.getStyle()?.layers ?? [];
    for (const l of layers) {
      const tf = (l as { layout?: Record<string, unknown> }).layout?.["text-font"];
      if (l.type === "symbol" && Array.isArray(tf) && tf.length) return tf as string[];
    }
  } catch {
    /* guna fallback */
  }
  return ["Noto Sans Regular"];
}

// Layer label nama masjid (halo ivory, collision auto MapLibre). Source kosong dulu;
// diisi oleh effect [visible].
function addLabelLayer(map: maplibregl.Map) {
  if (map.getSource(LABEL_SRC)) return;
  map.addSource(LABEL_SRC, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: LABEL_LAYER,
    type: "symbol",
    source: LABEL_SRC,
    minzoom: 9.5,
    layout: {
      "text-field": ["get", "nama"],
      "text-font": styleTextFont(map),
      "text-size": 11,
      "text-offset": [0, 1.35],
      "text-anchor": "top",
      "text-optional": true,
      "text-max-width": 8,
    },
    paint: {
      "text-color": "#0D1117",
      "text-halo-color": "#F7F3EB",
      "text-halo-width": 1.5,
    },
  });
}

// Cari source vector pertama dlm style (openmaptiles) untuk fill-extrusion bangunan.
function firstVectorSource(map: maplibregl.Map): string | null {
  try {
    const sources = map.getStyle()?.sources ?? {};
    for (const [id, s] of Object.entries(sources)) {
      if ((s as { type?: string })?.type === "vector") return id;
    }
  } catch {
    /* skip */
  }
  return null;
}

// Layer bangunan 3D (fill-extrusion). Graceful: jika source/source-layer tiada, skip.
function addBuildings(map: maplibregl.Map) {
  if (map.getLayer(B3D_LAYER)) {
    map.setLayoutProperty(B3D_LAYER, "visibility", "visible");
    return;
  }
  const srcId = firstVectorSource(map);
  if (!srcId) return;
  try {
    map.addLayer({
      id: B3D_LAYER,
      type: "fill-extrusion",
      source: srcId,
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-extrusion-color": "#d9d3c8",
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 8],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.55,
      },
    });
  } catch {
    /* schema tiada 'building' — biar peta condong tanpa bangunan */
  }
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
