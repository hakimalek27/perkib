// Seed 8 zon + 89 masjid ke Sanity. Idempotent (createOrReplace — data kanonik).
// Jalankan: npm run seed:zon-masjid

import { seedClient } from "./lib/sanity-client";
import { zones, masjids } from "../src/content/zon-masjid";

async function main() {
  const client = seedClient();
  const tx = client.transaction();

  for (const z of zones) {
    tx.createOrReplace({
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
    tx.createOrReplace({
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

  await tx.commit();
  console.log(`✓ Seed ${zones.length} zon + ${masjids.length} masjid selesai.`);
}

main().catch((err) => {
  console.error("✗ Seed zon/masjid gagal:", err.message);
  process.exit(1);
});
