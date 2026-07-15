// Ambil poligon sempadan wilayah (KL / Putrajaya / Labuan) dari Nominatim →
// simpan public/map/boundaries/{kl,putrajaya,labuan}.json (GeoJSON Feature).
// Hiasan peta sahaja — MasjidMap graceful-skip jika fail tiada.
// Jalankan: npx tsx scripts/fetch-boundaries.ts
import fs from "node:fs";
import path from "node:path";

const UA = "PERKIB-geocode/1.0 (admin@perkib.my)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const REGIONS: { key: string; q: string }[] = [
  { key: "kl", q: "Wilayah Persekutuan Kuala Lumpur, Malaysia" },
  { key: "putrajaya", q: "Wilayah Persekutuan Putrajaya, Malaysia" },
  { key: "labuan", q: "Wilayah Persekutuan Labuan, Malaysia" },
];

async function main() {
  const dir = path.resolve(process.cwd(), "public/map/boundaries");
  fs.mkdirSync(dir, { recursive: true });

  for (const r of REGIONS) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      r.q
    )}&format=json&polygon_geojson=1&limit=1&countrycodes=my`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      const arr = (await res.json()) as Array<{
        geojson?: { type?: string };
        display_name?: string;
        class?: string;
        type?: string;
      }>;
      const geom = arr[0]?.geojson;
      if (!geom || (geom.type !== "Polygon" && geom.type !== "MultiPolygon")) {
        console.log(`✗ ${r.key}: tiada poligon (${geom?.type ?? "kosong"}) — dilangkau`);
        await sleep(1200);
        continue;
      }
      const feature = {
        type: "Feature",
        properties: { wilayah: r.key, nama: arr[0].display_name },
        geometry: geom,
      };
      fs.writeFileSync(path.join(dir, `${r.key}.json`), JSON.stringify(feature), "utf8");
      console.log(`✓ ${r.key}: ${geom.type} — ${arr[0].display_name}`);
    } catch (e) {
      console.log(`✗ ${r.key}: ${(e as Error).message}`);
    }
    await sleep(1200);
  }
  console.log("Selesai. public/map/boundaries/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
