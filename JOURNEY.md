# Perjalanan Pembinaan — Laman Web PERKIB

> Rekod sejarah & perjalanan pembangunan laman web rasmi PERKIB, dibina dengan Claude Code.
> Tarikh: 12–13 Julai 2026.

## Ringkasan

Laman web rasmi PERKIB dibina dari kosong dalam satu sesi pembangunan berpandu, meniru seni bina laman rasmi Masjid Al-Muttaqin Wangsa Melawati (mamkl.my) — Next.js 16 + React 19 + Tailwind v4 + Sanity v5. Ia menggabungkan halaman organisasi lengkap, direktori masjid mengikut 8 zon JAWI, direktori 91 pegawai, dan **sistem permohonan saguhati berfungsi penuh** (rujukan: maiwp.io/bkpm).

## Sumber data

- `BRIEF-PERKIB.md` — profil, visi/misi, moto, perutusan, 24 AJK, 4 program, 4 kategori derma, bank, FAQ, alamat, design tokens.
- `MAKLUMAN SAGUHATI.pdf` — 9 jenis saguhati + kadar + dokumen sokongan.
- `Senarai Masjid.txt` — 8 zon JAWI, 89 masjid (KL 72 + Putrajaya 1 + Labuan 16), masjid induk & negeri.
- `rekod_ketua_imam_timbalan_bilal_enriched.csv` + `gambar/` — 91 pegawai + 91 foto rasmi.
- `PERLEMBAGAAN PERKIB.pdf` — makna logo & warna, syarat keahlian, bidang tugas.
- Poster carta organisasi, poster Bank Rakyat, DuitNow QR.

## Keputusan reka bentuk yang disahkan pengguna

1. Pengesahan pemohon saguhati: **No. Pekerja + 4 digit akhir IC** (bukan no. pekerja sahaja) — lebih selamat PDPA.
2. Paparan awam pegawai: nama + jawatan + foto + masjid/zon + emel rasmi. **TIADA** telefon/IC.
3. Admin: **Sanity Studio + halaman `/admin`** berkata laluan.
4. Hosting awal: localhost; deployment kemudian.

## 14 Milestone

| # | Milestone | Hasil |
|---|---|---|
| M1 | Scaffold (Next 16, TS, Tailwind v4, ESLint) | ✓ |
| M2 | Tema PERKIB, fonts, Header/Footer/PageHero, komponen UI | ✓ |
| M3 | 10 halaman statik + content fallback + api/contact | ✓ |
| M4 | Skema Sanity + Studio + gateway `lib/sanity.ts` (fallback) | ✓ |
| M5 | Cipta projek Sanity + isi `.env.local` | ✓ |
| M6 | Seed: 8 zon, 89 masjid, 91 pegawai+foto, 24 AJK, 9 saguhati | ✓ |
| M7 | `/direktori-masjid` + `/pegawai` (penapis klien) | ✓ |
| M8 | `/ajk` carta organisasi 3 lapis | ✓ |
| M9 | `/saguhati` info + API verify + token HMAC | ✓ |
| M10 | Wizard mohon 3-langkah + submit + semak status | ✓ |
| M11 | Admin (login, guard, senarai, butiran) | ✓ |
| M12 | Polish (animasi, responsif, metadata, deploy stub) | ✓ |
| M13 | Verifikasi statik: lint 0 ralat, build 2× (fallback + env) | ✓ |
| M14 | E2E penuh dengan Chrome MCP | ✓ |

## Cabaran & penyelesaian

- **Next.js 16 breaking changes** — `params`/`searchParams` = Promise, `cookies()`/`headers()` async, `revalidateTag(tag,"max")`. Elak middleware; guard admin dalam `admin/layout.tsx` + per-halaman.
- **Bug header** — teks navigasi guna warna gelap yang tidak kelihatan atas hero gelap. Dibaiki: teks bertukar cerah bila belum skrol / laluan admin.
- **Muat naik fail Sanity dari server** — `client.assets.upload("file", buffer)` → rujukan dalam array `dokumen`.
- **No. rujukan tanpa race** — dokumen kaunter Sanity + `patch().inc()` (mutasi diserialize per dokumen); fallback `PKB-<tahun>-T<base36>` supaya permohonan tidak pernah hilang.
- **Padanan AJK↔pegawai** — `employeeNo` dipeta TEPAT dalam `content/ajk.ts` (dari nama fail foto), jadi ref pegawai deterministik tanpa fuzzy matching. 24/24 dipadan.
- **Token Sanity** — dicipta melalui dashboard (aliran UI), nilai penuh (180 aksara) dibaca dari clipboard terus ke `.env.local` tanpa dedah. CORS `localhost:3000` didaftar via "Add development host" supaya Studio berfungsi.

## Ujian E2E (Chrome MCP, data Sanity sebenar)

- Navigasi semua halaman, homepage counter beranimasi (91·8·89·24).
- Direktori: tapis Zon 8 → tepat 16 masjid; cari "Mahmoodiah" → 1 (Zon 7); lencana Induk/Negeri.
- Pegawai: 91 dengan foto sebenar; kategori 31/32/28; **tiada telefon/IC dipapar**.
- AJK: 24 ahli, 3 lapis, Presiden ditonjol.
- **Aliran saguhati penuh:** verify `1991`+`5053` → "Abdul Hanif bin Abdul Latif" → hantar + PDF → **No. Rujukan `PKB-2026-0001`** (PDF ke Sanity CDN) → semak status "Baru Diterima" → admin senarai + butiran + pautan dokumen.
- **Assign pegawai → masjid:** Belum Ditugaskan 91→90; pegawai muncul di zon berkenaan dengan nama masjid.
- Borang hubungi (mod dev `200`); Studio `/studio` bersambung.
- `lint` 0 ralat; `build` lulus (fallback + env).

Selepas ujian, artifak ujian dibersihkan → data pristine (0 permohonan, 91 pegawai belum ditugaskan, kaunter reset).

## Baki tindakan (bukan penghalang)

- Tukar `ADMIN_PASSWORD` sebelum pengeluaran.
- Admin assign 91 pegawai ke masjid dalam Studio.
- Telefon pejabat masih placeholder — isi dalam Studio → Tetapan Laman.
- Domain & deployment belum diputuskan (folder `deploy/` sedia).
- Resend API key untuk emel hubungi sebenar.
