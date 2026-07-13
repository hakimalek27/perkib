// Log audit ringkas — direkod oleh setiap server action admin yang mengubah data.
// Server-only.

import { getWriteClient } from "./sanity-write";

export async function writeAudit(aksi: string, sasaran: string, ringkasan: string): Promise<void> {
  const client = getWriteClient();
  if (!client) return;
  try {
    await client.create({
      _type: "auditLog",
      masa: new Date().toISOString(),
      aksi,
      sasaran,
      ringkasan,
    });
  } catch (err) {
    console.error("[audit] gagal menulis", err);
  }
}
