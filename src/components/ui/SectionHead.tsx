import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

// Kepala seksyen Nadi — eyebrow → H2 (Bricolage) → perenggan muted.
export function SectionHead({
  eyebrow,
  title,
  lead,
  dark = false,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}${
        className ? " " + className : ""
      }`}
    >
      {eyebrow && (
        <div className={align === "center" ? "flex justify-center" : ""}>
          <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2
        className={`mt-4 font-display text-[clamp(1.875rem,4vw,2.625rem)] font-bold leading-[1.12] tracking-[-0.01em] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 text-[17px] leading-relaxed ${dark ? "text-white/70" : "text-muted-foreground"}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
