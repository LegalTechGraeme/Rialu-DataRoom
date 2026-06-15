import type { DiligenceFlag } from "../../types";

export type DiligenceFlagValue = DiligenceFlag | null | "unreviewed";

const config: Record<
  Exclude<DiligenceFlagValue, null>,
  { label: string; className: string }
> = {
  green: {
    label: "Green",
    className: "border-ok/40 bg-ok/10 text-ok",
  },
  amber: {
    label: "Amber",
    className: "border-warn/40 bg-warn/10 text-warn",
  },
  red: {
    label: "Red",
    className: "border-danger/40 bg-danger/10 text-danger",
  },
  unreviewed: {
    label: "Not reviewed",
    className: "border-line bg-surface-muted text-ink-muted",
  },
};

export function DiligenceFlagBadge({ flag }: { flag: DiligenceFlagValue }) {
  const key = flag ?? "unreviewed";
  const c = config[key];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${c.className}`}
    >
      {c.label}
    </span>
  );
}
