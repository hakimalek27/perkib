// Padam KEKAL permohonan saguhati mengikut nombor rujukan (untuk data ujian).
// Dry-run (default): npx tsx scripts/purge-permohonan.ts --ref=PKB-2026-0002
// Padam sebenar:     npx tsx scripts/purge-permohonan.ts --ref=PKB-2026-0002 --commit
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const commit = process.argv.includes("--commit");
  const ref = process.argv.find((a) => a.startsWith("--ref="))?.split("=")[1];
  if (!ref) {
    console.error("Guna --ref=PKB-2026-XXXX");
    process.exit(1);
  }
  const client = seedClient();
  const docs = await client.fetch<
    { _id: string; nomborRujukan: string; namaPemohon: string; status: string; tarikhMohon: string }[]
  >(
    `*[_type=="permohonanSaguhati" && nomborRujukan==$ref && !(_id in path("drafts.**"))]{
       _id, nomborRujukan, namaPemohon, status, tarikhMohon
     }`,
    { ref }
  );
  console.log(`Padanan untuk ${ref}: ${docs.length}`);
  docs.forEach((d) => console.log(`  ${d._id} — ${d.namaPemohon} · ${d.status} · ${d.tarikhMohon}`));
  if (!docs.length) {
    console.log("Tiada rekod.");
    return;
  }
  if (!commit) {
    console.log("\nℹ️  Dry-run. Jalankan --commit untuk padam kekal.");
    return;
  }
  for (const d of docs) {
    await client.delete(d._id);
    console.log(`✅ Dipadam kekal: ${d._id} (${d.nomborRujukan})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
