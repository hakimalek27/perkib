"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ArrowLeftRight,
  Wallet,
  Users,
  UserSearch,
  MessageCircle,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/saguhati", label: "Permohonan Saguhati", icon: FileText },
  { href: "/admin/penugasan", label: "Penugasan Pegawai", icon: ArrowLeftRight },
  { href: "/admin/yuran", label: "Yuran Keahlian", icon: Wallet },
  { href: "/admin/pegawai", label: "Direktori Pegawai", icon: Users },
  { href: "/admin/staf", label: "Staf MAIWP", icon: UserSearch },
  { href: "/admin/notifikasi", label: "Notifikasi WhatsApp", icon: MessageCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const nav = (
    <nav className="flex h-full flex-col">
      <Link
        href="/admin"
        className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4 font-display text-lg text-white"
        onClick={() => setOpen(false)}
      >
        <ShieldCheck className="size-6 text-accent-bright" />
        <span>
          PERKIB <span className="text-accent-bright">Admin</span>
        </span>
      </Link>
      <ul className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-primary-deep shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="/studio"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="size-[18px]" /> Sanity Studio
        </a>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
        >
          <Home className="size-[18px]" /> Laman Utama
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-destructive/20 hover:text-white"
        >
          <LogOut className="size-[18px]" /> Log Keluar
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Bar mudah alih */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-primary-deep px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-display">
          <ShieldCheck className="size-5 text-accent-bright" /> PERKIB Admin
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Buka menu" className="rounded-lg p-1.5 hover:bg-white/10">
          <Menu className="size-6" />
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 bg-primary-deep lg:block">{nav}</aside>

      {/* Drawer mudah alih */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-primary-deep shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
