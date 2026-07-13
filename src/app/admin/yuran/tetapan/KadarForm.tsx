"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { KadarGred } from "@/lib/yuran";
import { saveKadarAction } from "../actions";

const DEFAULT: KadarGred[] = [
  { gred: "S1", bulanan: 10 },
  { gred: "S5", bulanan: 15 },
  { gred: "S9", bulanan: 15 },
];

export function KadarForm({ initial }: { initial: KadarGred[] }) {
  const [rows, setRows] = useState<KadarGred[]>(initial.length ? initial : DEFAULT);
  const [pending, start] = useTransition();

  function update(i: number, field: keyof KadarGred, value: string) {
    setRows((r) => r.map((x, idx) => (idx === i ? { ...x, [field]: field === "bulanan" ? Number(value) : value } : x)));
  }
  function add() {
    setRows((r) => [...r, { gred: "", bulanan: 0 }]);
  }
  function remove(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }
  function save() {
    start(async () => {
      const r = await saveKadarAction(rows);
      if (r.ok) toast.success("Kadar yuran disimpan.");
      else toast.error(r.error ?? "Gagal.");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="space-y-3">
        <div className="hidden grid-cols-[1fr_1fr_auto] gap-3 text-xs font-semibold uppercase text-muted-foreground sm:grid">
          <span>Gred</span>
          <span>Kadar Sebulan (RM)</span>
          <span></span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
            <div>
              <Label className="sm:hidden">Gred</Label>
              <Input value={row.gred} onChange={(e) => update(i, "gred", e.target.value)} placeholder="cth: S1" />
            </div>
            <div>
              <Label className="sm:hidden">RM/bulan</Label>
              <Input type="number" min={0} value={row.bulanan} onChange={(e) => update(i, "bulanan", e.target.value)} />
            </div>
            <button
              onClick={() => remove(i)}
              className="rounded-lg p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Buang"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" /> Tambah Gred
        </Button>
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <Button variant="primary" size="lg" onClick={save} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Simpan Kadar
        </Button>
      </div>
    </div>
  );
}
