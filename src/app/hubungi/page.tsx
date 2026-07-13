import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "./ContactForm";
import { Mail, MapPin, Clock, Phone } from "lucide-react";
import { siteInfo } from "@/content/site";
import { getSiteSettings } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description:
    "Hubungi Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB) — alamat, emel dan borang pertanyaan.",
};

export default async function HubungiPage() {
  const settings = await getSiteSettings();
  const alamat = `${siteInfo.address.line1}, ${siteInfo.address.line2}, ${siteInfo.address.postcode} ${siteInfo.address.city}, ${siteInfo.address.state}`;

  return (
    <>
      <PageHero
        eyebrow="Hubungi"
        title="Hubungi Kami"
        description="Ada pertanyaan? Hubungi urus setia PERKIB melalui borang di bawah atau maklumat hubungan rasmi kami."
        breadcrumb={[{ label: "Hubungi" }]}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container-wide grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Maklumat */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">Alamat</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{alamat}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <Mail className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">Emel</h3>
                  <a href={`mailto:${settings.email}`} className="mt-1 block break-all text-sm text-primary hover:underline">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
            {settings.phone ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <Phone className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">Telefon</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{settings.phone}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6">
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Phone className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">Telefon</h3>
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      Nombor telefon akan dikemas kini.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {settings.officeHours.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <Clock className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">Waktu Pejabat</h3>
                    {settings.officeHours.map((h) => (
                      <p key={h.day} className="mt-1 text-sm text-muted-foreground">
                        {h.day}: {h.time}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Borang */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="font-display text-2xl font-semibold text-primary-dark">
              Borang Pertanyaan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Lengkapkan borang di bawah dan urus setia kami akan menghubungi anda.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
