"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2, UserX, UserCheck, AlertTriangle } from "lucide-react";
import { deletePegawaiAction, setPegawaiAktifAction } from "../actions";

export function PadamButton({
  employeeNo,
  nama,
  statusAktif,
}: {
  employeeNo: string;
  nama: string;
  statusAktif: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<null | "padam" | "nyahaktif">(null);

  function doDelete() {
    startTransition(async () => {
      const res = await deletePegawaiAction(employeeNo);
      if (res.ok) {
        toast.success(`Pegawai ${nama} telah dipadam.`);
        router.push("/admin/pegawai");
        router.refresh();
      } else if (res.referenced) {
        // Tidak boleh padam (ada rujukan) → tawar nyahaktif.
        setDialog("nyahaktif");
      } else {
        toast.error(res.error ?? "Gagal memadam.");
        setDialog(null);
      }
    });
  }

  function doSetAktif(aktif: boolean) {
    startTransition(async () => {
      const res = await setPegawaiAktifAction(employeeNo, aktif);
      if (res.ok) {
        toast.success(aktif ? "Pegawai diaktifkan semula." : "Pegawai dinyahaktifkan.");
        setDialog(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Gagal.");
      }
    });
  }

  return (
    <>
      {statusAktif ? (
        <button
          onClick={() => setDialog("padam")}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/30 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="size-4" /> Padam
        </button>
      ) : (
        <button
          onClick={() => doSetAktif(true)}
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-success/30 px-4 text-sm font-medium text-success transition-colors hover:bg-success/10 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
          Aktifkan Semula
        </button>
      )}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !pending && setDialog(null)} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">
                {dialog === "padam" ? "Padam pegawai?" : "Tidak boleh padam"}
              </h3>
            </div>

            {dialog === "padam" ? (
              <p className="text-sm text-muted-foreground">
                Anda pasti mahu memadam <strong className="text-ink">{nama}</strong> ({employeeNo})
                sepenuhnya? Tindakan ini tidak boleh dibatalkan.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <strong className="text-ink">{nama}</strong> mempunyai rekod permohonan saguhati atau
                yuran yang merujuknya, jadi tidak boleh dipadam sepenuhnya. Anda boleh{" "}
                <strong className="text-ink">nyahaktifkan</strong> sebaliknya — pegawai akan hilang
                dari direktori awam tetapi sejarahnya kekal.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDialog(null)}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium text-ink hover:bg-muted disabled:opacity-60"
              >
                Batal
              </button>
              {dialog === "padam" ? (
                <button
                  onClick={doDelete}
                  disabled={pending}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Padam
                </button>
              ) : (
                <button
                  onClick={() => doSetAktif(false)}
                  disabled={pending}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-warning px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <UserX className="size-4" />}
                  Nyahaktifkan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
