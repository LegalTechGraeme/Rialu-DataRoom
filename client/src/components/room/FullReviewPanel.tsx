import { useEffect, useState } from "react";
import {
  cancelFullReview,
  fetchFullReviewStatus,
  startFullReview,
  type FullReviewJob,
} from "../../services/workflowApi";

const DEMO_MATTER_ID = "matter-acme";

function isStuckLiveGroqJob(job: FullReviewJob | null) {
  if (!job?.message) return false;
  return /rate limit|~12s|free tier|retrying doc/i.test(job.message);
}

interface FullReviewPanelProps {
  matterId: string;
  onComplete?: () => void;
}

export function FullReviewPanel({ matterId, onComplete }: FullReviewPanelProps) {
  const isDemoMatter = matterId === DEMO_MATTER_ID;
  const [job, setJob] = useState<FullReviewJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFullReviewStatus(matterId)
      .then(async (j) => {
        if (cancelled) return;
        if (isDemoMatter && isStuckLiveGroqJob(j)) {
          const cleared = await cancelFullReview(matterId);
          if (!cancelled) setJob(cleared);
          return;
        }
        setJob(j);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [matterId, isDemoMatter]);

  const run = async () => {
    setStarting(true);
    setError(null);
    try {
      if (isDemoMatter && job?.status === "running" && isStuckLiveGroqJob(job)) {
        await cancelFullReview(matterId);
      }
      const j = await startFullReview(matterId);
      setJob(j);
      if (j.status === "completed") {
        onComplete?.();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start review");
    } finally {
      setStarting(false);
    }
  };

  const running = (job?.status === "running" || starting) && !isDemoMatter;
  const completed = job?.status === "completed";

  return (
    <div className="card space-y-3 p-5">
      <div>
        <h3 className="font-semibold text-ink">Full due diligence review</h3>
        <p className="mt-1 text-sm text-ink-muted">
          {isDemoMatter ? (
            <>
              Applies pre-generated AI analysis and diligence flags across all 94 demo documents
              instantly — no live API calls.
            </>
          ) : (
            <>
              Runs AI analysis on every document, synthesizes cross-document risks, and populates
              diligence flags. On Groq&apos;s free tier this can take 15–20 minutes.
            </>
          )}
        </p>
      </div>

      {isDemoMatter ? (
        <p className="rounded-md border border-brand/20 bg-brand-soft/30 px-3 py-2 text-xs text-ink-muted">
          Demo matter — curated outputs only. Safe to click any time.
        </p>
      ) : null}

      {isDemoMatter && isStuckLiveGroqJob(job) ? (
        <div className="space-y-2 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
          <p>
            A slow live AI run was interrupted (left over from an older deploy). Cancel it, then
            apply the demo review again.
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

      {completed ? (
        <p className="rounded-md border border-ok/30 bg-ok/10 px-3 py-2 text-xs text-ok">
          {job?.message ?? "Diligence review complete."}
        </p>
      ) : null}

      {job?.status === "error" || error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error ?? job?.error ?? job?.message}
        </p>
      ) : null}

      <button
        type="button"
        className="btn-primary"
        disabled={starting || (isDemoMatter && isStuckLiveGroqJob(job))}
        onClick={() => void run()}
      >
        {starting
          ? "Applying…"
          : isDemoMatter
            ? completed
              ? "Re-apply demo diligence review"
              : "Apply demo diligence review"
            : running
              ? "Review in progress…"
              : "Run full AI diligence review"}
      </button>
    </div>
  );
}
