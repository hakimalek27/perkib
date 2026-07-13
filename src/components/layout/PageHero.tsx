import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Hero halaman dalaman — biru gelap berlapis dengan ornamen emas + breadcrumb.
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-primary-deep pattern-geometric-dark pt-[112px]">
      {/* Cahaya latar */}
      <div className="pointer-events-none absolute -right-32 -top-24 size-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full bg-primary-light/20 blur-3xl" />
      <div className="container-wide relative py-16 md:py-20">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-white/60">
            <Link href="/" className="hover:text-accent-bright transition-colors">
              Utama
            </Link>
            {breadcrumb.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3" />
                {b.href ? (
                  <Link href={b.href} className="hover:text-accent-bright transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-accent-bright">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <span className="eyebrow eyebrow--on-dark">{eyebrow}</span>}
        <h1 className="heading-display mt-5 max-w-4xl text-white">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            {description}
          </p>
        )}
        <div className="mt-8 ornament-divider justify-start" aria-hidden>
          <span className="ornament-mark" />
        </div>
      </div>
    </section>
  );
}
