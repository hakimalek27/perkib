// Ujian integrasi WhatsApp group + tetapkan sasaran notifikasi admin.
//
// JID group (dari DB wassap.wehdah.my, jadual wa_groups):
//   SANTAI IMAM BILAL MAIWP = 60132059508-1547626247@g.us (110 ahli)
//   JAWATANKUASA PERKIB     = 60165506736-1581771315@g.us (24 ahli)
//
// Guna:
//   npx tsx scripts/wa-setup.ts                 → PRATONTON sahaja (dry-run, tiada mesej/simpan)
//   npx tsx scripts/wa-setup.ts --send          → HANTAR mesej ujian sebenar ke 2 group
//   npx tsx scripts/wa-setup.ts --set-target    → tambah JAWATANKUASA PERKIB sbg sasaran noti admin
//   npx tsx scripts/wa-setup.ts --clear-target  → buang sasaran JK PERKIB (elak cooldown lata)
//
// PENTING: Nombor penghantar bagi kunci "Perkib.my" (tenant masjid_id 9 = "PERKIB NOTI MAM",
// 6019xxx) MESTI menjadi AHLI group sasaran dahulu — jika tidak, hantar gagal (HTTP 500) dan
// mencetuskan cooldown yang turut menjejaskan notifikasi pemohon individu. Jadi JANGAN
// --set-target sehingga nombor itu ditambah ke group. Sasaran akhir = JK PERKIB sahaja.
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "node:path";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const GROUPS = {
  santai: { label: "SANTAI IMAM BILAL MAIWP", to: "60132059508-1547626247@g.us" },
  jk: { label: "JAWATANKUASA PERKIB", to: "60165506736-1581771315@g.us" },
};

const MESEJ_UJIAN =
  "🔔 *Ujian Sistem PERKIB*\n\n" +
  "Mesej ini ialah ujian integrasi notifikasi WhatsApp bagi sistem permohonan saguhati PERKIB. " +
  "Tiada tindakan diperlukan — sila *ABAIKAN* mesej ini.\n\n" +
  "Terima kasih 🙏\n— Urus Setia PERKIB";

async function main() {
  const send = process.argv.includes("--send");

  // Import LAZY selepas env dimuat (whatsapp/notifikasi baca env dalam fungsi).
  const { dispatchWhatsApp } = await import("../src/lib/whatsapp");
  const { getNotifConfig, saveNotifConfig } = await import("../src/lib/notifikasi");

  console.log("=".repeat(60));
  console.log(send ? "MOD: HANTAR SEBENAR (--send)" : "MOD: PRATONTON (dry-run — tiada mesej dihantar)");
  console.log("=".repeat(60));
  console.log("\nMesej ujian:\n" + MESEJ_UJIAN + "\n");

  if (send) {
    // Override DRY_RUN untuk benar-benar hantar (biar .env.local kekal =1 utk dev).
    process.env.WASSAP_DRY_RUN = "0";
    if (!process.env.WASSAP_API_KEY) {
      console.error("❌ WASSAP_API_KEY tidak ditetapkan dalam .env.local — batal.");
      process.exit(1);
    }
  } else {
    process.env.WASSAP_DRY_RUN = "1";
  }

  // 1) Hantar ke kedua-dua group.
  for (const g of [GROUPS.santai, GROUPS.jk]) {
    process.stdout.write(`→ ${g.label} (${g.to}) … `);
    const res = await dispatchWhatsApp({
      to: g.to,
      message: MESEJ_UJIAN,
      peristiwa: "ujian-sistem",
    });
    console.log(res.status.toUpperCase() + (res.error ? ` — ${res.error}` : ""));
  }

  // 2) Urus sasaran notifikasi admin (opt-in — hanya bila --set-target / --clear-target).
  const setTarget = process.argv.includes("--set-target");
  const clearTarget = process.argv.includes("--clear-target");
  console.log("\n— Tetapan sasaran notifikasi admin —");
  const cfg = await getNotifConfig();
  console.log("Sasaran semasa:", cfg.targets.length ? cfg.targets.map((t) => t.label).join(", ") : "(tiada)");

  if (clearTarget) {
    const before = cfg.targets.length;
    cfg.targets = cfg.targets.filter((t) => t.to !== GROUPS.jk.to);
    if (cfg.targets.length !== before) {
      await saveNotifConfig(cfg);
      console.log(`✓ Dibuang "${GROUPS.jk.label}" dari sasaran + disimpan.`);
    } else {
      console.log(`✓ "${GROUPS.jk.label}" tiada dalam sasaran — tiada perubahan.`);
    }
  } else if (setTarget) {
    if (cfg.targets.some((t) => t.to === GROUPS.jk.to)) {
      console.log(`✓ "${GROUPS.jk.label}" sudah menjadi sasaran — tiada perubahan.`);
    } else {
      cfg.targets.push({ label: GROUPS.jk.label, to: GROUPS.jk.to });
      await saveNotifConfig(cfg);
      console.log(`✓ Ditambah "${GROUPS.jk.label}" sebagai sasaran + disimpan.`);
    }
  } else {
    console.log("(tiada --set-target / --clear-target — sasaran tidak diubah)");
  }

  console.log("\nSelesai.");
}

main().catch((err) => {
  console.error("Ralat:", err);
  process.exit(1);
});
