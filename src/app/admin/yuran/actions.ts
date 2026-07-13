"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWriteClient } from "@/lib/sanity-write";
import { writeAudit } from "@/lib/audit";
import type { KadarGred } from "@/lib/yuran";

function monthKey(bulan: number): string {
  return `m${String(bulan).padStart(2, "0")}`;
}

async function ensureDoc(
  client: NonNullable<ReturnType<typeof getWriteClient>>,
  employeeNo: string,
  tahun: number
): Promise<string> {
  const id = `yuran-${employeeNo}-${tahun}`;
  await client.createIfNotExists({
    _id: id,
    _type: "yuranTahunan",
    employeeNo,
    tahun,
    pegawai: { _type: "reference", _ref: `pegawai-${employeeNo}` },
  });
  return id;
}

export async function toggleBulanAction(
  employeeNo: string,
  tahun: number,
  bulan: number,
  dibayar: boolean,
  amaun: number,
  tarikhISO: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const id = await ensureDoc(client, employeeNo, tahun);
    const value = dibayar
      ? { dibayar: true, tarikh: tarikhISO.slice(0, 10), amaun, kaedah: "bulanan" }
      : { dibayar: false };
    await client.patch(id).set({ [monthKey(bulan)]: value }).commit();
    revalidatePath("/admin/yuran");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function tandaSetahunAction(
  employeeNo: string,
  tahun: number,
  amaunBulanan: number,
  tarikhISO: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const id = await ensureDoc(client, employeeNo, tahun);
    const patch: Record<string, unknown> = {};
    for (let b = 1; b <= 12; b++) {
      patch[monthKey(b)] = { dibayar: true, tarikh: tarikhISO.slice(0, 10), amaun: amaunBulanan, kaedah: "tahunan" };
    }
    await client.patch(id).set(patch).commit();
    await writeAudit("tanda-yuran-setahun", employeeNo, `${tahun} · RM${amaunBulanan * 12}`);
    revalidatePath("/admin/yuran");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function saveKadarAction(
  kadar: KadarGred[]
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "Tidak dibenarkan." };
  const client = getWriteClient();
  if (!client) return { ok: false, error: "Sistem tidak tersedia." };
  try {
    const clean = kadar
      .filter((k) => k.gred?.trim())
      .map((k) => ({ _key: k.gred.trim(), gred: k.gred.trim().toUpperCase(), bulanan: Number(k.bulanan) || 0 }));
    await client.createOrReplace({ _id: "yuranTetapan", _type: "yuranTetapan", kadar: clean });
    await writeAudit("kemas-kini-kadar-yuran", "yuranTetapan", `${clean.length} gred`);
    revalidatePath("/admin/yuran");
    revalidatePath("/admin/yuran/tetapan");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
