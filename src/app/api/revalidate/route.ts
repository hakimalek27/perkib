import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { parseBody } from "next-sanity/webhook";

export const runtime = "nodejs";

// Peta jenis dokumen → laluan yang perlu di-revalidate bila kandungan berubah.
const PATHS_BY_TYPE: Record<string, string[]> = {
  pegawai: ["/pegawai", "/ajk", "/"],
  masjid: ["/direktori-masjid", "/"],
  zon: ["/direktori-masjid"],
  ajkEntry: ["/ajk", "/"],
  jenisSaguhati: ["/saguhati"],
  program: ["/program", "/"],
  faq: ["/soalan-lazim"],
  siteSettings: ["/", "/derma", "/hubungi"],
};

type WebhookBody = { _type?: string };

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<WebhookBody>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );
    if (!isValidSignature) {
      return NextResponse.json({ ok: false, error: "Tandatangan tidak sah" }, { status: 401 });
    }
    const type = body?._type;
    if (!type) {
      return NextResponse.json({ ok: false, error: "Tiada _type" }, { status: 400 });
    }
    const paths = PATHS_BY_TYPE[type] ?? ["/"];
    for (const p of paths) revalidatePath(p);
    return NextResponse.json({ ok: true, revalidated: paths });
  } catch (err) {
    console.error("[revalidate] gagal", err);
    return NextResponse.json({ ok: false, error: "Ralat dalaman" }, { status: 500 });
  }
}
