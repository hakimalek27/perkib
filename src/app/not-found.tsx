import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background pt-[112px]">
      <div className="container-narrow text-center">
        <p className="font-display text-7xl font-semibold text-accent">404</p>
        <h1 className="font-display mt-4 text-3xl font-semibold text-primary-dark">
          Halaman Tidak Dijumpai
        </h1>
        <p className="mt-3 text-muted-foreground">
          Maaf, halaman yang anda cari tidak wujud atau telah dialihkan.
        </p>
        <Button asChild variant="primary" className="mt-8">
          <Link href="/">
            <Home className="size-4" /> Kembali ke Utama
          </Link>
        </Button>
      </div>
    </div>
  );
}
