# HANDOVER — Laman Rasmi PERKIB (`perkib-web`)

**Kemas kini:** 2026-07-14 · **Status:** ✅ **v3 "Nadi" DEPLOYED & LIVE di https://perkib.my** (redesign penuh + ciri admin baharu).

## 🎨 v3 "PERKIB Nadi" (14 milestone M0–M13)
Redesign UI penuh **ivory #F7F3EB / obsidian #0D1117 / maroon #9E1F2E / gold #C6A25D** (font Bricolage Grotesque + Plus Jakarta Sans) menggantikan "Royal Glass" biru+emas. Motif tunggal **arch**. **framer-motion + canvas-confetti + @radix-ui/react-tabs DIBUANG** (CSS+IO+rAF sahaja); dep baharu = **maplibre-gl** sahaja. Disahkan LIVE 14 Jul: homepage Nadi, semua route 200, CSP +tiles.openfreemap.org, jiran tidak terganggu.

**Ciri BAHARU:**
- **Gate kata laluan KEDUA `/admin/staf`** (env `STAF_GATE_PASSWORD='Aqizan14$****'`, disahkan di server) — halaman DISOROK dari sidebar, akses URL manual + kata laluan. Rate limit 5/5min. Live search (taip terus, `/api/admin/staf-cari`).
- **CRUD pegawai** (`/admin/pegawai`): + Tambah / Sunting / Padam (delete-with-references → Nyahaktif). `next.config` bodySizeLimit 8mb.
- **Peta direktori** (maplibre + OpenFreeMap): toggle Senarai|Peta (`?view=`), marker arch, drawer. Koordinat via `npm run geocode:masjid`→semak→`geocode:apply`.
- **Wizard 3→5 langkah** (API/payload BEKU) + Nadi progress + sessionStorage draf. SemakForm timeline menegak node arch.
- Header floating dock, Footer obsidian 4-kolum, login admin split-screen, 404/loading/OG arch.

**⚠️ BELUM PUSH:** 14 commit v3 setempat (`8b1821a`→`31aa48a`) + tags `pra-v3`/`kumpulan-a-siap`. Token GitHub tiada akses. Hakim: `gh auth login` → `git push origin main --tags`.

---


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
- **v3: `STAF_GATE_PASSWORD`** (gate kedua `/admin/staf`; nilai literal `Aqizan14$****` — BALUT petikan tunggal dlm .env.local kerana ada `$`; server guna base64 semasa deploy). Disahkan di server (panjang 13).
- **v3: `WASSAP_SESSION_ID`** (kosong = round-robin; pin sesi penghantar bila kunci tak terikat & sasaran group).
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

## Baki tindakan (untuk Hakim) — v3
1. **GitHub push:** `gh auth login` (HTTPS, akaun hakimalek27) → `git push origin main --tags`. 14 commit v3 setempat belum push (token semasa tiada akses).
2. **WhatsApp group:** nombor penghantar PERKIB (6019 "PERKIB NOTI MAM", tenant masjid_id 9) **belum jadi ahli** group SANTAI+JK PERKIB (milik tenant 1). Tambah 6019 ke kedua-dua group di WhatsApp → `npx tsx scripts/wa-setup.ts --send --set-target`. (Sasaran & ujian gagal buat masa ini; target dikosongkan supaya cooldown tak jejas noti pemohon.)
3. **Peta koordinat:** `npm run geocode:masjid` → semak `scripts/output/geocode-review.json` (banding Google Maps) → `npm run geocode:apply`. Sementara: peta fallback senarai.
4. Lighthouse perkib.my (homepage/direktori/mohon) — sahkan DoD (QA-REPORT.md).
5. (Pilihan) video `/public/media/perkib-{hero,break}-{wide,vert}.mp4` — fallback siluet berfungsi tanpanya.

### Baki v2 (kekal relevan)
- Simpan salinan `DATA_ENCRYPTION_KEY` di tempat selamat (hilang = hilang semua IC/telefon/bank).
- Set kadar yuran per gred `/admin/yuran/tetapan` & had jenis `/admin/saguhati/tetapan`.
- (Pilihan) `npx sanity dataset visibility set production private` — token baca dipasang.

### Deploy semula (rujukan)
Corak: `NEXT_PUBLIC_SITE_URL=https://perkib.my npm run build` → cp `.next/static`+`public` ke `.next/standalone` → `tar -czf - -C .next standalone | ssh ubuntu@43.133.34.55 "cat > /tmp/x.tgz"` → server: ekstrak ke `standalone.vNnew` → **cp `.env.local` lama** → `mv standalone standalone.vNold; mv standalone.vNnew standalone` → `pm2 restart perkib && pm2 save`. Rollback: swap balik `standalone.v3old`.
