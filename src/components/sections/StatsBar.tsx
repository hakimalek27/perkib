import { Counter } from "@/components/Counter";
import type { Stat } from "@/content/homepage";

export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-primary-deep/60 px-5 py-7 text-center backdrop-blur-sm">
          <div className="font-display text-4xl font-semibold text-accent-bright md:text-5xl">
            <Counter to={s.value} suffix={s.suffix} />
          </div>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-white/70 md:text-sm">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
