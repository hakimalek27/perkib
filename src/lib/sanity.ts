// Pintu masuk Sanity CMS. Kembalikan data fallback statik dari src/content/*
// bila env tiada, supaya laman terus berfungsi tanpa projek Sanity.

import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

import {
  zones as zonesFallback,
  masjids as masjidsFallback,
  zoneByNombor,
  type Zon,
  type Wilayah,
  type JenisTempat,
} from "@/content/zon-masjid";
import {
  pegawaiFallback,
  kategoriLabel,
  type KategoriPegawai,
} from "@/content/pegawai";
import { ajkList, ajkKumpulanLabel, type AjkKumpulan } from "@/content/ajk";
import { programList, type Program } from "@/content/program";
import { faqList, type FaqEntry } from "@/content/faq";
import { jenisSaguhatiList, type JenisSaguhati } from "@/content/jenis-saguhati";
import { siteInfo } from "@/content/site";

export type { Zon, Wilayah } from "@/content/zon-masjid";
export type { KategoriPegawai } from "@/content/pegawai";
export type { Program } from "@/content/program";
export type { FaqEntry } from "@/content/faq";
export type { JenisSaguhati } from "@/content/jenis-saguhati";
export type { AjkKumpulan } from "@/content/ajk";
export { kategoriLabel, ajkKumpulanLabel };

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = "2025-01-01";
// Token baca (server-sahaja). WAJIB apabila dataset ditetapkan PRIVATE —
// tanpa token, dataset private balas kosong secara senyap. Bila token wujud,
// useCdn mesti false (permintaan bertoken tidak melalui CDN).
const readToken = process.env.SANITY_API_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

let _client: SanityClient | null = null;
function getClient(): SanityClient | null {
  if (!projectId) return null;
  if (_client) return _client;
  _client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !readToken,
    perspective: "published",
    ...(readToken ? { token: readToken } : {}),
  });
  return _client;
}

// Klien segar (tanpa CDN) — untuk data yang mesti terkini (verify, admin).
let _freshClient: SanityClient | null = null;
function getFreshClient(): SanityClient | null {
  if (!projectId) return null;
  if (_freshClient) return _freshClient;
  _freshClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: "published",
    ...(readToken ? { token: readToken } : {}),
  });
  return _freshClient;
}

const builder = projectId ? imageUrlBuilder({ projectId, dataset }) : null;

function urlForSquare(src: unknown, size: number): string | undefined {
  if (!src || !builder) return undefined;
  try {
    return builder
      .image(src as { _type: string; asset: { _ref: string } })
      .width(size)
      .height(size)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return undefined;
  }
}

export function isCmsEnabled(): boolean {
  return Boolean(projectId);
}

// ── Zon ──────────────────────────────────────────────────────────────
export function getZones(): Zon[] {
  return zonesFallback;
}

// ── Masjid ───────────────────────────────────────────────────────────
export type MasjidView = {
  id: string;
  nama: string;
  lokasi: string;
  isInduk: boolean;
  isNegeri: boolean;
  jenisTempat: JenisTempat;
  zonNombor: number;
  zonNama: string;
  wilayah: Wilayah;
};

function masjidFallback(): MasjidView[] {
  return masjidsFallback.map((m) => {
    const z = zoneByNombor(m.zonNombor);
    return {
      id: m.id,
      nama: m.nama,
      lokasi: m.lokasi,
      isInduk: m.isInduk,
      isNegeri: m.isNegeri,
      jenisTempat: m.jenisTempat,
      zonNombor: m.zonNombor,
      zonNama: z?.nama ?? `Zon ${m.zonNombor}`,
      wilayah: z?.wilayah ?? "kl",
    };
  });
}

export async function getMasjids(): Promise<MasjidView[]> {
  const client = getClient();
  if (!client) return masjidFallback();
  try {
    const rows = await client.fetch<
      Array<{
        id: string;
        nama: string;
        lokasi?: string;
        isInduk?: boolean;
        isNegeri?: boolean;
        jenisTempat?: JenisTempat;
        zonNombor?: number;
        zonNama?: string;
        wilayah?: Wilayah;
      }>
    >(
      `*[_type=="masjid"]|order(zon->nombor asc, isInduk desc, nama asc){
         "id": _id, nama, lokasi, isInduk, isNegeri, jenisTempat,
         "zonNombor": zon->nombor, "zonNama": zon->nama, "wilayah": zon->wilayah
       }`
    );
    if (!rows || rows.length === 0) return masjidFallback();
    return rows.map((m) => ({
      id: m.id,
      nama: m.nama,
      lokasi: m.lokasi ?? "",
      isInduk: m.isInduk ?? false,
      isNegeri: m.isNegeri ?? false,
      jenisTempat: m.jenisTempat ?? "masjid",
      zonNombor: m.zonNombor ?? 0,
      zonNama: m.zonNama ?? `Zon ${m.zonNombor ?? "-"}`,
      wilayah: m.wilayah ?? "kl",
    }));
  } catch (err) {
    console.error("getMasjids: fetch gagal, guna fallback", err);
    return masjidFallback();
  }
}

// Hanya masjid awam sebenar (jenisTempat "masjid", Zon 1–8) untuk direktori umum.
export async function getMasjidsAwam(): Promise<MasjidView[]> {
  const all = await getMasjids();
  return all.filter((m) => m.jenisTempat === "masjid" && m.zonNombor <= 8);
}

// ── Pegawai ──────────────────────────────────────────────────────────
export type PegawaiView = {
  employeeNo: string;
  nama: string;
  kategori: KategoriPegawai;
  jawatanPenuh: string;
  emelRasmi: string;
  gred: string;
  photoUrl?: string;
  masjidNama?: string;
  masjidZonNombor?: number;
  masjidZonNama?: string;
};

function pegawaiViewFallback(): PegawaiView[] {
  return pegawaiFallback.map((p) => ({ ...p }));
}

export async function getPegawai(): Promise<PegawaiView[]> {
  const client = getClient();
  if (!client) return pegawaiViewFallback();
  try {
    const rows = await client.fetch<
      Array<{
        employeeNo: string;
        nama: string;
        kategori: KategoriPegawai;
        jawatanPenuh?: string;
        emelRasmi?: string;
        gred?: string;
        photo?: unknown;
        masjidNama?: string;
        masjidZonNombor?: number;
        masjidZonNama?: string;
      }>
    >(
      // statusAktif != false → pegawai yang dinyahaktifkan (CRUD admin) hilang dari awam.
      `*[_type=="pegawai" && statusAktif != false]|order(nama asc){
         employeeNo, nama, kategori, jawatanPenuh, emelRasmi, gred,
         "photo": gambar,
         "masjidNama": masjid->nama,
         "masjidZonNombor": masjid->zon->nombor,
         "masjidZonNama": masjid->zon->nama
       }`
    );
    if (!rows || rows.length === 0) return pegawaiViewFallback();
    return rows.map((p) => ({
      employeeNo: p.employeeNo,
      nama: p.nama,
      kategori: p.kategori,
      jawatanPenuh: p.jawatanPenuh ?? "",
      emelRasmi: p.emelRasmi ?? "",
      gred: p.gred ?? "",
      photoUrl: urlForSquare(p.photo, 384),
      masjidNama: p.masjidNama ?? undefined,
      masjidZonNombor: p.masjidZonNombor ?? undefined,
      masjidZonNama: p.masjidZonNama ?? undefined,
    }));
  } catch (err) {
    console.error("getPegawai: fetch gagal, guna fallback", err);
    return pegawaiViewFallback();
  }
}

// Untuk pengesahan saguhati — dapatkan icLast4 + status (server-sahaja).
// Kembalikan null bila CMS tiada (verify tidak boleh berfungsi tanpa Sanity).
export type PegawaiVerify = {
  employeeNo: string;
  nama: string;
  kategori: KategoriPegawai;
  jawatanPenuh: string;
  emelRasmi: string;
  icLast4: string;
  statusAktif: boolean;
  masjidNama?: string;
  masjidZonNama?: string;
};

export async function getPegawaiForVerify(
  employeeNo: string
): Promise<PegawaiVerify | null> {
  const client = getFreshClient();
  if (!client) return null;
  const row = await client.fetch<PegawaiVerify | null>(
    `*[_type=="pegawai" && employeeNo==$emp][0]{
       employeeNo, nama, kategori, jawatanPenuh, emelRasmi,
       icLast4, statusAktif,
       "masjidNama": masjid->nama,
       "masjidZonNama": masjid->zon->nama
     }`,
    { emp: employeeNo }
  );
  return row ?? null;
}

// ── AJK ──────────────────────────────────────────────────────────────
export type AjkView = {
  id: string;
  employeeNo: string;
  nama: string;
  jawatan: string;
  kumpulan: AjkKumpulan;
  order: number;
  kategori?: KategoriPegawai;
  photoUrl?: string;
};

const KUMPULAN_RANK: Record<AjkKumpulan, number> = {
  tertinggi: 0,
  zon: 1,
  kluster: 2,
};

function ajkViewFallback(): AjkView[] {
  const byEmp = new Map(pegawaiFallback.map((p) => [p.employeeNo, p]));
  return ajkList.map((a) => ({
    id: a.id,
    employeeNo: a.employeeNo,
    nama: a.nama,
    jawatan: a.jawatan,
    kumpulan: a.kumpulan,
    order: a.order,
    kategori: byEmp.get(a.employeeNo)?.kategori,
  }));
}

export async function getAjk(): Promise<AjkView[]> {
  const client = getClient();
  if (!client) return ajkViewFallback();
  try {
    const rows = await client.fetch<
      Array<{
        id: string;
        employeeNo?: string;
        nama: string;
        jawatan: string;
        kumpulan: AjkKumpulan;
        order?: number;
        kategori?: KategoriPegawai;
        photo?: unknown;
      }>
    >(
      `*[_type=="ajkEntry"]{
         "id": _id, employeeNo, nama, jawatan, kumpulan, order,
         "kategori": pegawai->kategori,
         "photo": pegawai->gambar
       }`
    );
    if (!rows || rows.length === 0) return ajkViewFallback();
    return rows
      .map((a) => ({
        id: a.id,
        employeeNo: a.employeeNo ?? "",
        nama: a.nama,
        jawatan: a.jawatan,
        kumpulan: a.kumpulan,
        order: a.order ?? 100,
        kategori: a.kategori ?? undefined,
        photoUrl: urlForSquare(a.photo, 384),
      }))
      .sort(
        (x, y) =>
          KUMPULAN_RANK[x.kumpulan] - KUMPULAN_RANK[y.kumpulan] ||
          x.order - y.order
      );
  } catch (err) {
    console.error("getAjk: fetch gagal, guna fallback", err);
    return ajkViewFallback();
  }
}

// ── Program ──────────────────────────────────────────────────────────
export async function getPrograms(): Promise<Program[]> {
  const client = getClient();
  if (!client) return programList;
  try {
    const rows = await client.fetch<Program[]>(
      `*[_type=="program"]|order(order asc){
         "id": _id, icon, nama, penerangan, sasaran, jadual, order
       }`
    );
    return rows && rows.length > 0 ? rows : programList;
  } catch {
    return programList;
  }
}

// ── FAQ ──────────────────────────────────────────────────────────────
export async function getFaqs(): Promise<FaqEntry[]> {
  const client = getClient();
  if (!client) return faqList;
  try {
    const rows = await client.fetch<FaqEntry[]>(
      `*[_type=="faq"]|order(order asc){
         "id": _id, kategori, soalan, jawapan, order
       }`
    );
    return rows && rows.length > 0 ? rows : faqList;
  } catch {
    return faqList;
  }
}

// ── Jenis Saguhati ───────────────────────────────────────────────────
export async function getJenisSaguhati(): Promise<JenisSaguhati[]> {
  const client = getClient();
  if (!client) return jenisSaguhatiList;
  try {
    const rows = await client.fetch<JenisSaguhati[]>(
      `*[_type=="jenisSaguhati" && aktif != false]|order(bil asc){
         "id": _id, kod, bil, nama, kadar, dokumenSokongan, oneOff, catatan, hadMaksimum
       }`
    );
    return rows && rows.length > 0 ? rows : jenisSaguhatiList;
  } catch {
    return jenisSaguhatiList;
  }
}

export async function getJenisSaguhatiByKod(
  kod: string
): Promise<JenisSaguhati | undefined> {
  const all = await getJenisSaguhati();
  return all.find((j) => j.kod === kod);
}

// Kiraan permohonan sedia ada per jenis (kod) untuk seorang pegawai.
// Kira semua status KECUALI "tolak" (permohonan ditolak tidak mengira had).
export async function getSaguhatiUsage(
  employeeNo: string
): Promise<Record<string, number>> {
  const client = getFreshClient();
  if (!client) return {};
  try {
    const rows = await client.fetch<Array<{ jenisKod: string }>>(
      `*[_type=="permohonanSaguhati" && employeeNo==$emp && status != "tolak"]{ jenisKod }`,
      { emp: employeeNo }
    );
    const kira: Record<string, number> = {};
    for (const r of rows) if (r.jenisKod) kira[r.jenisKod] = (kira[r.jenisKod] ?? 0) + 1;
    return kira;
  } catch {
    return {};
  }
}

// ── Tetapan Laman (footer, telefon, bank, QR) ────────────────────────
export type SiteSettings = {
  footerDescription: string;
  phone: string;
  email: string;
  facebookUrl: string;
  bank: { name: string; account: string; holder: string; duitNowRef: string; qrImageUrl?: string };
  officeHours: { day: string; time: string }[];
};

const siteSettingsFallback: SiteSettings = {
  footerDescription:
    "Pertubuhan kebajikan bagi Naqib Masjid, Imam dan Bilal lantikan MAIWP yang berkhidmat di masjid-masjid Wilayah Persekutuan.",
  phone: siteInfo.phone,
  email: siteInfo.email,
  facebookUrl: siteInfo.facebook,
  bank: { ...siteInfo.bank },
  officeHours: [...siteInfo.officeHours],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const client = getClient();
  if (!client) return siteSettingsFallback;
  try {
    const data = await client.fetch<{
      footerDescription?: string;
      phone?: string;
      email?: string;
      facebookUrl?: string;
      bank?: { name?: string; account?: string; holder?: string; duitNowRef?: string; qrImageUrl?: string };
      officeHours?: { day: string; time: string }[];
    } | null>(
      `*[_type=="siteSettings"][0]{
         footerDescription, phone, email, facebookUrl,
         "bank": bankInfo{ name, account, holder, duitNowRef, "qrImageUrl": qrImage.asset->url },
         "officeHours": officeHours[]{ day, time }
       }`
    );
    if (!data) return siteSettingsFallback;
    return {
      footerDescription: data.footerDescription || siteSettingsFallback.footerDescription,
      phone: data.phone || siteSettingsFallback.phone,
      email: data.email || siteSettingsFallback.email,
      facebookUrl: data.facebookUrl || siteSettingsFallback.facebookUrl,
      bank: {
        name: data.bank?.name || siteSettingsFallback.bank.name,
        account: data.bank?.account || siteSettingsFallback.bank.account,
        holder: data.bank?.holder || siteSettingsFallback.bank.holder,
        duitNowRef: data.bank?.duitNowRef || siteSettingsFallback.bank.duitNowRef,
        qrImageUrl: data.bank?.qrImageUrl || undefined,
      },
      officeHours:
        data.officeHours && data.officeHours.length > 0
          ? data.officeHours
          : siteSettingsFallback.officeHours,
    };
  } catch (err) {
    console.error("getSiteSettings: fetch gagal, guna fallback", err);
    return siteSettingsFallback;
  }
}
