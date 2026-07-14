// Tambah SATU pegawai — Helmy bin Yahya (0033) — dari xlsx rasmi ke Sanity.
// Ketua Imam S10 TETAP, Masjid Al-Mubarakah (Zon 5). Enkrip IC/telefon (AES-256-GCM).
// Bersasar: HANYA sentuh doc pegawai-0033 (tidak menyentuh 92 rekod lain). Idempotent.
// Jalankan: npx tsx scripts/add-pegawai-helmy.ts

import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { seedClient } from "./lib/sanity-client";
import { formatName } from "./lib/pegawai-data";
import { masjids } from "../src/content/zon-masjid";
import { encryptValue, isEncryptionConfigured } from "../src/lib/crypto";

const DATA_DIR = path.resolve(process.cwd(), "..", "MAIWP_Imam_Bilal_2026-07-07");
const XLSX_PATH = path.join(DATA_DIR, "senarai_ketua_imam_timbalan_bilal_maiwp.xlsx");
const IMAM_GAMBAR = path.join(DATA_DIR, "gambar");
const STAF_GAMBAR = process.env.STAF_PHOTO_DIR || "C:/MAIWP_Staff_Lain_2026-07-07/gambar";
const TARGET_EMP = "0033";

function titleCase(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_m, pre, ch) => pre + ch.toUpperCase());
}

async function main() {
  if (!isEncryptionConfigured()) {
    throw new Error("DATA_ENCRYPTION_KEY belum ditetapkan dalam .env.local.");
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const ws = wb.getWorksheet("Senarai Penuh Ikut Zon");
  if (!ws) throw new Error('Sheet "Senarai Penuh Ikut Zon" tidak dijumpai.');
  const cell = (row: ExcelJS.Row, n: number) => String(row.getCell(n).text ?? "").trim();

  let target: ExcelJS.Row | null = null;
  ws.eachRow((row, rn) => {
    if (rn <= 5) return;
    if (cell(row, 5).padStart(4, "0") === TARGET_EMP) target = row;
  });
  if (!target) throw new Error(`Pegawai ${TARGET_EMP} tidak dijumpai dalam xlsx.`);
  const row = target as ExcelJS.Row;

  const emp = TARGET_EMP;
  const nama = formatName(cell(row, 6));
  const noKp = cell(row, 7).replace(/\D/g, "");
  const emel = cell(row, 8);
  const noTel = cell(row, 9);
  const gred = cell(row, 11);
  const jawatanApi = cell(row, 13) || cell(row, 12);
  const masjidNamaXlsx = cell(row, 4);

  const masjid =
    masjids.find((m) => m.zonNombor === 5 && m.nama === masjidNamaXlsx) ??
    masjids.find((m) => m.nama === masjidNamaXlsx);
  if (!masjid) throw new Error(`Masjid "${masjidNamaXlsx}" tidak dapat dipadan dalam zon-masjid.ts.`);

  const client = seedClient();
  const docId = `pegawai-${emp}`;

  // Foto (jika ada dalam folder imam/staf). Nama fail cth "33 - Helmy.jpg" atau "0033 - ...".
  let gambarRef: string | null = null;
  const existing = await client.fetch<{ has: boolean } | null>(
    `*[_id==$id][0]{ "has": defined(gambar) }`,
    { id: docId }
  );
  let photoPath: string | null = null;
  for (const dir of [IMAM_GAMBAR, STAF_GAMBAR]) {
    if (photoPath || !fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(/^(\d{1,4})\s*-/);
      if (m && m[1].padStart(4, "0") === emp) {
        photoPath = path.join(dir, f);
        break;
      }
    }
  }
  if (!existing?.has && photoPath && fs.existsSync(photoPath)) {
    const buffer = fs.readFileSync(photoPath);
    const filename = photoPath.split(/[\\/]/).pop() ?? `${emp}.jpg`;
    const asset = await client.assets.upload("image", buffer, { filename });
    gambarRef = asset._id;
  }

  await client.createIfNotExists({ _id: docId, _type: "pegawai", employeeNo: emp });

  const setFields: Record<string, unknown> = {
    employeeNo: emp,
    nama,
    kategori: "ketua-imam", // S10 = Ketua Imam TETAP (mengatasi mapKategori generik)
    jawatanPenuh: titleCase(jawatanApi),
    emelRasmi: emel,
    gred,
    icLast4: noKp.slice(-4),
    noKpEnc: encryptValue(noKp),
    telefonEnc: encryptValue(noTel),
    statusAktif: true,
    masjid: { _type: "reference", _ref: masjid.id },
  };
  if (gambarRef) {
    setFields.gambar = { _type: "image", asset: { _type: "reference", _ref: gambarRef } };
  }
  await client.patch(docId).set(setFields).unset(["telefon"]).commit();

  console.log(
    `✅ ${nama} (${emp}) — Ketua Imam ${gred}, ${masjid.nama} (Zon ${masjid.zonNombor}). ` +
      `Foto: ${gambarRef ? "dimuat naik" : existing?.has ? "kekal sedia ada" : "tiada (guna initials)"}. IC/telefon terenkripsi.`
  );
}

main().catch((err) => {
  console.error("✗ Gagal tambah Helmy:", err.message);
  process.exit(1);
});
