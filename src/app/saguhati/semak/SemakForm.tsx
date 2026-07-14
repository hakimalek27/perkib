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

// Peringkat timeline (spek §8.6). Indeks tertinggi "dicapai" per status sebenar.
const STAGES = [
  { label: "Dihantar", desc: "Permohonan diterima sistem" },
  { label: "Dalam Semakan", desc: "Sedang diproses oleh urus setia" },
  { label: "Keputusan", desc: "Diluluskan atau tidak diluluskan" },
  { label: "Pembayaran", desc: "Saguhati dikreditkan ke akaun" },
];
const REACHED: Record<string, number> = { baru: 0, diproses: 1, lulus: 2, tolak: 2, dibayar: 3 };

function StatusTimeline({ status }: { status: string }) {
  const reached = REACHED[status] ?? 0;
  const rejected = status === "tolak";
  const terminal = status === "tolak" || status === "dibayar";
  return (
    <ol className="mt-6 space-y-0">
      {STAGES.map((s, i) => {
        const done = i <= reached;
        const current = !terminal && i === reached + 1;
        const isKeputusanTolak = rejected && i === 2;
        const skipped = rejected && i === 3; // pembayaran tidak berkenaan bila ditolak
        const last = i === STAGES.length - 1;
        return (
          <li key={s.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 items-center justify-center text-[11px] font-bold",
                  isKeputusanTolak
                    ? "bg-destructive text-white"
                    : done
                      ? "bg-primary text-white"
                      : current
                        ? "animate-pulse bg-primary text-white motion-reduce:animate-none"
                        : "bg-muted text-muted-foreground"
                )}
                style={{ clipPath: "url(#archClip)" }}
              >
                {done && !isKeputusanTolak ? "✓" : i + 1}
              </span>
              {!last && (
                <span
                  className={cn("mt-1 w-[2px] flex-1", i < reached ? "bg-accent" : "bg-border")}
                  style={{ minHeight: "1.75rem" }}
                />
              )}
            </div>
            <div className={cn("pb-6", skipped && "opacity-40")}>
              <p className={cn("text-sm font-semibold", done || current || isKeputusanTolak ? "text-ink" : "text-muted-foreground")}>
                {isKeputusanTolak ? "Keputusan: Tidak Diluluskan" : s.label}
                {current && <span className="ml-2 text-xs font-medium text-primary">· Semasa</span>}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

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
            <p className="font-display text-2xl font-bold text-primary">{result.nomborRujukan}</p>
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

        {/* Timeline menegak node arch */}
        <StatusTimeline status={result.status} />

        <dl className="mt-2 space-y-4 border-t border-border pt-5 text-sm">
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
