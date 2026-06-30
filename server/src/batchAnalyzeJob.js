import { analyzeDocument } from "./ai/documentAnalyzer.js";
import { getDocumentAnalysis } from "./ai/analysisStore.js";
import { resolveDocumentFile } from "./fileResolver.js";
import { isSimulationMatter } from "./matterStore.js";
import { startDemoBatchAnalyze } from "./demoFullReview.js";
import { GROQ_ANALYZE_DELAY_MS } from "./config.js";
import {
  createJob,
  updateJob,
  completeJob,
  failJob,
  isJobCancelled,
  hasRunningJob,
} from "./aiJobManager.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} matterId
 * @param {import('./types.js').DocumentRecord[]} docs
 * @param {{ limit?: number; force?: boolean }} options
 */
export function startBatchAnalyze(matterId, docs, options = {}) {
  if (isSimulationMatter(matterId)) {
    return startDemoBatchAnalyze(matterId, docs, options);
  }

  if (hasRunningJob(matterId, "batch-analyze")) {
    throw new Error("Batch analysis already in progress for this matter");
  }

  const limit = Math.min(options.limit ?? 8, 50);
  const force = options.force === true;
  const pending = docs.filter((d) => d.storagePath && (force || !getDocumentAnalysis(matterId, d.id)));
  const toRun = pending.slice(0, limit);

  const job = createJob({
    matterId,
    type: "batch-analyze",
    label: `Batch analyze (${toRun.length} documents)`,
    total: toRun.length,
  });

  runBatch(job.id, matterId, toRun, force).catch((err) => {
    if (!isJobCancelled(job.id)) {
      failJob(job.id, err instanceof Error ? err.message : "Batch failed");
    }
  });

  return job;
}

/**
 * @param {string} jobId
 * @param {string} matterId
 * @param {import('./types.js').DocumentRecord[]} toRun
 * @param {boolean} force
 */
async function runBatch(jobId, matterId, toRun, force) {
  let processed = 0;
  for (let i = 0; i < toRun.length; i++) {
    if (isJobCancelled(jobId)) return;

    const doc = toRun[i];
    updateJob(jobId, {
      phase: "analyze",
      current: i,
      message: `Analyzing ${doc.fileName}… (${i + 1}/${toRun.length})`,
    });

    try {
      const abs = resolveDocumentFile(matterId, doc.storagePath);
      await analyzeDocument(doc, abs, matterId, force);
      processed += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "failed";
      if (msg.includes("429") || msg.includes("rate_limit")) {
        updateJob(jobId, { message: `Rate limited — waiting… (${i + 1}/${toRun.length})` });
        await sleep(GROQ_ANALYZE_DELAY_MS);
        i -= 1;
        continue;
      }
    }

    updateJob(jobId, { current: i + 1, message: `Analyzed ${i + 1} of ${toRun.length}` });
    if (i < toRun.length - 1) await sleep(GROQ_ANALYZE_DELAY_MS);
  }

  completeJob(jobId, `Batch complete — ${processed} of ${toRun.length} documents analyzed`);
}
