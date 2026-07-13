"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background pt-[112px]">
      <div className="container-narrow text-center">
        <h1 className="font-display text-3xl font-semibold text-primary-dark">
          Maaf, berlaku ralat
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sistem menghadapi masalah teknikal. Sila cuba semula sebentar lagi.
        </p>
        <Button onClick={reset} variant="primary" className="mt-8">
          <RotateCcw className="size-4" /> Cuba Semula
        </Button>
      </div>
    </div>
  );
}
