import { defineConfig, type SchemaTypeDefinition } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "perkib-studio",
  title: "PERKIB — CMS",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  // Skema ditulis sebagai objek biasa (gaya rujukan mamkl.my). Cast di sempadan
  // ini kerana objek biasa tidak sepadan tepat dengan SchemaTypeDefinition
  // (cth `type: string` bukan literal) — selamat kerana ikut format Sanity.
  schema: { types: schemaTypes as unknown as SchemaTypeDefinition[] },
});
