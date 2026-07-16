import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio — PERKIB",
  robots: { index: false, follow: false },
};

// Studio interaktif (auth, mutasi) — jangan prerender.
export const dynamic = "force-dynamic";

// Studio hidup di bawah root layout. Guna h-screen (100vh MUTLAK) — bukan
// `fixed inset-0` — kerana `position:fixed` mudah pecah bila ada ancestor
// bertransform (cth .page-enter template) yang menjadi containing block dan
// meruntuhkan tinggi Studio ke 0. (Header/Footer laman early-return utk /studio.)
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full overflow-auto bg-white">{children}</div>
  );
}
