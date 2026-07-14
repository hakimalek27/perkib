"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Upload, User } from "lucide-react";
import { createPegawaiAction, updatePegawaiAction } from "./actions";
import type { MasjidOption } from "@/lib/admin-data";

export type PegawaiInitial = {
  employeeNo: string;
  nama: string;
  kategori: string;
  jawatanPenuh: string;
  emelRasmi: string;
  gred: string;
  masjidId: string | null;
  statusAktif: boolean;
  photoUrl: string | null;
  icLast4: string | null;
  hasTelefon: boolean;
};

const KATEGORI = [
  { value: "ketua-imam", label: "Ketua Imam" },
  { value: "timbalan-ketua-imam", label: "Timbalan Ketua Imam" },
  { value: "bilal", label: "Bilal" },
];

export function PegawaiForm({
  mode,
  masjids,
  initial,
}: {
  mode: "cipta" | "kemas-kini";
  masjids: MasjidOption[];
  initial?: PegawaiInitial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(initial?.photoUrl ?? null);

  // Kumpul masjid ikut zon untuk optgroup.
  const zonGroups = useMemo(() => {
    const map = new Map<string, MasjidOption[]>();
    for (const m of masjids) {
      const key = m.zonNama ?? (m.zonNombor ? `Zon ${m.zonNombor}` : "Lain-lain");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [masjids]);

  function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFotoPreview(URL.createObjectURL(f));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res =
        mode === "cipta"
          ? await createPegawaiAction(fd)
          : await updatePegawaiAction(initial!.employeeNo, fd);
      if (res.ok) {
        toast.success(mode === "cipta" ? "Pegawai berjaya ditambah." : "Maklumat pegawai dikemas kini.");
        const emp = res.employeeNo ?? initial!.employeeNo;
        router.push(`/admin/pegawai/${emp}`);
        router.refresh();
      } else {
        setError(res.error ?? "Ralat tidak diketahui.");
        toast.error(res.error ?? "Gagal menyimpan.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Foto */}
      <div className="flex items-center gap-4">
        <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
          {fotoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoPreview} alt="Pratonton" className="size-full object-cover" />
          ) : (
            <User className="size-8 text-muted-foreground" />
          )}
        </span>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-ink hover:border-primary">
            <Upload className="size-4" />
            {mode === "cipta" ? "Muat naik foto" : "Tukar foto"}
            <input type="file" name="gambar" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFotoChange} />
          </label>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG atau WEBP · maksimum 5MB{mode === "kemas-kini" ? " · biar kosong untuk kekalkan" : ""}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="No. Pekerja" required>
          <input
            name="employeeNo"
            defaultValue={initial?.employeeNo ?? ""}
            readOnly={mode === "kemas-kini"}
            required
            inputMode="numeric"
            placeholder="cth. 1692"
            className={inputCls + (mode === "kemas-kini" ? " bg-muted text-muted-foreground" : "")}
          />
        </Field>
        <Field label="Gred">
          <input name="gred" defaultValue={initial?.gred ?? ""} placeholder="cth. S5" className={inputCls} />
        </Field>

        <Field label="Nama Penuh" required className="sm:col-span-2">
          <input name="nama" defaultValue={initial?.nama ?? ""} required minLength={3} placeholder="Nama penuh pegawai" className={inputCls} />
        </Field>

        <Field label="Kategori" required>
          <select name="kategori" defaultValue={initial?.kategori ?? ""} required className={inputCls}>
            <option value="" disabled>
              — Pilih kategori —
            </option>
            {KATEGORI.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Jawatan Penuh">
          <input name="jawatanPenuh" defaultValue={initial?.jawatanPenuh ?? ""} placeholder="cth. Pegawai Hal Ehwal Islam" className={inputCls} />
        </Field>

        <Field label="Emel Rasmi" className="sm:col-span-2">
          <input name="emelRasmi" type="email" defaultValue={initial?.emelRasmi ?? ""} placeholder="nama@maiwp.gov.my" className={inputCls} />
        </Field>

        <Field
          label="No. Kad Pengenalan"
          hint={mode === "kemas-kini" ? (initial?.icLast4 ? `Tersimpan (••••${initial.icLast4}) — biar kosong untuk kekalkan` : "Belum ada — isi untuk tambah") : "12 digit tanpa sengkang"}
        >
          <input name="noKp" inputMode="numeric" maxLength={12} placeholder={mode === "kemas-kini" ? "••••••••••••" : "900101012345"} className={inputCls} />
        </Field>
        <Field
          label="No. Telefon"
          hint={mode === "kemas-kini" ? (initial?.hasTelefon ? "Tersimpan — biar kosong untuk kekalkan" : "Belum ada — isi untuk tambah") : "cth. 0123456789"}
        >
          <input name="telefon" inputMode="tel" placeholder={mode === "kemas-kini" ? "••••••••••" : "0123456789"} className={inputCls} />
        </Field>

        <Field label="Masjid Bertugas" className="sm:col-span-2">
          <select name="masjidId" defaultValue={initial?.masjidId ?? ""} className={inputCls}>
            <option value="">— Belum ditugaskan —</option>
            {zonGroups.map(([zon, list]) => (
              <optgroup key={zon} label={zon}>
                {list.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input type="checkbox" name="statusAktif" defaultChecked={initial ? initial.statusAktif : true} className="size-4 rounded border-input" />
        Pegawai aktif (dipaparkan di direktori awam &amp; boleh mohon saguhati)
      </label>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {mode === "cipta" ? "Tambah Pegawai" : "Simpan Perubahan"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-11 items-center rounded-lg border border-input px-5 text-sm font-medium text-ink hover:bg-muted"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
