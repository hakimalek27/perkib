import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getStafLain } from "@/lib/staf-lain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentType(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ emp: string }> }
) {
  // Guard: admin sahaja.
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }

  const { emp } = await params;
  const staf = getStafLain(emp);
  if (!staf || !staf.photoFile) {
    return NextResponse.json({ error: "Foto tidak dijumpai" }, { status: 404 });
  }

  const dir = process.env.STAF_PHOTO_DIR;
  if (!dir) {
    return NextResponse.json({ error: "STAF_PHOTO_DIR belum ditetapkan" }, { status: 503 });
  }

  // Anti path-traversal: guna HANYA basename daripada indeks (bukan input pengguna),
  // dan sahkan laluan yang diselesaikan kekal dalam direktori foto.
  const safeName = path.basename(staf.photoFile);
  const full = path.resolve(dir, safeName);
  const dirResolved = path.resolve(dir);
  if (!full.startsWith(dirResolved + path.sep)) {
    return NextResponse.json({ error: "Laluan tidak sah" }, { status: 400 });
  }
  if (!fs.existsSync(full)) {
    return NextResponse.json({ error: "Fail foto tiada" }, { status: 404 });
  }

  const buffer = fs.readFileSync(full);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType(safeName),
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
