/**
 * Klien Sanity server-sahaja dengan keistimewaan tulis.
 *
 * Digunakan oleh route submit permohonan saguhati (upload fail + cipta dokumen).
 * Simpan dalam modul berasingan supaya token tulis tidak bocor ke bundle klien.
 * Hanya Server Component & route handler boleh import dari sini.
 *
 * Env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN
 * (token role Editor dari Sanity Manage → API → Tokens; JANGAN prefix NEXT_PUBLIC_).
 */

import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN;
const apiVersion = "2025-01-01";

let _writeClient: SanityClient | null = null;

export function getWriteClient(): SanityClient | null {
  if (!projectId || !token) return null;
  if (_writeClient) return _writeClient;
  _writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: "raw",
    token,
  });
  return _writeClient;
}

export function isWriteEnabled(): boolean {
  return Boolean(projectId && token);
}
