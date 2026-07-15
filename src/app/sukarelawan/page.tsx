import { redirect } from "next/navigation";

// Halaman Sukarelawan DISOROK buat masa ini (arahan Hakim v3.3) — redirect ke utama.
// Kandungan asal (`content/pages.ts` → `sukarelawan`) dan reka bentuk kekal dalam
// sejarah git untuk dipulihkan dengan mudah jika perlu dipaparkan semula.
export default function SukarelawanPage() {
  redirect("/");
}
