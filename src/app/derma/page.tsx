import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { Landmark, QrCode, Copy } from "lucide-react";
import { dermaKategori } from "@/content/derma";
import { getSiteSettings } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Derma & Sumbangan",
  description:
    "Salurkan sumbangan kepada PERKIB melalui akaun Bank Rakyat atau DuitNow QR untuk menyokong agenda kebajikan.",
};

export default async function DermaPage() {
  const settings = await getSiteSettings();
  const qr = settings.bank.qrImageUrl ?? "/duitnow-qr.jpg";

  return (
    <>
      <PageHero
        eyebrow="Sumbangan"
        title="Derma & Sumbangan"
        description="Sokong agenda kebajikan, pendidikan dan bantuan asnaf PERKIB melalui sumbangan anda."
        breadcrumb={[{ label: "Derma" }]}
      />

      {/* Kategori */}
      <section className="bg-background py-16 md:py-20">
        <div className="container-wide">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dermaKategori.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.08}>
                <div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/12 text-accent-deep">
                    <Icon name={d.icon} className="size-7" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-semibold text-primary-dark">
                    {d.tajuk}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {d.penerangan}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Maklumat bank + QR */}
      <section className="bg-bg-alt py-16 md:py-20">
        <div className="container-wide grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl bg-primary p-8 text-white shadow-deep md:p-10">
              <div className="flex items-center gap-3">
                <Landmark className="size-8 text-accent-bright" />
                <h2 className="font-display text-2xl font-semibold">Pindahan Bank</h2>
              </div>
              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Bank</p>
                  <p className="mt-1 font-display text-xl">{settings.bank.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Nombor Akaun
                  </p>
                  <p className="mt-1 font-display text-3xl tracking-wider text-accent-bright">
                    {settings.bank.account}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Nama Pemegang Akaun
                  </p>
                  <p className="mt-1 font-medium">{settings.bank.holder}</p>
                </div>
              </div>
              <p className="mt-8 flex items-center gap-2 text-xs text-white/60">
                <Copy className="size-3.5" /> Sila catat nombor akaun dengan tepat sebelum membuat pindahan.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
              <div className="flex items-center gap-2 text-primary-dark">
                <QrCode className="size-6 text-accent" />
                <h2 className="font-display text-xl font-semibold">DuitNow QR</h2>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                <Image
                  src={qr}
                  alt={`DuitNow QR ${settings.bank.duitNowRef}`}
                  width={340}
                  height={470}
                  className="h-auto w-full max-w-[300px]"
                />
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                Imbas kod QR di atas menggunakan aplikasi perbankan atau e-dompet anda.
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent-deep">
                {settings.bank.duitNowRef}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
