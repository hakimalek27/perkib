import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Hero halaman dalaman Nadi — permukaan obsidian + corak bintang emas + breadcrumb.
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
    <section className="surface-obsidian relative overflow-hidden pt-[104px]">
      <div className="pattern-star8 pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      {/* Outline arch hiasan */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -right-6 -top-4 h-[130%] w-64 opacity-[0.06]"
      >
        <path
          d="M2,120 L2,48 C2,20 22,4 47,1 L50,0 L53,1 C78,4 98,20 98,48 L98,120"
          stroke="var(--accent-bright)"
          strokeWidth={1.5}
          fill="none"
        />
      </svg>
      <div className="container-wide relative py-14 md:py-18">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-white/60">
            <Link href="/" className="transition-colors hover:text-accent-bright">
              Utama
            </Link>
            {breadcrumb.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3" />
                {b.href ? (
                  <Link href={b.href} className="transition-colors hover:text-accent-bright">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-accent-bright">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <Eyebrow dark>{eyebrow}</Eyebrow>}
        <h1 className="heading-display mt-5 max-w-4xl text-white">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            {description}
          </p>
        )}
        <div
          className="mt-8 h-px w-32 bg-gradient-to-r from-accent via-accent-bright to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
