// Seed program, FAQ, dan tetapan laman (siteSettings) ke Sanity.
// Program & FAQ: createOrReplace (kanonik). siteSettings: createIfNotExists
// supaya suntingan admin (telefon, QR) tidak ditimpa pada seed semula.
// Jalankan: npm run seed:content

import { seedClient } from "./lib/sanity-client";
import { programList } from "../src/content/program";
import { faqList } from "../src/content/faq";
import { siteInfo } from "../src/content/site";

async function main() {
  const client = seedClient();
  const tx = client.transaction();

  for (const p of programList) {
    tx.createOrReplace({
      _id: p.id,
      _type: "program",
      icon: p.icon,
      nama: p.nama,
      penerangan: p.penerangan,
      sasaran: p.sasaran,
      jadual: p.jadual,
      order: p.order,
    });
  }

  for (const f of faqList) {
    tx.createOrReplace({
      _id: f.id,
      _type: "faq",
      kategori: f.kategori,
      soalan: f.soalan,
      jawapan: f.jawapan,
      order: f.order,
    });
  }

  await tx.commit();

  // siteSettings — jangan timpa suntingan admin.
  await client.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    footerDescription:
      "Pertubuhan kebajikan bagi Naqib Masjid, Imam dan Bilal lantikan MAIWP yang berkhidmat di masjid-masjid Wilayah Persekutuan.",
    phone: siteInfo.phone,
    email: siteInfo.email,
    facebookUrl: siteInfo.facebook,
    bankInfo: {
      name: siteInfo.bank.name,
      account: siteInfo.bank.account,
      holder: siteInfo.bank.holder,
      duitNowRef: siteInfo.bank.duitNowRef,
    },
    officeHours: siteInfo.officeHours.map((h) => ({
      _key: h.day.replace(/\s+/g, "-").toLowerCase(),
      day: h.day,
      time: h.time,
    })),
  });

  console.log(
    `✓ Seed ${programList.length} program + ${faqList.length} FAQ + tetapan laman selesai.`
  );
}

main().catch((err) => {
  console.error("✗ Seed content gagal:", err.message);
  process.exit(1);
});
