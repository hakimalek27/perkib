// Helper padanan carian kongsi (server) — dipakai oleh carian staf MAIWP
// (staf-lain.ts) dan carian pegawai (admin-data.ts) supaya semantik padanan
// konsisten: sokong nama, no. pekerja, IC, telefon (berformat) dan emel.

// Normalisasi: huruf kecil, buang diakritik, tukar bukan-alfanumerik → ruang,
// mampat ruang. (Sama seperti corak normalize lama dalam staf-lain.ts.)
export function normalizeCari(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Padan SEMUA terms (AND). Query dipecah kepada terms selepas normalisasi.
// - Term semua-digit panjang ≥3 (cth telefon/IC/no. pekerja) → padan haystack DIGIT
//   (digitSource buang bukan-digit) ATAU haystack teks.
// - Term lain → padan haystack teks sahaja.
// Ini membolehkan carian telefon berformat "013-456 7890", IC, emel (@ → ruang),
// no. pekerja, dan nama — semua guna satu logik.
export function matchAllTerms(query: string, text: string, digitSource: string): boolean {
  const terms = normalizeCari(query).split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  const hayText = normalizeCari(text);
  const hayDigit = digitSource.replace(/\D/g, "");
  return terms.every((t) => {
    if (/^\d{3,}$/.test(t)) return hayDigit.includes(t) || hayText.includes(t);
    return hayText.includes(t);
  });
}
