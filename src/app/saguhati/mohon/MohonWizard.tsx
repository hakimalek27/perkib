"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileText,
  X,
  ArrowRight,
  ArrowLeft,
  Copy,
  UserCheck,
  RefreshCw,
  Landmark,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { cn, formatRM } from "@/lib/utils";
import type { JenisSaguhati } from "@/lib/sanity";

type VerifiedPegawai = {
  employeeNo: string;
  nama: string;
  kategori: string;
  jawatanPenuh: string;
  emelRasmi: string;
  masjidNama: string | null;
  masjidZonNama: string | null;
};

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = /\.(jpe?g|png|webp|pdf)$/i;

const STEPS = ["Sahkan Identiti", "Butiran Permohonan", "Semak & Hantar"];

const BANK_LIST = [
  "Maybank",
  "Bank Islam",
  "CIMB Bank",
  "Bank Rakyat",
  "RHB Bank",
  "Public Bank",
  "AmBank",
  "Bank Muamalat",
  "Affin Bank",
  "Hong Leong Bank",
  "BSN",
  "Agrobank",
  "OCBC Bank",
  "Standard Chartered",
  "UOB Bank",
  "Alliance Bank",
  "MBSB Bank",
  "HSBC",
  "Lain-lain",
];

const IDEM_KEY = "perkib-saguhati-idem";

export function MohonWizard({ jenis }: { jenis: JenisSaguhati[] }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Langkah 1
  const [employeeNo, setEmployeeNo] = useState("");
  const [icLast4, setIcLast4] = useState("");
  const [token, setToken] = useState("");
  const [pegawai, setPegawai] = useState<VerifiedPegawai | null>(null);
  const [usage, setUsage] = useState<Record<string, number>>({});

  // Captcha + honeypot
  const [captcha, setCaptcha] = useState<{ soalan: string; token: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // idempotency
  const idemRef = useRef<string>("");

  // Langkah 2
  const [selectedKod, setSelectedKod] = useState("");
  const [catatan, setCatatan] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [bankNama, setBankNama] = useState("");
  const [bankAkaun, setBankAkaun] = useState("");
  const [telefon, setTelefon] = useState("");

  // Langkah 3
  const [consent, setConsent] = useState(false);

  // Selesai
  const [refNo, setRefNo] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedJenis = jenis.find((j) => j.kod === selectedKod);

  function loadCaptcha() {
    fetch("/api/captcha")
      .then((r) => r.json())
      .then((d) => {
        if (d.soalan && d.token) setCaptcha({ soalan: d.soalan, token: d.token });
      })
      .catch(() => setCaptcha(null));
  }

  useEffect(() => {
    loadCaptcha();
    // idemKey stabil per percubaan (retry rangkaian guna semula).
    let k = "";
    try {
      k = sessionStorage.getItem(IDEM_KEY) ?? "";
      if (!k) {
        k = crypto.randomUUID();
        sessionStorage.setItem(IDEM_KEY, k);
      }
    } catch {
      k = crypto.randomUUID();
    }
    idemRef.current = k;
  }, []);

  function hadDicapai(j: JenisSaguhati): boolean {
    return j.hadMaksimum != null && (usage[j.kod] ?? 0) >= j.hadMaksimum;
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/saguhati/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeNo,
          icLast4,
          captchaToken: captcha?.token ?? "",
          captchaAnswer,
          namaPenuh: honeypot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setToken(data.token);
        setPegawai(data.pegawai);
        setUsage(data.usage ?? {});
        setStep(2);
      } else {
        setError(data.error ?? "Pengesahan gagal.");
        loadCaptcha();
        setCaptchaAnswer("");
      }
    } catch {
      setError("Ralat sambungan. Sila cuba semula.");
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  }

  function handleFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const incoming = Array.from(list);
    const combined = [...files, ...incoming].slice(0, MAX_FILES);
    for (const f of incoming) {
      if (!ALLOWED_EXT.test(f.name)) {
        setError(`Fail "${f.name}" tidak dibenarkan (hanya JPG, PNG, WEBP, PDF).`);
        return;
      }
      if (f.size > MAX_FILE_BYTES) {
        setError(`Fail "${f.name}" melebihi 5 MB.`);
        return;
      }
    }
    if (files.length + incoming.length > MAX_FILES) {
      setError(`Maksimum ${MAX_FILES} dokumen dibenarkan.`);
    }
    setFiles(combined);
  }

  function removeFile(idx: number) {
    setFiles((f) => f.filter((_, i) => i !== idx));
  }

  function goReview() {
    setError(null);
    if (!selectedKod) return setError("Sila pilih jenis saguhati.");
    if (selectedJenis && hadDicapai(selectedJenis))
      return setError("Anda telah mencapai had maksimum untuk jenis saguhati ini.");
    if (!bankNama) return setError("Sila pilih nama bank.");
    if (!/^\d{6,20}$/.test(bankAkaun.replace(/\s|-/g, "")))
      return setError("No. akaun bank tidak sah (6–20 digit).");
    if (!/^0\d{8,11}$/.test(telefon.replace(/\s|-/g, "")))
      return setError("No. telefon tidak sah (contoh: 0123456789).");
    if (files.length === 0) return setError("Sila muat naik sekurang-kurangnya satu dokumen sokongan.");
    setStep(3);
  }

  async function handleSubmit() {
    setError(null);
    if (!consent) return setError("Sila tandakan persetujuan sebelum menghantar.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("token", token);
      fd.append("jenisKod", selectedKod);
      fd.append("catatan", catatan);
      fd.append("bankNama", bankNama);
      fd.append("bankAkaun", bankAkaun.replace(/\s|-/g, ""));
      fd.append("telefon", telefon.replace(/\s|-/g, ""));
      fd.append("idemKey", idemRef.current);
      for (const f of files) fd.append("dokumen", f);
      const res = await fetch("/api/saguhati/submit", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRefNo(data.refNo);
        try {
          sessionStorage.removeItem(IDEM_KEY);
        } catch {}
        setStep(4);
        void fireConfetti();
      } else {
        setError(data.error ?? "Permohonan gagal dihantar.");
      }
    } catch {
      setError("Ralat sambungan. Sila cuba semula.");
    } finally {
      setLoading(false);
    }
  }

  // ── Skrin kejayaan ──
  if (step === 4) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-success/30 bg-card p-8 text-center shadow-elev md:p-10">
        <CheckCircle2 className="mx-auto size-16 text-success" />
        <h2 className="font-display mt-5 text-2xl font-semibold text-primary-dark">
          Permohonan Berjaya Dihantar
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Permohonan saguhati anda telah direkodkan. Simpan nombor rujukan di bawah untuk semakan status.
        </p>
        <div className="mt-6 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-deep">Nombor Rujukan</p>
          <p className="font-display mt-1 text-3xl font-semibold tracking-wider text-primary" data-testid="ref-no">
            {refNo}
          </p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(refNo);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Copy className="size-3.5" /> {copied ? "Disalin!" : "Salin nombor rujukan"}
          </button>
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle className="size-3.5 text-success" />
          Notifikasi pengesahan telah dihantar ke WhatsApp anda (jika dikonfigurasi).
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary">
            <Link href="/saguhati/semak">Semak Status</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Kembali ke Utama</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <ol className="mb-10 flex items-center justify-between gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    done && "bg-success text-white",
                    active && "bg-primary text-white ring-4 ring-primary/15",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle2 className="size-5" /> : n}
                </span>
                <span
                  className={cn(
                    "hidden text-[11px] font-medium sm:block",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-0.5 flex-1 rounded", step > n ? "bg-success" : "bg-border")} />
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Langkah 1 */}
      {step === 1 && (
        <form onSubmit={handleVerify} className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-primary-dark">Sahkan Identiti</h2>
              <p className="text-sm text-muted-foreground">
                Masukkan No. Pekerja dan 4 digit akhir kad pengenalan anda.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="employeeNo">No. Pekerja</Label>
              <Input
                id="employeeNo"
                className="mt-1.5"
                value={employeeNo}
                onChange={(e) => setEmployeeNo(e.target.value)}
                placeholder="Contoh: 1743"
                inputMode="numeric"
                required
              />
            </div>
            <div>
              <Label htmlFor="icLast4">4 Digit Akhir Kad Pengenalan</Label>
              <Input
                id="icLast4"
                className="mt-1.5"
                value={icLast4}
                onChange={(e) => setIcLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Contoh: 5081"
                inputMode="numeric"
                maxLength={4}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Untuk pengesahan sahaja. Kad pengenalan penuh tidak dipaparkan.
              </p>
            </div>

            {/* Honeypot — tersembunyi dari pengguna sebenar */}
            <div aria-hidden className="absolute -left-[9999px] top-0" tabIndex={-1}>
              <label>
                Nama penuh
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            {/* Captcha matematik */}
            <div>
              <Label htmlFor="captcha">Pengesahan Keselamatan</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="flex h-11 min-w-[5rem] items-center justify-center rounded-lg border border-border bg-muted px-3 font-display text-lg font-semibold tracking-wider text-ink">
                  {captcha ? `${captcha.soalan} =` : "…"}
                </span>
                <Input
                  id="captcha"
                  className="w-24"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value.replace(/[^\d-]/g, "").slice(0, 3))}
                  placeholder="?"
                  inputMode="numeric"
                  required
                  aria-label="Jawapan pengesahan"
                />
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="rounded-lg p-2.5 text-muted-foreground hover:bg-muted hover:text-primary"
                  aria-label="Soalan baharu"
                >
                  <RefreshCw className="size-4" />
                </button>
              </div>
            </div>
          </div>
          <Button type="submit" variant="primary" size="lg" disabled={loading} className="mt-7 w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Mengesahkan…
              </>
            ) : (
              <>
                Sahkan &amp; Teruskan <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      )}

      {/* Langkah 2 */}
      {step === 2 && pegawai && (
        <div className="space-y-6">
          {/* Kad pegawai disahkan */}
          <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/5 p-5">
            <UserCheck className="mt-0.5 size-6 shrink-0 text-success" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-success">Identiti Disahkan</p>
              <p className="font-display mt-1 text-lg font-semibold text-ink" data-testid="verified-name">
                {pegawai.nama}
              </p>
              <p className="text-sm text-muted-foreground">
                {pegawai.jawatanPenuh} · No. Pekerja {pegawai.employeeNo}
              </p>
              <p className="text-xs text-muted-foreground">
                {pegawai.masjidNama ?? "Belum ditugaskan"}
                {pegawai.masjidZonNama ? ` · ${pegawai.masjidZonNama}` : ""}
              </p>
            </div>
          </div>

          {/* Pilih jenis */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-primary-dark">Pilih Jenis Saguhati</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {jenis.map((j) => {
                const maxed = hadDicapai(j);
                return (
                  <label
                    key={j.kod}
                    className={cn(
                      "flex flex-col rounded-xl border p-4 transition-all",
                      maxed
                        ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                        : selectedKod === j.kod
                          ? "cursor-pointer border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "cursor-pointer border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <input
                        type="radio"
                        name="jenis"
                        value={j.kod}
                        checked={selectedKod === j.kod}
                        disabled={maxed}
                        onChange={() => setSelectedKod(j.kod)}
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold leading-tight text-ink">{j.nama}</span>
                      <span className="shrink-0 font-display text-base font-semibold text-accent-deep">
                        {formatRM(j.kadar)}
                      </span>
                    </div>
                    <span className="mt-2 text-[11px] text-muted-foreground">
                      Dokumen: {j.dokumenSokongan.join(", ")}
                    </span>
                    {maxed && (
                      <span className="mt-2 inline-flex w-fit rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        Had maksimum dicapai
                      </span>
                    )}
                    {!maxed && j.hadMaksimum != null && (
                      <span className="mt-2 text-[10px] text-muted-foreground">
                        Baki: {j.hadMaksimum - (usage[j.kod] ?? 0)} / {j.hadMaksimum}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Maklumat bank & telefon */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <Landmark className="size-5 text-accent" />
              <h2 className="font-display text-lg font-semibold text-primary-dark">
                Maklumat Bank &amp; Hubungan
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Saguhati akan dikreditkan ke akaun ini. Nombor telefon untuk notifikasi status.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="bankNama">Nama Bank</Label>
                <select
                  id="bankNama"
                  value={bankNama}
                  onChange={(e) => setBankNama(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">— Pilih bank —</option>
                  {BANK_LIST.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="bankAkaun">No. Akaun Bank</Label>
                <Input
                  id="bankAkaun"
                  className="mt-1.5"
                  value={bankAkaun}
                  onChange={(e) => setBankAkaun(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 24))}
                  placeholder="Contoh: 158123456789"
                  inputMode="numeric"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="telefon">No. Telefon</Label>
                <Input
                  id="telefon"
                  className="mt-1.5"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 13))}
                  placeholder="Contoh: 0123456789"
                  inputMode="tel"
                />
              </div>
            </div>
          </div>

          {/* Muat naik */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-primary-dark">Dokumen Sokongan</h2>
            {selectedJenis && (
              <p className="mt-1 text-sm text-muted-foreground">
                Diperlukan:{" "}
                <span className="font-medium text-ink">{selectedJenis.dokumenSokongan.join(", ")}</span>
              </p>
            )}
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-8 text-center transition-colors hover:border-primary/40">
              <Upload className="size-8 text-accent" />
              <span className="mt-2 text-sm font-medium text-ink">Klik untuk muat naik</span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WEBP atau PDF · Maks {MAX_FILES} fail · 5 MB setiap satu
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-2.5"
                  >
                    <span className="flex items-center gap-2 truncate text-sm text-ink">
                      <FileText className="size-4 shrink-0 text-accent" />
                      <span className="truncate">{f.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        ({(f.size / 1024).toFixed(0)} KB)
                      </span>
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Buang fail"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Catatan */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <Label htmlFor="catatan">Catatan (pilihan)</Label>
            <Textarea
              id="catatan"
              className="mt-1.5"
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Maklumat tambahan berkaitan permohonan…"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" /> Kembali
            </Button>
            <Button variant="primary" size="lg" onClick={goReview} className="flex-1">
              Semak Permohonan <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Langkah 3 — semak */}
      {step === 3 && pegawai && selectedJenis && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="font-display text-xl font-semibold text-primary-dark">Semak Permohonan Anda</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <Row label="Pemohon" value={`${pegawai.nama} (${pegawai.employeeNo})`} />
              <Row label="Jawatan" value={pegawai.jawatanPenuh} />
              <Row label="Masjid" value={pegawai.masjidNama ?? "Belum ditugaskan"} />
              <Row label="Jenis Saguhati" value={selectedJenis.nama} />
              <Row label="Kadar" value={formatRM(selectedJenis.kadar)} highlight />
              <Row label="Bank" value={bankNama} />
              <Row label="No. Akaun" value={bankAkaun.replace(/\s|-/g, "")} />
              <Row label="No. Telefon" value={telefon.replace(/\s|-/g, "")} />
              <Row label="Dokumen" value={`${files.length} fail dilampirkan`} />
              {catatan && <Row label="Catatan" value={catatan} />}
            </dl>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-xs text-ink/80">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>
              Saya mengesahkan maklumat di atas adalah benar dan bersetuju maklumat peribadi saya
              (termasuk kad pengenalan dan butiran bank) diproses serta dihantar melalui WhatsApp bagi
              tujuan permohonan saguhati ini, selaras dengan PDPA.
            </span>
          </label>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(2)} disabled={loading}>
              <ArrowLeft className="size-4" /> Kembali
            </Button>
            <Button
              variant="gold"
              size="lg"
              onClick={handleSubmit}
              disabled={loading || !consent}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Menghantar…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" /> Hantar Permohonan
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

async function fireConfetti() {
  try {
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#17457A", "#C99A3E", "#1E7D53"];
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors }), 200);
    setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors }), 350);
  } catch {
    // confetti pilihan sahaja
  }
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
      <dt className="shrink-0 font-medium text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", highlight ? "font-display text-lg font-semibold text-accent-deep" : "text-ink")}>
        {value}
      </dd>
    </div>
  );
}
