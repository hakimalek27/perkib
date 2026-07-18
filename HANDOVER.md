# HANDOVER — Laman Rasmi PERKIB (`perkib-web`)

**Kemas kini:** 2026-07-19 · **Status:** ✅ **v3.9 DEPLOYED & LIVE di https://perkib.my** (popup banner kini "sticky" — lekat di tengah viewport & ikut skrol; dulu muncul di bawah kandungan, kena skrol baru nampak, hilang bila skrol atas). Sebelum: v3.8 (popup besar 1080×1450 + crop WYSIWYG) (`main @ 4ef6423`).

## 🆕 v3.9 (19 Julai 2026) — DEPLOYED (popup banner sticky — baiki `fixed` positioning)
Hakim: "popup banner tadi x sticky… bila masuk homepage, banner dah ada kt bawah, kena skrol baru nampak, apstu skrol atas balik xnampak la banner tu… dia x ikut pandangan user." Deploy: build BERSIH → tar-pipe → kekal `.env.local` → backup **`standalone.bak-20260719-v39`** → pm2 restart. Commit `4ef6423`. **E2E 15/16 lulus + 1 flake pemasaan disahkan (accordion /soalan-lazim lulus 3/3 ulangan) = efektif 16/16.**
- **Punca (disahkan ejen Explore + git):** overlay popup guna `fixed inset-0 z-[200]` (betul) TAPI di-mount di `page.tsx` dalam pembalut `template.tsx` `<div className="page-enter">`. `.page-enter` (`globals.css:390`) = `animation: page-enter 0.25s var(--ease) both`, keyframes `transform: translateY(12px)→none`. **`animation-fill-mode: both`** kekalkan elemen sebagai **containing block** untuk anak `position:fixed` (Chromium) walau animasi tamat → `fixed` popup jadi relatif kotak kandungan halaman, BUKAN viewport → muncul di bawah, skrol hilang. **Punca IDENTIK bug Studio blank (`3ce30ff`)** — fix itu (skip /studio + h-screen) tak pernah dikenakan popup. Popup TIADA portal → tak terlepas pembalut.
- **Fix — `PopupBanner.tsx` sahaja (+17/-2):** `createPortal(overlay, document.body)` → overlay jadi anak terus `<body>`, terlepas `.page-enter` → `fixed inset-0` kembali relatif viewport (tengah skrin, ikut skrol, muncul serta-merta). `open` hanya `true` dlm effect (client) → `document.body` pasti wujud, tiada mismatch hydration (guard `mounted` DIBUANG — eslint `react-hooks/set-state-in-effect` + memang tak perlu). + scroll-lock badan semasa buka. Kad dalam (`.page-enter`) kekal (descendant, animasi masuk sahaja, bukan punca).
- **Bukti LIVE (Playwright perkib.my):** desktop 1440×900 + mobile 390×844 → `[role="dialog"]` parent = `<body>` ✓, tiada ancestor `.page-enter` ✓, skrol 775/599px → **`dyMove=0`** (overlay kekal fixed) ✓, kad di tengah viewport ✓. Screenshot: popup portrait penuh di tengah walau selepas skrol. tsc+eslint hijau, build bersih.
- **Nota scroll-lock:** aras `body` (layout ini skrol via `<html>`) → latar masih boleh skrol sikit di belakang backdrop gelap; popup tetap kekal (dyMove=0). Kelakuan modal biasa, tak menjejaskan aduan. (Boleh kunci penuh `documentElement` + pampasan scrollbar sbg follow-up jika Hakim mahu.)

**Baki Hakim v3.9:** tiada tugasan kod — sahkan sendiri di browser (buka perkib.my, popup muncul di tengah skrin & kekal bila skrol atas/bawah). Baki v3.8 (set crop dalam Studio) kekal.

## 🆕 v3.8 (17 Julai 2026) — DEPLOYED (popup besar + crop WYSIWYG)
Hakim: popup kecil sangat → besarkan 1080×1450; dan crop dalam Sanity mesti = paparan depan (bukan agak-agak) — sama untuk jalur & gambar lain. Deploy: build BERSIH → tar-pipe → kekal `.env.local` → backup **`standalone.bak-20260717-v38`** → pm2 restart. Commit `51424f3`. **E2E Playwright 16/16 kekal lulus.**
- **Punca (disahkan ejen):** popup & jalur guna `urlForWidth` (`sanity.ts`) — hanya `.width()`, TIADA `.height()`/`.fit("crop")` → **crop/hotspot editor DI-BYPASS**; pemotongan sebenar oleh CSS `object-cover` berpusat sahaja. Itulah "set dlm Sanity, keluar lain". Popup kecil: `max-w-lg` 512px + kotak `aspect-[4/3]`.
- **Mekanisme WYSIWYG (3 lapisan sepadan):** (1) Studio `options.hotspot.previews` nisbah tetap → dialog crop papar pratonton TEPAT apa yang dipapar; (2) frontend minta `.width(w).height(h).fit("crop")` nisbah SAMA → builder `@sanity/image-url` HORMAT crop rectangle + hotspot; (3) bekas CSS nisbah SAMA → tiada crop tambahan. Editor gerakkan crop/titik fokus = itulah yang keluar selepas publish.
- **Kod:** `sanity.ts` helper BAHARU **`urlForRatio(w,h)`** (`.width().height().fit("crop")`); `urlForWidth` dibuang; `urlForSquare` kini delegate ke urlForRatio. Popup → `urlForRatio(1080,1450)`, jalur → `urlForRatio(720,450)` (16:10). `paparanUtama.ts`: `popupGambar` previews "Popup 1080×1450" + `scrollerGambar.gambar` previews "Jalur 16:10" + description arahan editor. `PopupBanner.tsx`: kotak `aspect-[1080/1450]` + kad besar (lebar dihad tinggi viewport: `maxWidth: min(28rem, calc((94svh - 6rem) * 1080 / 1450))` → muat desktop/laptop/mobile, nisbah kekal). `AktivitiScroller.tsx`: satu nisbah 16:10 kedua breakpoint (`h-[140px] w-56 md:h-[180px] md:w-72`).
- **Bukti LIVE:** homepage HTML kini sajikan `...rect=0,105,2560,1600&w=720&h=450&fit=crop` (jalur — crop editor DIHORMATI, dulu diabaikan) + `...1080x1450.jpg?w=1080&h=1450&fit=crop` (popup). Visual popup disahkan besar/portrait/muat 3 saiz skrin.
- **Officer photos (pegawai/AJK) sengaja KEKAL** (tidak diubah): `photoUrl` dikongsi merentas bekas **5:6** (kad/homepage/AJK) DAN **bulatan 1:1** (perutusan) → tiada satu nisbah tetap yang WYSIWYG untuk kedua-dua; lagipun ia sudah hormat crop (via `urlForSquare` fit:crop) — bukan pepijat ini. (Boleh buat crop per-konteks sebagai tugas berasingan jika Hakim mahu.) QR derma kekal mentah (QR tak boleh crop).

**Baki Hakim v3.8:** buka Studio → Paparan Utama → gambar Popup/Jalur → klik ikon **crop** pada gambar → nampak pratonton nisbah bertajuk ("Popup 1080×1450"/"Jalur 16:10") → gerakkan kawasan crop/titik fokus → **Publish** → apa yang di-set itulah yang terpapar (hard refresh Ctrl+Shift+R). Untuk popup terbaik, muat naik gambar ≥1080×1450.

## 🆕 v3.7 (17 Julai 2026) — DEPLOYED (carian termasuk telefon + emel)
Carian di **`/admin/pegawai`** (Imam/Bilal) dan **`/admin/staf`** (staf MAIWP) kini boleh cari ikut **no. telefon + emel** — bukan hanya nama/no. pekerja. Deploy: build BERSIH → tar-pipe → kekal `.env.local` → backup **`standalone.bak-20260717-v37`** → pm2 restart. Commit `76e98ed`.
- **Helper kongsi `src/lib/search-text.ts` (BAHARU):** `normalizeCari` + `matchAllTerms(query, text, digitSource)` — haystack **teks** (nama/emp/masjid/emel; @→ruang) + haystack **digit** (telefon/IC/emp buang bukan-digit). Term semua-digit ≥3 → padan digit ATAU teks; term lain → teks. Logik AND. Kendali telefon berformat `013-456 7890`, IC, emel, nama.
- **Staf (`searchStafLain` di `staf-lain.ts`):** dulu **BUG** — hanya padan nama/emp/jawatan/bahagian walau UI dakwa "IC/telefon"; kini teks=`+emel`, digit=`noTel+noKp+emp`. API `staf-cari` + `StafSearch` tak berubah (sudah pulang + papar telefon/emel/WA); kemas placeholder/hint.
- **Pegawai (server-side):** telefon `telefonEnc` **TERENKRIPSI** (IV rawak → mustahil cari atas ciphertext) → carian ditukar ke server bila ≥2 aksara. Route BAHARU **`/api/admin/pegawai-cari`** (gate TUNGGAL admin — konsisten halaman butiran; `rateLimit` 30/min; tiru `staf-cari`). `searchPegawaiAdmin` (`admin-data.ts`) fetch ~93 + `decryptValue(telefonEnc)` + `matchAllTerms` → pulang **HITS sahaja** (JANGAN hantar telefon direktori penuh ke klien). `PegawaiAdminList` hibrid: **browse penuh (tanpa PII)** bila kosong, **carian server (telefon+emel dipapar teks, Link ke butiran)** bila taip; debounce 250ms + AbortController.
- **PDPA:** telefon pegawai dekripsi **server sahaja**, dihantar HANYA utk baris sepadan (cap 30) + rate-limit; konsisten dgn halaman butiran (gate admin sudah dedah telefon). Staf kekal **gate berganda**.
- **Verifikasi:** tsc + eslint hijau; **ujian unit `matchAllTerms` 18/18** (telefon berformat/tanpa/separa, IC, emel, nama, no. pekerja, AND, bukan-padanan); build bersih; route deployed + **gated (401 tanpa auth)**; 4 route 200. ⚠️ Ujian authenticated-live tersekat (sesi admin luput + renderer Chrome MCP beku) — **baki Hakim: uji carian dalam browser sendiri** (log masuk segar; corak auth identik `staf-cari` yang terbukti berfungsi).

**Baki Hakim v3.7:** uji carian di **/admin/pegawai** — taip no. telefon atau emel pegawai yang diketahui → sepatutnya jumpa + telefon terpapar; dan **/admin/staf** — cari ikut IC/telefon/emel staf. Carian nama/no. pekerja mesti kekal berfungsi.

## 🆕 v3.6 (16 Julai 2026) — DEPLOYED (audit v3.5 + fix + 2 ciri)
Hakim minta audit menyeluruh kerja v3.5 + 2 ciri baharu. Audit (2 ejen Explore + data live + DesignSync) → 6 penemuan, semua di-fix. Deploy: build BERSIH → tar-pipe → kekal `.env.local` → backup **`standalone.bak-20260716-v36`** → pm2 restart. Commit: `af11fc4`(M1 fix) `43c9260`(M2 reset) `927c681`(M3 marker) `e74d1dc`(E2E). **Verifikasi: Playwright 16/16 lulus** (LIVE) + screenshot marker + drawer + dialog reset.

**Audit v3.5 — disahkan BETUL:** M1 kontak (cross-check CSV↔JSON 56/56 padan, 0 tertinggal/salah), M2 popup masa (susunan guard + kunci storage betul), M3 scroller, M4 marker (.perkib-pin kekal), M6 soft delete (tapisan lengkap), fix webhook `after()` — semua kukuh. **6 penemuan di-fix:**
- **M1 fix (`af11fc4`):** (A1 KRITIKAL) `getPermohonanById` + `updateStatusAction` kini tapis `dibatalkan` → rekod di-soft-delete TAK boleh dibuka/diubah admin biasa via URL terus (dulu boleh cetus WhatsApp status). (A2) guard `reset-counter-saguhati.ts` kira SEMUA rekod (aktif+dibatalkan) — elak nombor rujukan bertindih. (A3) kiraan had "sekali seumur hidup" (submit route + `getSaguhatiUsage`) abai rekod dibatalkan → batal bebaskan kuota. (A4) idempotency submit tolak rekod dibatalkan (minta mula baharu). (A5) komen basi.
- **M2 — Butang Reset No. Rujukan (`43c9260`):** kad "zon bahaya" di bawah tab **Permohonan** /admin/staf (gate kedua). `bacaKaunterAction`+`resetKaunterAction` (ensureGate BERGANDA, **BLOK jika ada rekod aktif ATAU dibatalkan** pegang nombor rujukan — elak bertindih; skrip CLI `--force` kekal utk kecemasan). Dialog papar diagnosis (seq/PKB-2026-0001/kiraan) + taip **RESET** utk sahkan + `writeAudit "reset-kaunter-saguhati"`.
- **M3 — Marker peta Claude Design (`927c681`):** ganti kubah emas ringkas dgn "Masjid Map Marker" (`components/motif/MasjidMarker.jsx`): teardrop maroon berpuncak arch + rim emas, recess ivory (mihrab), **kubah bawang emas 3D** + **bulan sabit**, bayang tapak + glow. `masjidMarkerSvg(active)` (SVG statik, id gradien suffix a/n, hex terus). (A6) pin dipilih diserlah — registry `pinsRef` + effect swap innerHTML/saiz (aktif 46px + glow + z-index, biasa 36px). Kekal `.perkib-pin`+button+aria-label+anchor bottom (E2E selamat). Disahkan LIVE: 76 pin render, klik→drawer→kontak, pin aktif.

**Baki Hakim v3.6 (perlu sesi admin sendiri — renderer MCP beku, tak dapat auto-klik):**
1. **Uji butang Reset No. Rujukan:** /admin/staf → tab Permohonan → tatal bawah → "Reset No. Rujukan" → dialog patut tunjuk seq 0 / PKB-2026-0001 / 0 permohonan → taip RESET → Reset Sekarang (selamat, keadaan sekarang 0 permohonan). (Guard akan BLOK jika ada rekod dibatalkan.)
2. **Uji soft delete penuh** (jika belum): batalkan permohonan ujian → sahkan hilang dari /admin/saguhati + tab Dibatalkan pantau + Pulihkan.
3. Semak visual marker baharu di peta (hard refresh Ctrl+Shift+R).

## 🆕 v3.5 (16 Julai 2026) — DEPLOYED (6 permintaan Hakim)
6 milestone (M1–M6), lint+build hijau, dari fail `semakan_kontak_85_masjid.csv`. Deploy: build BERSIH → tar-pipe → kekal `.env.local` → backup **`standalone.bak-20260716-v35`** → pm2 restart. Disahkan: route 200 (/, /direktori-masjid, /yuran/semak, /studio, /admin/staf) + kontak masjid dlm HTML live.
- **M1 — 56 kontak masjid (JAWI):** telefon/emel 56 masjid Zon 1–7 dari direktori JAWI → Sanity (kini **65/94** ada kontak; 9 sedia ada dilangkau). `scripts/data/masjid-kontak-jawi.json` + `apply-masjid-kontak.ts` (baca SEMUA fail `masjid-kontak*.json`, terima 2 nombor `/`, **_id eksplisit + additive-only + dry-run**; 0 ditolak/hilang). Baki tanpa kontak: 18 Labuan (fallback JAWI Labuan 087-415 311) + ~11 KL tiada nombor rasmi. **Padanan halus disahkan:** Al-Hidayah Sentul (Z2) ≠ Al-Hidayah (Z6); Al-Mukhlisin plain (dilangkau) ≠ Alam Damai (diisi); Nur Iman ≠ Nurul Iman.
- **M2 — Popup banner jadual masa:** medan `popupMula` + `popupTamat` (datetime) dlm skema `paparanUtama`. `PopupBanner` tapis julat masa dlm effect (client, **tepat** — elak ISR lag); `getPaparanUtama` backstop auto-off server (matikan bila lepas `popupTamat`). Biar kosong = mula serta-merta / tiada tamat. Validasi tamat > mula (`_rule.ts` + `custom`).
- **M3 — Kelajuan jalur aktiviti:** medan `scrollerKelajuan` (radio: Perlahan 60s / Sederhana 42s / Laju 26s / Sangat Laju 16s) → CSS var `--marquee-duration` pada `.marquee-track`. `AktivitiScroller` terima prop `lajuSaat`.
- **M4 — Marker peta kubah emas:** ganti pin arch maroon (`clip-path:#archClip`) dgn **SVG kubah emas** (dome ogee + finial + tapak titik, `#C6A25D` + outline putih, anchor `bottom`) dlm `MasjidMap`. Drawer `tel:` guna nombor pertama (kendali 2 nombor).
- **M5 — Reset kaunter rujukan:** padam permohonan ujian **PKB-2026-0002** (Muhammad Azan, status tolak — pilihan Hakim "padam kekal") + reset `counter-saguhati-2026` seq=0 → seterusnya **PKB-2026-0001** (0 permohonan tinggal, bersih go-live). Skrip: `purge-permohonan.ts` (--ref) + `reset-counter-saguhati.ts` (dry-run + guard permohonan aktif).
- **M6 — Soft delete pembatalan:** medan `dibatalkan`/`dibatalkanPada`/`sebabBatal` (skema permohonan). **Batalkan** (gantikan padam terus) di `/admin/staf` → rekod **TERSEMBUNYI** dari admin biasa (`getPermohonanList`/`getStatusCounts`/`getPermohonanByEmployee`/dashboard) + semakan pemohon (`api/saguhati/status`). **Hanya /admin/staf** (gate kedua) nampak: tab **"Dibatalkan"** (pantau + **Pulihkan** + **Padam Kekal**). Action `batalPermohonanAction`/`pulihPermohonanAction` (guard berganda + audit). Boleh diundur.

**Baki Hakim v3.5:** (1) semak visual **peta** (/direktori-masjid → Peta → marker kubah emas) + drawer kontak 65 masjid; (2) di **Studio "Paparan Utama"**: set popup (gambar + Mula/Tamat) + pilih kelajuan jalur + hidupkan suis; (3) uji **soft delete** di /admin/staf (Batalkan → tab Dibatalkan → Pulihkan). (Kontak 18 Labuan + ~11 KL baki boleh diisi manual bila ada sumber sahih.)

## 🔧 Fix webhook yuran — balasan tak konsisten antara nombor (16 Julai 2026, lewat) — DEPLOYED
**Gejala:** `yuran 1880` dari 0189030363 dapat rekod, tapi nombor lain (cth `yuran 1889` dari 0172385416) **tiada respon langsung** — sepatutnya dapat penolakan sopan PDPA.
**Punca (disahkan dari log engine + kod, bukan spekulasi):** webhook `api/wa/webhook` **`await` semua kerja** (Sanity `getPegawaiAdminDetail`/`ambilRekodYuran` + `sendWhatsApp` yang ada **timeout 10s + retry 429**) SEBELUM jawab 200. Gateway wassap (Go engine `wassap-engine.service`) timeout webhook **jauh lebih pendek (~2-7s)** → catat `webhook: event=message.received gagal cubaan #1/2/3 — digugurkan` + **retry 3×** (log berulang 13:14/14:20/16:21/17:22/17:30…). Untuk 1880 balasan **sempat** terhantar dalam tempoh await (Hakim dapat reply walau engine catat "gagal"); untuk nombor lain, race timing → balasan **tergugur** → senyap. Route webhook sendiri sihat (bad-sig → 401 dalam ~4ms).
**Fix (`src/app/api/wa/webhook/route.ts`):** import `after` dari `next/server`; verify HMAC + dedup + keyword + rate-limit kekal segerak (pantas), TAPI cari-pegawai + banding-telefon + `sendWhatsApp` dipindah ke dalam **`after(async () => {…})`** → route **ACK 200 dalam <50ms**, kerja berat + balasan WhatsApp jalan **selepas** response. Gateway takkan timeout → tiada lagi "gagal 3 cubaan" + tiada retry berganda. Tambah `console.log` ringkas (nombor di-mask `maskRecipient`) untuk audit masa depan di `pm2 logs perkib`.
**Nota jangkaan:** selepas fix, nombor **tak berdaftar** untuk no. pekerja itu dapat **penolakan sopan** (bukan rekod) — reka bentuk PDPA: pegawai mesti guna **nombor telefon sendiri yang berdaftar**. Untuk uji pegawai lain dapat rekod, guna telefon berdaftar pegawai itu.
**Deploy:** build BERSIH → tar-pipe → kekal `.env.local` → backup **`standalone.bak-20260716-wafix`** → pm2 restart. Disahkan route 200 (/, /yuran/semak, /studio) + webhook 401 (bad-sig). **Pengesahan muktamad:** Hakim uji semula dari 2 nombor → semak `journalctl -u wassap-engine` (tiada lagi "gagal") + `pm2 logs perkib` (`[wa/webhook]` entri).

## 🔧 Susulan v3.4 (16 Julai 2026, malam) — Studio FIXED + webhook yuran BERFUNGSI
- **Sanity Studio blank DIBETULKAN (`3ce30ff`, DEPLOYED):** Punca SEBENAR (bukan CSP spt disangka v3.3) = animasi **`.page-enter`** (`template.tsx`) guna `transform:translateY` → menjadi *containing block* untuk `position:fixed` anak → `studio/layout` `fixed inset-0` **runtuh ke tinggi 0** (Sanity mount betul, content sebenar 800px tapi tak dipaint). Fix: (1) `template.tsx` skip `.page-enter` untuk `/studio` (`usePathname`); (2) `studio/layout` guna `h-screen` (100vh mutlak) ganti `fixed inset-0`. **Disahkan LIVE:** Studio render penuh (skrin login Google/GitHub/E-mail). Diagnosis: DOM mount + 0 console error + screenshot blank → guna `elementFromPoint` + dump DOM tree tinggi → jumpa `.page-enter [1280x0]` → `fixed [1280x0]` → Sanity content [1280x800].
- **Webhook yuran WhatsApp DISAHKAN BERFUNGSI:** Hakim uji `yuran 1880` dari 0189030363 → **balas rekod yuran** (nombor padan pegawai). Uji no. pekerja salah → **balas penolakan sopan** (PDPA: nombor tak sepadan). Punca awal 401 = secret webhook wassap ≠ `WASSAP_WEBHOOK_SECRET` perkib → Hakim selaraskan di dashboard wassap (secret sama). ⚠️ Classifier BLOK mutasi DB wassap automatik (gateway kongsi — dashboard/Hakim sahaja).
- **⚠️ Nota deploy penting:** selepas SETIAP deploy, klien perlu **hard refresh** (Ctrl+Shift+R) — jika tidak "Failed to find Server Action" (action ID lama) → punca tukar kata laluan /admin/staf pernah "gagal" (bukan bug kod). Pertimbang `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (stabilkan action ID merentas build) jika mahu elak ini.

## 🆕 v3.4 (16 Julai 2026) — DEPLOYED (8 maklum balas Hakim)
6 milestone (M1–M6), setiap satu lint+typecheck+build hijau + commit; **E2E Playwright 15/15 lulus** (11 + 4 v3.4). Deploy: build BERSIH → tar-pipe → kekal `.env.local` + tambah `WASSAP_WEBHOOK_SECRET` → backup **`standalone.bak-20260716-v34`** → pm2 restart. Verifikasi: route 200, OG live (101KB), medali/yuran live (Chrome MCP DOM), webhook 401.
- **Logo hero medali (M1):** logo diangkat jadi *medali emas* (cakera gelap + cincin emas + sinaran radial `medali-glow`) — tidak lagi tenggelam. `public/logo-mark.png` = logo latar hitam dibuang → transparan (sharp). **OG WhatsApp baharu** `public/og/perkib-og.png` (1200×630, 101KB, medali+PERKIB emas) — **laluan BAHARU** bust cache; `opengraph-image.tsx` DIPADAM (konvensyen fail mengatasi metadata).
- **/admin/staf 4 tab (M2):** disusun jadi tab bersih (`StafTabs`): Cari Staf · Permohonan · Maklum Balas · **Kata Laluan**. **Tukar kata laluan admin + gate** di sini (hash scrypt dlm singleton `adminTetapan`; guard berganda + sahkan semasa + rate limit + audit). `checkAdminPassword`/`checkStafGatePassword` async: baca hash Sanity, **fallback env** bila tiada hash / Sanity gagal (elak lockout). ⚠️ Selepas tukar, `ADMIN_PASSWORD`/`STAF_GATE_PASSWORD` env jadi fallback tak aktif; `DATA_ENCRYPTION_KEY`/`ADMIN_SESSION_SECRET` TIDAK disentuh.
- **Peta (M3):** **label nama masjid** (symbol layer, collision auto MapLibre) + toggle **3D** (fill-extrusion bangunan, graceful skip) + drawer **telefon/emel**. Medan `telefon`/`emel` ditambah skema masjid.
- **Kontak masjid (M4):** 9 masjid utama diisi telefon/emel dari laman/FB rasmi + PPZ-MAIWP (Wilayah, At-Taqwa, Jamek SAS, Asy-Syakirin, Saidina Abu Bakar, Saidina Umar, Jamek Kg Baru, Jamek Alam Shah, Al-Muttaqin WM). `scripts/apply-masjid-kontak.ts` + laporan `scripts/output/kontak-review.md`. Baki 85 → Hakim isi dlm Studio (nombor peribadi/tak sahih sengaja dilangkau).
- **Scroller + popup (M5):** singleton **`paparanUtama`** (pin Studio "🖼️ Paparan Utama"): jalur aktiviti auto-skrol (on/off + gambar ≤12) + popup banner (on/off + tajuk/gambar/pautan/butang/kekerapan sesi/harian/setiap). Fallback: tiada doc = homepage biasa. `revalidate=300` + webhook Sanity.
- **Semak yuran (M6):** (1) **UI `/yuran/semak`** — verify No.Pekerja+4 digit IC+captcha → jadual bulan dibayar/belum. (2) **WhatsApp** — hantar `yuran <noPekerja>` dari nombor berdaftar → auto-balas rekod (webhook HMAC `api/wa/webhook`, banding telefon PDPA, keyword ketat, mesej lain senyap).

**Baki Hakim v3.4:**
1. ~~Daftar webhook wassap~~ ✅ **SIAP — semak yuran WhatsApp BERFUNGSI** (uji `yuran <noPekerja>` balas rekod; nombor tak sepadan ditolak sopan — PDPA). Secret diselaraskan di dashboard wassap. (🔒 secret pernah terpapar di terminal semasa setup — pertimbang rotate.)
2. ~~Uji log masuk Studio~~ ✅ **SIAP — Studio load penuh** (`3ce30ff`). Boleh log masuk (Google/GitHub/E-mail).
3. **Tukar kata laluan** admin+gate melalui /admin/staf tab "Kata Laluan" (min 12 aksara) — **hard refresh dulu** (Ctrl+Shift+R). Lepas ni env jadi sandaran.
4. **Isi gambar** Paparan Utama (scroller aktiviti + popup) dlm Studio "🖼️ Paparan Utama" + hidupkan suis bila sedia.
5. **Lengkapkan kontak** 85 masjid baki + koordinat Al-Hijrah dlm Studio (medan Telefon/Emel/latitude/longitude). Senarai 85: `scripts/output/kontak-review.md`.

## 🗺️ Koordinat masjid dilengkapkan (15 Julai 2026, petang) — DEPLOYED
Hakim bekalkan koordinat manual (rekod rasmi JAWI + pin peta) untuk **38 masjid** yang sebelum ni tiada koordinat. Ditulis ke Sanity via `scripts/apply-manual-coords.ts` (**_id EKSPLISIT** — padanan nama dibuat & disahkan manual, BUKAN padan automatik; additive-only + validasi bbox wilayah; dry-run dulu). Kini **93/94 masjid awam berkoordinat** (naik dari 55). Baki: **hanya Masjid Al-Hijrah, Labuan** (Hakim: "belum dapat disahkan"). 3 Posting Khas Zon 9 (Ibu Pejabat MAIWP + 2 Surau Istana Negara) tiada koordinat — bukan masjid awam, tak dipapar dalam peta. Build BERSIH (`rm -rf .next`) bake 93 koordinat fresh dari Sanity → deploy tar-pipe → backup **`standalone.bak-20260715-v33map`** → pm2 restart. **Disahkan LIVE:** semua route 200; koordinat baru dalam HTML live (Al-Ehsan/Abi Ayyub + 15 Labuan unik); **E2E Playwright 11/11 lulus** (+1 ujian baharu: peta papar >40 pin dari koordinat Sanity). ⚠️ Nota data: beberapa nota kampung Hakim untuk Labuan berbeza dgn medan `lokasi` Sanity — padanan tetap ikut **nama masjid** (pengecam unik); `lokasi` Sanity tidak diubah.

## 🆕 v3.3 (15 Julai 2026) — DEPLOYED (12 pembaikan maklum balas Hakim)
6 milestone (M1–M6), setiap satu **lint+build hijau + commit**; **E2E Playwright 10/10 lulus** (5 v3.2 + 5 v3.3). Punca setiap isu disiasat (2 Explore + GROQ + Playwright).
- **Kad arch (M1):** `ArchOutline` path **full-bleed** padan tepat `#archClip` + `overflow-visible` → foto **ngam dalam arch** (tiada bocor 2%). **Kubah dibuang** dari kad pegawai/AJK (`Kubah.tsx`+`.kubah-halo` kekal). Homepage kepimpinan: tambah `ArchOutline` (garis arch emas kini nampak). `/ajk`: **Timbalan Presiden featured** (sama saiz Presiden).
- **Duplikat Hanif (M2):** padam `drafts.pegawai-1991` (backup disimpan) → admin **93**. `admin-data.ts`: tapis `!(_id in path("drafts.**"))` semua query admin (defense-in-depth).
- **Live search /admin/pegawai (M2):** komponen klien `PegawaiAdminList` (taip terus tapis — tiada Enter).
- **Urus rekod (M2) — HANYA `/admin/staf`** (di sebalik gate kata laluan kedua): padam/edit permohonan (dialog wajib taip no. rujukan; edit bank/telefon re-encrypt) + padam maklum balas. Server action **guard BERGANDA** (`isAdminAuthenticated && isStafGateAuthenticated`) — **admin biasa TIDAK boleh padam** (`admin/staf/actions.ts` + `UrusRekod.tsx`).
- **Sanity Studio (M3):** CSP `studioPolicy` benarkan **`https://*.sanity-cdn.com`** (bridge.js Sanity v5 — punca Studio blank) + `cloudflareinsights` kedua-dua polisi (console noise).
- **FAQ azanmalek (M3):** punca = `.next/cache/fetch-cache` basi dibakar ke HTML. **Build bersih** (`rm -rf .next`) → 0 azanmalek dlm soalan-lazim.html. Runbook dikemas kini (WAJIB rm -rf .next).
- **Peta masjid (M4):** geocode **55/94** masjid (Nominatim; lokaliti ikut wilayah; bbox validation), sempadan **KL/Putrajaya/Labuan** (`public/map/boundaries/`). `MasjidMap` fitBounds + butang **Semua/KL/Putrajaya/Labuan** (default fokus **KL** + sempadan). Baki 39 tanpa koordinat → senarai fallback (kemudian **dilengkapkan 93/94** — lihat seksyen Koordinat di atas).
- **Nav/CTA (M5):** **sorok `/sukarelawan`** (nav + sitemap + redirect ke `/`; fail kekal). CTA terapung "Mohon Saguhati" mobile kini **boleh-tutup (X)** — `sessionStorage` (kekal tersembunyi sesi itu).

**Baki Hakim v3.3:** uji **log masuk Studio** (`/studio` — CSP dah dibetulkan; saya tak boleh log masuk); ~~perhalusi koordinat 39 masjid~~ ✅ **93/94 SIAP** — hanya **Masjid Al-Hijrah (Labuan)** tinggal (isi `latitude`/`longitude` dlm Studio bila pin disahkan); (pilihan lama) RESEND_API_KEY, WhatsApp 6019 group.

---


## 🆕 v3.2 (15 Julai 2026) — DEPLOYED (adopsi design system + mobile)
Adopsi **delta** design system "PERKIB Nadi" (claude.ai/design `6e86173e…`, reverse-engineered dari repo → majoriti token/komponen sudah padan) + 2 pembaikan mobile diminta Hakim. 6 milestone (M1–M6), setiap satu **lint+build hijau + commit**. Kandungan/data/kadar/medan/API/skema **BEKU**. Deploy: build (NEXT_PUBLIC_SITE_URL=perkib.my) → tar-pipe → kekal `.env.local` (1239B) → backup **`standalone.bak-20260715-v32`** → pm2 restart. Disahkan LIVE (7 route Cloudflare 200, 16 chunk JS 200, jiran wassap tidak terganggu).
- **Mobile `/pegawai`** (`PegawaiExplorer.tsx`): butang **"Tapis"** (`md:hidden`) toggle panel penapis collapsible + badge kiraan penapis aktif; baris pill kategori/zon jadi **overflow-x satu baris** di telefon (bar sticky ~250px → ~90px). Desktop ≥md kekal 100% (panel `md:flex` paksa).
- **Mobile admin yuran** (`YuranMatrix.tsx`): kolum sticky "Pegawai" **lebar tetap** (`w-[9.5rem]`, sm:13rem) + `border-r` + bayang tepi, **nama balut 2 baris** (`line-clamp-2 sm:whitespace-nowrap`), meta truncate; baiki smear header (bg legap `#F9F7F1`). 12 kolum bulan kini kelihatan penuh. **Disahkan LIVE** (sesi admin sedia ada).
- **Komponen kongsi baharu:** `ui/badge.tsx` (pil 7 tona + `STATUS_TONE` **satu sumber** — nyahduplikasi 4 lokasi status), `ui/field.tsx` (Label+kawalan+ralat/petunjuk a11y — suntik `aria-invalid`/`aria-describedby` sahaja, ref/`register()` RHF tak disentuh), `ui/select.tsx` (52px + chevron emas). **Input/Textarea → 52px** (`rounded-xl`, keadaan `aria-[invalid=true]`; **kekal ring fokus `primary/40`** — lebih boleh akses drpd `--tint` 6% design system).
- **Migrasi borang** (markup sahaja): ContactForm (5 medan, buang aria/ralat manual), SemakForm, StatusForm(+Select), MohonWizard(bank), LoginForm → komponen kongsi. STATUS_TONE nyahduplikasi: admin senarai/butiran/semak/maklum-balas.
- **Kad "fasad masjid":** bingkai cahaya emas **`.arch-glow`** (ArchOutline berdenyut) atas potret pegawai + AJK; **kubah kekal**. Kad AJK potret bulatan → **arch 5:6**. Denyut guna animasi **opacity** (dikomposit GPU — jimat ~117 kad); `.tier-essential`+reduced-motion matikan. Lencana kategori Badge: ketua-imam=brand, timbalan=gold, **bilal=neutral** (drpd primary-light).
- **Accordion tanpa Radix:** `ui/accordion.tsx` tulis semula (Context + CSS `grid-template-rows` 0fr→1fr, `.acc-panel`) — API serasi, `/soalan-lazim` sifar perubahan. **`@radix-ui/react-accordion` DIBUANG** (tiada dep baharu; malah −1).
- **Kad `/saguhati`:** kod **S1–S9** (emas letterspaced) + Badge gold "Sekali seumur hidup" + kadar **maroon** + label "kadar saguhati" berpemisah border-top. Homepage chamber saguhati TIDAK disentuh.
- **Token additive** (`globals.css`): `--border-ghost(-dark)`, `--dur-micro/interface/spatial/cinematic`, `--shadow-cta`, `--color-neutral`; `button.tsx` guna token + `hover:shadow-cta`.

**Nota ujian E2E v3.2:** ✅ **Playwright 5/5 LULUS** terhadap perkib.my LIVE (`e2e/interaktif.spec.ts`, `npm run test:e2e`): M5 accordion buka/tutup · M1 penapis kategori /pegawai · M1 butang Tapis + panel mobile · M5 kad /saguhati · M4 arch-glow ×93 — **interaktiviti klien DISAHKAN berfungsi**. Build hijau + SSR markup + DOM struktur live juga disahkan (curl + Chrome MCP). Nota: ujian **klik via Chrome MCP tidak boleh** kerana tab automasi kekal **background/hidden** (Chrome gantung layout/render/hidrasi tab tersembunyi; koordinat 0,0, screenshot timeout, klik-ref CDP pun tak cetus hidrasi) — sebab itu Playwright (headless, browser sendiri) digunakan. Struktur admin (/admin/yuran M1b, /admin/saguhati Badge) disahkan via Chrome MCP dari sesi admin live pengguna.

**Baki Hakim v3.2:** sama seperti v3.1 — (pilihan) `RESEND_API_KEY`+`CONTACT_FROM_EMAIL` server untuk emel maklum balas; WhatsApp 6019 ke group SANTAI+JK PERKIB; geocode 94 masjid. (Pilihan) klik-lalu manual /pegawai (Tapis mobile) + /soalan-lazim (accordion) di telefon sendiri untuk pengesahan visual akhir.

---


## 🆕 v3.1 (15 Julai 2026) — DEPLOYED
Deploy: `main @ 9a4118c` → build (NEXT_PUBLIC_SITE_URL=perkib.my) → tar-pipe → backup `standalone.bak-20260715` → pm2 restart. Disahkan LIVE (Cloudflare 200: /, /pegawai, /hubungi, /derma, /soalan-lazim, /admin/login; jiran `bpp` tidak terganggu).
- **Pegawai baharu:** Helmy bin Yahya (0033, **Ketua Imam S10**, Masjid Al-Mubarakah Zon 5) — IC/telefon terenkripsi, foto dimuat naik. Jumlah pegawai **92→93** (kod + Sanity). `mapKategori` sync: **S9/S10+ → Ketua Imam**. Skrip 1-kali: `scripts/add-pegawai-helmy.ts`.
- **Alamat HQ:** → **Menara MAIWP, No. 55, Lorong Haji Hussein 2, 50300 KL** (`site.ts`+`pages.ts` → Footer/Hubungi/JSON-LD). ⚠️ Koordinat geo anggaran — sahkan di Google Maps jika perlu.
- **Emel organisasi:** disahkan **admin@perkib.my** (Sanity siteSettings + FAQ sudah bersih; halaman FAQ statik lama yang tunjuk azanmalek dibetulkan oleh redeploy ini). Emel **rasmi pegawai kekal**. Skrip semak: `scripts/fix-email-org.ts`.
- **Derma:** buang **Dana Pendidikan** + **Bantuan Asnaf** (kekal Derma Am + Dana Operasi); teks derma/homepage dikemas kini.
- **Borang maklum balas HIDUP** (`/hubungi`): `/api/contact` kini **simpan ke Sanity** (skema `maklumBalas`, PII terenkripsi `dataEnc`) + **emel admin@perkib.my** (jika `RESEND_API_KEY`) + **WhatsApp ke sasaran admin** sedia ada (NotifConfig). Halaman admin baharu **`/admin/maklum-balas`** (senarai/tapis/tandai status) + item sidebar.
- **Reka bentuk "bombastik":** komponen **Kubah** (dome ogee emas, `src/components/ui/Kubah.tsx`) = mahkota setiap kad pegawai + AJK; corak **girih** Islamik (`.pattern-girih` / `.pattern-girih-dark`) pada hero/PageHero/seksyen obsidian; aksen `.text-gold-sheen` (hormati reduced-motion).
- **Claude Design:** projek design-system "PERKIB Nadi" (6 preview: asas, kubah, girih, kad pegawai, kad AJK, hero+butang) di `design-system/` — disync ke claude.ai/design (projek `6e86173e…`).

**Baki Hakim v3.1:** (pilihan) set `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` di `.env.local` server untuk emel maklum balas sebenar (kini maklum balas tetap disimpan ke Sanity + WhatsApp walau tanpa Resend); sahkan koordinat Menara MAIWP; nombor WhatsApp 6019 masih perlu jadi ahli group untuk noti group (baki v3).

## 🎨 v3 "PERKIB Nadi" (14 milestone M0–M13)
Redesign UI penuh **ivory #F7F3EB / obsidian #0D1117 / maroon #9E1F2E / gold #C6A25D** (font Bricolage Grotesque + Plus Jakarta Sans) menggantikan "Royal Glass" biru+emas. Motif tunggal **arch**. **framer-motion + canvas-confetti + @radix-ui/react-tabs DIBUANG** (CSS+IO+rAF sahaja); dep baharu = **maplibre-gl** sahaja. Disahkan LIVE 14 Jul: homepage Nadi, semua route 200, CSP +tiles.openfreemap.org, jiran tidak terganggu.

**Ciri BAHARU:**
- **Gate kata laluan KEDUA `/admin/staf`** (env `STAF_GATE_PASSWORD='Aqizan14$****'`, disahkan di server) — halaman DISOROK dari sidebar, akses URL manual + kata laluan. Rate limit 5/5min. Live search (taip terus, `/api/admin/staf-cari`).
- **CRUD pegawai** (`/admin/pegawai`): + Tambah / Sunting / Padam (delete-with-references → Nyahaktif). `next.config` bodySizeLimit 8mb.
- **Peta direktori** (maplibre + OpenFreeMap): toggle Senarai|Peta (`?view=`), marker arch, drawer. Koordinat via `npm run geocode:masjid`→semak→`geocode:apply`.
- **Wizard 3→5 langkah** (API/payload BEKU) + Nadi progress + sessionStorage draf. SemakForm timeline menegak node arch.
- Header floating dock, Footer obsidian 4-kolum, login admin split-screen, 404/loading/OG arch.

**✅ DIPUSH:** `main @ dd254ec` (origin sync) + tags `pra-v3`/`kumpulan-a-siap`. Nota: env var harness `GH_TOKEN`+`GITHUB_TOKEN` (Process-level, expired 401) mengatasi token keyring `gho_` yang sah → push guna `env -u GH_TOKEN -u GITHUB_TOKEN git -c credential.helper='!gh auth git-credential' push`.

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
1. ~~GitHub push~~ ✅ SIAP (`main @ dd254ec`, origin sync). Nota env token: lihat atas.
2. **WhatsApp group:** nombor penghantar PERKIB (6019 "PERKIB NOTI MAM", tenant masjid_id 9) **belum jadi ahli** group SANTAI+JK PERKIB (milik tenant 1). Tambah 6019 ke kedua-dua group di WhatsApp → `npx tsx scripts/wa-setup.ts --send --set-target`. (Sasaran & ujian gagal buat masa ini; target dikosongkan supaya cooldown tak jejas noti pemohon.)
3. **Peta koordinat:** `npm run geocode:masjid` → semak `scripts/output/geocode-review.json` (banding Google Maps) → `npm run geocode:apply`. Sementara: peta fallback senarai.
4. Lighthouse perkib.my (homepage/direktori/mohon) — sahkan DoD (QA-REPORT.md).
5. (Pilihan) video `/public/media/perkib-{hero,break}-{wide,vert}.mp4` — fallback siluet berfungsi tanpanya.

### Baki v2 (kekal relevan)
- Simpan salinan `DATA_ENCRYPTION_KEY` di tempat selamat (hilang = hilang semua IC/telefon/bank).
- Set kadar yuran per gred `/admin/yuran/tetapan` & had jenis `/admin/saguhati/tetapan`.
- (Pilihan) `npx sanity dataset visibility set production private` — token baca dipasang.

### Deploy semula (rujukan)
Corak: **`rm -rf .next`** (WAJIB — lihat nota bawah) → `NEXT_PUBLIC_SITE_URL=https://perkib.my npm run build` → cp `.next/static`+`public` ke `.next/standalone` → `tar -czf - -C .next standalone | ssh ubuntu@43.133.34.55 "cat > /tmp/x.tgz"` → server: ekstrak ke `standalone.vNnew` → **cp `.env.local` lama** → `mv standalone standalone.vNold; mv standalone.vNnew standalone` → `pm2 restart perkib && pm2 save`. Rollback: swap balik `standalone.v3old`.

> ⚠️ **WAJIB `rm -rf .next` sebelum build produksi.** `.next/cache/fetch-cache` menyimpan respons Sanity yang boleh menjadi **basi** dan dibakar semula ke HTML statik (punca FAQ live pernah tunjuk emel lama `azanmalek@maiwp.gov.my` walaupun Sanity sudah bersih). Selepas build, sahkan: `grep -c azanmalek .next/server/app/soalan-lazim.html` mesti **0**.
