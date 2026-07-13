// Klien Sanity untuk skrip seed. Muat .env.local dan sahkan env.
import "dotenv/config";
import { createClient, type SanityClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";

// Muat .env.local secara eksplisit (dotenv/config hanya muat .env).
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

export function seedClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID tidak ditetapkan dalam .env.local");
  }
  if (!token) {
    throw new Error("SANITY_API_TOKEN tidak ditetapkan dalam .env.local (role Editor)");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    token,
    useCdn: false,
  });
}
