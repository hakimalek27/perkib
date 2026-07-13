import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { initials } from "@/lib/utils";
import { kategoriLabel, type PegawaiView } from "@/lib/sanity";

const KATEGORI_TONE: Record<string, string> = {
  "ketua-imam": "bg-primary/10 text-primary",
  "timbalan-ketua-imam": "bg-accent/15 text-accent-deep",
  bilal: "bg-primary-light/15 text-primary-light",
};

export function PegawaiCard({ pegawai }: { pegawai: PegawaiView }) {
  const tone = KATEGORI_TONE[pegawai.kategori] ?? "bg-muted text-muted-foreground";
  return (
    <article className="hover-glow group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {/* Foto / avatar */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/8 to-accent/8">
        {pegawai.photoUrl ? (
          <Image
            src={pegawai.photoUrl}
            alt={pegawai.nama}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl font-semibold text-primary/40">
              {initials(pegawai.nama)}
            </span>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}
        >
          {kategoriLabel[pegawai.kategori]}
        </span>
      </div>

      {/* Butiran */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-base font-semibold leading-tight text-ink">
          {pegawai.nama}
        </h3>
        <p className="text-xs text-muted-foreground">{pegawai.jawatanPenuh}</p>
        <div className="mt-auto space-y-1.5 pt-2">
          <p className="flex items-start gap-1.5 text-xs text-ink/80">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" />
            {pegawai.masjidNama ? (
              <span>
                {pegawai.masjidNama}
                {pegawai.masjidZonNama ? (
                  <span className="block text-[11px] text-muted-foreground">
                    {pegawai.masjidZonNama}
                  </span>
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
