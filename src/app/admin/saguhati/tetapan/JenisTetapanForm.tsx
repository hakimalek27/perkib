"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { JenisAdmin } from "@/lib/admin-data";
import { updateJenisAction } from "../actions";

export function JenisTetapanForm({ initial }: { initial: JenisAdmin[] }) {
  const [rows, setRows] = useState(initial);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [, start] = useTransition();

  function update(id: string, field: keyof JenisAdmin, value: string | number | boolean | null) {
    setRows((r) => r.map((x) => (x._id === id ? { ...x, [field]: value } : x)));
  }

  function save(row: JenisAdmin) {
    setSavingId(row._id);
    start(async () => {
      const r = await updateJenisAction(row._id, {
        hadMaksimum: row.hadMaksimum,
        kadar: Number(row.kadar) || 0,
        aktif: row.aktif,
      });
      setSavingId(null);
      if (r.ok) toast.success(`"${row.nama}" dikemas kini.`);
      else toast.error(r.error ?? "Gagal.");
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="hidden grid-cols-12 gap-3 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
        <div className="col-span-5">Jenis Saguhati</div>
        <div className="col-span-2">Kadar (RM)</div>
        <div className="col-span-2">Had Maks</div>
        <div className="col-span-1">Aktif</div>
        <div className="col-span-2 text-right">Tindakan</div>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row._id} className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-12 sm:items-center">
            <div className="col-span-2 sm:col-span-5">
              <p className="text-sm font-semibold text-ink">{row.nama}</p>
              <p className="text-xs text-muted-foreground">{row.kod}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-muted-foreground sm:hidden">Kadar (RM)</label>
              <Input
                type="number"
                min={0}
                value={row.kadar}
                onChange={(e) => update(row._id, "kadar", Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-muted-foreground sm:hidden">Had Maks (kosong = tiada)</label>
              <Input
                type="number"
                min={1}
                placeholder="∞"
                value={row.hadMaksimum ?? ""}
                onChange={(e) =>
                  update(row._id, "hadMaksimum", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-1">
              <input
                type="checkbox"
                checked={row.aktif}
                onChange={(e) => update(row._id, "aktif", e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-xs text-muted-foreground sm:hidden">Aktif</span>
            </div>
            <div className="col-span-2 sm:col-span-2 sm:text-right">
              <Button variant="outline" size="sm" onClick={() => save(row)} disabled={savingId === row._id}>
                {savingId === row._id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Simpan
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
