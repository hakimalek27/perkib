"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldAlert } from "lucide-react";

export function StafGateForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/staf-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        // Digunakan inline (gate luput semasa carian) → reset state induk;
        // digunakan berdiri sendiri (page.tsx) → refresh server component.
        if (onSuccess) onSuccess();
        else router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 401 && data.error === "admin") {
        router.replace("/admin/login");
        return;
      }
      setError(data.error || "Kata laluan tidak sah.");
    } catch {
      setError("Ralat rangkaian. Cuba semula.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">Akses Terhad</h1>
            <p className="text-xs text-muted-foreground">Direktori Staf MAIWP</p>
          </div>
        </div>

        <p className="mb-4 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          Halaman ini mengandungi data peribadi 1,000+ kakitangan. Masukkan kata laluan gate untuk
          meneruskan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="staf-gate-pw" className="mb-1 block text-sm font-medium text-ink">
              Kata Laluan Gate
            </label>
            <input
              id="staf-gate-pw"
              type="password"
              autoFocus
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy || !password}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Buka Direktori
          </button>
        </form>
      </div>
    </div>
  );
}
