import { siteInfo } from "@/content/site";

// Structured data schema.org untuk PERKIB (organisasi kebajikan/NGO).
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: siteInfo.fullName,
    alternateName: siteInfo.shortName,
    foundingDate: String(siteInfo.foundedYear),
    email: siteInfo.email,
    sameAs: [siteInfo.facebook],
    address: {
      "@type": "PostalAddress",
      streetAddress: `${siteInfo.address.line1}, ${siteInfo.address.line2}`,
      postalCode: siteInfo.address.postcode,
      addressLocality: siteInfo.address.city,
      addressRegion: siteInfo.address.state,
      addressCountry: "MY",
    },
    parentOrganization: {
      "@type": "GovernmentOrganization",
      name: siteInfo.authority,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
