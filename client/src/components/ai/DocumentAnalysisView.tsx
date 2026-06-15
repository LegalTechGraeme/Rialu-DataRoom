import type { DocumentAnalysis } from "../../types";

function SeverityPill({ s }: { s: string }) {
  const c =
    s === "high"
      ? "bg-danger/10 text-danger border-danger/30"
      : s === "medium"
        ? "bg-warn/10 text-warn border-warn/30"
        : "bg-ok/10 text-ok border-ok/30";
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${c}`}>
      {s}
    </span>
  );
}

export function DocumentAnalysisView({ analysis }: { analysis: DocumentAnalysis }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
          Document type
        </p>
        <p className="mt-1 font-medium text-ink">{analysis.document_type}</p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
          Summary
        </p>
        <p className="mt-1 leading-relaxed text-ink-muted">{analysis.summary}</p>
      </div>
      {analysis.key_clauses?.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Key clauses
          </p>
          <ul className="space-y-2">
            {analysis.key_clauses.map((c, i) => (
              <li key={i} className="rounded-lg border border-line/80 bg-surface p-2.5">
                <p className="font-medium text-ink">{c.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{c.text}</p>
                <p className="mt-1 font-mono text-[10px] text-ink-faint">{c.source_reference}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {analysis.risks?.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Risks
          </p>
          <ul className="space-y-2">
            {analysis.risks.map((r, i) => (
              <li key={i} className="rounded-lg border border-line/80 bg-surface p-2.5">
                <div className="flex items-center gap-2">
                  <SeverityPill s={r.severity} />
                  <p className="font-medium text-ink">{r.risk}</p>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{r.explanation}</p>
                <p className="mt-1 font-mono text-[10px] text-ink-faint">{r.source_reference}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {analysis.entities?.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Entities
          </p>
          <ul className="space-y-1 text-xs text-ink-muted">
            {analysis.entities.map((e, i) => (
              <li key={i}>
                <span className="font-medium text-ink">{e.name}</span> — {e.role}
                {e.jurisdiction ? ` (${e.jurisdiction})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-[10px] text-ink-faint">
        Analyzed {new Date(analysis.analyzedAt).toLocaleString()}
      </p>
    </div>
  );
}
