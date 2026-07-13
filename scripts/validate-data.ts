// Pengesahan kelengkapan data (tanpa Sanity) — buktikan tiada maklumat tertinggal
// SEBELUM seed. Semak kiraan, silang-rujuk AJK↔pegawai, foto, dan padanan.
// Jalankan: npx tsx scripts/validate-data.ts

import { zones, masjids } from "../src/content/zon-masjid";
import { ajkList } from "../src/content/ajk";
import { jenisSaguhatiList } from "../src/content/jenis-saguhati";
import { loadPegawai } from "./lib/pegawai-data";

let fail = 0;
const ok = (c: boolean, msg: string) => {
  console.log(`${c ? "✓" : "✗ GAGAL"} ${msg}`);
  if (!c) fail++;
};

console.log("=== ZON & MASJID ===");
ok(zones.length === 8, `Zon = ${zones.length} (jangka 8)`);
const perZon: Record<number, number> = {};
for (const m of masjids) perZon[m.zonNombor] = (perZon[m.zonNombor] ?? 0) + 1;
const jangkaZon: Record<number, number> = { 1: 10, 2: 9, 3: 10, 4: 12, 5: 16, 6: 15, 7: 1, 8: 16 };
for (const z of zones) ok(perZon[z.nombor] === jangkaZon[z.nombor], `Zon ${z.nombor}: ${perZon[z.nombor] ?? 0} masjid (jangka ${jangkaZon[z.nombor]})`);
ok(masjids.length === 89, `Jumlah masjid = ${masjids.length} (jangka 89)`);
ok(masjids.filter((m) => m.isInduk).length === 8, `Masjid induk = ${masjids.filter((m) => m.isInduk).length} (jangka 8, satu per zon)`);
ok(masjids.filter((m) => m.isNegeri).length === 2, `Masjid negeri = ${masjids.filter((m) => m.isNegeri).length} (Masjid Wilayah Persekutuan + Masjid Jamek An-Nur)`);
const idUnik = new Set(masjids.map((m) => m.id));
ok(idUnik.size === masjids.length, `ID masjid unik = ${idUnik.size}/${masjids.length}`);

console.log("\n=== PEGAWAI ===");
const pegawai = loadPegawai();
ok(pegawai.length === 91, `Jumlah pegawai = ${pegawai.length} (jangka 91)`);
const kira: Record<string, number> = {};
for (const p of pegawai) kira[p.kategori] = (kira[p.kategori] ?? 0) + 1;
ok(kira["ketua-imam"] === 31, `Ketua Imam = ${kira["ketua-imam"]} (jangka 31)`);
ok(kira["timbalan-ketua-imam"] === 32, `Timbalan Ketua Imam = ${kira["timbalan-ketua-imam"]} (jangka 32)`);
ok(kira["bilal"] === 28, `Bilal = ${kira["bilal"]} (jangka 28)`);
ok(pegawai.every((p) => /^\d{4}$/.test(p.employeeNo)), "Semua employeeNo 4 digit");
ok(pegawai.every((p) => /^\d{4}$/.test(p.icLast4)), "Semua icLast4 4 digit (untuk pengesahan saguhati)");
ok(pegawai.every((p) => p.photoPath), `Semua pegawai ada foto (tanpa foto: ${pegawai.filter((p) => !p.photoPath).length})`);
ok(pegawai.every((p) => p.emelRasmi.includes("@")), "Semua ada emel rasmi");
const empSet = new Set(pegawai.map((p) => p.employeeNo));
ok(empSet.size === pegawai.length, `employeeNo unik = ${empSet.size}/${pegawai.length}`);

console.log("\n=== AJK (silang-rujuk ke pegawai untuk foto) ===");
ok(ajkList.length === 24, `Jumlah AJK = ${ajkList.length} (jangka 24)`);
const grp: Record<string, number> = {};
for (const a of ajkList) grp[a.kumpulan] = (grp[a.kumpulan] ?? 0) + 1;
ok(grp["tertinggi"] === 8, `Majlis Tertinggi = ${grp["tertinggi"]} (jangka 8)`);
ok(grp["zon"] === 8, `Perwakilan Zon = ${grp["zon"]} (jangka 8)`);
ok(grp["kluster"] === 8, `AJK Kluster = ${grp["kluster"]} (jangka 8)`);
const tanpaPadanan = ajkList.filter((a) => !empSet.has(a.employeeNo));
ok(tanpaPadanan.length === 0, `AJK dipadan ke pegawai = ${ajkList.length - tanpaPadanan.length}/24 (foto akan terpapar)`);
if (tanpaPadanan.length > 0) for (const a of tanpaPadanan) console.log(`   ✗ ${a.nama} (${a.employeeNo}) — ${a.jawatan}`);
const adaPresiden = ajkList.some((a) => a.jawatan.toLowerCase() === "presiden");
ok(adaPresiden, "Ada Presiden (untuk perutusan + tonjolan carta)");

console.log("\n=== JENIS SAGUHATI ===");
ok(jenisSaguhatiList.length === 9, `Jenis saguhati = ${jenisSaguhatiList.length} (jangka 9)`);
ok(jenisSaguhatiList.every((j) => j.kadar > 0), "Semua ada kadar > 0");
ok(jenisSaguhatiList.every((j) => j.dokumenSokongan.length > 0), "Semua ada dokumen sokongan");
ok(new Set(jenisSaguhatiList.map((j) => j.kod)).size === 9, "Kod S1–S9 unik");

console.log(`\n=== KEPUTUSAN: ${fail === 0 ? "SEMUA LULUS — data lengkap, tiada tertinggal ✓" : `${fail} SEMAKAN GAGAL`} ===`);
process.exit(fail === 0 ? 0 : 1);
