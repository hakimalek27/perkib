export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background pt-[112px]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Memuatkan…</p>
      </div>
    </div>
  );
}
