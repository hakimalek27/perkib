import { Counter } from "@/components/Counter";
import type { Stat } from "@/content/homepage";

export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="glass-dark grid grid-cols-2 gap-px overflow-hidden rounded-2xl shadow-deep md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="group relative px-5 py-7 text-center transition-colors hover:bg-white/5"
        >
          <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
