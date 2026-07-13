// Memuatkan + menormalkan rekod pegawai daripada CSV rasmi MAIWP.
// Digunakan oleh seed-pegawai.ts, seed-ajk.ts dan gen-pegawai-fallback.ts.

import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csv";

// Folder data sumber (di luar projek): C:\Projek Coding\Perkib\MAIWP_Imam_Bilal_2026-07-07
export const DATA_DIR = path.resolve(process.cwd(), "..", "MAIWP_Imam_Bilal_2026-07-07");
export const CSV_PATH = path.join(DATA_DIR, "rekod_ketua_imam_timbalan_bilal_enriched.csv");
export const GAMBAR_DIR = path.join(DATA_DIR, "gambar");

export type KategoriPegawai = "ketua-imam" | "timbalan-ketua-imam" | "bilal";

export type PegawaiRecord = {
  employeeNo: string;
  nama: string;
  namaRaw: string;
  kategori: KategoriPegawai;
  jawatanPenuh: string;
  emelRasmi: string;
  telefon: string;
  icLast4: string;
  gred: string;
  bahagian: string;
  statusPerjawatan: string;
  statusAktif: boolean;
  photoPath: string | null;
};

const LOWER_PARTICLES = new Set(["bin", "binti", "al"]);

export function formatName(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  return cleaned
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (word === "@") return "@";
      if (LOWER_PARTICLES.has(lower)) return lower;
      return word
        .split("-")
        .map((part) =>
          part.length === 0
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-");
    })
    .join(" ");
}

function titleCasePlain(raw: string): string {
  // Huruf kecil dahulu, kemudian besarkan huruf pertama setiap perkataan
  // (termasuk selepas "(" ), cth "ISLAM (KETUA IMAM)" -> "Islam (Ketua Imam)".
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_m, pre, ch) => pre + ch.toUpperCase());
}

function mapKategori(category: string): KategoriPegawai {
  const c = category.trim().toLowerCase();
  if (c === "ketua imam") return "ketua-imam";
  if (c === "timbalan ketua imam") return "timbalan-ketua-imam";
  return "bilal";
}

let _photoIndex: Map<string, string> | null = null;
function photoIndex(): Map<string, string> {
  if (_photoIndex) return _photoIndex;
  const map = new Map<string, string>();
  if (fs.existsSync(GAMBAR_DIR)) {
    for (const file of fs.readdirSync(GAMBAR_DIR)) {
      const m = file.match(/^(\d{3,4})\s*-/);
      if (m) {
        // padkan ke 4 digit supaya sepadan dengan employeeNo
        map.set(m[1].padStart(4, "0"), path.join(GAMBAR_DIR, file));
      }
    }
  }
  _photoIndex = map;
  return map;
}

export function loadPegawai(): PegawaiRecord[] {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV tidak dijumpai: ${CSV_PATH}`);
  }
  const text = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(text);
  const photos = photoIndex();

  return rows.map((r) => {
    const employeeNo = (r.employee_no ?? "").trim().padStart(4, "0");
    const namaRaw = (r.name ?? "").trim();
    const icDigits = (r.no_kp ?? "").replace(/\D/g, "");
    return {
      employeeNo,
      nama: formatName(namaRaw),
      namaRaw,
      kategori: mapKategori(r.category ?? r.job ?? ""),
      jawatanPenuh: titleCasePlain(r.api_jawatan ?? r.job ?? ""),
      emelRasmi: (r.emel ?? "").trim(),
      telefon: (r.no_tel ?? "").trim(),
      icLast4: icDigits.slice(-4),
      gred: (r.gred_jawatan ?? "").trim(),
      bahagian: titleCasePlain(r.bahagian ?? ""),
      statusPerjawatan: titleCasePlain(r.status_perjawatan ?? ""),
      statusAktif: (r.status_aktif ?? "").trim() === "1",
      photoPath: photos.get(employeeNo) ?? null,
    };
  });
}
