// Senarai penuh masjid (id, nama, lokasi, wilayah, ada telefon/emel) — untuk kompil kontak.
// Jalankan: npx tsx scripts/list-masjid-full.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

type Row = { id: string; nama: string; lokasi?: string; zon?: number; wilayah?: string; jenisTempat?: string; telefon?: string; emel?: string };

async function main() {
  const client = seedClient();
  const rows = await client.fetch<Row[]>(
    `*[_type=="masjid" && jenisTempat=="masjid" && !(_id in path("drafts.**"))]|order(zon->nombor asc, nama asc){
      "id": _id, nama, lokasi, "zon": zon->nombor, "wilayah": zon->wilayah, jenisTempat, telefon, emel }`
  );
  console.log(JSON.stringify(rows, null, 2));
  console.error(`\n${rows.length} masjid awam. Ada telefon: ${rows.filter((r) => r.telefon).length}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
