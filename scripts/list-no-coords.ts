// Senaraikan masjid TANPA koordinat (ikut zon) — untuk padanan manual koordinat.
// Jalankan: npx tsx scripts/list-no-coords.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

type Row = { id: string; nama: string; lokasi?: string; zon?: number; wilayah?: string; jenisTempat?: string };

async function main() {
  const client = seedClient();
  const rows = await client.fetch<Row[]>(
    `*[_type=="masjid" && !defined(latitude) && !(_id in path("drafts.**"))]|order(zon->nombor asc, nama asc){
      "id": _id, nama, lokasi, "zon": zon->nombor, "wilayah": zon->wilayah, jenisTempat }`
  );
  const total = await client.fetch<number>(`count(*[_type=="masjid" && !(_id in path("drafts.**"))])`);
  const withCoord = await client.fetch<number>(
    `count(*[_type=="masjid" && defined(latitude) && !(_id in path("drafts.**"))])`
  );
  console.log(`JUMLAH masjid: ${total} · ADA koordinat: ${withCoord} · TIADA: ${rows.length}\n`);
  let curZon = -1;
  for (const r of rows) {
    if (r.zon !== curZon) {
      curZon = r.zon ?? -1;
      console.log(`\n=== ZON ${r.zon} (${r.wilayah}) ===`);
    }
    console.log(`  [${r.id}] ${r.nama}${r.lokasi ? ` — ${r.lokasi}` : ""}${r.jenisTempat && r.jenisTempat !== "masjid" ? ` (${r.jenisTempat})` : ""}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
