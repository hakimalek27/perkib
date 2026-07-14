import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background pt-[104px]">
      <div className="container-narrow text-center">
        {/* Arch + 404 */}
        <div className="relative mx-auto flex h-40 w-32 items-center justify-center">
          <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
            <path
              d="M2,120 L2,48 C2,20 22,4 47,1 L50,0 L53,1 C78,4 98,20 98,48 L98,120"
              stroke="var(--gold-soft)"
              strokeWidth={1.5}
              fill="none"
            />
          </svg>
          <span className="font-display text-6xl font-extrabold text-primary">404</span>
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink">Halaman Tidak Dijumpai</h1>
        <p className="mt-3 text-muted-foreground">
          Maaf, halaman yang anda cari tidak wujud atau telah dialihkan.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[50px] items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Home className="size-4" /> Kembali ke Utama
        </Link>
      </div>
    </div>
  );
}
