"use client";

import { useState, useTransition } from "react";
import { Mail, Phone, MessageCircle, Check, Clock, Inbox } from "lucide-react";
import { setMaklumBalasStatusAction } from "./actions";
import type { MaklumBalasItem } from "@/lib/admin-data";

const STATUS_TONE: Record<string, string> = {
  baru: "bg-primary/10 text-primary",
  dibaca: "bg-accent/15 text-accent-deep",
  selesai: "bg-success/10 text-success",
};
const STATUS_LABEL: Record<string, string> = { baru: "Baru", dibaca: "Dibaca", selesai: "Selesai" };
const FILTERS = ["semua", "baru", "dibaca", "selesai"] as const;

function waLink(phone: string): string {
  const d = phone.replace(/\D/g, "");
  const norm = d.startsWith("0") ? "6" + d : d.startsWith("6") ? d : "60" + d;
  return `https://wa.me/${norm}`;
}

export function MaklumBalasList({ items }: { items: MaklumBalasItem[] }) {
  const [filter, setFilter] = useState<string>("semua");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const shown = filter === "semua" ? items : items.filter((i) => i.status === filter);

  function updateStatus(id: string, status: string) {
    setBusyId(id);
    startTransition(async () => {
      await setMaklumBalasStatusAction(id, status);
      setBusyId(null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <Inbox className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Belum ada maklum balas diterima.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f === "semua" ? items.length : items.filter((i) => i.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {f === "semua" ? "Semua" : STATUS_LABEL[f]} ({count})
            </button>
          );
        })}
      </div>

      {shown.map((it) => (
        <article key={it._id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                STATUS_TONE[it.status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {STATUS_LABEL[it.status] ?? it.status}
            </span>
            <h3 className="font-display text-base font-bold text-ink">{it.subjek || "(Tiada subjek)"}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {it.nama} · {it.masa ? new Date(it.masa).toLocaleString("ms-MY") : ""}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{it.mesej}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs">
            {it.emel && (
              <a
                href={`mailto:${it.emel}?subject=${encodeURIComponent("RE: " + it.subjek)}`}
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Mail className="size-3.5" /> {it.emel}
              </a>
            )}
            {it.telefon && (
              <>
                <a
                  href={`tel:${it.telefon}`}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-ink"
                >
                  <Phone className="size-3.5" /> {it.telefon}
                </a>
                <a
                  href={waLink(it.telefon)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-success hover:underline"
                >
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              </>
            )}
            <div className="ml-auto flex gap-2">
              {it.status === "baru" && (
                <button
                  disabled={pending && busyId === it._id}
                  onClick={() => updateStatus(it._id, "dibaca")}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-semibold text-ink hover:bg-muted disabled:opacity-50"
                >
                  <Clock className="size-3.5" /> Tandai Dibaca
                </button>
              )}
              {it.status !== "selesai" && (
                <button
                  disabled={pending && busyId === it._id}
                  onClick={() => updateStatus(it._id, "selesai")}
                  className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1 font-semibold text-success hover:bg-success/20 disabled:opacity-50"
                >
                  <Check className="size-3.5" /> Selesai
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
