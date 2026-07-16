import { NextResponse, after } from "next/server";
import { randomUUID, createHash } from "node:crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyToken } from "@/lib/saguhati-token";
import { getWriteClient, isWriteEnabled } from "@/lib/sanity-write";
import { allocateRefNumber } from "@/lib/ref-number";
import { encryptValue, decryptValue } from "@/lib/crypto";
import { notifyPermohonanBaru, type PermohonanVars } from "@/lib/notifikasi";

export const runtime = "nodejs";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const ALLOWED_EXT = /\.(jpe?g|png|webp|pdf)$/i;

// Mutex dalam-memori per idemKey — serialize double-submit dalam satu proses.
// Digabung dengan _id deterministik + createIfNotExists untuk keselamatan silang-proses.
const chain = new Map<string, Promise<unknown>>();
function runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chain.get(key) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  chain.set(
    key,
    run.then(
      () => {},
      () => {}
    )
  );
  return run;
}

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
  const bankNama = String(form.get("bankNama") ?? "").trim().slice(0, 60);
  const bankAkaunRaw = String(form.get("bankAkaun") ?? "").replace(/\s|-/g, "");
  const telefonRaw = String(form.get("telefon") ?? "").replace(/\s|-/g, "");
  const idemKeyRaw = String(form.get("idemKey") ?? "").trim();

  if (!jenisKod) {
    return NextResponse.json({ ok: false, error: "Sila pilih jenis saguhati." }, { status: 400 });
  }
  if (!bankNama) {
    return NextResponse.json({ ok: false, error: "Sila masukkan nama bank." }, { status: 400 });
  }
  if (!/^\d{6,20}$/.test(bankAkaunRaw)) {
    return NextResponse.json(
      { ok: false, error: "No. akaun bank tidak sah (6–20 digit)." },
      { status: 400 }
    );
  }
  if (!/^0\d{8,11}$/.test(telefonRaw)) {
    return NextResponse.json(
      { ok: false, error: "No. telefon tidak sah (contoh: 0123456789)." },
      { status: 400 }
    );
  }

  // idemKey — jika tiada, jana rawak (tiada dedup, tetapi tetap berjaya).
  const idemKey = /^[\w-]{8,64}$/.test(idemKeyRaw) ? idemKeyRaw : `auto-${randomUUID()}`;

  // 3. Fail.
  const files = form.getAll("dokumen").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Sila muat naik sekurang-kurangnya satu dokumen sokongan." },
      { status: 400 }
    );
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: `Maksimum ${MAX_FILES} dokumen dibenarkan.` }, { status: 400 });
  }
  let total = 0;
  for (const f of files) {
    total += f.size;
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: `Fail "${f.name}" melebihi 5 MB.` }, { status: 400 });
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

  const docId = `permohonan-idem-${createHash("sha256").update(idemKey).digest("hex").slice(0, 24)}`;

  try {
    const result = await runExclusive(idemKey, async () => {
      // Idempotency: jika permohonan dengan idemKey ini sudah wujud, pulangkan sedia ada.
      const existing = await client.fetch<{ nomborRujukan?: string; dibatalkan?: boolean } | null>(
        `*[_type=="permohonanSaguhati" && _id==$id][0]{ nomborRujukan, dibatalkan }`,
        { id: docId }
      );
      // Rekod asal telah dibatalkan pentadbir — jangan pulangkan ref lama (pemohon tak jumpa
      // via semak status kerana ditapis). Minta mula permohonan baharu (sesi baru = idemKey baru).
      if (existing?.dibatalkan) {
        throw new SubmitError(
          409,
          "Permohonan asal telah dibatalkan oleh pentadbir. Sila mulakan permohonan baharu."
        );
      }
      if (existing?.nomborRujukan) {
        return { refNo: existing.nomborRujukan, created: false };
      }

      // Snapshot pegawai + jenis (dari server, jangan percaya klien).
      const pegawai = await client.fetch<{
        _id: string;
        nama?: string;
        emelRasmi?: string;
        jawatanPenuh?: string;
        masjid?: string;
        statusAktif?: boolean;
        noKpEnc?: string;
      } | null>(
        `*[_type=="pegawai" && employeeNo==$emp][0]{ _id, nama, emelRasmi, jawatanPenuh, "masjid": masjid->nama, statusAktif, noKpEnc }`,
        { emp: employeeNo }
      );
      const jenis = await client.fetch<{
        _id: string;
        nama?: string;
        kadar?: number;
        kod?: string;
        hadMaksimum?: number | null;
      } | null>(
        `*[_type=="jenisSaguhati" && kod==$kod][0]{ _id, nama, kadar, kod, hadMaksimum }`,
        { kod: jenisKod }
      );
      if (!pegawai) throw new SubmitError(404, "Rekod pegawai tidak dijumpai.");
      if (!jenis) throw new SubmitError(400, "Jenis saguhati tidak sah.");

      // Kuatkuasa had maksimum (seumur hidup; tidak kira yang ditolak atau dibatalkan).
      if (jenis.hadMaksimum != null) {
        const used = await client.fetch<number>(
          `count(*[_type=="permohonanSaguhati" && employeeNo==$emp && jenisKod==$kod && status != "tolak" && dibatalkan != true])`,
          { emp: employeeNo, kod: jenisKod }
        );
        if (used >= jenis.hadMaksimum) {
          throw new SubmitError(
            409,
            `Anda telah mencapai had maksimum (${jenis.hadMaksimum}) permohonan untuk "${jenis.nama}".`
          );
        }
      }

      // Muat naik fail — semua-atau-tiada.
      const dokumen = await Promise.all(
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

      // Peruntuk nombor rujukan + cipta dokumen (published).
      const now = new Date();
      const refNo = await allocateRefNumber(client, now.getFullYear());
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
        bankNama,
        bankAkaunEnc: encryptValue(bankAkaunRaw),
        telefonPemohonEnc: encryptValue(telefonRaw),
        idemKey,
        tarikhMohon: now.toISOString(),
        tarikhKemaskini: now.toISOString(),
      });

      // Baca semula no. rujukan sebenar (jika proses lain mencipta dahulu).
      const readback = await client.fetch<{ nomborRujukan?: string } | null>(
        `*[_id==$id][0]{ nomborRujukan }`,
        { id: docId }
      );
      const actualRef = readback?.nomborRujukan ?? refNo;
      const notifyVars: PermohonanVars & { telefonPemohon: string } = {
        refNo: actualRef,
        nama: pegawai.nama ?? "",
        noPekerja: employeeNo,
        noKp: decryptValue(pegawai.noKpEnc) ?? "",
        masjid: pegawai.masjid ?? "Belum ditugaskan",
        jenis: jenis.nama ?? "",
        kadar: jenis.kadar ?? 0,
        bankNama,
        bankAkaun: bankAkaunRaw,
        telefon: telefonRaw,
        telefonPemohon: telefonRaw,
      };
      return { refNo: actualRef, created: true, notifyVars };
    });

    // Notifikasi WhatsApp — HANYA jika permohonan benar-benar baharu dicipta
    // (elak WA berganda pada double-click). Fire-and-forget selepas respons.
    if (result.created && "notifyVars" in result && result.notifyVars) {
      const vars = result.notifyVars;
      after(() => notifyPermohonanBaru(vars));
    }
    return NextResponse.json({ ok: true, refNo: result.refNo, created: result.created });
  } catch (err) {
    if (err instanceof SubmitError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[submit] gagal", err);
    return NextResponse.json(
      { ok: false, error: "Permohonan gagal disimpan. Sila cuba semula." },
      { status: 500 }
    );
  }
}

class SubmitError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
