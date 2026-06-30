import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExportButtons } from "../components/room/ExportButtons";
import { analyzeBatch, fetchAiRisks, synthesizeMatter } from "../services/aiApi";
import type { AiRiskIssue } from "../types";

function severityClass(s: string) {
  if (s === "high") return "text-danger";
  if (s === "medium") return "text-warn";
  return "text-ink-muted";
}

export function RiskRegisterPage() {
  const { matterId = "" } = useParams();
  const [issues, setIssues] = useState<AiRiskIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchAiRisks(matterId)
      .then(setIssues)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [matterId]);

  const runPipeline = async () => {
    setWorking(true);
    setError(null);
    try {
      await analyzeBatch(matterId, 8);
      setError(null);
      // Batch runs in background — watch AI processes widget (bottom-right). Synthesize after batch completes.
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Pipeline failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">
            AI risk register
          </p>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Aggregated from per-document LLM analysis and cross-document synthesis. Quick analyze
            runs in the background — track progress in the AI processes widget (bottom-right).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 max-lg:flex-col max-lg:[&>button]:w-full">
          <button type="button" className="btn-primary max-lg:w-full" disabled={working} onClick={() => void runPipeline()}>
            {working ? "Starting…" : "Quick analyze (8 docs)"}
          </button>
          <button
            type="button"
            className="btn-secondary max-lg:w-full"
            disabled={working}
            onClick={() => {
              setWorking(true);
              synthesizeMatter(matterId, true)
                .then(() => load())
                .catch((e: unknown) =>
                  setError(e instanceof Error ? e.message : "Synthesis failed")
                )
                .finally(() => setWorking(false));
            }}
          >
            Synthesize risks
          </button>
          <ExportButtons matterId={matterId} />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="card overflow-hidden">
        {/* Mobile cards */}
        <div className="divide-y divide-line lg:hidden">
          {loading ? (
            <p className="px-4 py-12 text-center text-ink-muted">Loading…</p>
          ) : issues.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-ink-muted">
              No AI risks yet. Run quick analyze, then synthesize.
            </p>
          ) : (
            issues.map((row) => (
              <article key={row.id} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink">{row.issue}</p>
                  <span className={`shrink-0 text-xs font-semibold uppercase ${severityClass(row.severity)}`}>
                    {row.severity}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">{row.explanation}</p>
                {row.documentId ? (
                  <Link
                    to={`/matters/${matterId}/documents/${row.documentId}`}
                    className="text-sm font-medium text-brand"
                  >
                    {row.documentName}
                  </Link>
                ) : (
                  <p className="text-sm text-ink-muted">{row.documentName}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-ink-faint">
                  <span className="capitalize">{row.status}</span>
                  {row.sourceReference ? <span>· {row.sourceReference}</span> : null}
                </div>
              </article>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1100px] table-fixed border-collapse text-left text-sm">
            <thead className="bg-brand-soft/50 text-xs uppercase tracking-wide text-ink-faint">
              <tr className="border-b border-line">
                <th className="w-[38%] min-w-[340px] px-4 py-3 font-medium">Issue</th>
                <th className="w-[10%] min-w-[96px] px-4 py-3 font-medium">Severity</th>
                <th className="w-[22%] min-w-[200px] px-4 py-3 font-medium">Document</th>
                <th className="w-[12%] min-w-[100px] px-4 py-3 font-medium">Status</th>
                <th className="w-[18%] min-w-[180px] px-4 py-3 font-medium">Source ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-muted">
                    Loading…
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-muted">
                    No AI risks yet. Click Analyze & aggregate risks (analyzes up to 8 docs, then
                    synthesizes).
                  </td>
                </tr>
              ) : (
                issues.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{row.issue}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{row.explanation}</p>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 font-semibold uppercase ${severityClass(row.severity)}`}>
                      {row.severity}
                    </td>
                    <td className="px-4 py-3">
                      {row.documentId ? (
                        <Link
                          to={`/matters/${matterId}/documents/${row.documentId}`}
                          className="line-clamp-2 text-brand hover:underline"
                          title={row.documentName}
                        >
                          {row.documentName}
                        </Link>
                      ) : (
                        <span className="line-clamp-2" title={row.documentName}>
                          {row.documentName}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-ink-muted">{row.status}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-ink-faint">
                      {row.sourceReference || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
