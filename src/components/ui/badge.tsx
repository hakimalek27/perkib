import * as React from "react";
import { cn } from "@/lib/utils";

// Lencana Nadi — pil (radius penuh) untuk status & kategori. Tint 10–18% + teks
// tona. Bukan warna sahaja: sentiasa berpasangan dengan label yang boleh dibaca.
export type BadgeTone =
  | "brand"
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

const TONE: Record<BadgeTone, string> = {
  brand: "bg-primary/10 text-primary",
  gold: "bg-accent/15 text-accent-deep",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  neutral: "bg-neutral/15 text-muted-foreground",
};

// Peta status permohonan/maklum balas → tona. SATU sumber untuk semua paparan
// status (admin senarai, admin butiran, semak awam, maklum balas).
export const STATUS_TONE: Record<string, BadgeTone> = {
  baru: "brand",
  diproses: "gold",
  dibaca: "gold",
  lulus: "success",
  selesai: "success",
  tolak: "danger",
  dibayar: "success",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "brand", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold",
        TONE[tone],
        className
      )}
      {...props}
    />
  );
}
