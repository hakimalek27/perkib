import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}
import { siteInfo } from "@/content/site";
import type { SiteSettings } from "@/lib/sanity";

const NAV_UTAMA = [
  { label: "Profil & Sejarah", href: "/profil" },
  { label: "Visi & Misi", href: "/visi-misi" },
  { label: "AJK", href: "/ajk" },
  { label: "Program", href: "/program" },
];

const NAV_PERKHIDMATAN = [
  { label: "Direktori Masjid", href: "/direktori-masjid" },
  { label: "Maklumat Pegawai", href: "/pegawai" },
  { label: "Mohon Saguhati", href: "/saguhati" },
  { label: "Semak Status Saguhati", href: "/saguhati/semak" },
  { label: "Derma", href: "/derma" },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  const alamat = `${siteInfo.address.line1}, ${siteInfo.address.line2}, ${siteInfo.address.postcode} ${siteInfo.address.city}, ${siteInfo.address.state}`;
  return (
    <footer className="mt-auto bg-primary-deep text-white/80">
      <div className="h-1 w-full bg-gradient-to-r from-accent-deep via-accent to-accent-deep" />
      <div className="container-wide grid gap-10 py-14 md:grid-cols-3">
        {/* Jenama */}
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo PERKIB" width={48} height={48} className="size-12 object-contain" />
            <div>
              <p className="font-display text-xl text-white">PERKIB</p>
              <p className="text-xs text-white/60">Imam & Bilal MAIWP</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            {settings.footerDescription}
          </p>
          <p className="mt-4 text-xs text-white/50">
            No. Pendaftaran ROS: {siteInfo.rosNumber}
          </p>
        </div>

        {/* Pautan */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-accent-bright">
              Pertubuhan
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_UTAMA.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-accent-bright">
              Perkhidmatan
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_PERKHIDMATAN.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hubungi */}
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-accent-bright">
            Hubungi Kami
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>{alamat}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={`mailto:${settings.email}`} className="hover:text-white break-all">
                {settings.email}
              </a>
            </li>
            {settings.phone ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{settings.phone}</span>
              </li>
            ) : null}
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                {settings.officeHours.map((h) => `${h.day}: ${h.time}`).join(" · ")}
              </span>
            </li>
            <li className="flex gap-3">
              <FacebookIcon className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={siteInfo.facebook} target="_blank" rel="noreferrer" className="hover:text-white">
                Facebook Rasmi PERKIB
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <p>© 2026 {siteInfo.fullName}. Semua hak terpelihara.</p>
          <p>Di bawah naungan {siteInfo.authority}.</p>
        </div>
      </div>
    </footer>
  );
}
