import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWriteClient } from "@/lib/sanity-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Proksi dokumen sokongan — hanya admin. Menyembunyikan URL CDN mentah daripada
// HTML admin; strim fail melalui pelayan dengan header no-store.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const { ref } = await params;
  // Sahkan format ref aset Sanity (file-<hash>-<ext> / image-<hash>-<dim>-<ext>).
  if (!/^(file|image)-[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(ref)) {
    return NextResponse.json({ error: "Rujukan tidak sah" }, { status: 400 });
  }

  const client = getWriteClient();
  if (!client) return NextResponse.json({ error: "Sistem tidak tersedia" }, { status: 503 });

  const asset = await client.fetch<{ url?: string; mimeType?: string; originalFilename?: string } | null>(
    `*[_id==$ref][0]{ url, mimeType, originalFilename }`,
    { ref }
  );
  if (!asset?.url) return NextResponse.json({ error: "Dokumen tidak dijumpai" }, { status: 404 });

  const upstream = await fetch(asset.url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Gagal memuat dokumen" }, { status: 502 });
  }
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${(asset.originalFilename || "dokumen").replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
