import { cn } from "@/lib/utils";

// Tajuk seksyen dengan eyebrow + ornamen — untuk latar terang atau gelap.
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  onDark = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left",
        className
      )}
    >
      {eyebrow && (
        <span className={cn("eyebrow", onDark && "eyebrow--on-dark")}>{eyebrow}</span>
      )}
      <h2
        className={cn(
          "font-display mt-4 text-3xl font-semibold leading-tight md:text-4xl",
          onDark ? "text-white" : "text-primary-dark"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            onDark ? "text-white/75" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
      {align === "center" && (
        <div className="ornament-divider mt-6" aria-hidden>
          <span className="ornament-mark" />
        </div>
      )}
    </div>
  );
}
