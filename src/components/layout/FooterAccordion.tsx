"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

// Kolum footer — accordion `<details>` pada mobile (boleh tutup), terbuka penuh &
// tidak boleh tutup pada desktop. Default SSR = desktop (terbuka).
export function FooterAccordion({ title, children }: { title: string; children: ReactNode }) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (mobile) {
    return (
      <details className="group border-b border-white/10">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between font-display text-sm font-semibold uppercase tracking-wider text-accent-bright">
          {title}
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="pb-4">{children}</div>
      </details>
    );
  }

  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-accent-bright">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
