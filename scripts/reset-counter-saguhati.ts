// Reset kaunter nombor rujukan saguhati → seq 0 (permohonan seterusnya PKB-<tahun>-0001).
// BERHATI-HATI: reset bila ada permohonan AKTIF boleh cipta nombor rujukan BERTINDIH.
//
// Dry-run (default): npx tsx scripts/reset-counter-saguhati.ts
// Reset (selamat):   npx tsx scripts/reset-counter-saguhati.ts --commit
// Reset (paksa):     npx tsx scripts/reset-counter-saguhati.ts --commit --force
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const commit = process.argv.includes("--commit");
  const force = process.argv.includes("--force");
  const yearArg = process.argv.find((a) => a.startsWith("--year="))?.split("=")[1];
  const year = Number(yearArg) || 2026;
  const counterId = `counter-saguhati-${year}`;
  const client = seedClient();

  const counter = await client.fetch<{ seq?: number } | null>(`*[_id==$id][0]{ seq }`, { id: counterId });
  const perm = await client.fetch<{
    total: number;
    aktif: number;
    dibatalkan: number;
    tertinggi: string | null;
  }>(`{
    "total": count(*[_type=="permohonanSaguhati" && !(_id in path("drafts.**"))]),
    "aktif": count(*[_type=="permohonanSaguhati" && dibatalkan != true && !(_id in path("drafts.**"))]),
    "dibatalkan": count(*[_type=="permohonanSaguhati" && dibatalkan == true && !(_id in path("drafts.**"))]),
    "tertinggi": *[_type=="permohonanSaguhati" && !(_id in path("drafts.**"))] | order(nomborRujukan desc)[0].nomborRujukan
  }`);

  console.log(`Kaunter ${counterId}: seq = ${counter?.seq ?? "(tiada dokumen — akan dicipta)"}`);
  console.log(`Permohonan ${year}: ${perm.total} jumlah · ${perm.aktif} AKTIF · ${perm.dibatalkan} dibatalkan`);
  console.log(`Nombor rujukan tertinggi: ${perm.tertinggi ?? "(tiada)"}`);
  console.log(`\nReset ke 0000 → permohonan seterusnya = PKB-${year}-0001`);

  const selamat = perm.aktif === 0;
  if (!selamat) {
    console.log(`\n⚠️  AMARAN: ada ${perm.aktif} permohonan AKTIF. Reset boleh cipta nombor rujukan BERTINDIH`);
    console.log(`   dengan permohonan sedia ada. Batalkan/padam permohonan aktif dahulu, atau guna --force.`);
  }

  if (!commit) {
    console.log(`\nℹ️  Dry-run sahaja. Jalankan --commit untuk reset.`);
    return;
  }
  if (!selamat && !force) {
    console.log(`\n❌ Dibatalkan — ada permohonan aktif. Guna \`--commit --force\` jika betul-betul mahu.`);
    process.exit(1);
  }
  await client.createIfNotExists({ _id: counterId, _type: "counter", seq: 0 });
  await client.patch(counterId).set({ seq: 0 }).commit();
  console.log(`\n✅ Kaunter ${counterId} direset ke seq=0. Permohonan seterusnya = PKB-${year}-0001.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
