"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronRight, User, Loader2, Phone, Mail } from "lucide-react";
import type { PegawaiAdminRingkas, PegawaiHit } from "@/lib/admin-data";

const KAT_LABEL: Record<string, string> = {
  "ketua-imam": "Ketua Imam",
  "timbalan-ketua-imam": "Timbalan Ketua Imam",
  bilal: "Bilal",
};

// Browse (senarai penuh, TANPA PII) bila query < 2; carian SERVER (termasuk telefon
// + emel) bila ≥ 2 aksara — telefon didekripsi di server & dipulang utk hits sahaja
// (JANGAN hantar telefon seluruh direktori ke klien). Debounce 250ms + AbortController.
export function PegawaiAdminList({ pegawai }: { pegawai: PegawaiAdminRingkas[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PegawaiHit[]>([]);
  const [found, setFound] = useState(0);
  const [capped, setCapped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset segerak dalam event handler (bukan effect) — elak setState dalam badan effect.
  function handleChange(value: string) {
    setQuery(value);
    setError(null);
    if (value.trim().length < 2) {
      abortRef.current?.abort();
      setHits([]);
      setFound(0);
      setCapped(false);
      setBusy(false);
    } else {
      setBusy(true);
    }
  }

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/admin/pegawai-cari?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (res.status === 429) {
          setError("Terlalu banyak carian. Perlahan sedikit.");
          setBusy(false);
          return;
        }
        const data = (await res.json()) as { results: PegawaiHit[]; total: number; capped: boolean };
        setHits(data.results);
        setFound(data.total);
        setCapped(data.capped);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Ralat carian. Cuba semula.");
      } finally {
        setBusy(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, router]);

  const searching = query.trim().length >= 2;

  return (
    <div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Taip nama, no. pekerja, masjid, telefon atau emel…"
          className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {busy && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {!searching ? (
        <>
          <p className="mt-4 text-xs text-muted-foreground">{pegawai.length} pegawai</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pegawai.map((p) => (
              <BrowseCard key={p.employeeNo} p={p} />
            ))}
          </div>
        </>
      ) : (
        !error && (
          <>
            <p className="mt-4 text-xs text-muted-foreground">
              {found} hasil{capped ? " (papar 30 pertama — perincikan carian)" : ""}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hits.map((p) => (
                <HitCard key={p.employeeNo} p={p} />
              ))}
            </div>
            {!busy && hits.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">Tiada pegawai sepadan.</p>
            )}
          </>
        )
      )}
    </div>
  );
}

function Avatar({ url, nama }: { url: string | null; nama: string }) {
  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
      {url ? (
        <Image src={url} alt={nama} fill sizes="48px" className="object-cover" />
      ) : (
        <User className="size-5 text-muted-foreground" />
      )}
    </span>
  );
}

function Meta({ p }: { p: PegawaiAdminRingkas }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-ink">{p.nama}</p>
      <p className="truncate text-xs text-muted-foreground">
        {KAT_LABEL[p.kategori] ?? p.kategori} · {p.gred} · {p.employeeNo}
      </p>
      <p className="truncate text-xs text-muted-foreground/80">{p.masjidNama ?? "Belum ditugaskan"}</p>
    </div>
  );
}

function BrowseCard({ p }: { p: PegawaiAdminRingkas }) {
  return (
    <Link
      href={`/admin/pegawai/${p.employeeNo}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft transition-colors hover:border-primary/40"
    >
      <Avatar url={p.photoUrl} nama={p.nama} />
      <Meta p={p} />
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

// Kad hasil carian — telefon + emel dipapar sebagai TEKS (bukan anchor, elak <a>
// bersarang dalam Link). Butiran penuh (WhatsApp/mailto) di halaman butiran pegawai.
function HitCard({ p }: { p: PegawaiHit }) {
  return (
    <Link
      href={`/admin/pegawai/${p.employeeNo}`}
      className="block rounded-xl border border-border bg-card p-3 shadow-soft transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-3">
        <Avatar url={p.photoUrl} nama={p.nama} />
        <Meta p={p} />
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </div>
      {(p.telefon || p.emel) && (
        <dl className="mt-2 space-y-1 border-t border-border pt-2 text-xs">
          {p.telefon && (
            <div className="flex items-center gap-2">
              <Phone className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate text-ink">{p.telefon}</span>
            </div>
          )}
          {p.emel && (
            <div className="flex items-center gap-2">
              <Mail className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate text-ink">{p.emel}</span>
            </div>
          )}
        </dl>
      )}
    </Link>
  );
}
