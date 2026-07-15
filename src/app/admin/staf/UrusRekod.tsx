"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Trash2, Loader2, AlertTriangle, Save, Inbox } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { formatRM } from "@/lib/utils";
import type { PermohonanRingkas, MaklumBalasItem } from "@/lib/admin-data";
import {
  deletePermohonanAction,
  updatePermohonanAction,
  bacaButiranPermohonanAction,
  deleteMaklumBalasAction,
  type ButiranPermohonan,
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
function PermohonanPanel({ rows }: { rows: PermohonanRingkas[] }) {
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
  );
}

function PermohonanEditor({ row, onDeleted }: { row: PermohonanRingkas; onDeleted: () => void }) {
  const router = useRouter();
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();
  const [dialog, setDialog] = useState(false);
  const [konfirm, setKonfirm] = useState("");

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

  function doDelete() {
    start(async () => {
      const res = await deletePermohonanAction(row._id);
      if (res.ok) {
        toast.success(`Permohonan ${row.nomborRujukan} dipadam.`);
        setDialog(false);
        onDeleted();
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal memadam.");
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
            setDialog(true);
          }}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="size-4" /> Padam
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
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">Padam permohonan?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Padam <strong className="text-ink">{row.nomborRujukan}</strong> ({row.namaPemohon}) sepenuhnya?
              Ini memadam data peribadi pemohon (PDPA) dan tidak boleh dibatalkan. Taip nombor rujukan untuk sahkan:
            </p>
            <Input
              className="mt-3"
              value={konfirm}
              onChange={(e) => setKonfirm(e.target.value)}
              placeholder={row.nomborRujukan}
              aria-label="Taip nombor rujukan untuk sahkan"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDialog(false)}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium text-ink hover:bg-muted disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={doDelete}
                disabled={pending || konfirm.trim() !== row.nomborRujukan}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Padam Kekal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Maklum balas: senarai + padam ──────────────────────────────────────────
function MaklumBalasPanel({ rows }: { rows: MaklumBalasItem[] }) {
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
