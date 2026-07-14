// Apply geocode (fasa 3/3) — patch koordinat dari fail SEMAKAN ke Sanity.
// Hanya entri dengan latitude & longitude sah dipatch. Jalankan SELEPAS semakan manual.
// Jalankan: npx tsx scripts/apply-geocode.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

type Reviewed = { id: string; nama: string; latitude: number | null; longitude: number | null };

async function main() {
  const file = path.resolve(process.cwd(), "scripts/output/geocode-review.json");
  if (!fs.existsSync(file)) {
    console.error(`Fail tiada: ${file}. Jalankan geocode-masjid.ts dahulu.`);
    process.exit(1);
  }
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as Reviewed[];
  const valid = rows.filter(
    (r) => typeof r.latitude === "number" && typeof r.longitude === "number" &&
      Math.abs(r.latitude) <= 90 && Math.abs(r.longitude) <= 180
  );
  console.log(`Patch ${valid.length}/${rows.length} koordinat ke Sanity…`);

  const client = seedClient();
  let patched = 0;
  for (const r of valid) {
    await client.patch(r.id).set({ latitude: r.latitude, longitude: r.longitude }).commit();
    patched++;
    process.stdout.write(`✓ ${r.nama}\n`);
  }
  console.log(`\nSelesai: ${patched} tempat dikemas kini dengan koordinat.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
