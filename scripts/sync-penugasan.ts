// Sync penugasan pegawai (92) dari xlsx rasmi MAIWP ke Sanity + jana fallback.
//
// Sumber KANONIK: senarai_ketua_imam_timbalan_bilal_maiwp.xlsx,
//   sheet "Senarai Penuh Ikut Zon" (ZON, MASJID, NO PEKERJA, NAMA, NO KP,
//   EMEL, NO TEL, GRED, JAWATAN, JAWATAN API, NOTA).
//
// Tindakan:
//   1. Upsert semua zon (1–9) + masjid (termasuk baharu + Zon 9 Posting Khas).
//   2. Untuk 92 pegawai: cipta/patch doc pegawai, tetapkan masjid (via alias),
//      gred sebenar (S1/S5/S9), kategori, jawatan, emel, icLast4;
//      ENKRIP no. KP penuh + telefon (AES-256-GCM) → noKpEnc/telefonEnc;
//      UNSET medan telefon plain lama; muat naik foto (sekali).
//   3. Jana semula src/content/pegawai.ts (SELAMAT-AWAM: + penugasan masjid,
//      TANPA IC/telefon/foto).
//   4. Laporan padanan masjid + taburan kategori.
//
// Idempotent: boleh dijalankan berulang. Foto tidak dimuat naik semula jika ada.
// Jalankan: npm run sync:penugasan

import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { seedClient } from "./lib/sanity-client";
import { formatName } from "./lib/pegawai-data";
import { zones, masjids, type Masjid } from "../src/content/zon-masjid";
import { encryptValue, isEncryptionConfigured } from "../src/lib/crypto";

type Kategori = "ketua-imam" | "timbalan-ketua-imam" | "bilal";

const DATA_DIR = path.resolve(process.cwd(), "..", "MAIWP_Imam_Bilal_2026-07-07");
const XLSX_PATH = path.join(DATA_DIR, "senarai_ketua_imam_timbalan_bilal_maiwp.xlsx");
const IMAM_GAMBAR = path.join(DATA_DIR, "gambar");
const STAF_GAMBAR =
  process.env.STAF_PHOTO_DIR || "C:/MAIWP_Staff_Lain_2026-07-07/gambar";

// Alias: nama masjid dalam xlsx → nama kanonik dalam zon-masjid.ts.
const ALIAS: Record<string, string> = {
  "Masjid Al-Hidayah (Sentul Pasar)": "Masjid Al-Hidayah (Sentul)",
  "Masjid Saidina Ali KW (Padang Balang)": "Masjid Saidina Ali KW",
  "Masjid Asy-Syakirin (KLCC)": "Masjid Asy-Syakirin",
  "Masjid Muhammad Al-Fateh (Kem Wardieburn)": "Masjid Muhammad Al-Fateh",
  "Masjid Solehin (PLP Depoh / Pulapol)": "Masjid Solehin",
  "Masjid Al-Hidayah (Sg Penchala)": "Masjid Al-Hidayah",
  "Masjid Ar-Rahman (Pantai Baharu)": "Masjid Ar-Rahman",
  "Masjid At-Taqwa (TTDI)": "Masjid At-Taqwa",
  "Masjid Jamek Abdullah Hukum": "Masjid Jamek Abdullah Hukum Eco City",
  "Masjid Saidina Abu Bakar As-Siddiq (Bangsar)": "Masjid Saidina Abu Bakar As-Siddiq",
  "Masjid As-Sultan Abdullah": "Masjid Al-Sultan Abdullah",
};

type XRow = {
  zonNombor: number;
  masjidNamaXlsx: string;
  employeeNo: string;
  nama: string;
  noKp: string;
  emel: string;
  noTel: string;
  gred: string;
  jawatan: string;
  jawatanApi: string;
  nota: string;
};

function parseZon(zonText: string): number {
  if (/istana/i.test(zonText)) return 9;
  const m = /ZON\s*(\d)/i.exec(zonText);
  return m ? Number(m[1]) : 0;
}

function mapKategori(jawatan: string, gred: string): Kategori {
  const j = jawatan.toLowerCase();
  if (j.includes("bilal")) return "bilal";
  if (j.includes("timbalan")) return "timbalan-ketua-imam";
  if (j.includes("ketua imam")) return "ketua-imam";
  if (gred === "S1") return "bilal";
  const gredNum = parseInt(gred.replace(/\D/g, ""), 10);
  if (gredNum >= 9) return "ketua-imam"; // S9/S10 ke atas = Ketua Imam tetap
  return "timbalan-ketua-imam";
}

function titleCase(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_m, pre, ch) => pre + ch.toUpperCase());
}

async function parseXlsx(): Promise<XRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const ws = wb.getWorksheet("Senarai Penuh Ikut Zon");
  if (!ws) throw new Error('Sheet "Senarai Penuh Ikut Zon" tidak dijumpai.');
  const rows: XRow[] = [];
  ws.eachRow((row, rn) => {
    if (rn <= 5) return;
    const c = (n: number) => String(row.getCell(n).text ?? "").trim();
    const emp = c(5);
    if (!/^\d{3,4}$/.test(emp)) return;
    rows.push({
      zonNombor: parseZon(c(3)),
      masjidNamaXlsx: c(4),
      employeeNo: emp.padStart(4, "0"),
      nama: c(6),
      noKp: c(7).replace(/\D/g, ""),
      emel: c(8),
      noTel: c(9),
      gred: c(11),
      jawatan: c(12),
      jawatanApi: c(13),
      nota: c(14),
    });
  });
  return rows;
}

function buildPhotoIndex(): Map<string, string> {
  const map = new Map<string, string>();
  for (const dir of [IMAM_GAMBAR, STAF_GAMBAR]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      const m = file.match(/^(\d{3,4})\s*-/);
      if (m) {
        const key = m[1].padStart(4, "0");
        if (!map.has(key)) map.set(key, path.join(dir, file)); // imam/bilal diutamakan
      }
    }
  }
  return map;
}

// Resolusi masjid: (zon, namaXlsx) → id masjid kanonik.
function resolveMasjid(row: XRow, byKey: Map<string, Masjid>): Masjid | null {
  // Kes khas: 1712 "(Pindah ke MAIWP)" → Ibu Pejabat MAIWP (Zon 9).
  if (/^\(pindah/i.test(row.masjidNamaXlsx)) {
    return byKey.get(`9::Ibu Pejabat MAIWP`) ?? null;
  }
  const canonical = ALIAS[row.masjidNamaXlsx] ?? row.masjidNamaXlsx;
  return byKey.get(`${row.zonNombor}::${canonical}`) ?? null;
}

async function main() {
  if (!isEncryptionConfigured()) {
    throw new Error("DATA_ENCRYPTION_KEY belum ditetapkan dalam .env.local.");
  }
  const client = seedClient();
  const rows = await parseXlsx();
  console.log(`📄 Dibaca ${rows.length} pegawai dari xlsx.`);
  if (rows.length !== 92) console.warn(`⚠️  Jangka 92 pegawai, dapat ${rows.length}.`);

  // ── 1. Upsert zon + masjid (idempotent) ──
  const zonTx = client.transaction();
  for (const z of zones) {
    zonTx.createOrReplace({
      _id: z.id,
      _type: "zon",
      nombor: z.nombor,
      nama: z.nama,
      kawasan: z.kawasan,
      wilayah: z.wilayah,
      masjidInduk: z.masjidInduk,
    });
  }
  for (const m of masjids) {
    zonTx.createOrReplace({
      _id: m.id,
      _type: "masjid",
      nama: m.nama,
      lokasi: m.lokasi,
      isInduk: m.isInduk,
      isNegeri: m.isNegeri,
      jenisTempat: m.jenisTempat,
      zon: { _type: "reference", _ref: `zon-${m.zonNombor}` },
    });
  }
  await zonTx.commit();
  console.log(`🕌 Upsert ${zones.length} zon + ${masjids.length} masjid selesai.`);

  // ── 2. Sync pegawai ──
  const byKey = new Map<string, Masjid>();
  for (const m of masjids) byKey.set(`${m.zonNombor}::${m.nama}`, m);

  const photos = buildPhotoIndex();
  const existing = await client.fetch<{ _id: string; hasGambar: boolean }[]>(
    `*[_type=="pegawai"]{ "_id": _id, "hasGambar": defined(gambar) }`
  );
  const hasGambar = new Map(existing.map((e) => [e._id, e.hasGambar]));

  const unresolved: string[] = [];
  const noPhoto: string[] = [];
  const kataKira: Record<Kategori, number> = { "ketua-imam": 0, "timbalan-ketua-imam": 0, bilal: 0 };
  const fallbackRows: Array<{
    employeeNo: string;
    nama: string;
    kategori: Kategori;
    jawatanPenuh: string;
    emelRasmi: string;
    gred: string;
    masjidNama: string;
    masjidZonNombor: number;
    masjidZonNama: string;
  }> = [];

  let idx = 0;
  let uploaded = 0;
  for (const row of rows) {
    idx++;
    const docId = `pegawai-${row.employeeNo}`;
    const kategori = mapKategori(row.jawatan, row.gred);
    kataKira[kategori]++;
    const nama = formatName(row.nama);
    const jawatanPenuh = titleCase(row.jawatanApi || row.jawatan);
    const masjid = resolveMasjid(row, byKey);
    if (!masjid) unresolved.push(`${row.employeeNo} ${nama} → "${row.masjidNamaXlsx}" (Zon ${row.zonNombor})`);
    const zon = zones.find((z) => z.nombor === (masjid?.zonNombor ?? row.zonNombor));

    // Foto (sekali sahaja)
    let gambarRef: string | null = null;
    const photoPath = photos.get(row.employeeNo);
    if (!photoPath) noPhoto.push(`${row.employeeNo} ${nama}`);
    if (!hasGambar.get(docId) && photoPath && fs.existsSync(photoPath)) {
      const buffer = fs.readFileSync(photoPath);
      const filename = photoPath.split(/[\\/]/).pop() ?? `${row.employeeNo}.jpg`;
      const asset = await client.assets.upload("image", buffer, { filename });
      gambarRef = asset._id;
      uploaded++;
    }

    await client.createIfNotExists({ _id: docId, _type: "pegawai", employeeNo: row.employeeNo });

    const setFields: Record<string, unknown> = {
      employeeNo: row.employeeNo,
      nama,
      kategori,
      jawatanPenuh,
      emelRasmi: row.emel,
      gred: row.gred,
      icLast4: row.noKp.slice(-4),
      noKpEnc: encryptValue(row.noKp),
      telefonEnc: encryptValue(row.noTel),
      statusAktif: true,
    };
    if (masjid) setFields.masjid = { _type: "reference", _ref: masjid.id };
    if (gambarRef) setFields.gambar = { _type: "image", asset: { _type: "reference", _ref: gambarRef } };

    // Buang medan telefon plain lama (migrasi ke telefonEnc).
    await client.patch(docId).set(setFields).unset(["telefon"]).commit();

    fallbackRows.push({
      employeeNo: row.employeeNo,
      nama,
      kategori,
      jawatanPenuh,
      emelRasmi: row.emel,
      gred: row.gred,
      masjidNama: masjid?.nama ?? "",
      masjidZonNombor: masjid?.zonNombor ?? row.zonNombor,
      masjidZonNama: zon?.nama ?? `Zon ${row.zonNombor}`,
    });

    if (idx % 20 === 0) console.log(`  … ${idx}/${rows.length}`);
  }

  // ── 3. Jana fallback src/content/pegawai.ts ──
  writeFallback(fallbackRows);

  // ── 4. Laporan ──
  console.log(`\n✅ Sync ${rows.length} pegawai selesai. Foto dimuat naik: ${uploaded}.`);
  console.log(`   Kategori → Ketua Imam ${kataKira["ketua-imam"]}, Timbalan ${kataKira["timbalan-ketua-imam"]}, Bilal ${kataKira.bilal}`);
  if (noPhoto.length) console.log(`   ⚠️  Tiada foto (${noPhoto.length}): ${noPhoto.join("; ")}`);
  if (unresolved.length) {
    console.log(`\n   ❌ MASJID TIDAK DAPAT DIPADAN (${unresolved.length}):`);
    for (const u of unresolved) console.log(`      - ${u}`);
  } else {
    console.log(`   ✓ Semua 92 penugasan masjid berjaya dipadan.`);
  }
}

function writeFallback(rows: Array<{
  employeeNo: string; nama: string; kategori: Kategori; jawatanPenuh: string;
  emelRasmi: string; gred: string; masjidNama: string; masjidZonNombor: number; masjidZonNama: string;
}>) {
  const sorted = [...rows].sort((a, b) =>
    a.kategori.localeCompare(b.kategori) || a.nama.localeCompare(b.nama)
  );
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const lines = sorted.map((p) => {
    const parts = [
      `employeeNo: "${p.employeeNo}"`,
      `nama: "${esc(p.nama)}"`,
      `kategori: "${p.kategori}"`,
      `jawatanPenuh: "${esc(p.jawatanPenuh)}"`,
      `emelRasmi: "${esc(p.emelRasmi)}"`,
      `gred: "${esc(p.gred)}"`,
      `masjidNama: "${esc(p.masjidNama)}"`,
      `masjidZonNombor: ${p.masjidZonNombor}`,
      `masjidZonNama: "${esc(p.masjidZonNama)}"`,
    ];
    return `  { ${parts.join(", ")} },`;
  });
  const out = `// FALLBACK pegawai — dijana oleh scripts/sync-penugasan.ts daripada xlsx rasmi.
// Hanya medan SELAMAT-AWAM (tiada IC, tiada telefon, tiada foto) + penugasan masjid.
// Jalankan: npm run sync:penugasan
// Jumlah rekod: ${sorted.length}

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
  masjidNama?: string;
  masjidZonNombor?: number;
  masjidZonNama?: string;
};

export const pegawaiFallback: PegawaiPublic[] = [
${lines.join("\n")}
];
`;
  const target = path.resolve(process.cwd(), "src", "content", "pegawai.ts");
  fs.writeFileSync(target, out, "utf8");
  console.log(`📝 Jana semula src/content/pegawai.ts (${sorted.length} rekod).`);
}

main().catch((err) => {
  console.error("✗ Sync penugasan gagal:", err.message);
  process.exit(1);
});
