"use client";

import { useState } from "react";
import { Copy, Check, Landmark } from "lucide-react";

// Kad bank + butang salin nombor akaun (Clipboard API + fallback execCommand).
export function DermaCopy({ bankName, account, holder }: { bankName: string; account: string; holder: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const plain = account.replace(/[\s-]/g, "");
    try {
      await navigator.clipboard.writeText(plain);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = plain;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <Landmark className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-ink">{bankName}</p>
          <p
            className={`font-display text-2xl tracking-wide transition-all ${
              copied ? "-translate-y-0.5 text-success" : "text-primary"
            }`}
          >
            {account}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{holder}</p>
      <button
        onClick={copy}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
      >
        {copied ? (
          <>
            <Check className="size-4 text-success" /> <span className="text-success">Disalin ✓</span>
          </>
        ) : (
          <>
            <Copy className="size-4" /> Salin nombor akaun
          </>
        )}
      </button>
    </div>
  );
}
