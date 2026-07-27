"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { SLIDE_COUNT as N, TAJUK, CHAPTERS, src } from "./deck-data";
import "./slides.css";

/* Corak girih berpusing di latar (motif Islamik). */
function Girih() {
  const cells = [];
  for (let gy = 0; gy < 6; gy++) {
    for (let gx = 0; gx < 6; gx++) {
      cells.push(
        <g key={`${gx}-${gy}`} transform={`translate(${gx * 100 + 50} ${gy * 100 + 50})`}>
          <path
            d="M0 -34 L9 -14 L31 -14 L14 1 L21 22 L0 10 L-21 22 L-14 1 L-31 -14 L-9 -14 Z"
            fill="none"
            stroke="#c6a25d"
            strokeWidth="1.4"
          />
          <circle r="5" fill="none" stroke="#c6a25d" strokeWidth="1.2" />
        </g>
      );
    }
  }
  return (
    <svg className="sb-girih" viewBox="0 0 600 600" aria-hidden="true">
      {cells}
    </svg>
  );
}

/* Habuk emas — nilai dibulatkan supaya deterministik (elak mismatch hidrasi). */
const round2 = (n: number) => Math.round(n * 100) / 100;
const MOTES = Array.from({ length: 16 }, (_, i) => {
  const r = (m: number) => {
    const x = Math.sin((i + 1) * m) * 10000;
    return Math.round((x - Math.floor(x)) * 1000) / 1000;
  };
  return {
    left: round2(r(12.9) * 100),
    dur: round2(9 + r(78.2) * 15),
    delay: round2(-r(37.7) * 20),
    dx: `${round2((r(4.1) - 0.5) * 90)}px`,
    size: round2(2 + r(9.7) * 2.4),
  };
});

export function SembelihanSlides() {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(false);
  const [full, setFull] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const babRef = useRef<HTMLElement>(null);
  const boostRef = useRef(1);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const wheelLock = useRef(0);
  const curRef = useRef(0);
  useEffect(() => {
    curRef.current = cur;
  }, [cur]);

  const go = useCallback((n: number) => {
    setCur((c) => {
      const nx = Math.max(0, Math.min(N - 1, n));
      if (nx !== c) boostRef.current = 6; // pecut galaxy setiap tukar slaid
      return nx;
    });
  }, []);
  const next = useCallback(() => go(curRef.current + 1), [go]);
  const prev = useCallback(() => go(curRef.current - 1), [go]);

  // Pramuat slaid berhampiran supaya peralihan mulus.
  useEffect(() => {
    for (const d of [1, 2, -1]) {
      const i = cur + d;
      if (i >= 0 && i < N) {
        const im = new Image();
        im.src = src(i);
      }
    }
  }, [cur]);

  // Papan kekunci
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(N - 1);
      else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void rootRef.current?.requestFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go]);

  useEffect(() => {
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Auto-main
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      if (curRef.current >= N - 1) setAuto(false);
      else next();
    }, 9000);
    return () => clearInterval(id);
  }, [auto, next]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - wheelLock.current < 700 || Math.abs(e.deltaY) < 24) return;
      wheelLock.current = now;
      if (e.deltaY > 0) next();
      else prev();
    },
    [next, prev]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const s = touchRef.current;
      if (!s) return;
      const dx = e.changedTouches[0].clientX - s.x;
      const dy = e.changedTouches[0].clientY - s.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
      touchRef.current = null;
    },
    [next, prev]
  );

  // Galaxy: starfield warp 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLORS = ["#ffffff", "#f7f3eb", "#d9bc82", "#c6a25d", "#b44955"];
    let w = 0,
      h = 0,
      cx = 0,
      cy = 0,
      dpr = 1;
    type Star = { x: number; y: number; z: number; pz: number; c: string };
    const N_STAR = reduce ? 80 : 300;
    const stars: Star[] = [];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const mk = (): Star => ({
      x: rnd(-1, 1),
      y: rnd(-1, 1),
      z: rnd(0.05, 1),
      pz: 0,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    });
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
    };
    resize();
    for (let i = 0; i < N_STAR; i++) {
      const s = mk();
      s.pz = s.z;
      stars.push(s);
    }
    let raf = 0;
    const F = 0.62;
    const frame = () => {
      ctx.fillStyle = "rgba(5,7,12,0.34)";
      ctx.fillRect(0, 0, w, h);
      const boost = boostRef.current;
      boostRef.current += (1 - boostRef.current) * 0.06;
      const base = reduce ? 0.0006 : 0.0014;
      for (const s of stars) {
        s.pz = s.z;
        s.z -= base * boost;
        if (s.z <= 0.02) {
          const m = mk();
          s.x = m.x;
          s.y = m.y;
          s.z = 1;
          s.pz = 1;
          s.c = m.c;
          continue;
        }
        const sx = cx + (s.x / s.z) * cx * F;
        const sy = cy + (s.y / s.z) * cy * F;
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
        const px = cx + (s.x / s.pz) * cx * F;
        const py = cy + (s.y / s.pz) * cy * F;
        ctx.strokeStyle = s.c;
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.2 + 0.15);
        ctx.lineWidth = Math.max(0.3, (1 - s.z) * 2.3);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const babAktif = CHAPTERS.reduce((acc, c, i) => (cur >= c.mula ? i : acc), 0);
  useEffect(() => {
    const el = babRef.current?.children[babAktif] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [babAktif]);

  const stateFor = (i: number) =>
    i === cur ? "active" : i === cur - 1 ? "before" : i === cur + 1 ? "after" : "far";

  return (
    <div
      ref={rootRef}
      className="sb-root"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Persembahan Penyembelihan Halal"
    >
      <div className="sb-progress" style={{ width: `${((cur + 1) / N) * 100}%` }} />
      <canvas ref={canvasRef} className="sb-canvas" />
      <div className="sb-nebula">
        <div className="sb-neb sb-neb-1" />
        <div className="sb-neb sb-neb-2" />
        <div className="sb-neb sb-neb-3" />
      </div>
      <Girih />
      <div className="sb-dust" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="sb-mote"
            style={
              {
                left: `${m.left}%`,
                width: m.size,
                height: m.size,
                animationDuration: `${m.dur}s`,
                animationDelay: `${m.delay}s`,
                "--dx": m.dx,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Pentas 3D — slaid ASAL (imej 16:9) melayang dalam galaxy */}
      <div className="sb-stage">
        {Array.from({ length: N }, (_, i) => (
          <section key={i} className="sb-slide" data-state={stateFor(i)} aria-hidden={i !== cur}>
            {Math.abs(i - cur) <= 2 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src(i)}
                alt={`Slaid ${i + 1}: ${TAJUK[i] ?? ""}`}
                className="sb-deck-img"
                draggable={false}
                decoding="async"
              />
            )}
          </section>
        ))}
      </div>

      <div className="sb-vignette" />

      <div className="sb-ui">
        <div className="sb-top">
          <span className="sb-brand">
            <Sparkles size={16} /> PERKIB · PENYEMBELIHAN HALAL
          </span>
          <span className="sb-count">
            {String(cur + 1).padStart(2, "0")} / {N}
          </span>
        </div>

        <button className="sb-arrow sb-arrow-l" onClick={prev} disabled={cur === 0} aria-label="Slaid sebelum">
          <ChevronLeft size={22} />
        </button>
        <button className="sb-arrow sb-arrow-r" onClick={next} disabled={cur === N - 1} aria-label="Slaid seterusnya">
          <ChevronRight size={22} />
        </button>

        <div className="sb-bottom">
          <button
            className="sb-btn"
            onClick={() => setAuto((a) => !a)}
            aria-label={auto ? "Jeda auto-main" : "Main auto"}
            title={auto ? "Jeda" : "Auto-main"}
          >
            {auto ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <nav className="sb-chapters" aria-label="Bab" ref={babRef}>
            {CHAPTERS.map((c, i) => (
              <button
                key={c.nama}
                className="sb-chapter"
                aria-current={i === babAktif}
                onClick={() => go(c.mula)}
                title={c.nama}
              >
                {c.nama}
              </button>
            ))}
          </nav>
          <button
            className="sb-btn"
            onClick={() =>
              document.fullscreenElement ? document.exitFullscreen() : rootRef.current?.requestFullscreen()
            }
            aria-label={full ? "Keluar skrin penuh" : "Skrin penuh"}
            title={full ? "Keluar skrin penuh (F)" : "Skrin penuh (F)"}
          >
            {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        <span className="sb-hint">← → atau leret · F untuk skrin penuh</span>
      </div>
    </div>
  );
}
