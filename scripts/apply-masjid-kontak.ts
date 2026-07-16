// Patch kontak rasmi masjid (telefon/emel) ke Sanity dari scripts/data/masjid-kontak.json.
// _id EKSPLISIT (padanan disahkan manual). Additive-only: TIDAK tindih nilai yang
// sudah diisi dlm Studio. Validasi format telefon MY + emel.
//
// Dry-run (default): npx tsx scripts/apply-masjid-kontak.ts
// Tulis sebenar:      npx tsx scripts/apply-masjid-kontak.ts --commit
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { seedClient } from "./lib/sanity-client";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

type Kontak = { id: string; nama?: string; telefon?: string; emel?: string; sumber?: string };
type Doc = { _id: string; nama: string; telefon?: string; emel?: string };

// Telefon MY: 0 + 1-2 digit kod + 6-8 digit (ruang/sengkang dibenarkan utk paparan).
const TEL_RE = /^0\d{1,2}[-\s]?\d{3,4}[\s-]?\d{3,4}$/;
const EMEL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function main() {
  const commit = process.argv.includes("--commit");
  const file = path.resolve(process.cwd(), "scripts/data/masjid-kontak.json");
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as Kontak[];

  const client = seedClient();
  const ids = rows.map((r) => r.id);
  const docs = await client.fetch<Doc[]>(
    `*[_type=="masjid" && _id in $ids]{ _id, nama, telefon, emel }`,
    { ids }
  );
  const byId = new Map(docs.map((d) => [d._id, d]));

  console.log(`Mod: ${commit ? "COMMIT (tulis)" : "DRY-RUN (papar sahaja)"} · ${rows.length} kontak\n`);
  let ok = 0, skipAda = 0, hilang = 0, ditolak = 0, patched = 0;
  const masalah: string[] = [];

  for (const r of rows) {
    const d = byId.get(r.id);
    if (!d) {
      hilang++;
      masalah.push(`✗ ID TIADA: ${r.id}`);
      continue;
    }
    if (r.telefon && !TEL_RE.test(r.telefon)) {
      ditolak++;
      masalah.push(`✗ FORMAT TELEFON: ${d.nama} [${r.telefon}]`);
      continue;
    }
    if (r.emel && !EMEL_RE.test(r.emel)) {
      ditolak++;
      masalah.push(`✗ FORMAT EMEL: ${d.nama} [${r.emel}]`);
      continue;
    }
    // Additive-only: hanya set medan yg BELUM diisi dlm Studio.
    const patch: Record<string, string> = {};
    if (r.telefon && !d.telefon) patch.telefon = r.telefon;
    if (r.emel && !d.emel) patch.emel = r.emel;
    if (Object.keys(patch).length === 0) {
      skipAda++;
      console.log(`  ⏭  ${d.nama} — nilai sudah ada, dilangkau`);
      continue;
    }
    ok++;
    console.log(`  ✓ ${d.nama} ← ${Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(" · ")}`);
    if (commit) {
      await client.patch(r.id).set(patch).commit();
      patched++;
    }
  }

  console.log(`\nRingkasan: ${ok} sedia dipatch · ${skipAda} dilangkau (sudah ada) · ${ditolak} ditolak · ${hilang} id hilang.`);
  if (commit) console.log(`✅ ${patched} rekod DITULIS ke Sanity.`);
  else console.log(`ℹ️  Dry-run. Jalankan --commit untuk tulis.`);
  if (masalah.length) {
    console.log("\n⚠️  MASALAH:");
    masalah.forEach((m) => console.log("  " + m));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
