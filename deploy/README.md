# Deployment PERKIB (v2) — panduan

> Domain & pelayan **belum diputuskan** (hasrat: `perkib.my`). Laman dibina untuk
> `output: "standalone"`. ⚠️ **JANGAN** deploy ke pelayan produksi kariah/mamkl.my
> (Tencent) — PERKIB perlukan pelayan/domain tersendiri.

## Prasyarat go-live
1. Pelayan (VPS Linux) + domain `perkib.my` + DNS.
2. Fail `.env` pengeluaran (lihat `production.env.example`) — termasuk **kunci enkripsi & kata laluan admin baharu**.
3. **Fail data staf terenkripsi** `private-data/staf-lain.enc.json` — pindah secara SELAMAT (scp), JANGAN commit.
4. Dataset Sanity `sk9lh0ym` — token Editor + (disyorkan) tetapkan dataset **private**.

## Langkah
1. **Build** di runner (bukan VPS kecil — elak OOM): `npm ci && npm run build`.
2. Assemble standalone: `.next/standalone/`, `.next/static/` → `.next/standalone/.next/static/`, `public/` → `.next/standalone/public/`.
3. Pindah `private-data/staf-lain.enc.json` ke pelayan (di luar direktori awam).
4. **systemd** jalankan `node server.js` (`PORT=3000`, `HOSTNAME=127.0.0.1`, `EnvironmentFile=/etc/perkib/.env`).
5. **nginx** vhost → `proxy_pass http://127.0.0.1:3000`; Certbot SSL + HSTS.
6. Sanity Manage: tambah CORS origin `https://perkib.my` (Allow credentials); webhook → `https://perkib.my/api/revalidate`.
7. Set `WASSAP_DRY_RUN=0` + tampal JID group di `/admin/notifikasi` bila sedia hantar WhatsApp sebenar.

## Env pengeluaran
Lihat `production.env.example`. JANGAN commit `.env` sebenar.

## Nota kritikal
- `NEXT_PUBLIC_SITE_URL=https://perkib.my` (origin guard borang, metadata, sitemap).
- **`DATA_ENCRYPTION_KEY` mesti SAMA** dengan yang mengenkripsi data — jika berbeza, IC/telefon/bank tidak boleh didekripsi. Simpan salinan selamat.
- `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SAGUHATI_TOKEN_SECRET` — rahsia kuat (`openssl rand -hex 32`).
- `STAF_PHOTO_DIR` — folder foto staf di pelayan (dihidang via route berdaftar admin sahaja).
- CSP dikuatkuasa dalam `next.config.ts` (aplikasi) — nginx boleh tambah HSTS.
