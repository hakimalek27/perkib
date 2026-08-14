"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as RPointerEvent, WheelEvent as RWheelEvent } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  X,
  Moon,
} from "lucide-react";
import { SLIDE_COUNT, TAJUK, CHAPTERS, src, thumb, babBagiSlaid } from "./deck-data";
import "./slides.css";

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_LANGKAH = 1.35;
const AUTO_MS = 9000;

/* Corak girih statik — motif Islamik PERKIB, tiada animasi (nada khusyuk). */
function Girih() {
  return (
    <svg className="jz-girih" aria-hidden="true">
      <defs>
        <pattern id="jz-girih-p" width="120" height="120" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M60 18 L71 42 L97 42 L76 60 L84 88 L60 74 L36 88 L44 60 L23 42 L49 42 Z" />
            <circle cx="60" cy="60" r="6" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jz-girih-p)" />
    </svg>
  );
}

const jepit = (n: number, min: number, maks: number) => Math.min(maks, Math.max(min, n));

export function JenazahSlides() {
  const [cur, setCur] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grid, setGrid] = useState(false);
  const [cari, setCari] = useState("");
  const [auto, setAuto] = useState(false);
  const [full, setFull] = useState(false);
  const [seret, setSeret] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const babRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const seretRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const cubitRef = useRef<{ jarak: number; zoom: number } | null>(null);
  const sentuhRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const rodaRef = useRef(0);

  const babAktif = babBagiSlaid(cur);

  /* ── Navigasi ─────────────────────────────────────────────────────────── */
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (i: number) => {
      setCur((c) => {
        const n = jepit(i, 0, SLIDE_COUNT - 1);
        if (n !== c) {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }
        return n;
      });
    },
    []
  );
  const next = useCallback(() => go(cur + 1), [cur, go]);
  const prev = useCallback(() => go(cur - 1), [cur, go]);

  /* ── Zoom ─────────────────────────────────────────────────────────────── */
  // Zoom berpusat pada titik (nx, ny) dalam ruang 0..1 bingkai supaya kawasan
  // yang ditunjuk pengguna kekal di bawah kursor — kelakuan biasa PowerPoint.
  const zumKe = useCallback((zBaru: number, nx = 0.5, ny = 0.5) => {
    setZoom((zLama) => {
      const z = jepit(zBaru, ZOOM_MIN, ZOOM_MAX);
      setPan((p) => {
        if (z <= 1) return { x: 0, y: 0 };
        const el = frameRef.current;
        if (!el) return p;
        const w = el.clientWidth;
        const h = el.clientHeight;
        // titik dunia di bawah kursor sebelum zoom
        const wx = (nx * w - p.x) / zLama;
        const wy = (ny * h - p.y) / zLama;
        // Hadkan pan supaya tepi imej tidak masuk ke dalam bingkai:
        // x ∈ [w − w·z, 0] (dan sama untuk y).
        const x = jepit(nx * w - wx * z, w - w * z, 0);
        const y = jepit(ny * h - wy * z, h - h * z, 0);
        return { x, y };
      });
      return z;
    });
  }, []);

  const zumMasuk = useCallback(() => zumKe(zoom * ZOOM_LANGKAH), [zoom, zumKe]);
  const zumKeluar = useCallback(() => zumKe(zoom / ZOOM_LANGKAH), [zoom, zumKe]);

  /* ── Skrin penuh ──────────────────────────────────────────────────────── */
  const togolFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* ── Kekunci ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const sasaran = e.target as HTMLElement | null;
      if (sasaran && (sasaran.tagName === "INPUT" || sasaran.tagName === "TEXTAREA")) {
        if (e.key === "Escape") (sasaran as HTMLInputElement).blur();
        return;
      }
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(SLIDE_COUNT - 1);
      else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        togolFull();
      } else if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        setGrid((g) => !g);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zumMasuk();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zumKeluar();
      } else if (e.key === "0") {
        resetZoom();
      } else if (e.key === "Escape") {
        if (grid) setGrid(false);
        else if (zoom > 1) resetZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, togolFull, zumMasuk, zumKeluar, resetZoom, grid, zoom]);

  /* ── Auto-main ────────────────────────────────────────────────────────── */
  // Slaid semasa disimpan dalam ref supaya interval boleh membacanya tanpa
  // dicipta semula setiap kali slaid bertukar (dan tanpa setState dalam effect).
  const curRef = useRef(0);
  useEffect(() => {
    curRef.current = cur;
  }, [cur]);

  useEffect(() => {
    if (!auto || grid) return;
    const t = setInterval(() => {
      if (curRef.current >= SLIDE_COUNT - 1) {
        setAuto(false);
        return;
      }
      go(curRef.current + 1);
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [auto, grid, go]);

  /* ── Bar bab: tatal bab aktif ke pandangan ────────────────────────────── */
  useEffect(() => {
    const nav = babRef.current;
    if (!nav) return;
    const el = nav.children[babAktif] as HTMLElement | undefined;
    if (!el) return;
    const kiri = el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2;
    nav.scrollTo({ left: Math.max(0, kiri), behavior: "smooth" });
  }, [babAktif]);

  /* ── Grid: tatal ke slaid semasa bila dibuka ──────────────────────────── */
  useEffect(() => {
    if (!grid) return;
    const t = setTimeout(() => {
      gridRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "center" });
    }, 40);
    return () => clearTimeout(t);
  }, [grid]);

  /* ── Roda tetikus: Ctrl/zoom → zum, selainnya → navigasi ──────────────── */
  const onWheel = (e: RWheelEvent) => {
    if (grid) return;
    if (e.ctrlKey || zoom > 1) {
      const el = frameRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      zumKe(zoom * (e.deltaY < 0 ? 1.14 : 1 / 1.14), jepit(nx, 0, 1), jepit(ny, 0, 1));
      return;
    }
    const kini = Date.now();
    if (kini - rodaRef.current < 420) return;
    if (Math.abs(e.deltaY) < 12) return;
    rodaRef.current = kini;
    if (e.deltaY > 0) next();
    else prev();
  };

  /* ── Seret (pan) & sentuh ─────────────────────────────────────────────── */
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      seretRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      setSeret(true);
    }
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = seretRef.current;
    if (!s || zoom <= 1) return;
    const el = frameRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const x = jepit(s.px + (e.clientX - s.x), w - w * zoom, 0);
    const y = jepit(s.py + (e.clientY - s.y), h - h * zoom, 0);
    setPan({ x, y });
  };
  const onPointerUp = () => {
    seretRef.current = null;
    setSeret(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      cubitRef.current = { jarak: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), zoom };
      return;
    }
    const t = e.touches[0];
    sentuhRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && cubitRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const jarak = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const el = frameRef.current;
      const r = el?.getBoundingClientRect();
      const nx = r ? jepit(((a.clientX + b.clientX) / 2 - r.left) / r.width, 0, 1) : 0.5;
      const ny = r ? jepit(((a.clientY + b.clientY) / 2 - r.top) / r.height, 0, 1) : 0.5;
      zumKe(cubitRef.current.zoom * (jarak / cubitRef.current.jarak), nx, ny);
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    cubitRef.current = null;
    const s = sentuhRef.current;
    sentuhRef.current = null;
    if (!s || zoom > 1 || grid) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Date.now() - s.t > 700) return;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = jepit((e.clientX - r.left) / r.width, 0, 1);
    const ny = jepit((e.clientY - r.top) / r.height, 0, 1);
    if (zoom > 1) resetZoom();
    else zumKe(2.2, nx, ny);
  };

  /* ── Grid: penapis carian ─────────────────────────────────────────────── */
  const hasilGrid = useMemo(() => {
    const q = cari.trim().toLowerCase();
    const semua = Array.from({ length: SLIDE_COUNT }, (_, i) => i);
    if (!q) return semua;
    if (/^\d+$/.test(q)) {
      const n = parseInt(q, 10) - 1;
      return semua.filter((i) => i === n || String(i + 1).startsWith(q));
    }
    return semua.filter((i) => (TAJUK[i] || "").toLowerCase().includes(q));
  }, [cari]);

  const imgStyle: CSSProperties = {
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
  };

  return (
    <div
      ref={rootRef}
      className="jz-root"
      onWheel={onWheel}
      role="region"
      aria-label="Persembahan Kursus Intensif Pengurusan Jenazah"
    >
      <div className="jz-progress" style={{ width: `${((cur + 1) / SLIDE_COUNT) * 100}%` }} />
      <Girih />
      <div className="jz-glow jz-glow-1" aria-hidden />
      <div className="jz-glow jz-glow-2" aria-hidden />

      {/* Pentas — hanya slaid berhampiran dirender (131 slaid) */}
      <div className="jz-stage">
        <div className="jz-viewport">
          {Array.from({ length: SLIDE_COUNT }, (_, i) => i)
            .filter((i) => Math.abs(i - cur) <= 2)
            .map((i) => (
              <section
                key={i}
                className="jz-slide"
                data-state={i === cur ? "active" : i < cur ? "prev" : "next"}
                aria-hidden={i !== cur}
              >
                <div
                  ref={i === cur ? frameRef : undefined}
                  className="jz-frame"
                  data-zoom={zoom > 1 ? "0" : "1"}
                  data-drag={seret ? "1" : "0"}
                  onPointerDown={i === cur ? onPointerDown : undefined}
                  onPointerMove={i === cur ? onPointerMove : undefined}
                  onPointerUp={i === cur ? onPointerUp : undefined}
                  onPointerCancel={i === cur ? onPointerUp : undefined}
                  onDoubleClick={i === cur ? onDoubleClick : undefined}
                  onTouchStart={i === cur ? onTouchStart : undefined}
                  onTouchMove={i === cur ? onTouchMove : undefined}
                  onTouchEnd={i === cur ? onTouchEnd : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src(i)}
                    alt={`Slaid ${i + 1}: ${TAJUK[i] ?? ""}`}
                    className="jz-img"
                    style={i === cur ? imgStyle : undefined}
                    data-drag={seret ? "1" : "0"}
                    draggable={false}
                    decoding="async"
                    fetchPriority={i === cur ? "high" : "low"}
                  />
                </div>
              </section>
            ))}
        </div>
      </div>

      <div className="jz-vignette" aria-hidden />

      {/* ── Kawalan ──────────────────────────────────────────────────────── */}
      <div className="jz-ui">
        <div className="jz-top">
          <Link href="/slide" className="jz-brand" title="Kembali ke senarai Slaid & Modul PERKIB">
            <Moon size={15} />
            <span className="jz-brand-t">PERKIB · PENGURUSAN JENAZAH</span>
          </Link>
          <span className="jz-meta">
            {zoom > 1 && <span className="jz-zoom-tag">{Math.round(zoom * 100)}%</span>}
            <span>
              <b>{String(cur + 1).padStart(3, "0")}</b> / {SLIDE_COUNT}
            </span>
          </span>
        </div>

        <button className="jz-arrow jz-arrow-l" onClick={prev} disabled={cur === 0} aria-label="Slaid sebelum">
          <ChevronLeft size={20} />
        </button>
        <button
          className="jz-arrow jz-arrow-r"
          onClick={next}
          disabled={cur === SLIDE_COUNT - 1}
          aria-label="Slaid seterusnya"
        >
          <ChevronRight size={20} />
        </button>

        <div className="jz-bottom">
          <button
            className="jz-btn"
            onClick={() => setAuto((a) => !a)}
            aria-pressed={auto}
            aria-label={auto ? "Jeda tayangan automatik" : "Tayangan automatik"}
            title={auto ? "Jeda" : "Auto-main"}
          >
            {auto ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            className="jz-btn"
            onClick={() => setGrid(true)}
            aria-label="Semua slaid (G)"
            title="Semua slaid (G)"
          >
            <LayoutGrid size={15} />
          </button>

          <span className="jz-sep" aria-hidden />

          <nav className="jz-chapters" aria-label="Bab" ref={babRef}>
            {CHAPTERS.map((c, i) => (
              <button
                key={c.nama}
                className="jz-chapter"
                aria-current={i === babAktif}
                onClick={() => go(c.mula)}
                title={c.nama}
              >
                {c.nama}
              </button>
            ))}
          </nav>

          <span className="jz-sep" aria-hidden />

          <button
            className="jz-btn"
            onClick={zumKeluar}
            disabled={zoom <= ZOOM_MIN + 0.001}
            aria-label="Zum keluar (−)"
            title="Zum keluar (−)"
          >
            <ZoomOut size={15} />
          </button>
          <button
            className="jz-zoom-val"
            onClick={resetZoom}
            aria-label="Set semula zum (0)"
            title="Set semula zum (0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            className="jz-btn"
            onClick={zumMasuk}
            disabled={zoom >= ZOOM_MAX - 0.001}
            aria-label="Zum masuk (+)"
            title="Zum masuk (+)"
          >
            <ZoomIn size={15} />
          </button>

          <span className="jz-sep" aria-hidden />

          <button
            className="jz-btn"
            onClick={togolFull}
            aria-label={full ? "Keluar skrin penuh (F)" : "Skrin penuh (F)"}
            title={full ? "Keluar skrin penuh (F)" : "Skrin penuh (F)"}
          >
            {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        <span className="jz-hint">
          ← → slaid · <b>G</b> semua slaid · <b>+ −</b> zum · dwi-klik zum · <b>F</b> skrin penuh
        </span>

        <span className="jz-potret">Putar telefon atau cubit untuk membesarkan slaid</span>
      </div>

      {/* ── Grid semua slaid ─────────────────────────────────────────────── */}
      {grid && (
        <div className="jz-grid-wrap" role="dialog" aria-modal="true" aria-label="Semua slaid">
          <div className="jz-grid-head">
            <span className="jz-grid-title">SEMUA SLAID · {SLIDE_COUNT}</span>
            <input
              className="jz-cari"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari tajuk slaid atau nombor…"
              aria-label="Cari slaid"
              autoFocus
            />
            <button className="jz-btn" onClick={() => setGrid(false)} aria-label="Tutup" title="Tutup (Esc)">
              <X size={16} />
            </button>
          </div>
          <div className="jz-grid" ref={gridRef}>
            {hasilGrid.map((i) => (
              <button
                key={i}
                className="jz-cell"
                aria-current={i === cur}
                onClick={() => {
                  go(i);
                  setGrid(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(i)} alt="" loading="lazy" decoding="async" />
                <span className="jz-cell-cap">
                  <span className="jz-cell-no">{String(i + 1).padStart(3, "0")}</span>
                  <span className="jz-cell-t">{TAJUK[i]}</span>
                </span>
              </button>
            ))}
            {hasilGrid.length === 0 && <p className="jz-kosong">Tiada slaid sepadan dengan carian itu.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
