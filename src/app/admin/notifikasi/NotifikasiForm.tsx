"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import type { NotifConfig, NotifEvent } from "@/lib/notifikasi";
import { saveNotifAction, testSendAction } from "./actions";

const EVENTS: { key: NotifEvent; label: string }[] = [
  { key: "baru-admin", label: "Permohonan Baharu → Admin / Group" },
  { key: "baru-pemohon", label: "Permohonan Baharu → Pemohon" },
  { key: "lulus-pemohon", label: "Diluluskan → Pemohon" },
  { key: "tolak-pemohon", label: "Ditolak → Pemohon" },
  { key: "dibayar-pemohon", label: "Telah Dibayar → Pemohon" },
];

const PLACEHOLDERS = [
  "nama", "noPekerja", "noKp", "masjid", "jenis", "kadar", "refNo",
  "bankNama", "bankAkaun", "telefon", "catatan", "bankTransfer", "tarikhTransfer", "rujukanTransfer",
];

export function NotifikasiForm({ initial }: { initial: NotifConfig }) {
  const [config, setConfig] = useState<NotifConfig>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testTo, setTestTo] = useState("");
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [testing, startTest] = useTransition();

  function updateTarget(i: number, field: "label" | "to", value: string) {
    setConfig((c) => {
      const targets = [...c.targets];
      targets[i] = { ...targets[i], [field]: value };
      return { ...c, targets };
    });
  }
  function addTarget() {
    setConfig((c) => ({ ...c, targets: [...c.targets, { label: "", to: "" }] }));
  }
  function removeTarget(i: number) {
    setConfig((c) => ({ ...c, targets: c.targets.filter((_, idx) => idx !== i) }));
  }
  function setTemplate(ev: NotifEvent, value: string) {
    setConfig((c) => ({ ...c, templates: { ...c.templates, [ev]: value } }));
  }
  function toggle(ev: NotifEvent) {
    setConfig((c) => ({ ...c, enabled: { ...c.enabled, [ev]: !c.enabled[ev] } }));
  }

  function save() {
    setMsg(null);
    startSave(async () => {
      const r = await saveNotifAction(config);
      setMsg(r.ok ? { ok: true, text: "Tetapan disimpan." } : { ok: false, text: r.error ?? "Gagal." });
    });
  }
  function test() {
    setTestMsg(null);
    startTest(async () => {
      const r = await testSendAction(testTo);
      setTestMsg(
        r.ok
          ? { ok: true, text: r.status === "dry-run" ? "Mod ujian: mesej dilog (tidak dihantar)." : "Mesej ujian dihantar." }
          : { ok: false, text: r.error ?? "Gagal menghantar." }
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* Sasaran admin */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-primary-dark">Sasaran Admin / Group</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nombor telefon (contoh: 0123456789) atau JID group WhatsApp (contoh: 120363…@g.us).
          Salin JID group dari dashboard wassap.wehdah.my.
        </p>
        <div className="mt-4 space-y-3">
          {config.targets.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Belum ada sasaran.</p>
          )}
          {config.targets.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Input
                className="w-40"
                placeholder="Label (cth: Bendahari)"
                value={t.label}
                onChange={(e) => updateTarget(i, "label", e.target.value)}
              />
              <Input
                className="flex-1 min-w-[12rem]"
                placeholder="Nombor / JID group"
                value={t.to}
                onChange={(e) => updateTarget(i, "to", e.target.value)}
              />
              <button
                onClick={() => removeTarget(i)}
                className="rounded-lg p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Buang"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addTarget}>
            <Plus className="size-4" /> Tambah Sasaran
          </Button>
        </div>
      </section>

      {/* Templat per peristiwa */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-primary-dark">Templat Mesej</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Placeholder tersedia:{" "}
          {PLACEHOLDERS.map((p) => (
            <code key={p} className="mx-0.5 rounded bg-muted px-1 py-0.5 text-[11px]">{`{{${p}}}`}</code>
          ))}
        </p>
        <div className="mt-4 space-y-5">
          {EVENTS.map((ev) => (
            <div key={ev.key} className="rounded-xl border border-border p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enabled[ev.key]}
                  onChange={() => toggle(ev.key)}
                  className="size-4 accent-primary"
                />
                <span className="text-sm font-semibold text-ink">{ev.label}</span>
              </label>
              <Textarea
                className="mt-3 font-mono text-xs"
                rows={5}
                value={config.templates[ev.key]}
                onChange={(e) => setTemplate(ev.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="lg" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Simpan Tetapan
        </Button>
        {msg && (
          <span className={`flex items-center gap-1.5 text-sm ${msg.ok ? "text-success" : "text-destructive"}`}>
            {msg.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            {msg.text}
          </span>
        )}
      </div>

      {/* Ujian hantar */}
      <section className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <h2 className="font-display text-lg font-semibold text-primary-dark">Hantar Ujian</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Label htmlFor="testTo" className="sr-only">Nombor ujian</Label>
          <Input
            id="testTo"
            className="flex-1 min-w-[12rem]"
            placeholder="Nombor telefon anda (cth: 0123456789)"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
          />
          <Button variant="gold" onClick={test} disabled={testing}>
            {testing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Hantar Ujian
          </Button>
        </div>
        {testMsg && (
          <p className={`mt-2 flex items-center gap-1.5 text-sm ${testMsg.ok ? "text-success" : "text-destructive"}`}>
            {testMsg.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            {testMsg.text}
          </p>
        )}
      </section>
    </div>
  );
}
