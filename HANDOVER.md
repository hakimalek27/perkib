# HANDOVER — Laman Rasmi PERKIB (`perkib-web`)

**Kemas kini:** 2026-07-13 · **Status:** ✅ SIAP SEPENUHNYA & diuji E2E dengan Sanity langsung.

## Sanity (sudah dikonfigurasi & diseed)
- **Project ID:** `sk9lh0ym` · **Dataset:** `production` · **Org:** `ocpnSc6ev` (Growth Trial)
- Token Editor `perkib-web-api` + CORS `http://localhost:3000` sudah ditetapkan dalam `.env.local`.
- Diseed: 8 zon · 89 masjid · 91 pegawai (+91 foto) · 24 AJK · 9 saguhati · program/FAQ/tetapan.
- `ADMIN_PASSWORD` (lihat `.env.local` setempat) → **TUKAR sebelum pengeluaran**.
- Studio `/studio` berfungsi (log masuk Google untuk urus). Assign 91 pegawai ke masjid dalam Studio bila sedia.
- Uji semula bila-bila: `npm run dev` → http://localhost:3000. Seed semula (jika perlu): `npm run seed:all`.

---
### (Rekod asal — langkah persediaan yang kini sudah selesai)

## Apa itu

Laman web rasmi **Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB)** — Next.js 16 + React 19 + Tailwind v4 + Sanity v5 (Studio terbenam `/studio`). Meniru seni bina `C:\Projek Coding\Website Umum MAM`.

Tema: biru dalam `#17457A` + emas `#C99A3E`, font Manrope + Marcellus. Nada megah & berwibawa.

## Yang SUDAH siap (kod + diuji dalam pelayar, mod fallback)

| Bahagian | Status |
|---|---|
| Scaffold + config (Next 16, TS, Tailwind v4, ESLint) | ✅ |
| Tema, Header (nav + menu mudah alih), Footer 3-lajur, PageHero, komponen UI | ✅ |
| 10 halaman statik: Profil, Perutusan, Visi/Misi, Program, Keahlian, Sukarelawan, Derma, Soalan Lazim, Hubungi (+borang) | ✅ |
| Skema Sanity (zon, masjid, pegawai, ajkEntry, jenisSaguhati, permohonanSaguhati, counter, program, faq, siteSettings) + Studio + `structure.ts` | ✅ |
| Gateway `lib/sanity.ts` dengan fallback statik (build lulus TANPA env) | ✅ |
| `/direktori-masjid` — 89 masjid, 8 zon, penapis + carian (diuji: Zon 8=16, cari "Mahmoodiah"=1 Zon 7, lencana Induk/Negeri) | ✅ |
| `/pegawai` — 91 pegawai, penapis zon/kategori (diuji: Bilal 28, Ketua Imam 31, Timbalan 32, Belum Ditugaskan 91; TIADA telefon/IC dipapar) | ✅ |
| `/ajk` — carta organisasi 3 lapis (24 AJK, Presiden ditonjol) | ✅ |
| `/saguhati` — 9 jenis + kadar + dokumen sokongan | ✅ |
| Wizard `/saguhati/mohon` (3 langkah), `/saguhati/semak`, API verify/submit/status (HMAC, rate-limit) | ✅ kod; aliran langsung perlu Sanity |
| Admin `/admin` (login guard, senarai, butiran, pautan Studio) | ✅ kod; perlu `ADMIN_PASSWORD` |
| Skrip seed (zon/masjid, pegawai+foto, jenis, content, ajk) | ✅ |
| `npm run lint` (0 ralat), `npm run build` (28 laluan, lulus mod fallback) | ✅ |
| E2E Chrome mod fallback (nav, homepage counter, direktori, pegawai, ajk, saguhati, mohon "belum aktif", admin redirect) | ✅ |

## Satu langkah pengguna yang tinggal (mengaktifkan Sanity)

Aliran saguhati sebenar (sahkan identiti guna 4-digit IC → hantar dokumen → rekod) memerlukan pangkalan data Sanity. Ini perlu **log masuk akaun Sanity anda** (saya tidak boleh autentikasi bagi pihak anda).

### Langkah (jalankan dalam terminal projek `perkib-web`):

```
# 1. Log masuk (pilih akaun Google/GitHub anda dalam pelayar)
npx sanity login

# 2. Cipta projek + dataset (ikut arahan; nama dataset: production)
npx sanity init --project-plan free
#   → pilih "Create new project", nama "PERKIB", dataset "production",
#     JANGAN tambah skema contoh (kita sudah ada).

# 3. Dapatkan token Editor:
#   Buka https://www.sanity.io/manage → projek PERKIB → API → Tokens →
#   Add token → nama "seed", role "Editor" → salin token.

# 4. Tambah CORS origin (untuk Studio /studio):
#   API → CORS Origins → Add → http://localhost:3000 → tick "Allow credentials".
```

### Isi `.env.local` (salin dari `.env.local.example`):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<project id dari langkah 2>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<token Editor dari langkah 3>
SANITY_WRITE_TOKEN=<boleh sama dgn di atas>
SAGUHATI_TOKEN_SECRET=<openssl rand -hex 32>
ADMIN_PASSWORD=<kata laluan admin pilihan anda>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=dev
```

### Seed data + jalankan:

```
npm run seed:all      # 8 zon, 89 masjid, 91 pegawai (+ foto), 9 jenis, 24 AJK, content
npm run dev           # buka http://localhost:3000
```

Selepas itu: `/pegawai` papar foto sebenar, `/saguhati/mohon` aktif, `/admin` boleh log masuk, `/studio` untuk urus (assign pegawai → masjid, tukar status permohonan).

## Nota / placeholder (admin isi kemudian)

- **Telefon pejabat**: brief hanya ada placeholder `03-0000 0000` → dibiarkan kosong (papar "akan dikemas kini"). Isi dalam Studio → Tetapan Laman.
- **Penugasan masjid pegawai**: semua 91 pegawai "Belum Ditugaskan". Admin assign dalam Studio (dokumen Pegawai → field "Masjid Bertugas").
- **Domain & deployment**: belum diputuskan (hasrat perkib.org.my). Folder `deploy/` sedia sebagai panduan.
- **Resend**: belum ada API key → borang hubungi mod log sahaja.

## Keselamatan / PDPA

- IC penuh TIDAK disimpan (hanya 4 digit akhir untuk pengesahan). Telefon pegawai TIDAK dipapar awam. Foto pegawai hanya dalam Sanity CDN (tidak dalam repo).
- Rate-limit pada verify/submit/status/contact/admin-login. Token HMAC 15 minit. Kuki admin ditandatangani.
- `.env.local` dalam `.gitignore` — JANGAN commit.
