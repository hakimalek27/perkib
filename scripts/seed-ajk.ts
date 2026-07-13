// Seed 24 Ahli Jawatankuasa ke Sanity, dipautkan ke rekod pegawai (untuk foto).
// employeeNo dipetakan TEPAT dalam src/content/ajk.ts, jadi ref pegawai
// deterministik (`pegawai-<employeeNo>`) — tiada fuzzy matching diperlukan.
// Jalankan: npm run seed:ajk

import { seedClient } from "./lib/sanity-client";
import { ajkList } from "../src/content/ajk";

async function main() {
  const client = seedClient();

  // Sahkan setiap employeeNo mempunyai rekod pegawai (laporkan yang tiada).
  const empIds = ajkList.map((a) => `pegawai-${a.employeeNo}`);
  const wujud = await client.fetch<string[]>(`*[_id in $ids]._id`, { ids: empIds });
  const wujudSet = new Set(wujud);
  const tiada = ajkList.filter((a) => !wujudSet.has(`pegawai-${a.employeeNo}`));
  if (tiada.length > 0) {
    console.warn("⚠️  AJK tanpa padanan pegawai (foto tidak akan dipaparkan):");
    for (const a of tiada) console.warn(`   - ${a.nama} (No. Pekerja ${a.employeeNo}) — ${a.jawatan}`);
  }

  const tx = client.transaction();
  for (const a of ajkList) {
    const pegawaiExists = wujudSet.has(`pegawai-${a.employeeNo}`);
    tx.createOrReplace({
      _id: a.id,
      _type: "ajkEntry",
      nama: a.nama,
      jawatan: a.jawatan,
      kumpulan: a.kumpulan,
      order: a.order,
      sesi: a.sesi,
      employeeNo: a.employeeNo,
      ...(pegawaiExists
        ? { pegawai: { _type: "reference", _ref: `pegawai-${a.employeeNo}` } }
        : {}),
    });
  }
  await tx.commit();

  console.log(
    `✓ Seed ${ajkList.length} AJK selesai (${ajkList.length - tiada.length} berpaut ke pegawai).`
  );
}

main().catch((err) => {
  console.error("✗ Seed AJK gagal:", err.message);
  process.exit(1);
});
