// Penjana nombor rujukan permohonan saguhati: PKB-<tahun>-####
// Guna dokumen kaunter Sanity dengan patch().inc — Sanity serialize mutasi
// per dokumen, jadi setiap commit dapat seq unik (tiada race condition).

import type { SanityClient } from "next-sanity";

export async function allocateRefNumber(
  client: SanityClient,
  year: number
): Promise<string> {
  const counterId = `counter-saguhati-${year}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await client.createIfNotExists({
        _id: counterId,
        _type: "counter",
        seq: 0,
      });
      const res = await client
        .patch(counterId)
        .setIfMissing({ seq: 0 })
        .inc({ seq: 1 })
        .commit<{ seq: number }>({ returnDocuments: true, autoGenerateArrayKeys: true });
      const seq = (res as unknown as { seq?: number })?.seq;
      if (typeof seq === "number" && seq > 0) {
        return `PKB-${year}-${String(seq).padStart(4, "0")}`;
      }
    } catch (err) {
      console.error(`allocateRefNumber cubaan ${attempt + 1} gagal`, err);
    }
  }

  // Fallback — jangan sesekali biarkan permohonan hilang kerana kaunter gagal.
  const stamp = Date.now().toString(36).toUpperCase();
  return `PKB-${year}-T${stamp}`;
}
