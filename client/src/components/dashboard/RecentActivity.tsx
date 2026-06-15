import type { ActivityItem } from "../../types";

function kindLabel(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "upload":
      return "Upload";
    case "review":
      return "Review";
    case "flag":
      return "Flag";
    case "folder":
      return "Index";
    case "comment":
      return "Comment";
    default:
      return kind;
  }
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line/70 bg-brand-soft/40 px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
        <p className="text-xs text-ink-muted">
          Audit-style feed — future: filters, exports, real users.
        </p>
      </div>
      <ul className="divide-y divide-line">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3 px-4 py-3">
            <span className="mt-0.5 inline-flex h-6 shrink-0 items-center rounded-md border border-line bg-surface-muted px-2 font-mono text-[10px] font-medium uppercase text-ink-muted">
              {kindLabel(a.kind)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{a.message}</p>
              <p className="mt-1 text-xs text-ink-faint">
                {new Date(a.occurredAt).toLocaleString()}{" "}
                {a.actorLabel ? `· ${a.actorLabel}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
