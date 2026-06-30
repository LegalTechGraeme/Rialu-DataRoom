import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FullReviewSummary } from "../../services/workflowApi";

interface ReviewResultsGuideProps {
  matterId: string;
  summary: FullReviewSummary;
  onDismiss?: () => void;
}

const STEPS = ["summary", "room", "risks", "report", "done"] as const;
type Step = (typeof STEPS)[number];

export function ReviewResultsGuide({ matterId, summary, onDismiss }: ReviewResultsGuideProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("summary");
  const { flags, documentsReviewed, flaggedIssues, topRisks, riskRegisterCount, reviewedPercent } =
    summary;

  const stepIndex = STEPS.indexOf(step);
  const isLast = step === "done";

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goTo = (path: string) => {
    navigate(path);
    onDismiss?.();
  };

  return (
    <div className="space-y-4 rounded-lg border border-brand/25 bg-brand-soft/20 p-5 max-lg:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">Your AI review is ready</p>
        <div className="flex gap-1">
          {STEPS.slice(0, -1).map((s, i) => (
            <span
              key={s}
              className={[
                "h-1.5 w-6 rounded-full transition-colors",
                i <= stepIndex ? "bg-brand" : "bg-line",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      {step === "summary" ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Rialu reviewed <strong className="text-ink">{documentsReviewed} documents</strong> and
            applied diligence flags across the portfolio. Here&apos;s what was found — we&apos;ll
            show you where to look next.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip label="Reviewed" value={`${reviewedPercent}%`} />
            <StatChip label="Green" value={String(flags.green)} tone="ok" />
            <StatChip label="Amber" value={String(flags.amber)} tone="warn" />
            <StatChip label="Red flags" value={String(flags.red)} tone="danger" />
          </div>
          {flaggedIssues > 0 ? (
            <p className="text-xs text-danger">
              {flaggedIssues} document{flaggedIssues === 1 ? "" : "s"} need immediate attention.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === "room" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Step 1 — Data room</p>
          <p className="text-sm text-ink-muted">
            Open the data room explorer. Each document row now shows a{" "}
            <span className="font-medium text-ok">green</span>,{" "}
            <span className="font-medium text-warn">amber</span>, or{" "}
            <span className="font-medium text-danger">red</span> diligence flag. Click any row to
            read the AI summary in the side panel.
          </p>
        </div>
      ) : null}

      {step === "risks" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Step 2 — Risk register
          </p>
          <p className="text-sm text-ink-muted">
            Cross-document risks are consolidated in the risk register —{" "}
            <strong className="text-ink">{riskRegisterCount} issues</strong> identified across the
            deal.
          </p>
          {topRisks[0] ? (
            <div className="rounded-md border border-line bg-surface-elevated px-3 py-2 text-xs">
              <p className="font-medium text-ink">{topRisks[0].risk}</p>
              {topRisks[0].explanation ? (
                <p className="mt-1 text-ink-muted">{topRisks[0].explanation}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === "report" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Step 3 — Diligence report
          </p>
          <p className="text-sm text-ink-muted">
            The diligence report is a partner-ready memo synthesising findings, material risks, and
            recommended next steps for the transaction.
          </p>
        </div>
      ) : null}

      {step === "done" ? (
        <p className="text-sm text-ink-muted">
          You&apos;re set. Flags, risks, and the report stay in sync as you work through the matter.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-line/80 pt-3">
        {step === "room" ? (
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => goTo(`/matters/${matterId}/room`)}
          >
            Open data room →
          </button>
        ) : null}
        {step === "risks" ? (
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => goTo(`/matters/${matterId}/risks`)}
          >
            View risk register →
          </button>
        ) : null}
        {step === "report" ? (
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => goTo(`/matters/${matterId}/report`)}
          >
            Open diligence report →
          </button>
        ) : null}
        {!isLast ? (
          <button type="button" className="btn-secondary text-xs" onClick={goNext}>
            {step === "summary" ? "Show me where to look" : "Next"}
          </button>
        ) : (
          <button type="button" className="btn-secondary text-xs" onClick={onDismiss}>
            Done
          </button>
        )}
        {step !== "summary" && !isLast ? (
          <button type="button" className="text-xs text-ink-faint hover:text-ink" onClick={goNext}>
            Skip
          </button>
        ) : null}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "danger";
}) {
  const toneClass =
    tone === "ok"
      ? "border-ok/30 bg-ok/10 text-ok"
      : tone === "warn"
        ? "border-warn/30 bg-warn/10 text-warn"
        : tone === "danger"
          ? "border-danger/30 bg-danger/10 text-danger"
          : "border-line bg-surface-elevated text-ink";

  return (
    <div className={`rounded-md border px-3 py-2 text-center ${toneClass}`}>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</p>
    </div>
  );
}
