"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Phone, Mail, User, Loader2 } from "lucide-react";
import { StafGateForm } from "./StafGateForm";

type StafHit = {
  employeeNo: string;
  nama: string;
  noKp: string;
  noTel: string;
  emel: string;
  gred: string;
  jawatan: string;
  bahagian: string;
  hasPhoto: boolean;
};

function waLink(noTel: string): string | null {
  const digits = (noTel || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return "60" + digits.slice(1);
  return "60" + digits;
}

export function StafSearch({ total }: { total: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<StafHit[]>([]);
  const [found, setFound] = useState(0);
  const [capped, setCapped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gateLost, setGateLost] = useState(false);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset segerak dikendalikan dalam onChange (event handler) — BUKAN dalam effect,
  // supaya elak setState segerak dalam badan effect (react-hooks/set-state-in-effect).
  function handleChange(value: string) {
    setQ(value);
    setError(null);
    const t = value.trim();
    if (t.length < 2) {
      abortRef.current?.abort();
      setHits([]);
      setFound(0);
      setCapped(false);
      setBusy(false);
    } else {
      setBusy(true); // papar spinner serta-merta pada ketukan kekunci
    }
  }

  // Effect HANYA menjadualkan fetch berdebounce; semua setState di dalam callback async.
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) return;

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/admin/staf-cari?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        if (res.status === 401) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (data.error === "admin") {
            router.replace("/admin/login");
            return;
          }
          setGateLost(true); // gate luput → papar panel gate inline
          setBusy(false);
          return;
        }
        if (res.status === 429) {
          setError("Terlalu banyak carian. Perlahan sedikit.");
          setBusy(false);
          return;
        }
        const data = (await res.json()) as { results: StafHit[]; total: number; capped: boolean };
        setHits(data.results);
        setFound(data.total);
        setCapped(data.capped);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Ralat carian. Cuba semula.");
      } finally {
        setBusy(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [q, router, retry]);

  if (gateLost) {
    return (
      <div>
        <p className="mb-4 text-sm text-warning">Sesi gate tamat. Sila masukkan kata laluan semula.</p>
        <StafGateForm
          onSuccess={() => {
            setGateLost(false);
            setBusy(true);
            setRetry((r) => r + 1); // cetus semula carian dengan query semasa
          }}
        />
      </div>
    );
  }

  const trimmed = q.trim();

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold text-primary-dark md:text-3xl">
          Direktori Staf MAIWP
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Carian maklumat {total.toLocaleString("ms-MY")} kakitangan MAIWP lain — cari ikut nama,
          no. pekerja, IC, telefon atau emel (klik terus WhatsApp). Akses admin sahaja.
        </p>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => handleChange(e.target.value)}
            autoFocus
            autoComplete="off"
            placeholder="Taip nama, no. pekerja, IC, telefon atau emel…"
            aria-label="Cari staf MAIWP"
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {busy && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {trimmed.length > 0 && trimmed.length < 2 && (
        <p className="mt-6 text-sm text-muted-foreground italic">Taip sekurang-kurangnya 2 aksara.</p>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {trimmed.length >= 2 && !error && (
        <>
          <p className="mt-4 text-xs text-muted-foreground">
            {found} hasil{capped ? " (papar 30 pertama — perincikan carian)" : ""}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hits.map((s) => {
              const wa = waLink(s.noTel);
              return (
                <div key={s.employeeNo} className="rounded-xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-start gap-3">
                    <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {s.hasPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/admin/staf-foto/${s.employeeNo}`}
                          alt={s.nama}
                          className="size-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <User className="size-6 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{s.nama}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.jawatan || "—"}</p>
                      <p className="truncate text-[11px] text-muted-foreground/80">
                        {s.gred || "—"} · {s.employeeNo}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-muted-foreground">No. KP</dt>
                      <dd className="text-ink">{s.noKp || "—"}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="w-16 shrink-0 text-muted-foreground">Telefon</dt>
                      <dd className="flex items-center gap-2 text-ink">
                        {s.noTel || "—"}
                        {wa && (
                          <a
                            href={`https://wa.me/${wa}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success hover:bg-success/20"
                          >
                            <Phone className="size-2.5" /> WA
                          </a>
                        )}
                      </dd>
                    </div>
                    {s.emel && (
                      <div className="flex items-center gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Emel</dt>
                        <dd className="flex min-w-0 items-center gap-1 text-ink">
                          <Mail className="size-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{s.emel}</span>
                        </dd>
                      </div>
                    )}
                    {s.bahagian && (
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Bahagian</dt>
                        <dd className="text-ink">{s.bahagian}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              );
            })}
          </div>
          {!busy && hits.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Tiada staf sepadan dengan &ldquo;{trimmed}&rdquo;.
            </p>
          )}
        </>
      )}
    </div>
  );
}
