// Dump semua masjid (published) — _id, nama, telefon, emel — untuk padanan kontak.
// npx tsx scripts/list-masjid-kontak.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

type Doc = { _id: string; nama: string; telefon?: string; emel?: string };

async function main() {
  const client = seedClient();
  const docs = await client.fetch<Doc[]>(
    `*[_type=="masjid" && !(_id in path("drafts.**"))]{ _id, nama, telefon, emel } | order(_id asc)`
  );
  for (const d of docs) {
    const has = [d.telefon ? "TEL✓" : "", d.emel ? "EMEL✓" : ""].filter(Boolean).join(" ");
    console.log(`${d._id}\t${d.nama}${has ? "  [" + has + "]" : ""}`);
  }
  console.log(`\nJumlah: ${docs.length} masjid`);
}
main().catch((e) => { console.error(e); process.exit(1); });
