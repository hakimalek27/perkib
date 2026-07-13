"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2, "Nama terlalu pendek").max(100),
  email: z.string().email("Emel tidak sah").max(254),
  phone: z.string().min(7, "No. telefon tidak sah").max(20),
  subject: z.string().min(3, "Subjek terlalu pendek").max(200),
  message: z.string().min(10, "Mesej terlalu pendek").max(5000),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("ok");
        reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-success/30 bg-success/5 p-10 text-center">
        <CheckCircle2 className="size-12 text-success" />
        <h3 className="font-display mt-4 text-xl font-semibold text-ink">Mesej Dihantar</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Terima kasih. Urus setia PERKIB akan menghubungi anda secepat mungkin.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus("idle")}>
          Hantar Mesej Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nama Penuh</Label>
          <Input id="name" className="mt-1.5" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">No. Telefon</Label>
          <Input id="phone" className="mt-1.5" {...register("phone")} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="email">Emel</Label>
        <Input id="email" type="email" className="mt-1.5" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="subject">Subjek</Label>
        <Input id="subject" className="mt-1.5" {...register("subject")} aria-invalid={!!errors.subject} />
        {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>}
      </div>
      <div>
        <Label htmlFor="message">Mesej</Label>
        <Textarea id="message" rows={5} className="mt-1.5" {...register("message")} aria-invalid={!!errors.message} />
        {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          Gagal menghantar mesej. Sila cuba semula.
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Menghantar…
          </>
        ) : (
          <>
            <Send className="size-4" /> Hantar Mesej
          </>
        )}
      </Button>
    </form>
  );
}
