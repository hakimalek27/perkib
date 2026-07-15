// Geocode masjid (fasa 1/3) — jana fail semakan koordinat. TIDAK menulis ke Sanity.
//
// Aliran: (1) skrip ini jana scripts/output/geocode-review.json →
//         (2) HAKIM semak/betulkan manual (banding Google Maps) →
//         (3) npx tsx scripts/apply-geocode.ts (patch ke Sanity).
//
// Sumber: Nominatim (OpenStreetMap) — 1 req/s + User-Agent (dasar penggunaan).
// Jalankan: npx tsx scripts/geocode-masjid.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

type MasjidRow = { id: string; nama: string; lokasi?: string; zon?: number; wilayah?: string };
type Reviewed = {
  id: string;
  nama: string;
  lokasi: string;
  wilayah: string;
  latitude: number | null;
  longitude: number | null;
  confidence: "tinggi" | "sederhana" | "tiada";
  osmDisplay: string;
};

// Lokaliti query ikut wilayah — elak bias "Kuala Lumpur" utk Putrajaya/Labuan.
function localityFor(wilayah?: string): string {
  if (wilayah === "putrajaya") return "Putrajaya";
  if (wilayah === "labuan") return "Labuan, Wilayah Persekutuan Labuan";
  return "Kuala Lumpur"; // kl + khas
}

const UA = "PERKIB-geocode/1.0 (admin@perkib.my)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function geocode(q: string): Promise<{ lat: number; lng: number; display: string; importance: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=my&limit=1`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{ lat: string; lon: string; display_name: string; importance?: number }>;
    if (!arr.length) return null;
    return { lat: Number(arr[0].lat), lng: Number(arr[0].lon), display: arr[0].display_name, importance: arr[0].importance ?? 0 };
  } catch {
    return null;
  }
}

async function main() {
  const client = seedClient();
  const rows = await client.fetch<MasjidRow[]>(
    `*[_type=="masjid"]|order(zon->nombor asc, nama asc){ "id": _id, nama, lokasi, "zon": zon->nombor, "wilayah": zon->wilayah }`
  );
  console.log(`Geocode ${rows.length} tempat (1 req/s)…`);

  const out: Reviewed[] = [];
  let jumpa = 0;
  for (const m of rows) {
    const locality = localityFor(m.wilayah);
    const q = [m.nama, m.lokasi, locality, "Malaysia"].filter(Boolean).join(", ");
    const hit = await geocode(q);
    // Cuba kali kedua guna lokaliti wilayah (bukan hardcode KL) jika gagal.
    const hit2 = hit ?? (await (async () => { await sleep(1100); return geocode(`${m.nama}, ${locality}, Malaysia`); })());
    const confidence: Reviewed["confidence"] = !hit2 ? "tiada" : hit2.importance >= 0.4 ? "tinggi" : "sederhana";
    if (hit2) jumpa++;
    out.push({
      id: m.id,
      nama: m.nama,
      lokasi: m.lokasi ?? "",
      wilayah: m.wilayah ?? "kl",
      latitude: hit2?.lat ?? null,
      longitude: hit2?.lng ?? null,
      confidence,
      osmDisplay: hit2?.display ?? "(tidak dijumpai)",
    });
    process.stdout.write(`${confidence === "tiada" ? "✗" : "✓"} ${m.nama}\n`);
    await sleep(1100); // hormati dasar 1 req/s
  }

  const dir = path.resolve(process.cwd(), "scripts/output");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "geocode-review.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 2), "utf8");

  console.log(`\nSelesai: ${jumpa}/${rows.length} dijumpai. Fail: ${file}`);
  console.log("SEMAK MANUAL fail ini (betulkan lat/lng ikut Google Maps), kemudian jalankan:");
  console.log("  npx tsx scripts/apply-geocode.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
