import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyToken } from "@/lib/saguhati-token";
import { getWriteClient, isWriteEnabled } from "@/lib/sanity-write";
import { allocateRefNumber } from "@/lib/ref-number";

export const runtime = "nodejs";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const ALLOWED_EXT = /\.(jpe?g|png|webp|pdf)$/i;

export async function POST(req: Request) {
  if (!isWriteEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Sistem permohonan belum dikonfigurasi. Sila hubungi urus setia." },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  const rl = rateLimit(`submit:${ip}`, { capacity: 8, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak permohonan. Sila cuba semula sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_TOTAL_BYTES + 1024 * 512) {
    return NextResponse.json({ ok: false, error: "Saiz muat naik terlalu besar." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Data borang tidak sah." }, { status: 400 });
  }

  // 1. Sahkan token (bukti telah verify identiti).
  const token = String(form.get("token") ?? "");
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: "Sesi pengesahan tamat. Sila sahkan identiti semula." },
      { status: 401 }
    );
  }
  const employeeNo = payload.emp;

  // 2. Medan.
  const jenisKod = String(form.get("jenisKod") ?? "").trim();
  const catatan = String(form.get("catatan") ?? "").trim().slice(0, 2000);
  if (!jenisKod) {
    return NextResponse.json({ ok: false, error: "Sila pilih jenis saguhati." }, { status: 400 });
  }

  // 3. Fail.
  const files = form.getAll("dokumen").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Sila muat naik sekurang-kurangnya satu dokumen sokongan." },
      { status: 400 }
    );
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { ok: false, error: `Maksimum ${MAX_FILES} dokumen dibenarkan.` },
      { status: 400 }
    );
  }
  let total = 0;
  for (const f of files) {
    total += f.size;
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `Fail "${f.name}" melebihi 5 MB.` },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME.has(f.type) || !ALLOWED_EXT.test(f.name)) {
      return NextResponse.json(
        { ok: false, error: `Jenis fail "${f.name}" tidak dibenarkan (hanya JPG, PNG, WEBP, PDF).` },
        { status: 400 }
      );
    }
  }
  if (total > MAX_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: "Jumlah saiz fail terlalu besar." }, { status: 400 });
  }

  const client = getWriteClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "Sistem tidak tersedia." }, { status: 503 });
  }

  // 4. Dapatkan snapshot pegawai + jenis (dari server, jangan percaya klien).
  let pegawai: {
    _id: string;
    nama?: string;
    emelRasmi?: string;
    jawatanPenuh?: string;
    masjid?: string;
    statusAktif?: boolean;
  } | null;
  let jenis: { _id: string; nama?: string; kadar?: number; kod?: string } | null;
  try {
    pegawai = await client.fetch(
      `*[_type=="pegawai" && employeeNo==$emp][0]{ _id, nama, emelRasmi, jawatanPenuh, "masjid": masjid->nama, statusAktif }`,
      { emp: employeeNo }
    );
    jenis = await client.fetch(
      `*[_type=="jenisSaguhati" && kod==$kod][0]{ _id, nama, kadar, kod }`,
      { kod: jenisKod }
    );
  } catch (err) {
    console.error("[submit] fetch gagal", err);
    return NextResponse.json({ ok: false, error: "Ralat sistem. Sila cuba lagi." }, { status: 500 });
  }

  if (!pegawai) {
    return NextResponse.json({ ok: false, error: "Rekod pegawai tidak dijumpai." }, { status: 404 });
  }
  if (!jenis) {
    return NextResponse.json({ ok: false, error: "Jenis saguhati tidak sah." }, { status: 400 });
  }

  // 5. Muat naik fail — semua-atau-tiada.
  let dokumen: Array<{ _type: "file"; _key: string; asset: { _type: "reference"; _ref: string } }>;
  try {
    dokumen = await Promise.all(
      files.map(async (f, i) => {
        const buffer = Buffer.from(await f.arrayBuffer());
        const asset = await client.assets.upload("file", buffer, {
          filename: f.name,
          contentType: f.type,
        });
        return {
          _type: "file" as const,
          _key: `dok-${i}-${randomUUID().slice(0, 8)}`,
          asset: { _type: "reference" as const, _ref: asset._id },
        };
      })
    );
  } catch (err) {
    console.error("[submit] muat naik fail gagal", err);
    return NextResponse.json(
      { ok: false, error: "Muat naik dokumen gagal. Sila cuba semula." },
      { status: 502 }
    );
  }

  // 6. Peruntuk nombor rujukan + cipta dokumen (published).
  const now = new Date();
  const year = now.getFullYear();
  let refNo: string;
  try {
    refNo = await allocateRefNumber(client, year);
    const docId = `permohonan-${refNo.toLowerCase()}`;
    await client.createIfNotExists({
      _id: docId,
      _type: "permohonanSaguhati",
      nomborRujukan: refNo,
      status: "baru",
      employeeNo,
      namaPemohon: pegawai.nama ?? "",
      emelPemohon: pegawai.emelRasmi ?? "",
      jawatanPemohon: pegawai.jawatanPenuh ?? "",
      masjidPemohon: pegawai.masjid ?? "Belum ditugaskan",
      jenisKod: jenis.kod ?? jenisKod,
      jenisNama: jenis.nama ?? "",
      jenisKadar: jenis.kadar ?? 0,
      pegawai: { _type: "reference", _ref: pegawai._id },
      jenis: { _type: "reference", _ref: jenis._id },
      catatan,
      dokumen,
      tarikhMohon: now.toISOString(),
      tarikhKemaskini: now.toISOString(),
    });
  } catch (err) {
    console.error("[submit] cipta permohonan gagal", err);
    return NextResponse.json(
      { ok: false, error: "Permohonan gagal disimpan. Sila cuba semula." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, refNo });
}
