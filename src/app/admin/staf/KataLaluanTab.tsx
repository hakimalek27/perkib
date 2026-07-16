"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldCheck, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { tukarKataLaluanAction } from "./actions";

export function KataLaluanTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-primary/[0.04] p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Tukar kata laluan halaman admin di sini. Kata laluan disimpan sebagai <strong>hash</strong> (bukan
            teks biasa). Selepas ditukar, kata laluan <code className="rounded bg-black/10 px-1">.env</code> lama
            menjadi sandaran sahaja. Minimum <strong>12 aksara</strong>.
          </span>
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TukarBorang
          jenis="admin"
          tajuk="Kata Laluan Admin"
          nota="Kata laluan log masuk panel /admin."
        />
        <TukarBorang
          jenis="staf"
          tajuk="Kata Laluan Gate Staf"
          nota="Kata laluan kedua untuk halaman /admin/staf ini."
        />
      </div>
    </div>
  );
}

function TukarBorang({ jenis, tajuk, nota }: { jenis: "admin" | "staf"; tajuk: string; nota: string }) {
  const [semasa, setSemasa] = useState("");
  const [baru, setBaru] = useState("");
  const [sahkan, setSahkan] = useState("");
  const [pending, start] = useTransition();

  const boleh = semasa.length > 0 && baru.length >= 12 && baru === sahkan && baru !== semasa;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!boleh) return;
    start(async () => {
      const res = await tukarKataLaluanAction(jenis, semasa, baru, sahkan);
      if (res.ok) {
        toast.success(`${tajuk} berjaya ditukar.`);
        setSemasa("");
        setBaru("");
        setSahkan("");
      } else {
        toast.error(res.error ?? "Gagal menukar kata laluan.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{tajuk}</h3>
          <p className="text-xs text-muted-foreground">{nota}</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <Field label="Kata laluan semasa" htmlFor={`${jenis}-semasa`}>
          <Input
            id={`${jenis}-semasa`}
            type="password"
            autoComplete="current-password"
            value={semasa}
            onChange={(e) => setSemasa(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Field label="Kata laluan baharu" htmlFor={`${jenis}-baru`} hint="Minimum 12 aksara">
          <Input
            id={`${jenis}-baru`}
            type="password"
            autoComplete="new-password"
            value={baru}
            onChange={(e) => setBaru(e.target.value)}
            placeholder="••••••••••••"
            aria-invalid={baru.length > 0 && baru.length < 12}
          />
        </Field>
        <Field
          label="Sahkan kata laluan baharu"
          htmlFor={`${jenis}-sahkan`}
          error={sahkan.length > 0 && sahkan !== baru ? "Tidak sepadan dengan kata laluan baharu." : undefined}
        >
          <Input
            id={`${jenis}-sahkan`}
            type="password"
            autoComplete="new-password"
            value={sahkan}
            onChange={(e) => setSahkan(e.target.value)}
            placeholder="••••••••••••"
            aria-invalid={sahkan.length > 0 && sahkan !== baru}
          />
        </Field>
        <button
          type="submit"
          disabled={!boleh || pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Tukar Kata Laluan
        </button>
      </div>
    </form>
  );
}
