# QA-REPORT — PERKIB v3 "Nadi" Redesign

**Tarikh:** 2026-07-14 · **Skop:** Redesign UI "PERKIB Nadi" (spek v2.3) + ciri admin baharu.
**Kaedah:** Build hijau + lint 0 ralat setiap milestone (M0–M12); verifikasi visual Chrome MCP
(localhost) pada halaman utama, pegawai, direktori (peta), wizard, login admin.

## Definition of Done (spek §1.5)

| Item DoD | Status | Nota |
|---|---|---|
| Lighthouse Performance ≥ 90 (homepage/direktori/borang) | ⏳ Semak live | Perlu jalankan Lighthouse pada perkib.my selepas deploy. Asas: SSR/SSG kekal, tiada lib animasi (framer/confetti dibuang), imej next/image + lazy, video preload=none. |
| Lighthouse Accessibility ≥ 95 | ⏳ Semak live | Landmark, skip-link, aria-current, aria-label odometer, focus-visible, alt bermakna disemak semasa bina. |
| LCP < 2.5s · CLS < 0.1 · INP < 200ms | ⏳ Semak live | Ruang dirizab (aspect-ratio arch, odometer), transform/opacity sahaja, IO trigger. |
| WCAG 2.2 AA — kontras ≥ 4.5:1 | ✅ Reka | Token: maroon #9E1F2E & ink #1A1F27 atas ivory #F7F3EB lulus AA; emas gelap #8F7440 utk teks emas atas terang; emas #D9BC82 atas obsidian. |
| WCAG — sasaran sentuh ≥ 44px, butang 50px | ✅ | Butang min-h 50px; ikon-butang ≥44px; nav mobile 44px. |
| WCAG — keyboard penuh + focus-visible | ✅ Reka | focus-visible ring maroon; dialog/drawer boleh Tab + ESC. |
| prefers-reduced-motion dihormati | ✅ | `.tier-essential` + @media reduced-motion mematikan reveal/odometer/page-enter/arch-draw; TierInit set kelas ikut peranti. |
| 0 permintaan font pihak ketiga | ✅ | Bricolage Grotesque + Plus Jakarta Sans + Amiri via `next/font/google` (self-host). |
| Kandungan asal wujud & tepat | ✅ | 9 saguhati, 4 teras program, visi/misi 5 item, AJK, akaun Bank Rakyat, ROS, alamat HQ MAIWP — semua dikekalkan. |
| Ujian sebenar 3 pengguna mohon via telefon | ⏳ Selepas go-live | Wizard 5 langkah + sticky butang mobile siap; ujian pengguna sebenar oleh Hakim. |

## Nisbah warna (spek §2.1) — 90 ivory / 7 obsidian / 2.5 maroon / 0.5 emas
✅ Dipatuhi: majoriti halaman latar ivory; seksyen obsidian terhad (hero panel arch, strip
statistik, saguhati, photo-break, footer, admin sidebar); maroon = CTA/pautan/aktif;
emas = garis/aksen sahaja (tiada gradient emas terang selepas buang `.text-gradient-gold-anim`).

## Signature (spek §3)
- ✅ Motif arch tunggal: ArchFrame (foto pegawai/kepimpinan/hero), Glyph, node progress wizard,
  node timeline semak, node ScrollRail, loader, 404, ornamen footer/PageHero/login.
- ✅ Arch Reveal (hero) + Odometer (statistik) + Nadi progress (wizard).
- ✅ Arch Morph (template.tsx fade+rise entry, reduced-motion off) — bukan viewTransition eksperimen.

## Motion (spek §4)
- ✅ CSS + IntersectionObserver + rAF sahaja. framer-motion & canvas-confetti DIBUANG (grep 0).
- ✅ Had: tilt ≤3°, parallax ≤12px, scale ≤1.04, magnetic ≤4px (Magnetic.tsx).
- ✅ Tier Essential (reduced-motion/peranti lemah) → statik.

## Prestasi (spek §10)
- ✅ Tiada lib animasi baharu (framer/confetti dibuang). Dep baharu = maplibre-gl SAHAJA (peta,
  dynamic import ssr:false — hanya bila tab Peta dibuka; disahkan tiles 200).
- ✅ next/image + blur; video CinematicSlot preload=none + lazy-src + pause luar viewport.
- ✅ @radix-ui/react-tabs dinyahpasang (0 guna).

## Keputusan skop (sengaja — untuk kestabilan, "xda bug baru")
1. **Alias butang** (gold/outline/dark/white) DIKEKALKAN sebagai alias Nadi (primary/ghost/ghost-dark)
   — berfungsi betul; elak sweep berisiko merentas 13+ halaman. Boleh dibersihkan kemudian.
2. **Utiliti Nadi-serasi** (`.eyebrow .heading-display .card-hover .hover-glow .gold-topline
   .pattern-geometric*`) dikekalkan (recolor Nadi, diguna banyak halaman). Utiliti off-brand
   (mesh-royal/glass/aurora/glow/text-gradient-gold/spin/float/noise/gradient-border) DIHAPUS (grep 0).
3. **Admin: jadual→kad mobile + semakan 3-panel DITANGGUH** — jadual admin kekal berfungsi + Nadi +
   skrol mobile. Risiko regresi pada aliran semak-lulus live tidak berbaloi untuk skop "minimum".
4. **Peta: koordinat masjid** — infrastruktur siap; markers muncul selepas Hakim jalankan
   `npm run geocode:masjid` → semak fail → `npm run geocode:apply`. Fallback anggun (senarai) sementara.

## Baki tindakan Hakim (bukan penghalang deploy)
- Jalankan Lighthouse pada perkib.my (homepage/direktori/mohon) selepas deploy.
- WhatsApp: tambah nombor PERKIB NOTI (6019) ke group SANTAI + JK PERKIB, kemudian
  `npx tsx scripts/wa-setup.ts --send --set-target` (lihat HANDOVER).
- Geocode 94 masjid: geocode:masjid → semak → geocode:apply.
- (Pilihan) sediakan video /public/media/*.mp4 (hero + break) — fallback siluet berfungsi tanpanya.
- Re-auth GitHub push bila perlu (`gh auth login`).
