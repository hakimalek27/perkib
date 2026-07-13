// Menjana src/content/pegawai.ts daripada CSV rasmi.
// Hanya medan SELAMAT-AWAM disertakan (tiada IC, telefon, foto).
// Jalankan: npm run gen:pegawai-fallback

import fs from "node:fs";
import path from "node:path";
import { loadPegawai } from "./lib/pegawai-data";

const records = loadPegawai();

const rows = records
  .map((p) => {
    const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `  { employeeNo: "${esc(p.employeeNo)}", nama: "${esc(p.nama)}", kategori: "${p.kategori}", jawatanPenuh: "${esc(p.jawatanPenuh)}", emelRasmi: "${esc(p.emelRasmi)}", gred: "${esc(p.gred)}" },`;
  })
  .join("\n");

const file = `// FALLBACK pegawai — dijana oleh scripts/gen-pegawai-fallback.ts daripada CSV rasmi.
// Hanya medan SELAMAT-AWAM (tiada IC, tiada telefon, tiada foto).
// Jalankan: npm run gen:pegawai-fallback
// Jumlah rekod: ${records.length}

export type KategoriPegawai = "ketua-imam" | "timbalan-ketua-imam" | "bilal";

export const kategoriLabel: Record<KategoriPegawai, string> = {
  "ketua-imam": "Ketua Imam",
  "timbalan-ketua-imam": "Timbalan Ketua Imam",
  bilal: "Bilal",
};

export type PegawaiPublic = {
  employeeNo: string;
  nama: string;
  kategori: KategoriPegawai;
  jawatanPenuh: string;
  emelRasmi: string;
  gred: string;
};

export const pegawaiFallback: PegawaiPublic[] = [
${rows}
];
`;

const outPath = path.resolve(process.cwd(), "src", "content", "pegawai.ts");
fs.writeFileSync(outPath, file, "utf8");
console.log(`✓ Dijana ${records.length} rekod pegawai → ${outPath}`);

const kira: Record<string, number> = {};
for (const p of records) kira[p.kategori] = (kira[p.kategori] ?? 0) + 1;
console.log("  Kategori:", kira);
const tanpaFoto = records.filter((p) => !p.photoPath).length;
console.log(`  Rekod tanpa foto dijumpai: ${tanpaFoto}`);
