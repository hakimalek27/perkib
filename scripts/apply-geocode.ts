// Apply geocode (fasa 3/3) — patch koordinat dari fail SEMAKAN ke Sanity.
// Validasi bounding-box per wilayah: koordinat LUAR sempadan wilayah DITOLAK
// (elak geocode tersasar). TIDAK overwrite koordinat sedia ada.
// Jalankan: npx tsx scripts/apply-geocode.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

type Reviewed = {
  id: string;
  nama: string;
  wilayah?: string;
  latitude: number | null;
  longitude: number | null;
};

// Sempadan kasar setiap wilayah (longitude, latitude). Koordinat di luar = tolak.
const BBOX: Record<string, { minLng: number; maxLng: number; minLat: number; maxLat: number }> = {
  kl: { minLng: 101.55, maxLng: 101.78, minLat: 3.0, maxLat: 3.3 },
  putrajaya: { minLng: 101.62, maxLng: 101.75, minLat: 2.87, maxLat: 3.0 },
  labuan: { minLng: 115.1, maxLng: 115.36, minLat: 5.15, maxLat: 5.45 },
  khas: { minLng: 101.55, maxLng: 101.78, minLat: 3.0, maxLat: 3.3 }, // posting khas dlm KL
};

function inBbox(wilayah: string | undefined, lat: number, lng: number): boolean {
  const b = BBOX[wilayah ?? "kl"] ?? BBOX.kl;
  return lng >= b.minLng && lng <= b.maxLng && lat >= b.minLat && lat <= b.maxLat;
}

async function main() {
  const file = path.resolve(process.cwd(), "scripts/output/geocode-review.json");
  if (!fs.existsSync(file)) {
    console.error(`Fail tiada: ${file}. Jalankan geocode-masjid.ts dahulu.`);
    process.exit(1);
  }
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as Reviewed[];

  const client = seedClient();
  // Jangan overwrite koordinat sedia ada.
  const existing = await client.fetch<{ _id: string }[]>(`*[_type=="masjid" && defined(latitude)]{ _id }`);
  const hasCoord = new Set(existing.map((e) => e._id));

  let patched = 0;
  let ditolak = 0;
  let dilangkau = 0;
  const tolakSenarai: string[] = [];

  for (const r of rows) {
    if (typeof r.latitude !== "number" || typeof r.longitude !== "number") continue;
    if (hasCoord.has(r.id)) {
      dilangkau++;
      continue;
    }
    if (!inBbox(r.wilayah, r.latitude, r.longitude)) {
      ditolak++;
      tolakSenarai.push(`${r.nama} [${r.latitude},${r.longitude}] (${r.wilayah ?? "kl"})`);
      continue;
    }
    await client.patch(r.id).set({ latitude: r.latitude, longitude: r.longitude }).commit();
    patched++;
    process.stdout.write(`✓ ${r.nama}\n`);
  }

  console.log(
    `\nSelesai: ${patched} dipatch · ${ditolak} ditolak (luar bbox) · ${dilangkau} dilangkau (sudah ada koordinat).`
  );
  if (tolakSenarai.length) {
    console.log("\nDITOLAK (semak/betulkan manual dlm geocode-review.json jika perlu):");
    tolakSenarai.forEach((s) => console.log("  ✗", s));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
