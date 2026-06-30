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
} from "./aiJobManager.js";
import { hasDemoAiBundle } from "./ai/demoAi.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} jobId */
function jobStatus(jobId) {
  const job = getJob(jobId);
  if (!job) return { status: "idle", phase: "", current: 0, total: 0, message: "" };
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
 * Simulated full review using committed demo AI bundle (no Groq).
 * @param {string} matterId
 * @param {{ classify?: boolean; analyze?: boolean; synthesize?: boolean; applyReviews?: boolean }} options
 */
export async function startDemoFullReview(matterId, options = {}) {
  if (hasRunningJob(matterId, "full-review")) {
    throw new Error("Full review already in progress");
  }
  if (!hasDemoAiBundle(matterId)) {
    throw new Error("Demo AI bundle failed to load — redeploy the API service");
  }

  const opts = {
    classify: options.classify !== false,
    analyze: options.analyze !== false,
    synthesize: options.synthesize !== false,
    applyReviews: options.applyReviews !== false,
  };

  const docs = getDocuments(matterId).filter((d) => d.storagePath);
  const job = createJob({
    matterId,
    type: "full-review",
    label: "Full due diligence review (demo)",
    total: docs.length,
  });

  updateJob(job.id, { message: "Loading curated AI diligence outputs…" });

  runDemoFullReview(job.id, matterId, docs, opts).catch((err) => {
    if (!isJobCancelled(job.id)) {
      failJob(job.id, err instanceof Error ? err.message : "Review failed");
    }
  });

  return jobStatus(job.id);
}

/**
 * @param {string} jobId
 * @param {string} matterId
 * @param {import('./types.js').DocumentRecord[]} docs
 * @param {{ classify: boolean; analyze: boolean; synthesize: boolean; applyReviews: boolean }} opts
 */
async function runDemoFullReview(jobId, matterId, docs, opts) {
  const check = () => {
    if (isJobCancelled(jobId)) throw new Error("Cancelled");
  };

  if (opts.classify) {
    updateJob(jobId, { phase: "classify", message: "Classifying documents…", current: 0, total: docs.length });
    for (let i = 0; i < docs.length; i++) {
      check();
      await sleep(40);
      updateJob(jobId, { current: i + 1, message: `Classified ${i + 1} of ${docs.length}…` });
    }
  }

  if (opts.analyze) {
    updateJob(jobId, { phase: "analyze", message: "Applying document analyses…", current: 0, total: docs.length });
    for (let i = 0; i < docs.length; i++) {
      check();
      if (!getDocumentAnalysis(matterId, docs[i].id)) {
        throw new Error(`Missing demo analysis for ${docs[i].fileName}`);
      }
      await sleep(35);
      updateJob(jobId, { current: i + 1, message: `Analyzed ${i + 1} of ${docs.length}… (curated demo data)` });
    }
  }

  check();

  if (opts.synthesize) {
    updateJob(jobId, { phase: "synthesize", message: "Loading cross-document synthesis…", current: 0, total: 1 });
    await sleep(600);
    check();
    updateJob(jobId, { current: 1, message: "Synthesis complete" });
  }

  check();

  if (opts.applyReviews) {
    updateJob(jobId, {
      phase: "apply",
      message: "Applying diligence flags…",
      current: 0,
      total: docs.length,
    });
    for (let i = 0; i < docs.length; i++) {
      check();
      const doc = docs[i];
      const analysis = getDocumentAnalysis(matterId, doc.id);
      if (analysis) {
        const flag = analysis.suggested_diligence_flag ?? "amber";
        upsertDocumentReview(matterId, doc.id, {
          diligenceFlag: flag,
          summary: analysis.suggested_summary ?? analysis.summary ?? "",
          pertinentNotes: analysis.suggested_pertinent_notes ?? "",
        });
        updateDocumentStatusFromReview(matterId, doc.id, flag);
      }
      await sleep(25);
      updateJob(jobId, { current: i + 1, message: `Applied findings ${i + 1} of ${docs.length}…` });
    }
  }

  const matter = getMatter(matterId);
  completeJob(jobId, `Full diligence review complete for ${matter?.name ?? matterId}`);
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
    total: toRun.length,
  });

  runDemoBatch(job.id, matterId, toRun).catch((err) => {
    if (!isJobCancelled(job.id)) {
      failJob(job.id, err instanceof Error ? err.message : "Batch failed");
    }
  });

  return job;
}

/** @param {string} jobId @param {string} matterId @param {import('./types.js').DocumentRecord[]} toRun */
async function runDemoBatch(jobId, matterId, toRun) {
  for (let i = 0; i < toRun.length; i++) {
    if (isJobCancelled(jobId)) return;
    const doc = toRun[i];
    updateJob(jobId, {
      phase: "analyze",
      current: i,
      message: `Analyzing ${doc.fileName}… (${i + 1}/${toRun.length})`,
    });
    if (!getDocumentAnalysis(matterId, doc.id)) {
      throw new Error(`Missing demo analysis for ${doc.fileName}`);
    }
    await sleep(300);
    updateJob(jobId, { current: i + 1, message: `Analyzed ${i + 1} of ${toRun.length}` });
  }
  completeJob(jobId, `Batch complete — ${toRun.length} documents analyzed`);
}
