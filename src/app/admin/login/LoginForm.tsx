"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-elev">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <Lock className="size-7" />
        </span>
        <h1 className="font-display mt-4 text-2xl font-semibold text-primary-dark">Panel Admin</h1>
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
        <Input
          id="password"
          type="password"
          className="mt-1.5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={loading} className="mt-6 w-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Log masuk…
          </>
        ) : (
          "Log Masuk"
        )}
      </Button>
    </form>
  );
}
