/* Jana poster (bingkai pertama) untuk setiap video slaid deck.
   Guna Chrome sebenar (channel:"chrome") kerana Chromium bundle Playwright
   tiada dekoder H.264. Jika Chrome tiada → skrip keluar dengan mesej, deck
   tetap berfungsi (preload="metadata" papar bingkai pertama pada kebanyakan browser).

   Jalankan: node scripts/gen-video-posters.mjs   (dev server mesti hidup di :3000) */
import { chromium } from "playwright";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = "public/slide/sembelihan-2026/video";
const OUT = join(DIR, "poster");
const BASE = process.env.BASE || "http://localhost:3000";

const fail = readdirSync(DIR).filter((f) => f.endsWith(".mp4")).sort();
if (!fail.length) {
  console.error("Tiada video dijumpai.");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  console.error("⚠️  Chrome tidak dijumpai — poster dilangkau (deck tetap berfungsi).");
  process.exit(0);
}

const page = await browser.newPage();
await page.goto(`${BASE}/slide/sembelihan-2026`, { waitUntil: "domcontentloaded" });

for (const f of fail) {
  const url = `${BASE}/slide/sembelihan-2026/video/${f}`;
  const dataUrl = await page.evaluate(async (src) => {
    const v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    document.body.appendChild(v);
    try {
      await new Promise((res, rej) => {
        v.onloadeddata = res;
        v.onerror = () => rej(new Error("gagal muat"));
        setTimeout(() => rej(new Error("timeout")), 25000);
      });
      // Ambil bingkai ~0.5s (elak bingkai hitam permulaan)
      await new Promise((res) => {
        v.onseeked = res;
        v.currentTime = Math.min(0.5, (v.duration || 1) / 2);
        setTimeout(res, 6000);
      });
      const c = document.createElement("canvas");
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext("2d").drawImage(v, 0, 0);
      return c.toDataURL("image/png");
    } finally {
      v.remove();
    }
  }, url).catch((e) => {
    console.error(`  ✗ ${f}: ${e.message}`);
    return null;
  });

  if (!dataUrl) continue;
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  const nama = f.replace(/\.mp4$/, ".webp");
  await sharp(buf).webp({ quality: 72 }).toFile(join(OUT, nama));
  console.log(`  ✓ ${nama}`);
}

await browser.close();
console.log("Selesai.");
