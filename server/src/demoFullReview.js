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
import { buildReviewSummary } from "./reviewSummary.js";

const SIM_CLASSIFY_MS = 1200;
const SIM_ANALYZE_MS = 4500;
const SIM_SYNTHESIZE_MS = 1200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Messages emitted only by the live Groq orchestrator — never the bundled-AI path. */
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
    ...(job.status === "completed" ? { summary: buildReviewSummary(job.matterId) } : {}),
  };
}

/**
 * Start a full diligence review with realistic phased progress (~7s) then apply bundled outputs.
 * Returns immediately with status "running" — poll GET .../full-review/status.
 */
export function startSimulatedFullReview(matterId, options = {}) {
  cancelStaleGroqFullReviews(matterId);

  if (hasRunningJob(matterId, "full-review")) {
    throw new Error("Full review already in progress — wait a moment or cancel it");
  }
  if (!hasDemoAiBundle(matterId)) {
    throw new Error("AI review data unavailable — redeploy the API service");
  }

  const docs = getDocuments(matterId).filter((d) => d.storagePath);
  const job = createJob({
    matterId,
    type: "full-review",
    label: "Full due diligence review",
    total: docs.length,
  });

  updateJob(job.id, { message: "Starting AI diligence review…" });

  runSimulatedFullReview(job.id, matterId, options).catch((err) => {
    if (!isJobCancelled(job.id)) {
      failJob(job.id, err instanceof Error ? err.message : "Review failed");
    }
  });

  return jobStatus(job.id);
}

/**
 * @param {string} jobId
 * @param {string} matterId
 * @param {{ applyReviews?: boolean }} options
 */
async function runSimulatedFullReview(jobId, matterId, options = {}) {
  const applyReviews = options.applyReviews !== false;
  const docs = getDocuments(matterId).filter((d) => d.storagePath);
  const n = docs.length;

  const check = () => {
    if (isJobCancelled(jobId)) throw new Error("Cancelled");
  };

  updateJob(jobId, { phase: "classify", message: "Classifying documents…", current: 0, total: n });
  const classifyTicks = 6;
  for (let i = 0; i < classifyTicks; i++) {
    check();
    await sleep(SIM_CLASSIFY_MS / classifyTicks);
    const current = Math.max(1, Math.round(((i + 1) / classifyTicks) * n * 0.12));
    updateJob(jobId, {
      current,
      message: `Classified ${Math.min(current, n)} of ${n}…`,
    });
  }

  updateJob(jobId, {
    phase: "analyze",
    message: "Analyzing documents with AI…",
    current: Math.round(n * 0.12),
    total: n,
  });
  const analyzeStart = Date.now();
  while (Date.now() - analyzeStart < SIM_ANALYZE_MS) {
    check();
    const pct = (Date.now() - analyzeStart) / SIM_ANALYZE_MS;
    const current = Math.round(n * (0.12 + pct * 0.68));
    updateJob(jobId, {
      current: Math.min(current, n),
      message: `Analyzing document ${Math.min(current, n)} of ${n}…`,
    });
    await sleep(100);
  }

  updateJob(jobId, {
    phase: "synthesize",
    message: "Synthesizing cross-document risks…",
    current: Math.round(n * 0.82),
    total: n,
  });
  await sleep(SIM_SYNTHESIZE_MS / 2);
  check();
  await sleep(SIM_SYNTHESIZE_MS / 2);
  updateJob(jobId, { current: Math.round(n * 0.92), message: "Cross-document synthesis complete" });

  if (applyReviews) {
    updateJob(jobId, {
      phase: "apply",
      message: "Applying diligence flags…",
      current: 0,
      total: n,
    });
    for (let i = 0; i < docs.length; i++) {
      check();
      const doc = docs[i];
      const analysis = getDocumentAnalysis(matterId, doc.id);
      if (!analysis) {
        throw new Error(`Missing analysis for ${doc.fileName}`);
      }
      const flag = analysis.suggested_diligence_flag ?? "amber";
      upsertDocumentReview(matterId, doc.id, {
        diligenceFlag: flag,
        summary: analysis.suggested_summary ?? analysis.summary ?? "",
        pertinentNotes: analysis.suggested_pertinent_notes ?? "",
      });
      updateDocumentStatusFromReview(matterId, doc.id, flag);
      updateJob(jobId, {
        current: i + 1,
        message: `Applied findings ${i + 1} of ${n}…`,
      });
    }
  }

  const matter = getMatter(matterId);
  completeJob(
    jobId,
    `AI diligence review complete — ${n} documents reviewed for ${matter?.name ?? matterId}`
  );
}

/** @deprecated Use startSimulatedFullReview */
export async function runDemoFullReviewImmediate(matterId, options = {}) {
  const status = startSimulatedFullReview(matterId, options);
  const jobId = status.jobId;
  if (!jobId) throw new Error("Could not start review");

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const job = getJob(jobId);
    if (!job || job.status === "completed") return jobStatus(jobId);
    if (job.status === "error") throw new Error(job.error ?? "Review failed");
    await sleep(200);
  }
  throw new Error("Review timed out");
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
    label: `Batch analyze (${toRun.length} documents)`,
    total: Math.max(toRun.length, 1),
  });

  try {
    for (const doc of toRun) {
      if (!getDocumentAnalysis(matterId, doc.id)) {
        throw new Error(`Missing analysis for ${doc.fileName}`);
      }
    }
    completeJob(job.id, `Batch complete — ${toRun.length} documents analyzed`);
  } catch (err) {
    failJob(job.id, err instanceof Error ? err.message : "Batch failed");
    throw err;
  }

  return job;
}
