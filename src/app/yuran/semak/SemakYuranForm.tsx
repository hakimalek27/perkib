"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Search, Check, X as XIcon, Wallet } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import type { RekodYuranTahun } from "@/lib/yuran";

type Hasil = { nama: string; employeeNo: string; rekod: RekodYuranTahun[] };
const BULAN = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

export function SemakYuranForm() {
  const [employeeNo, setEmployeeNo] = useState("");
  const [icLast4, setIcLast4] = useState("");
  const [captcha, setCaptcha] = useState<{ soalan: string; token: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasil, setHasil] = useState<Hasil | null>(null);

  function loadCaptcha() {
    fetch("/api/captcha")
      .then((r) => r.json())
      .then((d) => {
        if (d.soalan && d.token) setCaptcha({ soalan: d.soalan, token: d.token });
      })
      .catch(() => setCaptcha(null));
  }
  useEffect(() => {
    loadCaptcha();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/yuran/semak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeNo,
          icLast4,
          captchaToken: captcha?.token ?? "",
          captchaAnswer,
          namaPenuh: honeypot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setHasil({ nama: data.nama, employeeNo: data.employeeNo, rekod: data.rekod });
      } else {
        setError(data.error ?? "Semakan gagal.");
        loadCaptcha();
        setCaptchaAnswer("");
      }
    } catch {
      setError("Ralat sambungan. Sila cuba semula.");
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  }

  if (hasil) {
    return (
      <div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">{hasil.nama}</h2>
              <p className="text-xs text-muted-foreground">No. Pekerja: {hasil.employeeNo}</p>
            </div>
          </div>
        </div>

        {hasil.rekod.map((r) => (
          <div key={r.tahun} className="mt-5 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink">Tahun {r.tahun}</h3>
              <span className="text-sm font-semibold text-primary">
                {r.bilDibayar}/12 bulan{r.jumlahDibayar > 0 ? ` · RM${r.jumlahDibayar.toFixed(2)}` : ""}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {r.bulan.map((b, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center ${
                    b.dibayar ? "border-primary/30 bg-primary/5" : "border-border bg-muted/40"
                  }`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full ${
                      b.dibayar ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.dibayar ? <Check className="size-3.5" /> : <XIcon className="size-3.5" />}
                  </span>
                  <span className="text-xs font-medium text-ink">{BULAN[i]}</span>
                  {b.dibayar && b.amaun ? (
                    <span className="text-[10px] text-muted-foreground">RM{b.amaun.toFixed(0)}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setHasil(null);
            setEmployeeNo("");
            setIcLast4("");
            setCaptchaAnswer("");
            loadCaptcha();
          }}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-input px-5 text-sm font-semibold text-ink hover:bg-muted"
        >
          Semak No. Pekerja Lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="No. Pekerja" htmlFor="emp">
          <Input
            id="emp"
            value={employeeNo}
            onChange={(e) => setEmployeeNo(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="cth. 1889"
            inputMode="numeric"
            required
          />
        </Field>
        <Field label="4 Digit Akhir Kad Pengenalan" htmlFor="ic">
          <Input
            id="ic"
            value={icLast4}
            onChange={(e) => setIcLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            inputMode="numeric"
            required
          />
        </Field>
      </div>

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] top-0" tabIndex={-1}>
        <label>
          Nama penuh
          <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div className="mt-4">
        <Label htmlFor="captcha">Pengesahan Keselamatan</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="flex h-11 min-w-[5rem] items-center justify-center rounded-lg border border-border bg-muted px-3 font-display text-lg font-bold tracking-wider text-ink">
            {captcha ? `${captcha.soalan} =` : "…"}
          </span>
          <Input
            id="captcha"
            className="w-24"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value.replace(/[^\d-]/g, "").slice(0, 3))}
            placeholder="?"
            inputMode="numeric"
            required
            aria-label="Jawapan pengesahan"
          />
          <button
            type="button"
            onClick={loadCaptcha}
            className="rounded-lg p-2.5 text-muted-foreground hover:bg-muted hover:text-primary"
            aria-label="Soalan baharu"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Semak Rekod Yuran
      </button>
    </form>
  );
}
