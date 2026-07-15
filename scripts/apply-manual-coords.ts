// Patch koordinat MANUAL (dari rekod rasmi JAWI/pin peta, disemak Hakim) ke Sanity.
// _id EKSPLISIT (bukan padan nama automatik — padanan dibuat manual & disahkan).
// Additive-only (tidak overwrite koordinat sedia ada) + validasi bbox wilayah.
//
// Dry-run (default): npx tsx scripts/apply-manual-coords.ts
// Tulis sebenar:      npx tsx scripts/apply-manual-coords.ts --commit
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

// Koordinat manual (6 titik perpuluhan). Al-Hijrah (Labuan) DILANGKAU — belum sah.
const COORDS: { id: string; lat: number; lng: number }[] = [
  // Zon 1 — Kepong/Batu/Segambut
  { id: "masjid-1-masjid-abi-ayyub-al-ansari", lat: 3.22717, lng: 101.68597 },
  // Zon 2 — Sentul/Gombak/Setapak
  { id: "masjid-2-masjid-amru-bin-al-as", lat: 3.179952, lng: 101.698661 },
  { id: "masjid-2-masjid-ibn-abbas", lat: 3.21016, lng: 101.71691 },
  { id: "masjid-2-masjid-jamek-pekan-sentul", lat: 3.182076, lng: 101.69071 },
  { id: "masjid-2-masjid-jamek-saad-ibn-waqqas", lat: 3.20143, lng: 101.70246 },
  { id: "masjid-2-masjid-salahuddin-al-ayyubi", lat: 3.22255, lng: 101.72019 },
  { id: "masjid-2-masjid-zaid-bin-haritsah", lat: 3.21088, lng: 101.70593 },
  // Zon 3 — Bandar/Kampung Baru/Kampung Pandan
  { id: "masjid-3-masjid-as-sodiqin", lat: 3.118, lng: 101.731 },
  // Zon 4 — Keramat/Setiawangsa/Titiwangsa/Wangsa Maju
  { id: "masjid-4-masjid-ibn-masud", lat: 3.163276, lng: 101.727904 },
  { id: "masjid-4-masjid-ibnu-sina", lat: 3.18513, lng: 101.70575 },
  { id: "masjid-4-masjid-khalid-bin-al-walid", lat: 3.17177, lng: 101.72612 },
  { id: "masjid-4-masjid-muadz-bin-jabal", lat: 3.1784, lng: 101.73783 },
  { id: "masjid-4-masjid-muhammad-al-fateh", lat: 3.205767, lng: 101.724333 },
  { id: "masjid-4-masjid-solehin", lat: 3.174916, lng: 101.719985 },
  { id: "masjid-4-masjid-universiti-teknologi-malaysia", lat: 3.171359, lng: 101.720527 },
  // Zon 5 — Sri Petaling/Bandar Tun Razak/Cheras Selatan/Sungai Besi
  { id: "masjid-5-masjid-abdullah-bin-zubair", lat: 3.11954, lng: 101.70308 },
  { id: "masjid-5-masjid-al-imam-at-tirmizi", lat: 3.074191, lng: 101.650884 },
  { id: "masjid-5-masjid-al-najihin", lat: 3.098045, lng: 101.711318 },
  { id: "masjid-5-masjid-az-zubair-ibnu-awwam", lat: 3.1139, lng: 101.72006 },
  { id: "masjid-5-masjid-jamek-bandar-baru-sri-petaling", lat: 3.06908, lng: 101.68902 },
  { id: "masjid-5-masjid-talhah-bin-ubaidillah", lat: 3.05514, lng: 101.66483 },
  { id: "masjid-5-masjid-thoriq-bin-ziyad", lat: 3.05826, lng: 101.71705 },
  // Zon 6 — Bangsar/Lembah Pantai/TTDI/Bukit Damansara
  { id: "masjid-6-masjid-jamek-abdullah-hukum-eco-city", lat: 3.12068, lng: 101.67493 },
  // Zon 8 — Labuan (Al-Hijrah DILANGKAU — belum sah)
  { id: "masjid-8-masjid-al-ehsan", lat: 5.323667, lng: 115.187944 },
  { id: "masjid-8-masjid-al-falah", lat: 5.323111, lng: 115.218917 },
  { id: "masjid-8-masjid-al-munawwar", lat: 5.369693, lng: 115.220913 },
  { id: "masjid-8-masjid-al-muttakin", lat: 5.317764, lng: 115.24673 },
  { id: "masjid-8-masjid-al-muzakirullah", lat: 5.365942, lng: 115.23255 },
  { id: "masjid-8-masjid-al-sultan-abdullah", lat: 5.298556, lng: 115.2055 },
  { id: "masjid-8-masjid-ar-rahman-labuan", lat: 5.305272, lng: 115.180861 },
  { id: "masjid-8-masjid-bebuloh-darat", lat: 5.276717, lng: 115.187961 },
  { id: "masjid-8-masjid-jamek-adam", lat: 5.346833, lng: 115.234278 },
  { id: "masjid-8-masjid-jamek-an-nur", lat: 5.283394, lng: 115.247546 },
  { id: "masjid-8-masjid-jamek-layang-layangan", lat: 5.330944, lng: 115.19525 },
  { id: "masjid-8-masjid-nur-iman", lat: 5.362667, lng: 115.229139 },
  { id: "masjid-8-masjid-nurul-iman", lat: 5.298556, lng: 115.2055 },
  { id: "masjid-8-masjid-rancha-rancha-darat", lat: 5.263306, lng: 115.232444 },
  { id: "masjid-8-masjid-sirajul-islam", lat: 5.346861, lng: 115.242667 },
];

// Sempadan kasar setiap wilayah (longitude, latitude). Koordinat di luar = tolak.
const BBOX: Record<string, { minLng: number; maxLng: number; minLat: number; maxLat: number }> = {
  kl: { minLng: 101.55, maxLng: 101.78, minLat: 3.0, maxLat: 3.3 },
  putrajaya: { minLng: 101.62, maxLng: 101.75, minLat: 2.87, maxLat: 3.0 },
  labuan: { minLng: 115.1, maxLng: 115.36, minLat: 5.15, maxLat: 5.45 },
  khas: { minLng: 101.55, maxLng: 101.78, minLat: 3.0, maxLat: 3.3 },
};
function inBbox(wilayah: string | undefined, lat: number, lng: number): boolean {
  const b = BBOX[wilayah ?? "kl"] ?? BBOX.kl;
  return lng >= b.minLng && lng <= b.maxLng && lat >= b.minLat && lat <= b.maxLat;
}

type Doc = { _id: string; nama: string; latitude?: number; longitude?: number; wilayah?: string };

async function main() {
  const commit = process.argv.includes("--commit");
  const client = seedClient();

  const ids = COORDS.map((c) => c.id);
  const docs = await client.fetch<Doc[]>(
    `*[_type=="masjid" && _id in $ids]{ _id, nama, latitude, longitude, "wilayah": zon->wilayah }`,
    { ids }
  );
  const byId = new Map(docs.map((d) => [d._id, d]));

  console.log(`Mod: ${commit ? "COMMIT (tulis)" : "DRY-RUN (papar sahaja)"} · ${COORDS.length} koordinat\n`);

  let ok = 0, skipAda = 0, tolak = 0, hilang = 0, patched = 0;
  const masalah: string[] = [];

  for (const c of COORDS) {
    const d = byId.get(c.id);
    if (!d) {
      hilang++;
      masalah.push(`✗ ID TIADA dalam Sanity: ${c.id}`);
      continue;
    }
    if (typeof d.latitude === "number") {
      skipAda++;
      console.log(`  ⏭  ${d.nama} — sudah ada koordinat (${d.latitude}, ${d.longitude}), dilangkau`);
      continue;
    }
    if (!inBbox(d.wilayah, c.lat, c.lng)) {
      tolak++;
      masalah.push(`✗ LUAR BBOX (${d.wilayah}): ${d.nama} [${c.lat}, ${c.lng}]`);
      continue;
    }
    ok++;
    console.log(`  ✓ ${d.nama} (${d.wilayah}) ← ${c.lat}, ${c.lng}`);
    if (commit) {
      await client.patch(c.id).set({ latitude: c.lat, longitude: c.lng }).commit();
      patched++;
    }
  }

  console.log(
    `\nRingkasan: ${ok} sedia dipatch · ${skipAda} dilangkau (sudah ada) · ${tolak} ditolak (luar bbox) · ${hilang} id hilang.`
  );
  if (commit) console.log(`✅ ${patched} rekod DITULIS ke Sanity.`);
  else console.log(`ℹ️  Dry-run sahaja. Jalankan dengan --commit untuk tulis.`);
  if (masalah.length) {
    console.log("\n⚠️  MASALAH:");
    masalah.forEach((m) => console.log("  " + m));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
