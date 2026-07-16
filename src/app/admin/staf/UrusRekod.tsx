"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Trash2, Loader2, AlertTriangle, Save, Inbox, Ban, RotateCcw, ArchiveX, RefreshCw } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { formatRM } from "@/lib/utils";
import type { PermohonanRingkas, MaklumBalasItem, PermohonanDibatalkan } from "@/lib/admin-data";
import {
  deletePermohonanAction,
  batalPermohonanAction,
  pulihPermohonanAction,
  updatePermohonanAction,
  bacaButiranPermohonanAction,
  deleteMaklumBalasAction,
  bacaKaunterAction,
  resetKaunterAction,
  type ButiranPermohonan,
  type KaunterInfo,
} from "./actions";

type Tab = "permohonan" | "maklumbalas";

export function UrusRekod({
  permohonan,
  maklumBalas,
}: {
  permohonan: PermohonanRingkas[];
  maklumBalas: MaklumBalasItem[];
}) {
  const [tab, setTab] = useState<Tab>("permohonan");
  return (
    <div className="mt-10 rounded-2xl border border-destructive/25 bg-destructive/[0.03] p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Urus Rekod (Zon Terhad)</h2>
          <p className="text-xs text-muted-foreground">
            Padam / edit rekod permohonan &amp; maklum balas — hanya di sebalik gate staf.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <TabBtn active={tab === "permohonan"} onClick={() => setTab("permohonan")}>
          Permohonan Saguhati ({permohonan.length})
        </TabBtn>
        <TabBtn active={tab === "maklumbalas"} onClick={() => setTab("maklumbalas")}>
          Maklum Balas ({maklumBalas.length})
        </TabBtn>
      </div>

      <div className="mt-5">
        {tab === "permohonan" ? (
          <PermohonanPanel rows={permohonan} />
        ) : (
          <MaklumBalasPanel rows={maklumBalas} />
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-primary text-white" : "border border-border bg-card text-ink/70 hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

// ── Permohonan: senarai (live search) + editor ─────────────────────────────
export function PermohonanPanel({ rows }: { rows: PermohonanRingkas[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PermohonanRingkas | null>(null);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows.slice(0, 60);
    return rows.filter(
      (r) =>
        r.nomborRujukan.toLowerCase().includes(q) ||
        r.namaPemohon.toLowerCase().includes(q) ||
        r.employeeNo.includes(q)
    );
  }, [rows, query]);

  return (
    <div className="space-y-6">
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari no. rujukan / nama / no. pekerja…"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <ul className="mt-3 max-h-[440px] space-y-2 overflow-auto pr-1">
          {list.map((r) => (
            <li key={r._id}>
              <button
                onClick={() => setSelected(r)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected?._id === r._id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold text-ink">{r.nomborRujukan}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.namaPemohon} · {r.jenisNama} · {formatRM(r.jenisKadar)}
                </p>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="text-sm text-muted-foreground">Tiada rekod sepadan.</li>}
        </ul>
      </div>
      <div>
        {selected ? (
          <PermohonanEditor key={selected._id} row={selected} onDeleted={() => setSelected(null)} />
        ) : (
          <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
            Pilih rekod di sebelah untuk edit butiran atau padam.
          </div>
        )}
      </div>
    </div>

      <ResetRujukanCard />
    </div>
  );
}

// ── Reset nombor rujukan (zon bahaya) — HANYA /admin/staf ────────────────────
// Set semula kaunter → permohonan seterusnya PKB-<tahun>-0001. Guard di server
// (resetKaunterAction) BLOK jika ada rekod aktif/dibatalkan yang pegang nombor
// rujukan — elak nombor bertindih. Dialog papar diagnosis + taip RESET.
function ResetRujukanCard() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [dialog, setDialog] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [info, setInfo] = useState<KaunterInfo | null>(null);
  const [konfirm, setKonfirm] = useState("");

  function buka() {
    setKonfirm("");
    setInfo(null);
    setMemuat(true);
    setDialog(true);
    bacaKaunterAction().then((res) => {
      if (res.ok && res.info) setInfo(res.info);
      else toast.error(res.error ?? "Gagal membaca kaunter.");
      setMemuat(false);
    });
  }

  function doReset() {
    start(async () => {
      const res = await resetKaunterAction();
      if (res.ok) {
        toast.success(`Kaunter direset — permohonan seterusnya ${res.info?.seterusnya ?? "PKB-0001"}.`);
        setDialog(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal reset kaunter.");
        if (res.info) setInfo(res.info); // segarkan kiraan jika guard menolak
      }
    });
  }

  const bolehReset = info?.bolehReset ?? false;

  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <RefreshCw className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold text-ink">Reset Nombor Rujukan</h3>
            <p className="text-xs text-muted-foreground">
              Set semula kaunter → permohonan seterusnya bermula <strong>0001</strong>. Untuk go-live / permulaan tahun.
            </p>
          </div>
        </div>
        <button
          onClick={buka}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-destructive/40 px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <RefreshCw className="size-4" /> Reset No. Rujukan
        </button>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !pending && setDialog(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <RefreshCw className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">Reset nombor rujukan?</h3>
            </div>

            {memuat ? (
              <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Membaca kaunter…
              </p>
            ) : info ? (
              <>
                <dl className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <div className="flex justify-between py-0.5">
                    <dt className="text-muted-foreground">Seq semasa</dt>
                    <dd className="font-semibold text-ink">{info.seq}</dd>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-border pt-1.5">
                    <dt className="text-muted-foreground">Selepas reset</dt>
                    <dd className="font-mono font-semibold text-primary">{info.seterusnya}</dd>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-border pt-1.5">
                    <dt className="text-muted-foreground">Permohonan {info.tahun}</dt>
                    <dd className="text-ink">
                      {info.total} ({info.aktif} aktif · {info.dibatalkan} dibatalkan)
                    </dd>
                  </div>
                </dl>

                {bolehReset ? (
                  <>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Taip <strong className="text-ink">RESET</strong> untuk sahkan:
                    </p>
                    <Input
                      className="mt-2"
                      value={konfirm}
                      onChange={(e) => setKonfirm(e.target.value)}
                      placeholder="RESET"
                      aria-label="Taip RESET untuk sahkan"
                    />
                  </>
                ) : (
                  <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700">
                    Tidak boleh reset — ada <strong>{info.total}</strong> rekod ({info.aktif} aktif · {info.dibatalkan}{" "}
                    dibatalkan) yang masih memegang nombor rujukan. Batalkan &amp; Padam Kekal rekod berkenaan dahulu
                    (elak nombor bertindih).
                  </p>
                )}
              </>
            ) : (
              <p className="py-4 text-sm text-destructive">Gagal membaca maklumat kaunter.</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDialog(false)}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium text-ink hover:bg-muted disabled:opacity-60"
              >
                Kembali
              </button>
              <button
                onClick={doReset}
                disabled={pending || !bolehReset || konfirm.trim() !== "RESET"}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PermohonanEditor({ row, onDeleted }: { row: PermohonanRingkas; onDeleted: () => void }) {
  const router = useRouter();
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();
  const [dialog, setDialog] = useState(false);
  const [konfirm, setKonfirm] = useState("");
  const [sebab, setSebab] = useState("");

  const [bankNama, setBankNama] = useState("");
  const [bankAkaun, setBankAkaun] = useState("");
  const [telefon, setTelefon] = useState("");
  const [catatanAdmin, setCatatanAdmin] = useState("");

  useEffect(() => {
    // Komponen di-key oleh row._id (remount setiap pilihan) → state mula segar,
    // jadi tak perlu reset loaded/loadErr secara segerak di sini.
    let alive = true;
    bacaButiranPermohonanAction(row._id).then((res) => {
      if (!alive) return;
      if (res.ok && res.butiran) {
        const b: ButiranPermohonan = res.butiran;
        setBankNama(b.bankNama);
        setBankAkaun(b.bankAkaun);
        setTelefon(b.telefon);
        setCatatanAdmin(b.catatanAdmin);
      } else {
        setLoadErr(res.error ?? "Gagal memuat butiran.");
      }
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [row._id]);

  function save() {
    start(async () => {
      const res = await updatePermohonanAction(row._id, { bankNama, bankAkaun, telefon, catatanAdmin });
      if (res.ok) {
        toast.success("Butiran dikemas kini.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal mengemas kini.");
      }
    });
  }

  function doBatal() {
    start(async () => {
      const res = await batalPermohonanAction(row._id, sebab);
      if (res.ok) {
        toast.success(`Permohonan ${row.nomborRujukan} dibatalkan.`);
        setDialog(false);
        onDeleted();
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal membatalkan.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold text-primary">{row.nomborRujukan}</p>
          <p className="text-xs text-muted-foreground">
            {row.namaPemohon} · {row.employeeNo}
          </p>
        </div>
        <button
          onClick={() => {
            setKonfirm("");
            setSebab("");
            setDialog(true);
          }}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/40 px-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/10"
        >
          <Ban className="size-4" /> Batalkan
        </button>
      </div>

      {!loaded ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Memuat butiran…
        </p>
      ) : loadErr ? (
        <p className="mt-6 text-sm text-destructive">{loadErr}</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Bank" htmlFor="ub-bank">
              <Input id="ub-bank" value={bankNama} onChange={(e) => setBankNama(e.target.value)} placeholder="cth. Bank Islam" />
            </Field>
            <Field label="No. Akaun Bank" htmlFor="ub-akaun" hint="Kosongkan = tak ubah">
              <Input id="ub-akaun" value={bankAkaun} onChange={(e) => setBankAkaun(e.target.value)} inputMode="numeric" placeholder="6–20 digit" />
            </Field>
          </div>
          <Field label="No. Telefon" htmlFor="ub-tel" hint="Kosongkan = tak ubah">
            <Input id="ub-tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} inputMode="tel" placeholder="cth. 0123456789" />
          </Field>
          <Field label="Catatan Admin" htmlFor="ub-catatan">
            <Textarea id="ub-catatan" rows={3} value={catatanAdmin} onChange={(e) => setCatatanAdmin(e.target.value)} placeholder="Catatan dalaman…" />
          </Field>
          <button
            onClick={save}
            disabled={pending}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Simpan Butiran
          </button>
        </div>
      )}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !pending && setDialog(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <Ban className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">Batalkan permohonan?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Batalkan <strong className="text-ink">{row.nomborRujukan}</strong> ({row.namaPemohon})? Rekod akan{" "}
              <strong className="text-ink">disembunyikan daripada admin biasa</strong> dan hanya kelihatan di tab
              &ldquo;Dibatalkan&rdquo; untuk pantauan. Ia <strong className="text-ink">boleh dipulihkan</strong> semula.
              Taip nombor rujukan untuk sahkan:
            </p>
            <Input
              className="mt-3"
              value={konfirm}
              onChange={(e) => setKonfirm(e.target.value)}
              placeholder={row.nomborRujukan}
              aria-label="Taip nombor rujukan untuk sahkan"
            />
            <div className="mt-3">
              <label htmlFor="sebab-batal" className="mb-1 block text-xs font-medium text-ink/70">
                Sebab pembatalan (opsyenal)
              </label>
              <Input
                id="sebab-batal"
                value={sebab}
                onChange={(e) => setSebab(e.target.value)}
                placeholder="cth. Permohonan berganda / ujian"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDialog(false)}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium text-ink hover:bg-muted disabled:opacity-60"
              >
                Kembali
              </button>
              <button
                onClick={doBatal}
                disabled={pending || konfirm.trim() !== row.nomborRujukan}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />} Batalkan Permohonan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Maklum balas: senarai + padam ──────────────────────────────────────────
export function MaklumBalasPanel({ rows }: { rows: MaklumBalasItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [dialogId, setDialogId] = useState<string | null>(null);
  const target = rows.find((r) => r._id === dialogId) ?? null;

  function doDelete(id: string) {
    start(async () => {
      const res = await deleteMaklumBalasAction(id);
      if (res.ok) {
        toast.success("Mesej maklum balas dipadam.");
        setDialogId(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal memadam.");
      }
    });
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-10 text-sm text-muted-foreground">
        <Inbox className="size-5" /> Tiada mesej maklum balas.
      </div>
    );
  }

  return (
    <>
      <ul className="max-h-[480px] space-y-3 overflow-auto pr-1">
        {rows.map((r) => (
          <li key={r._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{r.subjek || "(Tiada subjek)"}</p>
                <p className="text-xs text-muted-foreground">
                  {r.nama} · {r.masa ? new Date(r.masa).toLocaleString("ms-MY") : ""}
                </p>
              </div>
              <button
                onClick={() => setDialogId(r._id)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="size-4" /> Padam
              </button>
            </div>
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-ink/80">{r.mesej}</p>
          </li>
        ))}
      </ul>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !pending && setDialogId(null)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">Padam mesej?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Padam mesej maklum balas daripada <strong className="text-ink">{target.nama || "pengirim"}</strong>{" "}
              ({target.subjek || "tiada subjek"})? Tindakan ini tidak boleh dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDialogId(null)}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium text-ink hover:bg-muted disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={() => doDelete(target._id)}
                disabled={pending}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Permohonan DIBATALKAN (soft delete): pantau + pulih + padam kekal ────────
// Hanya di /admin/staf (gate kedua). Admin biasa tidak nampak rekod ini.
export function DibatalkanPanel({ rows }: { rows: PermohonanDibatalkan[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [padamId, setPadamId] = useState<string | null>(null);
  const [konfirm, setKonfirm] = useState("");
  const target = rows.find((r) => r._id === padamId) ?? null;

  function pulih(id: string, ruj: string) {
    start(async () => {
      const res = await pulihPermohonanAction(id);
      if (res.ok) {
        toast.success(`Permohonan ${ruj} dipulihkan.`);
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal memulihkan.");
      }
    });
  }

  function padamKekal(id: string, ruj: string) {
    start(async () => {
      const res = await deletePermohonanAction(id);
      if (res.ok) {
        toast.success(`Permohonan ${ruj} dipadam kekal.`);
        setPadamId(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal memadam.");
      }
    });
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-10 text-sm text-muted-foreground">
        <ArchiveX className="size-5" /> Tiada permohonan dibatalkan.
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Permohonan yang dibatalkan (soft delete) — tersembunyi daripada admin biasa &amp; semakan pemohon.
        Pulihkan untuk kembalikan, atau padam kekal (tidak boleh diundur).
      </p>
      <ul className="max-h-[480px] space-y-3 overflow-auto pr-1">
        {rows.map((r) => (
          <li key={r._id} className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{r.nomborRujukan}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.namaPemohon} · {r.employeeNo} · {r.jenisNama}
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Dibatalkan {r.dibatalkanPada ? new Date(r.dibatalkanPada).toLocaleString("ms-MY") : ""}
                  {r.sebabBatal ? ` — ${r.sebabBatal}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => pulih(r._id, r.nomborRujukan)}
                  disabled={pending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/30 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  <RotateCcw className="size-4" /> Pulihkan
                </button>
                <button
                  onClick={() => {
                    setKonfirm("");
                    setPadamId(r._id);
                  }}
                  disabled={pending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                >
                  <Trash2 className="size-4" /> Padam Kekal
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !pending && setPadamId(null)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">Padam kekal?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Padam <strong className="text-ink">{target.nomborRujukan}</strong> ({target.namaPemohon}) sepenuhnya?
              Ini memadam data peribadi pemohon (PDPA) dan <strong className="text-ink">tidak boleh diundur</strong>.
              Taip nombor rujukan untuk sahkan:
            </p>
            <Input
              className="mt-3"
              value={konfirm}
              onChange={(e) => setKonfirm(e.target.value)}
              placeholder={target.nomborRujukan}
              aria-label="Taip nombor rujukan untuk sahkan"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPadamId(null)}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium text-ink hover:bg-muted disabled:opacity-60"
              >
                Kembali
              </button>
              <button
                onClick={() => padamKekal(target._id, target.nomborRujukan)}
                disabled={pending || konfirm.trim() !== target.nomborRujukan}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Padam Kekal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
