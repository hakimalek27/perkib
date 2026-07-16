"use client";

import { useState } from "react";
import { Users, FileText, MessageSquare, KeyRound, Ban, type LucideIcon } from "lucide-react";
import type { PermohonanRingkas, MaklumBalasItem, PermohonanDibatalkan } from "@/lib/admin-data";
import { StafSearch } from "./StafSearch";
import { PermohonanPanel, MaklumBalasPanel, DibatalkanPanel } from "./UrusRekod";
import { KataLaluanTab } from "./KataLaluanTab";

type TabKey = "cari" | "permohonan" | "maklumbalas" | "dibatalkan" | "katalaluan";

export function StafTabs({
  total,
  permohonan,
  maklumBalas,
  dibatalkan,
}: {
  total: number;
  permohonan: PermohonanRingkas[];
  maklumBalas: MaklumBalasItem[];
  dibatalkan: PermohonanDibatalkan[];
}) {
  const [tab, setTab] = useState<TabKey>("cari");

  const tabs: { key: TabKey; label: string; icon: LucideIcon; badge?: number }[] = [
    { key: "cari", label: "Cari Staf MAIWP", icon: Users },
    { key: "permohonan", label: "Permohonan", icon: FileText, badge: permohonan.length },
    { key: "maklumbalas", label: "Maklum Balas", icon: MessageSquare, badge: maklumBalas.length },
    { key: "dibatalkan", label: "Dibatalkan", icon: Ban, badge: dibatalkan.length },
    { key: "katalaluan", label: "Kata Laluan", icon: KeyRound },
  ];

  return (
    <div>
      {/* Bar tab */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-white shadow-soft"
                  : "border border-border bg-card text-ink/70 hover:border-primary/40"
              }`}
            >
              <Icon className="size-4" />
              {t.label}
              {typeof t.badge === "number" && (
                <span
                  className={`ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    active ? "bg-white/20 text-white" : "bg-muted text-ink/60"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Kandungan tab */}
      <div className="mt-6">
        {tab === "cari" && <StafSearch total={total} />}
        {tab === "permohonan" && <PermohonanPanel rows={permohonan} />}
        {tab === "maklumbalas" && <MaklumBalasPanel rows={maklumBalas} />}
        {tab === "dibatalkan" && <DibatalkanPanel rows={dibatalkan} />}
        {tab === "katalaluan" && <KataLaluanTab />}
      </div>
    </div>
  );
}
