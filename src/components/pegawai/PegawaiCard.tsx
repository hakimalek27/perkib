import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { initials } from "@/lib/utils";
import { kategoriLabel, type PegawaiView } from "@/lib/sanity";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { ArchOutline } from "@/components/nadi/ArchOutline";
import { Badge, type BadgeTone } from "@/components/ui/badge";

// Tona kategori — lencana dalam bahagian teks (bukan atas foto), sentiasa terbaca.
const KATEGORI_TONE: Record<string, BadgeTone> = {
  "ketua-imam": "brand",
  "timbalan-ketua-imam": "gold",
  bilal: "neutral",
};

export function PegawaiCard({ pegawai }: { pegawai: PegawaiView }) {
  const tone = KATEGORI_TONE[pegawai.kategori] ?? "neutral";
  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-3">
      {/* Foto — bingkai arch (motif tunggal PERKIB) + bingkai cahaya emas berdenyut */}
      <div className="relative">
        <ArchFrame ratio="5 / 6" className="w-full bg-gradient-to-br from-primary/8 to-accent/8">
          {pegawai.photoUrl ? (
            <Image
              src={pegawai.photoUrl}
              alt={pegawai.nama}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="font-display text-4xl font-bold text-primary/40">
                {initials(pegawai.nama)}
              </span>
            </div>
          )}
        </ArchFrame>
        <ArchOutline
          stroke="var(--accent-bright)"
          strokeWidth={2}
          className="arch-glow pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>

      {/* Butiran */}
      <div className="flex flex-1 flex-col gap-1.5 px-2 pb-1 pt-3">
        <Badge tone={tone} className="w-fit">
          {kategoriLabel[pegawai.kategori]}
        </Badge>
        <h3 className="mt-1 font-display text-base font-bold leading-tight text-ink">{pegawai.nama}</h3>
        <p className="text-xs text-muted-foreground">{pegawai.jawatanPenuh}</p>
        <div className="mt-auto space-y-1.5 pt-2">
          <p className="flex items-start gap-1.5 text-xs text-ink/80">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" />
            {pegawai.masjidNama ? (
              <span>
                {pegawai.masjidNama}
                {pegawai.masjidZonNama ? (
                  <span className="block text-[11px] text-muted-foreground">{pegawai.masjidZonNama}</span>
                ) : null}
              </span>
            ) : (
              <span className="italic text-muted-foreground">Belum ditugaskan</span>
            )}
          </p>
          {pegawai.emelRasmi ? (
            <a
              href={`mailto:${pegawai.emelRasmi}`}
              className="flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary-dark"
            >
              <Mail className="size-3.5 shrink-0 text-accent" />
              <span className="truncate">{pegawai.emelRasmi}</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
