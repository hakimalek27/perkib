# Deployment PERKIB — stub

> Domain & pelayan belum diputuskan (hasrat: `perkib.org.my` / `perkib.my`).
> Laman ini dibina untuk `output: "standalone"` — sama corak dengan mamkl.my.

## Bila domain/pelayan disahkan

Ikut corak deploy mamkl.my (`C:\Projek Coding\Website Umum MAM\deploy\`):

1. **Build** di runner (bukan VPS 2 GB — elak OOM): `npm ci && npm run build`.
2. Assemble standalone: salin `.next/standalone`, `.next/static`, `public/`.
3. **nginx** vhost → `proxy_pass http://127.0.0.1:3000` (di belakang Cloudflare jika ada).
4. **systemd** unit jalankan `node server.js` (PORT=3000, HOSTNAME=127.0.0.1, EnvironmentFile=.env).
5. Certbot SSL, header keselamatan (CSP, HSTS).
6. Tambah CORS origin domain ke Sanity Manage (dengan credentials).
7. Tetapkan webhook Sanity → `https://<domain>/api/revalidate` (secret = `SANITY_REVALIDATE_SECRET`).

## Env pengeluaran

Lihat `production.env.example`. JANGAN commit `.env` sebenar.

## Nota

- `NEXT_PUBLIC_SITE_URL` mesti domain sebenar (untuk origin guard borang, metadata, sitemap).
- `ADMIN_PASSWORD` + `SAGUHATI_TOKEN_SECRET` mesti rahsia kuat (`openssl rand -hex 32`).
- `RESEND_API_KEY` sebenar + sahkan domain di Resend untuk `CONTACT_FROM_EMAIL` jenama.
