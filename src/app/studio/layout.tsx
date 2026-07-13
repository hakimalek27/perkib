import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio — PERKIB",
  robots: { index: false, follow: false },
};

// Studio interaktif (auth, mutasi) — jangan prerender.
export const dynamic = "force-dynamic";

// Studio hidup di bawah root layout yang render Header tetap. Pin Studio ke
// overlay full-viewport supaya ia mengisi seluruh skrin tanpa jurang.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] overflow-auto bg-white">{children}</div>
  );
}
