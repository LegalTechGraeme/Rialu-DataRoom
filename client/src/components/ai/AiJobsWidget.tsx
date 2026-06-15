import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  cancelAiJob,
  fetchAiJobs,
  jobTypeLabel,
  type AiJob,
} from "../../services/aiJobsApi";

export function AiJobsWidget() {
  const { matterId } = useParams<{ matterId?: string }>();
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!matterId) return;
    fetchAiJobs(matterId)
      .then(setJobs)
      .catch(() => {});
  }, [matterId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [load]);

  const running = jobs.filter((j) => j.status === "running");

  useEffect(() => {
    if (running.length > 0) setMinimized(false);
  }, [running.length]);

  if (!matterId) return null;

  const recent = jobs.slice(0, 6);
  if (recent.length === 0 && minimized) return null;

  const handleCancel = async (jobId: string) => {
    setCancelling(jobId);
    try {
      await cancelAiJob(jobId);
      load();
    } finally {
      setCancelling(null);
    }
  };

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-line bg-surface-elevated px-4 py-2 text-sm font-medium text-ink shadow-lg hover:border-brand/40"
      >
        <span
          className={[
            "h-2 w-2 rounded-full",
            running.length > 0 ? "animate-pulse bg-brand" : "bg-ink-faint",
          ].join(" ")}
        />
        AI jobs
        {running.length > 0 ? ` (${running.length} running)` : ""}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(100vw-2rem,360px)] rounded-xl border border-line bg-surface-elevated shadow-lg">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={[
              "h-2 w-2 rounded-full",
              running.length > 0 ? "animate-pulse bg-brand" : "bg-ink-faint",
            ].join(" ")}
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-ink">
            AI processes
          </span>
          {running.length > 0 ? (
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium text-brand">
              {running.length} active
            </span>
          ) : null}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded px-2 py-0.5 text-[10px] text-ink-muted hover:bg-surface-muted"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            className="rounded px-2 py-0.5 text-[10px] text-ink-muted hover:bg-surface-muted"
            onClick={() => setMinimized(true)}
          >
            Minimize
          </button>
        </div>
      </div>

      {open ? (
        <div className="max-h-64 space-y-2 overflow-auto p-3">
          {recent.length === 0 ? (
            <p className="text-xs text-ink-muted">No AI jobs yet for this matter.</p>
          ) : (
            recent.map((job) => {
              const pct =
                job.total > 0 ? Math.round((job.current / job.total) * 100) : job.status === "completed" ? 100 : 0;
              const isRunning = job.status === "running";
              return (
                <div
                  key={job.id}
                  className="rounded-lg border border-line/80 bg-surface-muted/30 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-ink">
                        {job.label || jobTypeLabel(job.type)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-faint">
                        {jobTypeLabel(job.type)}
                        {job.phase ? ` · ${job.phase}` : ""}
                      </p>
                    </div>
                    {isRunning ? (
                      <button
                        type="button"
                        disabled={cancelling === job.id}
                        onClick={() => void handleCancel(job.id)}
                        className="shrink-0 rounded border border-danger/30 px-2 py-0.5 text-[10px] font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                      >
                        {cancelling === job.id ? "…" : "Stop"}
                      </button>
                    ) : (
                      <StatusBadge status={job.status} />
                    )}
                  </div>
                  {isRunning && job.total > 0 ? (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full bg-brand transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  ) : null}
                  <p className="mt-1.5 line-clamp-2 text-[10px] text-ink-muted">{job.message}</p>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: AiJob["status"] }) {
  const styles = {
    running: "bg-brand/15 text-brand",
    completed: "bg-ok/15 text-ok",
    cancelled: "bg-surface-muted text-ink-muted",
    error: "bg-danger/15 text-danger",
  };
  return (
    <span
      className={[
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}
