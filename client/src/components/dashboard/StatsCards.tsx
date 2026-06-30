interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatsCards({ items, pulse = false }: { items: StatItem[]; pulse?: boolean }) {
  return (
    <div
      className={[
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
        pulse ? "animate-pulse rounded-xl ring-2 ring-brand/25 ring-offset-2 ring-offset-surface" : "",
      ].join(" ")}
    >
      {items.map((s) => (
        <div key={s.label} className="card p-5">
          <p className="text-sm text-ink-muted">{s.label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-ink">
            {s.value}
          </p>
          {s.hint ? <p className="mt-2 text-xs text-ink-faint">{s.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
