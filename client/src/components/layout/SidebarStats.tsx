import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDashboard } from "../../services/mattersApi";

export function SidebarStats() {
  const { matterId } = useParams<{ matterId?: string }>();
  const [stats, setStats] = useState<{ documents: number; reviewed: number; flagged: number } | null>(
    null
  );

  useEffect(() => {
    if (!matterId) {
      setStats(null);
      return;
    }
    fetchDashboard(matterId)
      .then((d) =>
        setStats({
          documents: d.stats.totalDocuments,
          reviewed: Math.round((d.stats.reviewedPercent / 100) * d.stats.totalDocuments),
          flagged: d.stats.flaggedIssues,
        })
      )
      .catch(() => setStats(null));
  }, [matterId]);

  if (!matterId) return null;

  const rows = [
    { label: "Documents", value: stats?.documents ?? "—" },
    { label: "Reviewed", value: stats?.reviewed ?? "—" },
    { label: "Flagged", value: stats?.flagged ?? "—" },
  ];

  return (
    <div className="space-y-2 text-xs text-ink-faint">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-2">
          <span>{r.label}</span>
          <span className="tabular-nums text-ink-muted">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
