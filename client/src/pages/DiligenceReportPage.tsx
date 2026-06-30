import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DiligenceFlagBadge } from "../components/diligence/DiligenceFlagBadge";
import { ExportButtons } from "../components/room/ExportButtons";
import { fetchMatterSynthesis, generateReport } from "../services/aiApi";
import { fetchDiligenceReport } from "../services/reviewsApi";
import type {
  DiligenceFlag,
  DiligenceReportPayload,
  GeneratedReport,
  MatterSynthesis,
} from "../types";

type FlagFilter = "all" | DiligenceFlag | "unreviewed";

export function DiligenceReportPage() {
  const { matterId = "" } = useParams();
  const [report, setReport] = useState<DiligenceReportPayload | null>(null);
  const [filter, setFilter] = useState<FlagFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<GeneratedReport | null>(null);
  const [synthesis, setSynthesis] = useState<MatterSynthesis | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDiligenceReport(matterId), fetchMatterSynthesis(matterId)])
      .then(([r, syn]) => {
        if (!cancelled) {
          setReport(r);
          setSynthesis(syn);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load report");
      });
    if (matterId === "matter-acme") {
      generateReport(matterId)
        .then((memo) => {
          if (!cancelled) setAiReport(memo);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [matterId]);

  const filtered = useMemo(() => {
    if (!report) return [];
    return report.entries.filter((e) => {
      if (filter === "all") return true;
      if (filter === "unreviewed") return !e.review?.diligenceFlag;
      return e.review?.diligenceFlag === filter;
    });
  }, [report, filter]);

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!report) {
    return <p className="text-sm text-ink-muted">Loading due diligence report…</p>;
  }

  const { counts, total } = report;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Due diligence report</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Working report across all data room documents. Open any row to review the file and
          edit flags and notes, or generate an AI partner memo below.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 max-lg:flex-col max-lg:[&>button]:w-full max-lg:[&>a]:w-full">
          <button
            type="button"
            className="btn-primary max-lg:w-full"
            disabled={generating}
            onClick={() => {
              setGenerating(true);
              generateReport(matterId)
                .then(setAiReport)
                .catch((e: unknown) =>
                  setError(e instanceof Error ? e.message : "Report generation failed")
                )
                .finally(() => setGenerating(false));
            }}
          >
            {generating ? "Generating AI report…" : "Generate AI diligence memo"}
          </button>
          <ExportButtons matterId={matterId} />
        </div>
      </div>

      {synthesis ? (
        <article className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-ink">Structured findings</h2>
          <p className="text-sm leading-relaxed text-ink-muted">{synthesis.executive_summary}</p>
          {synthesis.top_risks.length > 0 ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
                Top risks
              </h3>
              <ul className="mt-3 space-y-2">
                {synthesis.top_risks.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-line bg-surface-muted/40 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                          r.severity === "high"
                            ? "bg-danger/15 text-danger"
                            : r.severity === "medium"
                              ? "bg-warn/15 text-warn"
                              : "bg-surface-muted text-ink-muted",
                        ].join(" ")}
                      >
                        {r.severity}
                      </span>
                      <span className="font-medium text-ink">{r.risk}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">{r.explanation}</p>
                    {r.document_names?.length ? (
                      <p className="mt-1 text-[11px] text-ink-faint">
                        {r.document_names.join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {synthesis.themes?.length ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
                Themes
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {synthesis.themes.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line bg-surface-muted px-3 py-1 text-xs text-ink-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      ) : null}

      {aiReport ? (
        <article className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-ink">{aiReport.report.title}</h2>
          <p className="text-sm leading-relaxed text-ink-muted">{aiReport.report.executive_summary}</p>
          {aiReport.report.sections.map((s, i) => (
            <section key={i}>
              <h3 className="font-semibold text-ink">{s.heading}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {s.body}
              </p>
            </section>
          ))}
          {aiReport.report.red_flags.length > 0 ? (
            <section>
              <h3 className="font-semibold text-danger">Red flags</h3>
              <ul className="mt-2 space-y-2">
                {aiReport.report.red_flags.map((f, i) => (
                  <li key={i} className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm">
                    <p className="font-medium text-ink">{f.item}</p>
                    <p className="mt-1 text-xs text-ink-muted">{f.recommendation}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="border-t border-line pt-4 text-sm text-ink-muted">{aiReport.report.conclusion}</p>
        </article>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { key: "green" as const, label: "Green", count: counts.green },
            { key: "amber" as const, label: "Amber", count: counts.amber },
            { key: "red" as const, label: "Red", count: counts.red },
            { key: "unreviewed" as const, label: "Not reviewed", count: counts.unreviewed },
          ] as const
        ).map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            className={[
              "rounded-xl border p-4 text-left transition-colors",
              filter === s.key
                ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                : "border-line bg-surface-elevated hover:border-accent/30",
            ].join(" ")}
          >
            <DiligenceFlagBadge flag={s.key === "unreviewed" ? null : s.key} />
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{s.count}</p>
            <p className="text-xs text-ink-muted">of {total} documents</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        <FilterChip active={filter === "green"} onClick={() => setFilter("green")} label="Green" />
        <FilterChip active={filter === "amber"} onClick={() => setFilter("amber")} label="Amber" />
        <FilterChip active={filter === "red"} onClick={() => setFilter("red")} label="Red" />
        <FilterChip
          active={filter === "unreviewed"}
          onClick={() => setFilter("unreviewed")}
          label="Not reviewed"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface-elevated shadow-card dark:shadow-card-dark">
        {/* Mobile cards */}
        <div className="divide-y divide-line lg:hidden">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink-muted">No documents match this filter.</p>
          ) : (
            filtered.map((row) => (
              <article key={row.document.id} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/matters/${matterId}/documents/${row.document.id}`}
                    className="min-w-0 flex-1 font-medium text-brand"
                  >
                    {row.document.fileName}
                  </Link>
                  <DiligenceFlagBadge flag={row.review?.diligenceFlag ?? null} />
                </div>
                <p className="text-xs text-ink-muted">{row.document.categoryLabel}</p>
                <p className="text-xs text-ink-faint">{row.folderName}</p>
                {row.review?.summary ? (
                  <p className="text-sm text-ink-muted">{row.review.summary}</p>
                ) : null}
                {row.review?.pertinentNotes ? (
                  <p className="text-xs text-ink-faint">{row.review.pertinentNotes}</p>
                ) : null}
              </article>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs uppercase tracking-wide text-ink-faint">
              <tr className="border-b border-line">
                <th className="px-4 py-2 font-medium">Flag</th>
                <th className="px-4 py-2 font-medium">Document</th>
                <th className="px-4 py-2 font-medium">Folder</th>
                <th className="px-4 py-2 font-medium">Summary</th>
                <th className="px-4 py-2 font-medium">Pertinent information</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    No documents match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.document.id} className="hover:bg-surface-muted/50">
                    <td className="px-4 py-3 align-top">
                      <DiligenceFlagBadge flag={row.review?.diligenceFlag ?? null} />
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top">
                      <Link
                        to={`/matters/${matterId}/documents/${row.document.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {row.document.fileName}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-faint">{row.document.categoryLabel}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-ink-muted">
                      {row.folderName}
                    </td>
                    <td className="max-w-[280px] px-4 py-3 align-top text-ink-muted">
                      {row.review?.summary ? (
                        <span className="line-clamp-4">{row.review.summary}</span>
                      ) : (
                        <span className="italic text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="max-w-[320px] px-4 py-3 align-top text-ink-muted">
                      {row.review?.pertinentNotes ? (
                        <span className="line-clamp-4">{row.review.pertinentNotes}</span>
                      ) : (
                        <span className="italic text-ink-faint">—</span>
                      )}
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

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line text-ink-muted hover:bg-surface-muted",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
