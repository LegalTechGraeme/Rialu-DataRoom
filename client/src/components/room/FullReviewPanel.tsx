import { useEffect, useRef, useState } from "react";
import {
  cancelFullReview,
  fetchFullReviewStatus,
  startFullReview,
  type FullReviewJob,
  type FullReviewSummary,
} from "../../services/workflowApi";
import { ReviewResultsGuide } from "./ReviewResultsGuide";

const ACME_MATTER_ID = "matter-acme";

function isStuckLiveGroqJob(job: FullReviewJob | null) {
  if (!job?.message) return false;
  return /rate limit|~12s|free tier|retrying doc/i.test(job.message);
}

interface FullReviewPanelProps {
  matterId: string;
  onComplete?: (summary: FullReviewSummary | null) => void;
}

export function FullReviewPanel({ matterId, onComplete }: FullReviewPanelProps) {
  const isAcmeMatter = matterId === ACME_MATTER_ID;
  const [job, setJob] = useState<FullReviewJob | null>(null);
  const [summary, setSummary] = useState<FullReviewSummary | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  const handleComplete = (j: FullReviewJob) => {
    setSummary(j.summary ?? null);
    setShowGuide(true);
    onComplete?.(j.summary ?? null);
    requestAnimationFrame(() => {
      guideRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  useEffect(() => {
    let cancelled = false;
    fetchFullReviewStatus(matterId)
      .then(async (j) => {
        if (cancelled) return;
        if (isAcmeMatter && isStuckLiveGroqJob(j)) {
          const cleared = await cancelFullReview(matterId);
          if (!cancelled) {
            setJob(cleared);
            setSummary(null);
            setShowGuide(false);
          }
          return;
        }
        setJob(j);
        if (j.status === "completed" && j.summary) {
          setSummary(j.summary);
          setShowGuide(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [matterId, isAcmeMatter]);

  useEffect(() => {
    if (job?.status !== "running") return;
    const interval = setInterval(() => {
      fetchFullReviewStatus(matterId)
        .then((j) => {
          setJob(j);
          if (j.status === "completed") {
            setSummary(j.summary ?? null);
            setShowGuide(true);
            onComplete?.(j.summary ?? null);
            requestAnimationFrame(() => {
              guideRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
          }
        })
        .catch(() => {});
    }, 500);
    return () => clearInterval(interval);
  }, [job?.status, matterId, onComplete]);

  const run = async () => {
    setStarting(true);
    setError(null);
    setShowGuide(false);
    try {
      if (isAcmeMatter && job?.status === "running" && isStuckLiveGroqJob(job)) {
        await cancelFullReview(matterId);
      }
      const j = await startFullReview(matterId);
      setJob(j);
      if (j.status === "completed") {
        handleComplete(j);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start review");
    } finally {
      setStarting(false);
    }
  };

  const running = job?.status === "running" || starting;
  const pct =
    job && job.total > 0
      ? Math.round((job.current / job.total) * 100)
      : job?.status === "completed"
        ? 100
        : 0;

  return (
    <div className="card space-y-4 p-5">
      <div>
        <h3 className="font-semibold text-ink">Full due diligence review</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Runs AI analysis on every document, synthesizes cross-document risks, and populates
          diligence flags across the data room. Track progress below and in the{" "}
          <strong>AI processes</strong> widget (bottom-right).
        </p>
      </div>

      {isAcmeMatter && isStuckLiveGroqJob(job) ? (
        <div className="space-y-2 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
          <p>
            A previous review was interrupted. Cancel it, then run the review again.
          </p>
          <button
            type="button"
            className="rounded-md border border-warn/40 px-2 py-1 font-medium hover:bg-warn/10"
            onClick={() => void cancelFullReview(matterId).then(setJob)}
          >
            Cancel stuck review
          </button>
        </div>
      ) : null}

      {job?.status === "error" || error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error ?? job?.error ?? job?.message}
        </p>
      ) : null}

      {running ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>{job?.phase ? capitalize(job.phase) : "Starting"}</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-brand transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted">{job?.message ?? "Starting AI diligence review…"}</p>
        </div>
      ) : null}

      {job?.status === "completed" && !showGuide ? (
        <p className="rounded-md border border-ok/30 bg-ok/10 px-3 py-2 text-xs text-ok">
          {job.message}
        </p>
      ) : null}

      <button
        type="button"
        className="btn-primary max-lg:w-full"
        disabled={running || (isAcmeMatter && isStuckLiveGroqJob(job))}
        onClick={() => void run()}
      >
        {running ? "Review in progress…" : summary ? "Run review again" : "Run full AI diligence review"}
      </button>

      {showGuide && summary ? (
        <div ref={guideRef}>
          <ReviewResultsGuide
            matterId={matterId}
            summary={summary}
            onDismiss={() => setShowGuide(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
