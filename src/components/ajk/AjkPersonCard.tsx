import Image from "next/image";
import { cn, initials } from "@/lib/utils";
import { kategoriLabel, type AjkView } from "@/lib/sanity";

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
        "card-hover flex flex-col items-center rounded-2xl border bg-card p-5 text-center shadow-soft",
        featured ? "border-accent/50 gold-topline" : "border-border"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-full ring-2",
          featured ? "size-28 ring-accent/60" : "size-24 ring-accent/25"
        )}
      >
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.nama}
            fill
            sizes={featured ? "112px" : "96px"}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/8">
            <span className="font-display text-2xl font-semibold text-primary/50">
              {initials(member.nama)}
            </span>
          </div>
        )}
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
