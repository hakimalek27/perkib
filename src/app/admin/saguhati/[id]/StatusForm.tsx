"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { updateStatusAction, type StatusUpdate } from "../actions";

const STATUS_OPTIONS: { value: StatusUpdate["status"]; label: string }[] = [
  { value: "baru", label: "Baru" },
  { value: "diproses", label: "Diproses" },
  { value: "lulus", label: "Lulus" },
  { value: "tolak", label: "Tolak" },
  { value: "dibayar", label: "Dibayar" },
];

export function StatusForm({
  id,
  initial,
}: {
  id: string;
  initial: {
    status: string;
    catatanAdmin: string;
    transferBank: string;
    transferTarikh: string;
    transferRujukan: string;
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initial.status);
  const [catatanAdmin, setCatatanAdmin] = useState(initial.catatanAdmin);
  const [transferBank, setTransferBank] = useState(initial.transferBank);
  const [transferTarikh, setTransferTarikh] = useState(initial.transferTarikh);
  const [transferRujukan, setTransferRujukan] = useState(initial.transferRujukan);
  const [pending, start] = useTransition();

  const showTransfer = status === "lulus" || status === "dibayar";

  function submit() {
    start(async () => {
      const r = await updateStatusAction(id, {
        status: status as StatusUpdate["status"],
        catatanAdmin,
        transferBank,
        transferTarikh,
        transferRujukan,
      });
      if (r.ok) {
        toast.success(
          r.waStatus === "dihantar"
            ? "Status dikemas kini & notifikasi WhatsApp dihantar."
            : "Status dikemas kini."
        );
        router.refresh();
      } else {
        toast.error(r.error ?? "Gagal mengemas kini.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6">
      <h2 className="font-display text-lg font-semibold text-primary-dark">Kemas Kini Status</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ubah status terus di sini — tiada perlu log masuk Studio. Pemohon akan menerima notifikasi
        WhatsApp untuk status Lulus / Tolak / Dibayar.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Status" htmlFor="status">
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        {showTransfer && (
          <div className="grid gap-4 rounded-xl border border-success/30 bg-success/5 p-4 sm:grid-cols-3">
            <Field label="Bank Ditransfer" htmlFor="tbank">
              <Input id="tbank" value={transferBank} onChange={(e) => setTransferBank(e.target.value)} placeholder="cth: Maybank" />
            </Field>
            <Field label="Tarikh Transfer" htmlFor="ttarikh">
              <Input id="ttarikh" type="date" value={transferTarikh} onChange={(e) => setTransferTarikh(e.target.value)} />
            </Field>
            <Field label="No. Rujukan Transaksi" htmlFor="truj">
              <Input id="truj" value={transferRujukan} onChange={(e) => setTransferRujukan(e.target.value)} placeholder="cth: TXN123456" />
            </Field>
          </div>
        )}

        <Field label="Catatan Admin" htmlFor="catatanAdmin">
          <Textarea
            id="catatanAdmin"
            rows={3}
            value={catatanAdmin}
            onChange={(e) => setCatatanAdmin(e.target.value)}
            placeholder="Catatan dalaman / sebab penolakan…"
          />
        </Field>

        <Button variant="primary" size="lg" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Simpan Status
        </Button>
      </div>
    </div>
  );
}
