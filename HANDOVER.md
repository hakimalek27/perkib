# HANDOVER — Laman Rasmi PERKIB (`perkib-web`)

**Kemas kini:** 2026-07-14 · **Status:** ✅ v2 **DEPLOYED & LIVE di https://perkib.my** + diuji E2E dengan Sanity langsung.

## 🚀 PENGELUARAN (LIVE)
- **URL:** https://perkib.my (Cloudflare → nginx :80 → pm2 `perkib` port **3005**).
- **Pelayan:** `ubuntu@43.133.34.55` (Tencent VM-0-13; kongsi dgn wassap.wehdah.my + 4 laman lain — semua tidak terganggu).
- **Lokasi app:** `/var/www/perkib/.next/standalone/` (Next standalone). Env: `.env.local` dlm dir itu (chmod 600).
- **Diuji LIVE:** homepage/pegawai/saguhati/studio 200 · data Sanity langsung (92 pegawai) · captcha API + CSP hadir · **admin login + IC `900911145053` dekripsi + wa.me** (kunci enkripsi server PADAN) · **WhatsApp app-level dihantar** (baru-pemohon → 0189030363, SENT) · **foto staf 1122 dihidang** (route berdaftar admin 200, tanpa-auth 401).
- **Endpoint WhatsApp:** wassap.wehdah.my guna `/v1/messages/send` (BUKAN `/api/v1`) — dibetulkan dlm `whatsapp.ts`. `WASSAP_DRY_RUN=0` (LIVE).
- **Foto staf:** 1122 fail (362M) di `/var/www/perkib/staf-foto/`.
- **Kata laluan admin:** sudah DITUKAR (bukan lagi default). Disimpan dlm `.env.local` server.
- **Deploy semula:** tar-pipe standalone → `cp .env.local` (kekal produksi) → swap → `pm2 restart perkib`. Rollback: `standalone.v2old/` + tgz.

Naik taraf besar (v2) daripada laman maklumat statik → **platform admin berfungsi penuh**: enkripsi data,
sistem saguhati lengkap (captcha, bank, notifikasi WhatsApp), panel admin tanpa Studio (status, penugasan
seret-lepas, yuran bendahari, direktori pegawai + staf MAIWP), dan reka bentuk "Royal Glass".

## Persekitaran / Rahsia (`.env.local` — JANGAN commit)
- `NEXT_PUBLIC_SANITY_PROJECT_ID=sk9lh0ym` · `NEXT_PUBLIC_SANITY_DATASET=production`
- `SANITY_API_TOKEN` / `SANITY_WRITE_TOKEN` (Editor) — baca+tulis (dataset kini boleh dijadikan private).
- **`DATA_ENCRYPTION_KEY`** (AES-256-GCM, 32-bait hex) — ⚠️ **HILANG = HILANG SEMUA IC/telefon/bank**. Simpan salinan selamat (pengurus kata laluan).
- `ADMIN_PASSWORD` (lihat `.env.local` setempat) → **TUKAR sebelum pengeluaran**. `ADMIN_SESSION_SECRET` (tandatangan kuki, berasingan).
- `SAGUHATI_TOKEN_SECRET` (HMAC 15 min token verify).
- **WhatsApp:** `WASSAP_API_URL=https://wassap.wehdah.my`, `WASSAP_API_KEY=sk_...` (skop `messages:send`), `WASSAP_DRY_RUN=1` (mod ujian; tetapkan `0` untuk hantar sebenar).
- **Staf lain:** `STAF_DATA_FILE=private-data/staf-lain.enc.json`, `STAF_PHOTO_DIR=C:\MAIWP_Staff_Lain_2026-07-07\gambar`.
- `CAPTCHA_BYPASS_SECRET` (kosong di prod; hanya untuk automasi ujian).

## Data (Sanity, langsung)
- **92 pegawai** (Ketua Imam 31 · Timbalan 33 · Bilal 28) — SEMUA ditugaskan masjid; IC penuh + telefon **terenkripsi** (`noKpEnc`/`telefonEnc`); `icLast4` plain untuk verify.
- **97 tempat**: 94 masjid (Zon 1–8) + 3 Posting Khas (Zon 9: 2 surau Istana Negara + Ibu Pejabat MAIWP).
- Anuar bin Mat Saad (1692) ditambah (foto dari folder staf). Officer 1712 → Ibu Pejabat MAIWP.
- 9 jenis saguhati (had maksimum boleh diset), 24 AJK, program/FAQ/siteSettings.
- **Staf MAIWP lain: 1,121** dalam `private-data/staf-lain.enc.json` (terenkripsi, gitignored — BUKAN dalam Sanity/repo).

## Cara jalan
```
npm install
npm run dev                 # http://localhost:3000
npm run seed:all            # sync pegawai (xlsx) + jenis + content + ajk
npm run sync:penugasan      # sync 92 pegawai dari xlsx sahaja
npm run build:staf-lain     # jana semula fail terenkripsi staf lain
npm run validate:data       # bukti kelengkapan (92/94/97/zon9…)
npm run lint && npm run build
```

## Panel Admin (`/admin`, kata laluan `ADMIN_PASSWORD`) — TANPA Sanity Studio
| Laluan | Fungsi |
|---|---|
| `/admin` | Dashboard: permohonan baru, belum ditugaskan, kutipan yuran, WA gagal, aktiviti (auditLog) |
| `/admin/saguhati` (+`[id]`, `/tetapan`) | Senarai+carian; tukar status + butiran transfer → WhatsApp pemohon; had per jenis |
| `/admin/penugasan` | Seret-lepas pegawai↔masjid (per zon) + dropdown "Pindah ke…" |
| `/admin/yuran` (+`/tetapan`) | Matriks bayaran (tahun/zon), toggle, tanda setahun, jumlah, eksport CSV; kadar per gred |
| `/admin/pegawai` (+`[emp]`) | Carian; profil penuh (IC dekripsi, telefon→wa.me, sejarah permohonan, rekod yuran) |
| `/admin/staf` | Carian 1,121 staf MAIWP (IC/telefon/foto + wa.me) |
| `/admin/notifikasi` | Sasaran WhatsApp + templat + toggle + Hantar Ujian + outbox |

## WhatsApp (wassap.wehdah.my)
- Pemohon terima notifikasi selepas hantar (nama, no pekerja, IC, tempat, jenis, bank, status) & selepas lulus/tolak/dibayar (butiran transfer). Admin/group terima notifikasi permohonan baharu.
- **JID group:** tiada API senarai — salin JID `...@g.us` dari dashboard wassap ke `/admin/notifikasi`.
- Kegagalan WA **tidak** menggagalkan permohonan (fire-and-forget + outbox log). Mula dengan `WASSAP_DRY_RUN=1`, tukar `0` bila sedia.

## Keselamatan
- IC/telefon/bank **terenkripsi at-rest** (AES-256-GCM) — walau dataset public, GROQ anon hanya nampak ciphertext `v1:…`.
- Captcha matematik + honeypot + had kadar **verify 5×/5 min + sejuk 5 min**; login admin 5×/15 min + lockout 30 min.
- CSP + X-Frame-Options + nosniff (next.config, `/studio` polisi longgar berasingan). Kuki admin `sameSite:strict`.
- Idempotency: double-submit = 1 rekod (disahkan E2E). Proksi dokumen admin (`/api/admin/dokumen/[ref]`), foto staf (`/api/admin/staf-foto/[emp]`) — guard sesi + no-store.

## Keputusan E2E (Chrome MCP, data Sanity langsung — 2026-07-14)
Homepage (statistik 92·8·94·24, reka bentuk Royal Glass) · pegawai awam 92 + taburan + 0 belum ditugaskan + TIADA IC/telefon bocor · **saguhati penuh: captcha→verify→bank→submit; double-submit=1 rekod (refNo sama)** · captcha salah 400 · **anon GROQ noKpEnc=ciphertext, telefon plain tiada** · headers hadir · admin login+dashboard · **detail pegawai: IC 900911145053 dekripsi + wa.me + foto**. Artifak ujian dibersihkan → pristine.

## Baki tindakan (untuk Hakim)
- Tukar `ADMIN_PASSWORD`; simpan salinan `DATA_ENCRYPTION_KEY` di tempat selamat.
- Set `WASSAP_DRY_RUN=0` + tampal JID group WhatsApp bila sedia hantar sebenar.
- Set kadar yuran per gred di `/admin/yuran/tetapan` (cth. S1=RM10, S5/S9=RM15) & had jenis di `/admin/saguhati/tetapan`.
- (Pilihan, disyorkan) `npx sanity dataset visibility set production private` — token baca sudah dipasang.
- Domain `perkib.my` + mailbox `admin@perkib.my` (paparan sahaja buat masa ini). Deploy: folder `deploy/`.
