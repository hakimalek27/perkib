"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { toast } from "sonner";
import { GripVertical, Search, UserCog, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { assignPegawaiAction } from "./actions";

type Masjid = { id: string; nama: string; zonNombor: number; jenisTempat: string };
type Zon = { nombor: number; nama: string };
type Peg = { employeeNo: string; nama: string; kategori: string; gred: string; masjidId: string | null };

const KAT_LABEL: Record<string, string> = {
  "ketua-imam": "Ketua Imam",
  "timbalan-ketua-imam": "Timbalan",
  bilal: "Bilal",
};

export function PenugasanBoard({
  pegawai,
  masjids,
  zones,
}: {
  pegawai: Peg[];
  masjids: Masjid[];
  zones: Zon[];
}) {
  const [assign, setAssign] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(pegawai.map((p) => [p.employeeNo, p.masjidId ?? null]))
  );
  const [zone, setZone] = useState<number>(zones[0]?.nombor ?? 1);
  const [q, setQ] = useState("");

  const info = useMemo(() => Object.fromEntries(pegawai.map((p) => [p.employeeNo, p])), [pegawai]);
  const masjidById = useMemo(() => Object.fromEntries(masjids.map((m) => [m.id, m])), [masjids]);
  const masjidsByZone = useMemo(() => {
    const g: Record<number, Masjid[]> = {};
    for (const m of masjids) (g[m.zonNombor] ??= []).push(m);
    return g;
  }, [masjids]);

  const move = useCallback(
    async (emp: string, masjidId: string | null) => {
      const prev = assign[emp] ?? null;
      if (prev === masjidId) return;
      setAssign((a) => ({ ...a, [emp]: masjidId }));
      const r = await assignPegawaiAction(emp, masjidId, masjidId ? masjidById[masjidId]?.nama : undefined);
      if (!r.ok) {
        setAssign((a) => ({ ...a, [emp]: prev }));
        toast.error(r.error ?? "Gagal menugaskan.");
      } else {
        toast.success(
          `${info[emp]?.nama ?? emp} → ${masjidId ? masjidById[masjidId]?.nama : "Belum Ditugaskan"}`
        );
      }
    },
    [assign, info, masjidById]
  );

  useEffect(
    () =>
      monitorForElements({
        onDrop({ source, location }) {
          const target = location.current.dropTargets[0];
          if (!target) return;
          const emp = String(source.data.emp);
          const masjidId = (target.data.masjidId as string | null) ?? null;
          void move(emp, masjidId);
        },
      }),
    [move]
  );

  const query = q.trim().toLowerCase();
  const matches = (p: Peg) =>
    !query || p.nama.toLowerCase().includes(query) || p.employeeNo.includes(query);

  const zoneMasjids = masjidsByZone[zone] ?? [];
  const unassigned = pegawai.filter((p) => !assign[p.employeeNo]);

  return (
    <div className="space-y-5">
      {/* Pemilih zon + carian */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {zones.map((z) => (
            <button
              key={z.nombor}
              onClick={() => setZone(z.nombor)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                zone === z.nombor
                  ? "bg-primary text-white shadow-soft"
                  : "bg-card text-muted-foreground hover:bg-primary/5 hover:text-primary border border-border"
              )}
            >
              {z.nombor === 9 ? "Posting Khas" : `Zon ${z.nombor}`}
            </button>
          ))}
        </div>
        <div className="relative ml-auto min-w-[14rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari pegawai…"
            className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Seret kad pegawai ke masjid lain, atau guna menu &ldquo;Pindah ke…&rdquo; pada setiap kad.
        Perubahan disimpan serta-merta.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        {/* Lajur masjid zon terpilih */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {zoneMasjids.map((m) => (
            <Column key={m.id} masjidId={m.id} title={m.nama} subtitle={m.jenisTempat !== "masjid" ? m.jenisTempat : undefined}>
              {pegawai
                .filter((p) => assign[p.employeeNo] === m.id)
                .map((p) => (
                  <OfficerCard
                    key={p.employeeNo}
                    peg={p}
                    dim={!matches(p)}
                    masjidsByZone={masjidsByZone}
                    zones={zones}
                    onPick={(target) => move(p.employeeNo, target)}
                  />
                ))}
            </Column>
          ))}
          {zoneMasjids.length === 0 && (
            <p className="text-sm text-muted-foreground">Tiada masjid dalam zon ini.</p>
          )}
        </div>

        {/* Kolam belum ditugaskan */}
        <Column masjidId={null} title="Belum Ditugaskan" tone="warn">
          {unassigned.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground italic">Semua pegawai telah ditugaskan.</p>
          )}
          {unassigned.map((p) => (
            <OfficerCard
              key={p.employeeNo}
              peg={p}
              dim={!matches(p)}
              masjidsByZone={masjidsByZone}
              zones={zones}
              onPick={(target) => move(p.employeeNo, target)}
            />
          ))}
        </Column>
      </div>
    </div>
  );
}

function Column({
  masjidId,
  title,
  subtitle,
  tone,
  children,
}: {
  masjidId: string | null;
  title: string;
  subtitle?: string;
  tone?: "warn";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ masjidId }),
      onDragEnter: () => setOver(true),
      onDragLeave: () => setOver(false),
      onDrop: () => setOver(false),
    });
  }, [masjidId]);
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card p-3 shadow-soft transition-colors",
        tone === "warn" ? "border-accent/40 bg-accent/5" : "border-border",
        over && "border-primary ring-2 ring-primary/25"
      )}
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <Building2 className="size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
          {subtitle && <p className="text-[10px] uppercase text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function OfficerCard({
  peg,
  dim,
  masjidsByZone,
  zones,
  onPick,
}: {
  peg: Peg;
  dim: boolean;
  masjidsByZone: Record<number, Masjid[]>;
  zones: Zon[];
  onPick: (masjidId: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return draggable({
      element: el,
      getInitialData: () => ({ emp: peg.employeeNo }),
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
    });
  }, [peg.employeeNo]);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-background p-2.5 text-sm transition-opacity",
        dragging && "opacity-40",
        dim && "opacity-30"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{peg.nama}</p>
          <p className="text-[11px] text-muted-foreground">
            {KAT_LABEL[peg.kategori] ?? peg.kategori} · {peg.gred} · {peg.employeeNo}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <UserCog className="size-3.5 text-muted-foreground" />
        <select
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__none") onPick(null);
            else if (v) onPick(v);
          }}
          className="w-full rounded border border-input bg-card px-1.5 py-1 text-[11px] text-ink outline-none focus:border-primary"
        >
          <option value="">Pindah ke…</option>
          <option value="__none">Belum Ditugaskan</option>
          {zones.map((z) => (
            <optgroup key={z.nombor} label={z.nombor === 9 ? "Posting Khas" : `Zon ${z.nombor}`}>
              {(masjidsByZone[z.nombor] ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}
