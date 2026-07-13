// Seed 91 pegawai ke Sanity + muat naik foto rasmi.
// Mengekalkan penugasan masjid (field `masjid`) yang admin tetapkan — hanya
// medan lain dikemas kini pada seed semula. Foto dimuat naik sekali sahaja.
// Jalankan: npm run seed:pegawai

import fs from "node:fs";
import { seedClient } from "./lib/sanity-client";
import { loadPegawai } from "./lib/pegawai-data";

async function main() {
  const client = seedClient();
  const records = loadPegawai();

  // Rekod sedia ada — untuk elak muat naik foto berulang.
  const existing = await client.fetch<{ _id: string; hasGambar: boolean }[]>(
    `*[_type=="pegawai"]{ "_id": _id, "hasGambar": defined(gambar) }`
  );
  const hasGambar = new Map(existing.map((e) => [e._id, e.hasGambar]));

  let uploaded = 0;
  let idx = 0;
  for (const p of records) {
    idx++;
    const docId = `pegawai-${p.employeeNo}`;

    // Muat naik foto jika belum ada.
    let gambarRef: string | null = null;
    if (!hasGambar.get(docId) && p.photoPath && fs.existsSync(p.photoPath)) {
      const buffer = fs.readFileSync(p.photoPath);
      const filename = p.photoPath.split(/[\\/]/).pop() ?? `${p.employeeNo}.jpg`;
      const asset = await client.assets.upload("image", buffer, { filename });
      gambarRef = asset._id;
      uploaded++;
    }

    await client.createIfNotExists({
      _id: docId,
      _type: "pegawai",
      employeeNo: p.employeeNo,
    });

    const setFields: Record<string, unknown> = {
      employeeNo: p.employeeNo,
      nama: p.nama,
      kategori: p.kategori,
      jawatanPenuh: p.jawatanPenuh,
      emelRasmi: p.emelRasmi,
      telefon: p.telefon,
      icLast4: p.icLast4,
      gred: p.gred,
      bahagian: p.bahagian,
      statusPerjawatan: p.statusPerjawatan,
      statusAktif: p.statusAktif,
    };
    if (gambarRef) {
      setFields.gambar = { _type: "image", asset: { _type: "reference", _ref: gambarRef } };
    }

    await client.patch(docId).set(setFields).commit();
    if (idx % 20 === 0) console.log(`  … ${idx}/${records.length}`);
  }

  console.log(`✓ Seed ${records.length} pegawai selesai. Foto dimuat naik: ${uploaded}.`);
}

main().catch((err) => {
  console.error("✗ Seed pegawai gagal:", err.message);
  process.exit(1);
});
