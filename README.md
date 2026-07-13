# PERKIB — Laman Web Rasmi

Laman web rasmi **Pertubuhan Kebajikan Imam dan Bilal Majlis Agama Islam Wilayah Persekutuan (PERKIB)** — pertubuhan kebajikan bagi Naqib Masjid, Imam dan Bilal lantikan MAIWP yang berkhidmat di masjid-masjid Wilayah Persekutuan.

> No. Pendaftaran ROS: **PPM-013-14-08022021** · Ditubuhkan **2021** · Di bawah naungan **MAIWP**

## ✨ Ciri Utama

- **Halaman organisasi penuh** — Profil & makna logo, Perutusan Presiden, Visi & Misi, Program, Keahlian, Sukarelawan, Soalan Lazim, Hubungi.
- **Carta Organisasi AJK** — 3 lapis (Majlis Tertinggi, Perwakilan Zon, AJK Kluster), 24 ahli sesi 2025/2026.
- **Direktori Masjid** — 89 masjid Wilayah Persekutuan mengikut **8 zon rasmi JAWI** (KL, Putrajaya, Labuan), dengan penapis + carian + lencana Masjid Induk/Negeri.
- **Maklumat Pegawai** — 91 pegawai (Ketua Imam, Timbalan Ketua Imam, Bilal) mengikut zon; admin tetapkan penugasan masjid melalui Studio. Paparan awam patuh PDPA (tiada telefon/IC).
- **Sistem Permohonan Saguhati** — 9 jenis saguhati kebajikan. Ahli sahkan identiti (No. Pekerja + 4 digit akhir IC) → pilih jenis → muat naik dokumen sokongan → terima nombor rujukan. Semak status dalam talian. Panel admin untuk urus permohonan.

## 🧱 Teknologi

- **Next.js 16** (App Router, output standalone) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme`)
- **Sanity v5** — CMS + Studio terbenam di `/studio`
- **framer-motion** (animasi), **react-hook-form + zod** (borang), **Resend** (emel)
- Tema: biru dalam `#17457A` + emas `#C99A3E`; font **Manrope** (body) + **Marcellus** (display)

## 🚀 Persediaan

```bash
npm install
cp .env.local.example .env.local   # isi nilai Sanity + rahsia
npm run dev                         # http://localhost:3000
```

Laman berfungsi **tanpa Sanity** juga (fallback statik dalam `src/content/*`) — `npm run build` lulus tanpa env.

### Sanity (untuk data langsung + Studio + saguhati)

1. Cipta projek di [sanity.io/manage](https://www.sanity.io/manage), dataset `production`.
2. Jana token **Editor** (API → Tokens) dan daftar CORS `http://localhost:3000` (Allow credentials).
3. Isi `.env.local` (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_API_TOKEN`, dll.).
4. Seed data: `npm run seed:all`

## 📂 Struktur

```
src/app/          Laluan (BM): /, /profil, /ajk, /direktori-masjid, /pegawai,
                  /saguhati/{mohon,semak}, /admin, /studio, /api/*
src/components/   layout, sections, ajk, pegawai, ui
src/content/      Data fallback statik (sumber tunggal seed + fallback)
src/lib/          sanity gateway, rate-limit, HMAC token, admin-auth, ref-number
sanity/           schemas + structure Studio
scripts/          seed-* (zon/masjid, pegawai+foto, jenis, content, ajk)
deploy/           panduan deployment (stub)
```

## 🔐 Keselamatan & PDPA

- IC penuh **tidak disimpan** (hanya 4 digit akhir untuk pengesahan). Telefon pegawai **tidak dipapar awam**.
- Had kadar pada verify/submit/status/contact/admin-login; token HMAC 15 minit; kuki admin ditandatangani.
- **JANGAN commit** `.env.local` (token/rahsia).

## 📜 Lesen & Hak Cipta

© 2026 Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB). Semua hak terpelihara.

---

Lihat [`JOURNEY.md`](JOURNEY.md) untuk sejarah pembinaan & [`HANDOVER.md`](HANDOVER.md) untuk status operasi.
