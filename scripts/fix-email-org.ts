// Tukar emel ORGANISASI azanmalek@maiwp.gov.my → admin@perkib.my dalam Sanity live.
// Skop: dokumen FAQ (soalan lazim) + siteSettings.email. TIDAK menyentuh emel rasmi
// pegawai (emelRasmi rekod pegawai kekal). Selamat: hanya patch doc yang mengandungi emel lama.
// Jalankan: npx tsx scripts/fix-email-org.ts

import { seedClient } from "./lib/sanity-client";

const OLD = "azanmalek@maiwp.gov.my";
const NEW = "admin@perkib.my";

async function main() {
  const client = seedClient();
  let changes = 0;

  // 1. FAQ — soalan/jawapan yang mengandungi emel lama.
  const faqs = await client.fetch<{ _id: string; soalan?: string; jawapan?: string }[]>(
    `*[_type=="faq"]{ _id, soalan, jawapan }`
  );
  for (const f of faqs) {
    const patch: Record<string, string> = {};
    if (f.jawapan?.includes(OLD)) patch.jawapan = f.jawapan.split(OLD).join(NEW);
    if (f.soalan?.includes(OLD)) patch.soalan = f.soalan.split(OLD).join(NEW);
    if (Object.keys(patch).length) {
      await client.patch(f._id).set(patch).commit();
      console.log(`✏️  FAQ ${f._id}: emel dikemas kini → ${NEW}`);
      changes++;
    }
  }

  // 2. siteSettings.email (papar di footer + hubungi).
  const ss = await client.fetch<{ _id: string; email?: string } | null>(
    `*[_type=="siteSettings"][0]{ _id, email }`
  );
  if (ss?.email && ss.email.trim().toLowerCase() === OLD) {
    await client.patch(ss._id).set({ email: NEW }).commit();
    console.log(`✏️  siteSettings.email: ${OLD} → ${NEW}`);
    changes++;
  } else if (ss?.email) {
    console.log(`ℹ️  siteSettings.email sedia ada: ${ss.email} (bukan emel lama — tiada perubahan)`);
  } else {
    console.log(`ℹ️  siteSettings.email tidak diset — laman guna fallback admin@perkib.my`);
  }

  console.log(`\n✅ Selesai. ${changes} dokumen dikemas kini.`);
}

main().catch((err) => {
  console.error("✗ Gagal:", err.message);
  process.exit(1);
});
