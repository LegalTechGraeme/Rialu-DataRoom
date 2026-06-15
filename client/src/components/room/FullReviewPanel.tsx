import { useEffect, useState } from "react";
import { fetchAiStatus } from "../../services/aiApi";
import {
  fetchFullReviewStatus,
  startFullReview,
  type FullReviewJob,
} from "../../services/workflowApi";

interface FullReviewPanelProps {
  matterId: string;
  onComplete?: () => void;
}

export function FullReviewPanel({ matterId, onComplete }: FullReviewPanelProps) {
  const [job, setJob] = useState<FullReviewJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    fetchAiStatus()
      .then((s) => {
        setAiReady(s.ok === true);
        setAiError(s.error ?? (s.configured && s.ok === false ? "Groq API key check failed" : null));
      })
      .catch(() => {
        setAiReady(false);
        setAiError("Could not reach AI status endpoint");
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchFullReviewStatus(matterId)
      .then((j) => {
        if (!cancelled) setJob(j);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [matterId]);

  useEffect(() => {
    if (job?.status !== "running") return;
    const interval = setInterval(() => {
      fetchFullReviewStatus(matterId)
        .then((j) => {
          setJob(j);
          if (j.status === "completed") onComplete?.();
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [job?.status, matterId, onComplete]);

  const run = async () => {
    setStarting(true);
    setError(null);
    try {
      const j = await startFullReview(matterId);
      setJob(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start review");
    } finally {
      setStarting(false);
    }
  };

  const running = job?.status === "running" || starting;
  const pct =
    job && job.total > 0 ? Math.round((job.current / job.total) * 100) : job?.status === "completed" ? 100 : 0;

  return (
    <div className="card space-y-3 p-5">
      <div>
        <h3 className="font-semibold text-ink">Full due diligence review</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Runs AI analysis on every document, synthesizes cross-document risks, and populates
          diligence flags automatically. Track progress in the <strong>AI processes</strong> widget
          (bottom-right). On Groq&apos;s free tier this takes ~15–20 minutes.
        </p>
      </div>

      {aiReady === false ? (
        <p className="rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
          {aiError ??
            "Groq API key missing. Add GROQ_API_KEY to server/.env and restart the server."}
        </p>
      ) : null}

      <details className="rounded-md border border-line bg-surface-muted/40 px-3 py-2 text-xs text-ink-muted">
        <summary className="cursor-pointer font-medium text-ink">How to analyze a single document</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Open the <strong>data room explorer</strong></li>
          <li>Select a document in the table</li>
          <li>In the right <strong>AI copilot</strong> panel, click <strong>Analyze doc</strong></li>
        </ol>
        <p className="mt-2">
          Or use <strong>Risk register → Quick analyze</strong> for a batch of 8 documents.
        </p>
      </details>

      {job?.status === "running" ? (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted">{job.message}</p>
        </div>
      ) : null}
      {job?.status === "completed" ? (
        <p className="rounded-md border border-ok/30 bg-ok/10 px-3 py-2 text-xs text-ok">
          {job.message}
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
        disabled={running || aiReady === false}
        onClick={() => void run()}
      >
        {running ? "Review in progress…" : "Run full AI diligence review"}
      </button>
    </div>
  );
}
