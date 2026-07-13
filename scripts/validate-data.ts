// Pengesahan kelengkapan data (tanpa Sanity) — buktikan tiada maklumat tertinggal.
// Menyemak fallback awam (src/content/*) yang menjadi sumber tunggal seed + render.
// Jalankan: npx tsx scripts/validate-data.ts  (atau: npm run validate:data)

import { zones, masjids, masjidsAwam } from "../src/content/zon-masjid";
import { pegawaiFallback } from "../src/content/pegawai";
import { ajkList } from "../src/content/ajk";
import { jenisSaguhatiList } from "../src/content/jenis-saguhati";

let fail = 0;
const ok = (c: boolean, msg: string) => {
  console.log(`${c ? "✓" : "✗ GAGAL"} ${msg}`);
  if (!c) fail++;
};

console.log("=== ZON & MASJID ===");
ok(zones.length === 9, `Zon = ${zones.length} (jangka 9: 8 JAWI + 1 Posting Khas)`);
const perZon: Record<number, number> = {};
for (const m of masjids) perZon[m.zonNombor] = (perZon[m.zonNombor] ?? 0) + 1;
const jangkaZon: Record<number, number> = { 1: 10, 2: 9, 3: 12, 4: 12, 5: 18, 6: 15, 7: 1, 8: 17, 9: 3 };
for (const z of zones) ok(perZon[z.nombor] === jangkaZon[z.nombor], `Zon ${z.nombor}: ${perZon[z.nombor] ?? 0} tempat (jangka ${jangkaZon[z.nombor]})`);
ok(masjids.length === 97, `Jumlah tempat = ${masjids.length} (jangka 97: 94 masjid + 3 Posting Khas)`);
ok(masjidsAwam.length === 94, `Masjid awam (Zon 1–8) = ${masjidsAwam.length} (jangka 94)`);
ok(masjids.filter((m) => m.isInduk).length === 9, `Masjid/tempat induk = ${masjids.filter((m) => m.isInduk).length} (jangka 9, satu per zon)`);
ok(masjids.filter((m) => m.isNegeri).length === 2, `Masjid negeri = ${masjids.filter((m) => m.isNegeri).length} (jangka 2)`);
ok(masjids.filter((m) => m.jenisTempat !== "masjid").length === 3, `Tempat bukan-masjid (surau/pejabat) = ${masjids.filter((m) => m.jenisTempat !== "masjid").length} (jangka 3)`);
const idUnik = new Set(masjids.map((m) => m.id));
ok(idUnik.size === masjids.length, `ID tempat unik = ${idUnik.size}/${masjids.length}`);

console.log("\n=== PEGAWAI (fallback awam, dari xlsx) ===");
ok(pegawaiFallback.length === 92, `Jumlah pegawai = ${pegawaiFallback.length} (jangka 92)`);
const kira: Record<string, number> = {};
for (const p of pegawaiFallback) kira[p.kategori] = (kira[p.kategori] ?? 0) + 1;
ok(kira["ketua-imam"] === 31, `Ketua Imam = ${kira["ketua-imam"]} (jangka 31)`);
ok(kira["timbalan-ketua-imam"] === 33, `Timbalan Ketua Imam = ${kira["timbalan-ketua-imam"]} (jangka 33)`);
ok(kira["bilal"] === 28, `Bilal = ${kira["bilal"]} (jangka 28)`);
ok(pegawaiFallback.every((p) => /^\d{4}$/.test(p.employeeNo)), "Semua employeeNo 4 digit");
ok(pegawaiFallback.every((p) => p.emelRasmi.includes("@")), "Semua ada emel rasmi");
ok(pegawaiFallback.every((p) => /^S\d/.test(p.gred)), "Semua gred format S1/S5/S9 (bukan 'S' sahaja)");
ok(pegawaiFallback.every((p) => Boolean(p.masjidNama)), `Semua pegawai ditugaskan masjid (tanpa masjid: ${pegawaiFallback.filter((p) => !p.masjidNama).length})`);
const empSet = new Set(pegawaiFallback.map((p) => p.employeeNo));
ok(empSet.size === pegawaiFallback.length, `employeeNo unik = ${empSet.size}/${pegawaiFallback.length}`);
ok(pegawaiFallback.some((p) => p.employeeNo === "1692"), "Anuar bin Mat Saad (1692) telah ditambah");
ok(pegawaiFallback.some((p) => p.masjidZonNombor === 9), "Ada pegawai Posting Khas (Zon 9)");
// TIADA IC/telefon dalam fallback awam (PDPA)
ok(!("noKp" in (pegawaiFallback[0] as object)) && !("telefon" in (pegawaiFallback[0] as object)), "Fallback awam TIADA medan IC/telefon");

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
