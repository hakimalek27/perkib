"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Check } from "lucide-react";
import { cn, formatRM } from "@/lib/utils";
import type { YuranRow } from "@/lib/yuran";
import { toggleBulanAction, tandaSetahunAction } from "./actions";

const BULAN = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

export function YuranMatrix({ rows: initial, tahun }: { rows: YuranRow[]; tahun: number }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  function recompute(r: YuranRow): YuranRow {
    return { ...r, jumlah: r.bulan.reduce((s, m) => s + (m.dibayar ? m.amaun ?? 0 : 0), 0) };
  }

  async function toggle(emp: string, bulanIdx: number) {
    const idx = rows.findIndex((r) => r.employeeNo === emp);
    if (idx < 0) return;
    const row = rows[idx];
    const current = row.bulan[bulanIdx].dibayar;
    if (!current && row.kadar <= 0) {
      toast.error(`Kadar untuk gred ${row.gred} belum ditetapkan.`);
      return;
    }
    const key = `${emp}-${bulanIdx}`;
    setBusy(key);
    const nextPaid = !current;
    const amaun = row.kadar;
    // optimistik
    setRows((rs) =>
      rs.map((r, i) => {
        if (i !== idx) return r;
        const bulan = r.bulan.map((m, j) =>
          j === bulanIdx ? { ...m, dibayar: nextPaid, amaun: nextPaid ? amaun : m.amaun } : m
        );
        return recompute({ ...r, bulan });
      })
    );
    const res = await toggleBulanAction(emp, tahun, bulanIdx + 1, nextPaid, amaun, new Date().toISOString());
    setBusy(null);
    if (!res.ok) {
      setRows(initial); // revert kasar
      toast.error(res.error ?? "Gagal.");
    }
  }

  async function tandaSetahun(emp: string) {
    const row = rows.find((r) => r.employeeNo === emp);
    if (!row) return;
    if (row.kadar <= 0) {
      toast.error(`Kadar untuk gred ${row.gred} belum ditetapkan.`);
      return;
    }
    setBusy(`year-${emp}`);
    setRows((rs) =>
      rs.map((r) =>
        r.employeeNo === emp
          ? recompute({ ...r, bulan: r.bulan.map((m) => ({ ...m, dibayar: true, amaun: r.kadar })) })
          : r
      )
    );
    const res = await tandaSetahunAction(emp, tahun, row.kadar, new Date().toISOString());
    setBusy(null);
    if (res.ok) toast.success(`${row.nama}: yuran ${tahun} ditanda lunas.`);
    else {
      setRows(initial);
      toast.error(res.error ?? "Gagal.");
    }
  }

  function exportCsv() {
    const head = ["No. Pekerja", "Nama", "Gred", "Masjid", "Zon", ...BULAN, "Jumlah (RM)"];
    const lines = [head.join(",")];
    for (const r of rows) {
      const cells = [
        r.employeeNo,
        `"${r.nama.replace(/"/g, '""')}"`,
        r.gred,
        `"${(r.masjidNama ?? "").replace(/"/g, '""')}"`,
        r.zonNombor ?? "",
        ...r.bulan.map((m) => (m.dibayar ? (m.amaun ?? 0) : "")),
        r.jumlah,
      ];
      lines.push(cells.join(","));
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yuran-perkib-${tahun}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const jumlahBesar = rows.reduce((s, r) => s + r.jumlah, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} pegawai · Jumlah kutipan: <span className="font-semibold text-success">{formatRM(jumlahBesar)}</span>
        </p>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-primary hover:border-primary/40"
        >
          <Download className="size-4" /> Eksport CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full min-w-[56rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2.5 text-left">Pegawai</th>
              {BULAN.map((b, i) => (
                <th key={b} className={cn("px-1.5 py-2.5 text-center font-medium", i + 1 === new Date().getMonth() + 1 && "text-primary")}>
                  {b}
                </th>
              ))}
              <th className="px-2 py-2.5 text-right">Jumlah</th>
              <th className="px-2 py-2.5 text-center">Setahun</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={16} className="px-4 py-8 text-center text-muted-foreground">
                  Tiada pegawai.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.employeeNo} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-card px-3 py-2">
                  <p className="whitespace-nowrap font-medium text-ink">{r.nama}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.gred} · {formatRM(r.kadar)}/bln · Zon {r.zonNombor ?? "-"}
                  </p>
                </td>
                {r.bulan.map((m, i) => {
                  const key = `${r.employeeNo}-${i}`;
                  return (
                    <td key={i} className="px-1 py-1.5 text-center">
                      <button
                        onClick={() => toggle(r.employeeNo, i)}
                        disabled={busy === key}
                        aria-label={`${BULAN[i]} ${m.dibayar ? "dibayar" : "belum"}`}
                        className={cn(
                          "mx-auto flex size-7 items-center justify-center rounded-md border transition-colors",
                          m.dibayar
                            ? "border-success bg-success text-white"
                            : "border-border bg-background text-transparent hover:border-primary/50"
                        )}
                      >
                        <Check className="size-4" />
                      </button>
                    </td>
                  );
                })}
                <td className="whitespace-nowrap px-2 py-2 text-right font-semibold text-ink">{formatRM(r.jumlah)}</td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => tandaSetahun(r.employeeNo)}
                    disabled={busy === `year-${r.employeeNo}`}
                    className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-primary hover:border-primary/40"
                  >
                    Lunas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
