<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PERKIB — Laman Rasmi

Laman rasmi Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB). Stack: Next.js 16 + React 19 + Tailwind v4 + Sanity v5 (Studio terbenam `/studio`).

## Perintah
- `npm run dev` — pelayan pembangunan
- `npm run build` — bina pengeluaran (mesti lulus TANPA env Sanity juga — fallback `src/content/*`)
- `npm run lint`
- `npm run seed:all` — seed semua data ke Sanity (perlu `.env.local`)

## Peraturan kandungan
- Seluruh UI **Bahasa Melayu Malaysia** baku.
- JANGAN jana teks Arab sendiri (ayat/hadith/doa) — guna aset rasmi sahaja.
- Kekalkan ejaan nama khas & singkatan rasmi huruf demi huruf: PERKIB, MAIWP, Bank Rakyat, DuitNow QR.
- IC penuh TIDAK disimpan (hanya 4 digit akhir untuk pengesahan saguhati). Telefon pegawai TIDAK dipapar awam.
