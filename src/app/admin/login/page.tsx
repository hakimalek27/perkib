import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/saguhati");
  }
  const configured = isAdminConfigured();

  return (
    <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-16">
      {configured ? (
        <LoginForm />
      ) : (
        <div className="w-full max-w-md rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
          <h1 className="font-display text-xl font-semibold text-primary-dark">
            Panel Admin Belum Dikonfigurasi
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tetapkan <code className="rounded bg-muted px-1 py-0.5">ADMIN_PASSWORD</code> dalam{" "}
            <code className="rounded bg-muted px-1 py-0.5">.env.local</code>, kemudian mulakan semula
            pelayan.
          </p>
        </div>
      )}
    </div>
  );
}
