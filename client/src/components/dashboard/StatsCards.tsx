interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatsCards({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            {s.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{s.value}</p>
          {s.hint ? <p className="mt-1 text-xs text-ink-muted">{s.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
