"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, FileClock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn, formatRM } from "@/lib/utils";

type Permohonan = {
  nomborRujukan: string;
  status: string;
  statusLabel: string;
  jenisNama?: string;
  jenisKadar?: number;
  tarikhMohon?: string;
  tarikhKemaskini?: string;
  catatanAdmin?: string | null;
};

const STATUS_TONE: Record<string, string> = {
  baru: "bg-primary/10 text-primary",
  diproses: "bg-accent/15 text-accent-deep",
  lulus: "bg-success/15 text-success",
  tolak: "bg-destructive/10 text-destructive",
  dibayar: "bg-success/20 text-success",
};

function formatTarikh(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("ms-MY", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SemakForm() {
  const [refNo, setRefNo] = useState("");
  const [employeeNo, setEmployeeNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Permohonan | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/saguhati/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refNo, employeeNo }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult(data.permohonan);
      } else {
        setError(data.error ?? "Permohonan tidak dijumpai.");
      }
    } catch {
      setError("Ralat sambungan. Sila cuba semula.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-elev md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nombor Rujukan
            </p>
            <p className="font-display text-2xl font-semibold text-primary">{result.nomborRujukan}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              STATUS_TONE[result.status] ?? "bg-muted text-muted-foreground"
            )}
          >
            {result.statusLabel}
          </span>
        </div>
        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Jenis Saguhati</dt>
            <dd className="text-right font-medium text-ink">{result.jenisNama ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Kadar</dt>
            <dd className="text-right font-semibold text-accent-deep">
              {result.jenisKadar != null ? formatRM(result.jenisKadar) : "-"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Tarikh Mohon</dt>
            <dd className="text-right text-ink">{formatTarikh(result.tarikhMohon)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Kemas Kini Terakhir</dt>
            <dd className="text-right text-ink">{formatTarikh(result.tarikhKemaskini)}</dd>
          </div>
          {result.catatanAdmin && (
            <div className="rounded-lg border border-border bg-background p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Catatan Admin
              </dt>
              <dd className="mt-1 text-ink">{result.catatanAdmin}</dd>
            </div>
          )}
        </dl>
        <Button variant="outline" className="mt-6" onClick={() => setResult(null)}>
          <RotateCcw className="size-4" /> Semak Permohonan Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <FileClock className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-primary-dark">Semak Status Permohonan</h2>
          <p className="text-sm text-muted-foreground">
            Masukkan nombor rujukan dan nombor pekerja anda.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <Label htmlFor="refNo">Nombor Rujukan</Label>
          <Input
            id="refNo"
            className="mt-1.5"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            placeholder="Contoh: PKB-2026-0001"
            required
          />
        </div>
        <div>
          <Label htmlFor="employeeNoSemak">No. Pekerja</Label>
          <Input
            id="employeeNoSemak"
            className="mt-1.5"
            value={employeeNo}
            onChange={(e) => setEmployeeNo(e.target.value)}
            placeholder="Contoh: 1743"
            inputMode="numeric"
            required
          />
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={loading} className="mt-7 w-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Menyemak…
          </>
        ) : (
          <>
            <Search className="size-4" /> Semak Status
          </>
        )}
      </Button>
    </form>
  );
}
