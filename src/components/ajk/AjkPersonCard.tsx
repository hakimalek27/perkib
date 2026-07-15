import Image from "next/image";
import { cn, initials } from "@/lib/utils";
import { kategoriLabel, type AjkView } from "@/lib/sanity";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { ArchOutline } from "@/components/nadi/ArchOutline";
import { Kubah } from "@/components/ui/Kubah";

export function AjkPersonCard({
  member,
  featured = false,
}: {
  member: AjkView;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "hover-glow flex flex-col items-center rounded-2xl border bg-card p-5 text-center shadow-soft",
        featured ? "border-accent/50 gold-topline" : "border-border"
      )}
    >
      {/* Mahkota kubah (motif dome PERKIB) */}
      <Kubah
        bright={featured}
        className={cn(
          "kubah-halo relative z-10 mx-auto shrink-0",
          featured ? "-mb-2.5 h-6 w-7" : "-mb-2 h-5 w-6"
        )}
      />
      <div className={cn("relative", featured ? "w-28" : "w-24")}>
        <ArchFrame ratio="5 / 6" className="w-full bg-primary/8">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.nama}
              fill
              sizes={featured ? "112px" : "96px"}
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="font-display text-2xl font-semibold text-primary/50">
                {initials(member.nama)}
              </span>
            </div>
          )}
        </ArchFrame>
        <ArchOutline
          stroke={featured ? "var(--accent-bright)" : "var(--accent)"}
          strokeWidth={featured ? 2 : 1.5}
          className="arch-glow pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>
      <p
        className={cn(
          "mt-4 font-semibold uppercase leading-tight tracking-wide",
          featured ? "text-base text-accent-deep" : "text-[13px] text-accent-deep"
        )}
      >
        {member.jawatan}
      </p>
      <p className="mt-1.5 font-display text-sm font-semibold text-ink">{member.nama}</p>
      {member.kategori && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {kategoriLabel[member.kategori]}
        </p>
      )}
    </div>
  );
}
