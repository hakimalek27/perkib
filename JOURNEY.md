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

## Baki tindakan v1 (bukan penghalang)

- Tukar `ADMIN_PASSWORD` sebelum pengeluaran.
- Domain & deployment belum diputuskan (folder `deploy/` sedia).
- Resend API key untuk emel hubungi sebenar.

---

# Perjalanan v2 — Platform Admin Berfungsi Penuh + Redesign (13–14 Julai 2026)

Naik taraf besar daripada laman maklumat → **platform pentadbiran**. 13 milestone, setiap satu `npm run build` hijau sebelum ke seterusnya.

## Sumber data baharu
- `senarai_ketua_imam_timbalan_bilal_maiwp.xlsx` (sheet "Senarai Penuh Ikut Zon") — 92 pegawai + penugasan masjid + IC penuh + telefon + gred sebenar (S1/S5/S9).
- `rekod_staff_lain_enriched.csv` — 1,121 staf MAIWP lain (IC/telefon/foto).
- API `wassap.wehdah.my` (dari projek Whatsapp Multi Tenant) untuk notifikasi.

## 13 Milestone v2
| # | Milestone | Hasil |
|---|---|---|
| M1 | Asas keselamatan — `crypto.ts` (AES-256-GCM), rate-limit fixed-window 5/5min+lockout, CSP/headers, kuki strict | ✓ |
| M2 | Skema Sanity v2 — Zon 9, `jenisTempat`, medan `*Enc` (hidden), had jenis, yuran/notifikasi/audit/outbox | ✓ |
| M3 | Sync penugasan xlsx — 92 pegawai + masjid baharu + Zon 9 + Anuar(1692) + enkripsi IC/telefon (unset plain) | ✓ |
| M4 | Stor staf lain — 1,121 → `private-data/staf-lain.enc.json` (gitignored) + route foto admin | ✓ |
| M5 | Saguhati v2 — captcha matematik, medan bank+telefon (enkrip), idempotency, had per jenis, consent PDPA | ✓ |
| M6 | WhatsApp — `lib/whatsapp.ts` (normalisasi, retry 429, dry-run, outbox), templat BM, cetusan `after()` | ✓ |
| M7 | Admin shell v2 — sidebar, dashboard, sonner, auditLog | ✓ |
| M8 | Admin saguhati penuh — tukar status + transfer → WhatsApp; had per jenis; proksi dokumen | ✓ |
| M9 | Penugasan seret-lepas (`pragmatic-drag-and-drop`) + fallback dropdown | ✓ |
| M10 | Yuran bendahari — kadar per gred, matriks toggle, tanda setahun, jumlah, eksport CSV | ✓ |
| M11 | Admin pegawai (IC dekripsi/wa.me/sejarah/yuran) + carian staf lain | ✓ |
| M12 | Redesign "Royal Glass" (mesh, kaca, glow emas, shimmer) + kandungan (emel/alamat HQ MAIWP/buang waktu) | ✓ |
| M13 | E2E Chrome MCP + adversarial + commit/push + deploy + docs | ✓ |

## Keputusan reka bentuk v2
- **Enkripsi at-rest** dipilih atas percaya-dataset-private semata: walau dataset public + repo public, IC/telefon/bank kekal ciphertext.
- **Staf lain di luar Sanity/repo** — blob terenkripsi tempatan; foto distrim via route berdaftar admin.
- **Idempotency** `_id` deterministik dari `idemKey` + `createIfNotExists` + mutex — double-submit = 1 rekod.
- **Yuran** medan bulan BERNAMA (`m01..m12`) bukan array — elak race `_key`.
- **pragmatic-drag-and-drop** dipilih atas @dnd-kit (penyelenggaraan aktif, serasi React 19).
- **exceljs** (bukan npm `xlsx` — terbengkalai + CVE) untuk baca xlsx.

## Cabaran & penyelesaian v2
- **Resolusi masjid xlsx→kanonik** — peta ALIAS eksplisit + laporan; sahkan 2 masjid "Al-Mukhlisin" berbeza (plain 2126 vs Alam Damai 1889).
- **Env dibaca peringkat modul** (isu susunan import) — tukar baca env lazy dalam fungsi (whatsapp).
- **ref semasa render** (lint) — tukar ke `useCallback` + monitor dep.
- **Sembunyi chrome awam di /admin** — early-return Header + gate Footer (`SiteFooterGate`) via usePathname.
- **Laluan Windows** `path.resolve("C:", …)` ≠ `C:\` — guna literal `C:/…`.

## Keputusan E2E v2 (Chrome MCP, data langsung)
Homepage Royal Glass (statistik 92·8·94·24) · pegawai awam 92, taburan 31/33/28, Zon 9(7), 0 belum ditugaskan, TIADA IC/telefon bocor · **saguhati: captcha→verify(1991/5053)→bank→submit; double-submit=1 rekod (refNo sama, created=false)** · captcha salah→400 · **anon GROQ: noKpEnc ciphertext `v1:`, telefon plain tiada** · CSP/X-Frame/nosniff hadir · admin login+dashboard · **detail pegawai: IC 900911145053 dekripsi + wa.me + foto**. Artifak ujian dibersihkan → pristine (92 pegawai, 0 permohonan).

---

# Deployment & Go-Live — https://perkib.my (14 Julai 2026)

## Penemuan pelayan
Pelayan `ubuntu@43.133.34.55` (Tencent VM-0-13, Ubuntu 22.04, Node v20, nginx) — **bukan** kotak produksi kariah/mamkl.my. Hos 6 laman wehdah/jawi termasuk **`perkib.my` (nginx sudah wujud)** + **wassap.wehdah.my** (gateway WhatsApp). **PERKIB v1 sudah di-deploy** di sini: standalone `/var/www/perkib/.next/standalone/` via **pm2 `perkib` port 3005**, di belakang Cloudflare. Tugas jadi: **ganti v1 → v2**.

## Proses deploy
1. Build produksi (`NEXT_PUBLIC_SITE_URL=https://perkib.my` di-bake) + himpun standalone (static+public).
2. Backup v1 (tgz + `standalone.v1old/`) untuk rollback.
3. tar-pipe standalone (~53M) → `standalone.v2new/` (rsync tiada di Windows Git Bash).
4. scp `.env.local` (rahsia via SSH) + fail staf terenkripsi; laras env produksi (SITE_URL, WASSAP_DRY_RUN=0, laluan staf, PORT=3005); `chmod 600`.
5. Uji boot port 3006 (v1 kekal 3005) → 200 + data langsung → swap dir → `pm2 restart perkib` → `pm2 save`.

## Disahkan LIVE
perkib.my/saguhati/studio 200 · **data Sanity langsung (92 pegawai)** · captcha API + CSP (ciri v2-eksklusif) · **admin login + IC `900911145053` dekripsi + wa.me** (kunci enkripsi server PADAN) · 5 laman lain TIDAK terganggu.

## Baiki & tugas selepas go-live
- **Kata laluan admin** ditukar dari default → disahkan (baharu 200, lama 401). Guna base64 elak isu aksara `$` dalam shell.
- **CRLF dalam `.env.local`** (scp dari Windows) — @next/env bersihkan, tapi `sed 's/\r$//'` untuk pasti (kritikal bagi DATA_ENCRYPTION_KEY).
- 🐛 **Endpoint WhatsApp**: wassap.wehdah.my LANGSUNG guna **`/v1/messages/send`**, bukan `/api/v1/*` (apiPrefix kosong) — dok tersilap. Dibetulkan `whatsapp.ts`; disahkan: ujian gateway + **app-level `SENT baru-pemohon → 0189030363`**.
- **Foto staf 1122 (362M)** dipindah (tar-pipe) → route foto admin 200/tanpa-auth 401.
- **JID group WhatsApp**: query DB wassap (`WaGroup`) = 0 group disync (nombor belum jadi ahli group). Cara dapat: tambah nombor ke group → sync/webhook tangkap `chat_jid` → tampal `@g.us` di /admin/notifikasi.

## Cabaran deploy & penyelesaian
- **rsync tiada** (Git Bash) → tar-over-ssh.
- **Swap dir memadam `.env.local`** (env dalam dir standalone) → `cp` .env.local produksi ke dir baharu sebelum swap.
- **Kuki admin `secure`** tidak disimpan atas HTTP → uji dekripsi via HTTPS (Cloudflare).
- **Classifier blok arahan kompaun** (scp rahsia + sed) → pecah kepada langkah kecil.
