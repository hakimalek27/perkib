"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Accordion Nadi tanpa Radix — mod "single collapsible" (satu terbuka pada satu masa,
// boleh tutup semua) menggunakan CSS grid-template-rows 0fr→1fr (kelas .acc-panel).
// Menepati API yang dipakai /soalan-lazim: <Accordion type collapsible> + Item/Trigger/
// Content. Papan kekunci: Tab fokus trigger (butang), Enter/Space toggle (native).

type AccordionCtx = { openValue: string | null; setOpenValue: (v: string | null) => void };
const Ctx = React.createContext<AccordionCtx | null>(null);

type ItemCtx = { value: string; open: boolean; triggerId: string; panelId: string };
const ItemContext = React.createContext<ItemCtx | null>(null);

export function Accordion({
  defaultValue = null,
  className,
  children,
}: {
  // `type`/`collapsible` diterima untuk keserasian API tetapi mod sentiasa
  // single+collapsible (satu-satunya mod yang dilaksana).
  type?: "single";
  collapsible?: boolean;
  defaultValue?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  const [openValue, setOpenValue] = React.useState<string | null>(defaultValue);
  return (
    <Ctx.Provider value={{ openValue, setOpenValue }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(Ctx);
  const uid = React.useId().replace(/:/g, "");
  const open = ctx?.openValue === value;
  return (
    <ItemContext.Provider value={{ value, open, triggerId: `acc-t-${uid}`, panelId: `acc-p-${uid}` }}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-colors",
          open && "border-accent/50",
          className
        )}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(Ctx);
  const item = React.useContext(ItemContext);
  if (!ctx || !item) return null;
  return (
    <h3 className="flex">
      <button
        type="button"
        id={item.triggerId}
        aria-expanded={item.open}
        aria-controls={item.panelId}
        onClick={() => ctx.setOpenValue(item.open ? null : item.value)}
        className={cn(
          "flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink transition-colors hover:text-primary",
          item.open && "text-primary",
          className
        )}
      >
        {children}
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-accent transition-transform duration-300",
            item.open && "rotate-180"
          )}
        />
      </button>
    </h3>
  );
}

export function AccordionContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const item = React.useContext(ItemContext);
  if (!item) return null;
  return (
    <div
      id={item.panelId}
      role="region"
      aria-labelledby={item.triggerId}
      data-open={item.open}
      className="acc-panel text-sm"
    >
      <div className="min-h-0 overflow-hidden">
        <div className={cn("px-5 pb-5 pt-0 leading-relaxed text-muted-foreground", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
