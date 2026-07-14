export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background pt-[104px]">
      <div className="flex flex-col items-center gap-4">
        {/* Loader arch (garis emas dilukis) */}
        <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="h-16 w-14" aria-hidden>
          <path
            d="M2,120 L2,48 C2,20 22,4 47,1 L50,0 L53,1 C78,4 98,20 98,48 L98,120"
            stroke="var(--primary)"
            strokeWidth={3}
            fill="none"
            pathLength={1}
            className="arch-draw"
            style={{ animationIterationCount: "infinite" }}
          />
        </svg>
        <p className="text-sm text-muted-foreground">Memuatkan…</p>
      </div>
    </div>
  );
}
