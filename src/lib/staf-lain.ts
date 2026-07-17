// Direktori staf MAIWP lain (1,122) — AKSES ADMIN SAHAJA.
// Data (termasuk IC penuh + telefon) disimpan sebagai SATU blob terenkripsi
// di private-data/staf-lain.enc.json (gitignored, TIDAK dalam repo/Sanity).
// Dimuat + didekripsi sekali ke memori proses. Server-only.

import fs from "node:fs";
import path from "node:path";
import { decryptValue } from "./crypto";
import { matchAllTerms } from "./search-text";

export type StafLain = {
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

type EncFile = { v: number; count: number; data: string };

let _cache: StafLain[] | null = null;
let _loaded = false;

function dataFilePath(): string {
  const rel = process.env.STAF_DATA_FILE || "private-data/staf-lain.enc.json";
  return path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
}

/** Muat + dekripsi (sekali). Kembalikan [] jika fail/kunci tiada. */
export function loadStafLain(): StafLain[] {
  if (_loaded) return _cache ?? [];
  _loaded = true;
  try {
    const file = dataFilePath();
    if (!fs.existsSync(file)) {
      console.warn(`staf-lain: fail data tidak dijumpai (${file}).`);
      _cache = [];
      return _cache;
    }
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as EncFile;
    const json = decryptValue(raw.data);
    if (!json) {
      console.error("staf-lain: dekripsi gagal (semak DATA_ENCRYPTION_KEY).");
      _cache = [];
      return _cache;
    }
    _cache = JSON.parse(json) as StafLain[];
    return _cache;
  } catch (err) {
    console.error("staf-lain: gagal memuat", err);
    _cache = [];
    return _cache;
  }
}

export function isStafLainReady(): boolean {
  return loadStafLain().length > 0;
}

export type StafLainSearchResult = {
  results: StafLain[];
  total: number;
};

/** Cari staf ikut nama, no. pekerja, IC, telefon atau emel. Kosong = senarai terhad. */
export function searchStafLain(query: string, limit = 50): StafLainSearchResult {
  const all = loadStafLain();
  if (!query.trim()) return { results: all.slice(0, limit), total: all.length };
  const matched = all.filter((s) =>
    matchAllTerms(
      query,
      `${s.nama} ${s.employeeNo} ${s.jawatan} ${s.bahagian} ${s.emel}`,
      `${s.noTel} ${s.noKp} ${s.employeeNo}`
    )
  );
  return { results: matched.slice(0, limit), total: matched.length };
}

export function getStafLain(employeeNo: string): StafLain | null {
  const emp = employeeNo.trim();
  return loadStafLain().find((s) => s.employeeNo === emp) ?? null;
}

export function stafLainCount(): number {
  return loadStafLain().length;
}
