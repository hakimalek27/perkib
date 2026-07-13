"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  // Header solid (teks gelap) apabila telah skrol ATAU pada laluan tanpa hero
  // gelap (admin) supaya teks nav sentiasa boleh dibaca.
  const solid = scrolled || pathname.startsWith("/admin");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-lg shadow-soft border-b border-border"
          : "bg-transparent"
      )}
    >
      {/* Garis aksen emas atas */}
      <div className="h-1 w-full bg-gradient-to-r from-accent-deep via-accent to-accent-deep" />
      <div className="container-wide flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo.png"
            alt="Logo PERKIB"
            width={44}
            height={44}
            className="size-11 object-contain"
            priority
          />
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "font-display text-lg font-semibold transition-colors",
                solid ? "text-primary-dark" : "text-white"
              )}
            >
              PERKIB
            </span>
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider transition-colors",
                solid ? "text-muted-foreground" : "text-white/60"
              )}
            >
              Imam & Bilal MAIWP
            </span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) =>
            isLink(item) ? (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  solid
                    ? "text-ink/80 hover:bg-primary/8 hover:text-primary"
                    : "text-white/85 hover:bg-white/10 hover:text-white",
                  pathname === item.href && (solid ? "text-primary font-semibold" : "text-white font-semibold")
                )}
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="group relative">
                <button
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    solid
                      ? "text-ink/80 hover:bg-primary/8 hover:text-primary"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
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
                        pathname === c.href && "bg-primary/8 text-primary font-semibold"
                      )}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <Link href="/saguhati">
              <HeartHandshake className="size-4" />
              Mohon Saguhati
            </Link>
          </Button>
          <button
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full transition-colors xl:hidden",
              solid || mobileOpen
                ? "text-primary-dark hover:bg-primary/8"
                : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
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
                  "rounded-lg px-4 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-primary/8 hover:text-primary",
                  pathname === l.href && "bg-primary/8 text-primary font-semibold"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild variant="gold" className="mt-4">
              <Link href="/saguhati" onClick={() => setMobileOpen(false)}>
                <HeartHandshake className="size-4" />
                Mohon Saguhati
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
