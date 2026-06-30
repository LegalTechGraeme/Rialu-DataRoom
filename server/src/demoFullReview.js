import { getDocuments, getMatter, updateDocumentStatusFromReview } from "./matterStore.js";
import { getDocumentAnalysis } from "./ai/analysisStore.js";
import { upsertDocumentReview } from "./reviewStore.js";
import {
  createJob,
  updateJob,
  completeJob,
  failJob,
  isJobCancelled,
  getJob,
  hasRunningJob,
  listJobs,
  cancelJob,
} from "./aiJobManager.js";
import { hasDemoAiBundle } from "./ai/demoAi.js";

/** Messages emitted only by the live Groq orchestrator — never the demo path. */
export function isLiveGroqReviewMessage(message) {
  if (!message) return false;
  return /rate limit|~12s|free tier|retrying doc/i.test(message);
}

/** Cancel any in-flight full-review jobs that look like a live Groq run (stale after redeploy). */
export function cancelStaleGroqFullReviews(matterId) {
  for (const job of listJobs(matterId)) {
    if (job.type !== "full-review" || job.status !== "running") continue;
    if (isLiveGroqReviewMessage(job.message)) {
      cancelJob(job.id);
    }
  }
}

function jobStatus(jobId) {
  const job = getJob(jobId);
  if (!job) return { status: "idle", phase: "", current: 0, total: 0, message: "", jobId: null };
  return {
    status: job.status === "running" ? "running" : job.status,
    phase: job.phase,
    current: job.current,
    total: job.total,
    message: job.message,
    error: job.error,
    completedAt: job.completedAt,
    jobId: job.id,
  };
}

/**
 * Apply pre-generated demo diligence in one shot (no Groq, no per-doc delays).
 * Returns a completed job payload — safe to use synchronously in the HTTP handler.
 */
export async function runDemoFullReviewImmediate(matterId, options = {}) {
  cancelStaleGroqFullReviews(matterId);

  if (hasRunningJob(matterId, "full-review")) {
    throw new Error("Full review already in progress — wait a moment or cancel it");
  }
  if (!hasDemoAiBundle(matterId)) {
    throw new Error("Demo AI bundle failed to load — redeploy the API service");
  }

  const applyReviews = options.applyReviews !== false;
  const docs = getDocuments(matterId).filter((d) => d.storagePath);

  const job = createJob({
    matterId,
    type: "full-review",
    label: "Full due diligence review (demo)",
    total: docs.length,
  });

  try {
    updateJob(job.id, {
      phase: "apply",
      message: "Applying curated diligence outputs…",
      current: 0,
      total: docs.length,
    });

    if (applyReviews) {
      for (const doc of docs) {
        if (isJobCancelled(job.id)) throw new Error("Cancelled");
        const analysis = getDocumentAnalysis(matterId, doc.id);
        if (!analysis) {
          throw new Error(`Missing demo analysis for ${doc.fileName}`);
        }
        const flag = analysis.suggested_diligence_flag ?? "amber";
        upsertDocumentReview(matterId, doc.id, {
          diligenceFlag: flag,
          summary: analysis.suggested_summary ?? analysis.summary ?? "",
          pertinentNotes: analysis.suggested_pertinent_notes ?? "",
        });
        updateDocumentStatusFromReview(matterId, doc.id, flag);
      }
    }

    const matter = getMatter(matterId);
    completeJob(
      job.id,
      `Diligence review complete — ${docs.length} documents flagged using pre-generated AI outputs for ${matter?.name ?? matterId}`
    );
  } catch (err) {
    if (!isJobCancelled(job.id)) {
      failJob(job.id, err instanceof Error ? err.message : "Review failed");
    }
    throw err;
  }

  return jobStatus(job.id);
}

/**
 * @param {string} matterId
 * @param {import('./types.js').DocumentRecord[]} docs
 * @param {{ limit?: number; force?: boolean }} options
 */
export function startDemoBatchAnalyze(matterId, docs, options = {}) {
  if (hasRunningJob(matterId, "batch-analyze")) {
    throw new Error("Batch analysis already in progress for this matter");
  }

  const limit = Math.min(options.limit ?? 8, 50);
  const pending = docs.filter((d) => d.storagePath && (options.force || !getDocumentAnalysis(matterId, d.id)));
  const toRun = pending.slice(0, limit);

  const job = createJob({
    matterId,
    type: "batch-analyze",
    label: `Batch analyze (${toRun.length} documents, demo)`,
    total: Math.max(toRun.length, 1),
  });

  try {
    for (const doc of toRun) {
      if (!getDocumentAnalysis(matterId, doc.id)) {
        throw new Error(`Missing demo analysis for ${doc.fileName}`);
      }
    }
    completeJob(job.id, `Batch complete — ${toRun.length} documents ready (demo data)`);
  } catch (err) {
    failJob(job.id, err instanceof Error ? err.message : "Batch failed");
    throw err;
  }

  return job;
}

/** @deprecated Use runDemoFullReviewImmediate */
export async function startDemoFullReview(matterId, options = {}) {
  return runDemoFullReviewImmediate(matterId, options);
}
