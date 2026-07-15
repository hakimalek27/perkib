"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.replace("/admin/saguhati");
        router.refresh();
      } else {
        setError(data.error ?? "Kata laluan tidak sah.");
      }
    } catch {
      setError("Ralat sambungan. Sila cuba semula.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <Lock className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Panel Admin PERKIB</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log masuk untuk mengurus permohonan saguhati.</p>
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6">
        <Label htmlFor="password">Kata Laluan</Label>
        <div className="relative mt-1.5">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={(e) => setCapsOn(e.getModifierState?.("CapsLock") ?? false)}
            autoComplete="current-password"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Sembunyi kata laluan" : "Lihat kata laluan"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-primary"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {capsOn && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-warning">
            <AlertCircle className="size-3.5" /> Caps Lock dihidupkan.
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={loading} className="mt-6 w-full">
        {loading ? <><Loader2 className="size-4 animate-spin" /> Log masuk…</> : "Log Masuk"}
      </Button>
    </form>
  );
}
