import { analyzeDocument } from "./ai/documentAnalyzer.js";
import { getDocumentAnalysis } from "./ai/analysisStore.js";
import { synthesizeMatter } from "./ai/matterIntelligence.js";
import { resolveDocumentFile } from "./fileResolver.js";
import { getDocuments, getMatter, updateDocumentStatusFromReview } from "./matterStore.js";
import { upsertDocumentReview } from "./reviewStore.js";
import { reclassifyDocument } from "./uploadService.js";
import { isGroqConfigured, GROQ_ANALYZE_DELAY_MS } from "./config.js";
import { isSimulationMatter } from "./matterStore.js";
import { hasDemoAiBundle } from "./ai/demoAi.js";
import { startSimulatedFullReview } from "./demoFullReview.js";
import { buildReviewSummary } from "./reviewSummary.js";
import {
  createJob,
  updateJob,
  completeJob,
  failJob,
  isJobCancelled,
  getJob,
  listJobs,
  hasRunningJob,
  cancelJob,
} from "./aiJobManager.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} matterId */
export function getFullReviewStatus(matterId) {
  const jobs = listJobs(matterId).filter((j) => j.type === "full-review");
  const job = jobs[0];
  if (!job) {
    return { status: "idle", phase: "", current: 0, total: 0, message: "", jobId: null };
  }
  return {
    status: job.status === "running" ? "running" : job.status,
    phase: job.phase,
    current: job.current,
    total: job.total,
    message: job.message,
    error: job.error,
    completedAt: job.completedAt,
    jobId: job.id,
    ...(job.status === "completed" ? { summary: buildReviewSummary(matterId) } : {}),
  };
}

/**
 * @param {string} matterId
 * @param {{ classify?: boolean; analyze?: boolean; synthesize?: boolean; applyReviews?: boolean }} options
 */
export async function startFullReview(matterId, options = {}) {
  if (isSimulationMatter(matterId)) {
    if (!hasDemoAiBundle(matterId)) {
      throw new Error("AI review data unavailable — redeploy the latest API build.");
    }
    return startSimulatedFullReview(matterId, options);
  }

  if (!isGroqConfigured()) {
    throw new Error("Groq API not configured — add GROQ_API_KEY to server/.env");
  }
  if (hasRunningJob(matterId, "full-review")) {
    throw new Error("Full review already in progress");
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
    label: "Full due diligence review",
    total: docs.length,
  });

  updateJob(job.id, { message: "Starting full due diligence review…" });

  runFullReview(job.id, matterId, opts).catch((err) => {
    if (!isJobCancelled(job.id)) {
      failJob(job.id, err instanceof Error ? err.message : "Review failed");
    }
  });

  return getFullReviewJobStatus(job.id);
}

/** @param {string} jobId */
function getFullReviewJobStatus(jobId) {
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

export { cancelJob };

/**
 * @param {string} jobId
 * @param {string} matterId
 * @param {{ classify: boolean; analyze: boolean; synthesize: boolean; applyReviews: boolean }} opts
 */
async function runFullReview(jobId, matterId, opts) {
  const docs = getDocuments(matterId).filter((d) => d.storagePath);

  const check = () => {
    if (isJobCancelled(jobId)) throw new Error("Cancelled");
  };

  if (opts.classify) {
    updateJob(jobId, { phase: "classify", message: "Classifying documents…", current: 0, total: docs.length });
    for (let i = 0; i < docs.length; i++) {
      check();
      try {
        await reclassifyDocument(matterId, docs[i].id);
      } catch {
        /* continue */
      }
      updateJob(jobId, {
        current: i + 1,
        message: `Classified ${i + 1} of ${docs.length}…`,
      });
    }
  }

  let analyzedCount = 0;
  if (opts.analyze) {
    updateJob(jobId, { phase: "analyze", message: "Analyzing documents…", current: 0, total: docs.length });
    for (let i = 0; i < docs.length; i++) {
      check();
      const doc = docs[i];
      try {
        if (getDocumentAnalysis(matterId, doc.id)) {
          analyzedCount += 1;
        } else {
          const abs = resolveDocumentFile(matterId, doc.storagePath);
          await analyzeDocument(doc, abs, matterId, false);
          analyzedCount += 1;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Analysis failed";
        if (msg === "Cancelled") throw err;
        if (msg.includes("401") || msg.includes("Invalid API Key") || msg.includes("expired_api_key")) {
          throw new Error(
            "Groq API key is invalid or expired. Update GROQ_API_KEY in server/.env and restart the API."
          );
        }
        if (msg.includes("429") || msg.includes("rate_limit")) {
          updateJob(jobId, {
            message: `Rate limited — waiting before retrying doc ${i + 1}/${docs.length}…`,
            current: i,
          });
          await sleep(GROQ_ANALYZE_DELAY_MS);
          check();
          i -= 1;
          continue;
        }
      }
      updateJob(jobId, {
        current: i + 1,
        message: `Analyzed ${i + 1} of ${docs.length}… (~12s between docs on free tier)`,
      });
      if (i < docs.length - 1) {
        await sleep(GROQ_ANALYZE_DELAY_MS);
      }
    }
  }

  check();

  if (opts.synthesize) {
    updateJob(jobId, { phase: "synthesize", message: "Synthesizing cross-document intelligence…", current: 0, total: 1 });
    const freshDocs = getDocuments(matterId);
    if (analyzedCount === 0 && opts.analyze) {
      const cached = freshDocs.filter((d) => getDocumentAnalysis(matterId, d.id)).length;
      if (cached === 0) {
        throw new Error(
          "No documents were analyzed. Check your Groq API key (server/.env), restart the API, then try again."
        );
      }
    }
    await synthesizeMatter(matterId, freshDocs, true);
    updateJob(jobId, { current: 1, message: "Synthesis complete" });
  }

  check();

  if (opts.applyReviews) {
    const freshDocs = getDocuments(matterId);
    updateJob(jobId, {
      phase: "apply",
      message: "Applying AI diligence findings…",
      current: 0,
      total: freshDocs.length,
    });
    for (let i = 0; i < freshDocs.length; i++) {
      check();
      const doc = freshDocs[i];
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
      updateJob(jobId, {
        current: i + 1,
        message: `Applied findings ${i + 1} of ${freshDocs.length}…`,
      });
    }
  }

  const matter = getMatter(matterId);
  completeJob(jobId, `Full diligence review complete for ${matter?.name ?? matterId}`);
}
