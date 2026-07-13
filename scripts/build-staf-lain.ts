// Bina fail data terenkripsi untuk direktori staf MAIWP lain (admin sahaja).
// Baca CSV rekod → normalkan → enkrip SATU blob → private-data/staf-lain.enc.json.
// Fail output GITIGNORED (mengandungi IC + telefon). Jalankan: npm run build:staf-lain

import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { parseCsv } from "./lib/csv";
import { formatName } from "./lib/pegawai-data";
import { encryptValue, isEncryptionConfigured } from "../src/lib/crypto";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const CSV_PATH =
  process.env.STAF_CSV_FILE ||
  "C:/MAIWP_Staff_Lain_2026-07-07/rekod_staff_lain_enriched.csv";

function titleCase(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_m, pre, ch) => pre + ch.toUpperCase());
}

type StafLain = {
  employeeNo: string;
  nama: string;
  noKp: string;
  emel: string;
  noTel: string;
  bahagian: string;
  gred: string;
  jawatan: string;
  tempatBertugas: string;
  statusPerjawatan: string;
  photoFile: string;
};

function main() {
  if (!isEncryptionConfigured()) {
    throw new Error("DATA_ENCRYPTION_KEY belum ditetapkan dalam .env.local.");
  }
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV staf lain tidak dijumpai: ${CSV_PATH}`);
  }
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const staf: StafLain[] = rows
    .filter((r) => (r.employee_no ?? "").trim() && (r.name ?? "").trim())
    .map((r) => {
      const gred = [r.gred_jawatan, r.gred_gaji].map((s) => (s ?? "").trim()).filter(Boolean).join("");
      return {
        employeeNo: (r.employee_no ?? "").trim().padStart(4, "0"),
        nama: formatName((r.name ?? "").trim()),
        noKp: (r.no_kp ?? "").replace(/\D/g, ""),
        emel: (r.emel ?? "").trim(),
        noTel: (r.no_tel ?? "").trim(),
        bahagian: titleCase(r.bahagian ?? ""),
        gred,
        jawatan: titleCase(r.jawatan_direktori ?? r.jawatan_api ?? ""),
        tempatBertugas: titleCase(r.tempat_bertugas ?? ""),
        statusPerjawatan: titleCase(r.status_perjawatan ?? ""),
        photoFile: (r.photo_file ?? "").trim(),
      };
    });

  // Nyah-duplikat ikut employeeNo (utamakan rekod dengan IC).
  const byEmp = new Map<string, StafLain>();
  for (const s of staf) {
    const prev = byEmp.get(s.employeeNo);
    if (!prev || (!prev.noKp && s.noKp)) byEmp.set(s.employeeNo, s);
  }
  const list = [...byEmp.values()].sort((a, b) => a.nama.localeCompare(b.nama));

  const enc = encryptValue(JSON.stringify(list));
  if (!enc) throw new Error("Enkripsi gagal.");

  const outDir = path.resolve(process.cwd(), "private-data");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "staf-lain.enc.json");
  fs.writeFileSync(outFile, JSON.stringify({ v: 1, count: list.length, data: enc }), "utf8");

  const adaKp = list.filter((s) => s.noKp).length;
  const adaFoto = list.filter((s) => s.photoFile).length;
  console.log(`✅ ${list.length} staf lain → ${outFile}`);
  console.log(`   Ada IC: ${adaKp} · Ada foto: ${adaFoto}`);
  console.log(`   Fail GITIGNORED (mengandungi IC + telefon). TIDAK di-commit.`);
}

try {
  main();
} catch (err) {
  console.error("✗ Build staf lain gagal:", (err as Error).message);
  process.exit(1);
}
