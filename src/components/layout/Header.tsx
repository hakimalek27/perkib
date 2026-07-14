"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };
type NavItem = NavLink | { label: string; children: NavLink[] };

const NAV: NavItem[] = [
  { label: "Utama", href: "/" },
  {
    label: "Tentang",
    children: [
      { label: "Profil & Sejarah", href: "/profil" },
      { label: "Perutusan Presiden", href: "/perutusan" },
      { label: "Visi & Misi", href: "/visi-misi" },
      { label: "Keahlian", href: "/keahlian" },
      { label: "Sukarelawan", href: "/sukarelawan" },
      { label: "Soalan Lazim", href: "/soalan-lazim" },
    ],
  },
  { label: "AJK", href: "/ajk" },
  { label: "Direktori Masjid", href: "/direktori-masjid" },
  { label: "Pegawai", href: "/pegawai" },
  { label: "Program", href: "/program" },
  { label: "Derma", href: "/derma" },
  { label: "Hubungi", href: "/hubungi" },
];

const FLAT_LINKS: NavLink[] = [
  { label: "Utama", href: "/" },
  { label: "Profil & Sejarah", href: "/profil" },
  { label: "Perutusan Presiden", href: "/perutusan" },
  { label: "Visi & Misi", href: "/visi-misi" },
  { label: "AJK", href: "/ajk" },
  { label: "Direktori Masjid", href: "/direktori-masjid" },
  { label: "Pegawai", href: "/pegawai" },
  { label: "Program", href: "/program" },
  { label: "Keahlian", href: "/keahlian" },
  { label: "Sukarelawan", href: "/sukarelawan" },
  { label: "Saguhati", href: "/saguhati" },
  { label: "Derma", href: "/derma" },
  { label: "Soalan Lazim", href: "/soalan-lazim" },
  { label: "Hubungi", href: "/hubungi" },
];

function isLink(item: NavItem): item is NavLink {
  return "href" in item;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false); // > 24 → dock ivory
  const [docked, setDocked] = useState(false); // > 90 → morph penuh
  const [showSticky, setShowSticky] = useState(false); // > 640 → sticky CTA
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [ind, setInd] = useState<{ left: number; width: number; on: boolean }>({
    left: 0,
    width: 0,
    on: false,
  });

  const hideChrome = pathname.startsWith("/admin") || pathname.startsWith("/studio");
  const hideSticky = pathname.startsWith("/saguhati/mohon"); // elak bertindih butang wizard

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setDocked(y > 90);
      setShowSticky(y > 640);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Nav indicator — morph ke pautan aktif (top-level) mengikut pathname.
  const moveToActive = useCallback(() => {
    const activeItem = NAV.find((it) =>
      isLink(it) ? it.href === pathname : it.children.some((c) => c.href === pathname)
    );
    const key = activeItem ? activeItem.label : null;
    const nav = navRef.current;
    const el = key ? linkRefs.current.get(key) : null;
    if (nav && el) {
      const nr = nav.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setInd({ left: er.left - nr.left, width: er.width, on: true });
    } else {
      setInd((s) => ({ ...s, on: false }));
    }
  }, [pathname]);

  useEffect(() => {
    moveToActive();
    const onResize = () => moveToActive();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveToActive, docked]);

  function hoverTo(key: string) {
    const nav = navRef.current;
    const el = linkRefs.current.get(key);
    if (nav && el) {
      const nr = nav.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setInd({ left: er.left - nr.left, width: er.width, on: true });
    }
  }

  const solid = scrolled; // teks gelap bila skrol; cerah bila atas hero

  if (hideChrome) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Garis aksen emas atas (nipis) */}
        <div
          className={cn(
            "h-[3px] w-full bg-gradient-to-r from-accent-deep via-accent to-accent-deep transition-opacity",
            docked ? "opacity-0" : "opacity-100"
          )}
        />
        <div className={cn("transition-all duration-[350ms]", docked && "px-3 md:px-6")}>
          <div
            className={cn(
              "container-wide flex items-center justify-between gap-4 transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)]",
              solid
                ? "bg-[color-mix(in_srgb,var(--background)_90%,transparent)] backdrop-blur-xl"
                : "bg-transparent",
              docked
                ? "my-2.5 h-[62px] rounded-2xl border border-[var(--gold-soft)] px-5 shadow-[0_10px_34px_rgba(13,17,23,.09)]"
                : "h-[74px] border border-transparent"
            )}
          >
            {/* Jenama */}
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo PERKIB"
                width={50}
                height={50}
                className={cn("object-contain transition-all duration-[350ms]", docked ? "size-[42px]" : "size-[50px]")}
                priority
              />
              <span className="flex flex-col leading-none">
                <span className={cn("font-display text-[19px] font-extrabold tracking-[.02em] transition-colors", solid ? "text-ink" : "text-white")}>
                  PERKIB
                </span>
                <span className={cn("text-[11.5px] font-medium tracking-wide transition-colors", solid ? "text-muted-foreground" : "text-white/60")}>
                  Imam &amp; Bilal MAIWP
                </span>
              </span>
            </Link>

            {/* Nav desktop + indicator */}
            <nav
              ref={navRef}
              className="relative hidden h-full items-center gap-1 xl:flex"
              onMouseLeave={moveToActive}
            >
              {NAV.map((item) =>
                isLink(item) ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    ref={(el) => {
                      if (el) linkRefs.current.set(item.label, el);
                    }}
                    onMouseEnter={() => hoverTo(item.label)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={cn(
                      "relative rounded-md px-3 py-2 text-[15px] font-medium transition-colors",
                      solid ? "text-ink/75 hover:text-primary" : "text-white/85 hover:text-white",
                      pathname === item.href && (solid ? "font-semibold text-primary" : "font-semibold text-white")
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div key={item.label} className="group relative flex h-full items-center">
                    <button
                      ref={(el) => {
                        if (el) linkRefs.current.set(item.label, el);
                      }}
                      onMouseEnter={() => hoverTo(item.label)}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-3 py-2 text-[15px] font-medium transition-colors",
                        solid ? "text-ink/75 hover:text-primary" : "text-white/85 hover:text-white"
                      )}
                    >
                      {item.label}
                      <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="invisible absolute left-0 top-full w-60 translate-y-1 rounded-xl border border-border bg-card p-2 opacity-0 shadow-deep transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-primary/8 hover:text-primary",
                            pathname === c.href && "bg-primary/8 font-semibold text-primary"
                          )}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              )}
              {/* Indicator maroon morph */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 h-[2px] rounded bg-primary transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)]"
                style={{ left: ind.left, width: ind.width, opacity: ind.on ? 1 : 0 }}
              />
            </nav>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-2">
              <Link
                href="/saguhati"
                className="hidden min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-dark sm:inline-flex xl:min-h-[46px]"
              >
                <HeartHandshake className="size-4" />
                Mohon Saguhati
              </Link>
              <button
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-lg transition-colors xl:hidden",
                  solid || mobileOpen ? "text-ink hover:bg-primary/8" : "text-white hover:bg-white/10"
                )}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mudah alih */}
        {mobileOpen && (
          <div className="fixed inset-x-0 top-[76px] bottom-0 z-40 overflow-y-auto border-t border-border bg-background xl:hidden">
            <nav className="container-wide flex flex-col gap-1 py-6">
              {FLAT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "min-h-[44px] rounded-lg px-4 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-primary/8 hover:text-primary",
                    pathname === l.href && "bg-primary/8 font-semibold text-primary"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/saguhati"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white hover:bg-primary-dark"
              >
                <HeartHandshake className="size-4" />
                Mohon Saguhati
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Sticky bottom CTA (mobile) */}
      {!hideSticky && showSticky && !mobileOpen && (
        <Link
          href="/saguhati"
          className="fixed inset-x-4 bottom-4 z-40 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white shadow-[0_10px_30px_rgba(158,31,46,.35)] sm:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <HeartHandshake className="size-4" />
          Mohon Saguhati
        </Link>
      )}
    </>
  );
}
