// Seed 9 jenis saguhati ke Sanity. Idempotent (createOrReplace — data kanonik).
// Jalankan: npm run seed:jenis-saguhati

import { seedClient } from "./lib/sanity-client";
import { jenisSaguhatiList } from "../src/content/jenis-saguhati";

async function main() {
  const client = seedClient();
  const tx = client.transaction();

  for (const j of jenisSaguhatiList) {
    tx.createOrReplace({
      _id: j.id,
      _type: "jenisSaguhati",
      kod: j.kod,
      bil: j.bil,
      nama: j.nama,
      kadar: j.kadar,
      dokumenSokongan: j.dokumenSokongan,
      oneOff: j.oneOff,
      catatan: j.catatan ?? "",
      aktif: true,
    });
  }

  await tx.commit();
  console.log(`✓ Seed ${jenisSaguhatiList.length} jenis saguhati selesai.`);
}

main().catch((err) => {
  console.error("✗ Seed jenis saguhati gagal:", err.message);
  process.exit(1);
});
