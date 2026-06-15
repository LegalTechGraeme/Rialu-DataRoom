import crypto from "crypto";

/** @typedef {'running'|'completed'|'cancelled'|'error'} JobStatus */
/** @typedef {'full-review'|'batch-analyze'|'document-analyze'|'synthesize'|'report'} JobType */

/**
 * @typedef {Object} AiJob
 * @property {string} id
 * @property {string} matterId
 * @property {JobType} type
 * @property {string} label
 * @property {JobStatus} status
 * @property {string} phase
 * @property {number} current
 * @property {number} total
 * @property {string} message
 * @property {string} startedAt
 * @property {string} [completedAt]
 * @property {string} [error]
 */

/** @type {Map<string, AiJob>} */
const jobs = new Map();
/** @type {Set<string>} */
const cancelRequested = new Set();

function newJobId() {
  return `job-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

/**
 * @param {{ matterId: string; type: JobType; label: string; total?: number }} input
 */
export function createJob(input) {
  /** @type {AiJob} */
  const job = {
    id: newJobId(),
    matterId: input.matterId,
    type: input.type,
    label: input.label,
    status: "running",
    phase: "starting",
    current: 0,
    total: input.total ?? 0,
    message: "Starting…",
    startedAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  return job;
}

/** @param {string} jobId */
export function getJob(jobId) {
  return jobs.get(jobId) ?? null;
}

/** @param {string} [matterId] */
export function listJobs(matterId) {
  const all = [...jobs.values()].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
  const filtered = matterId ? all.filter((j) => j.matterId === matterId) : all;
  // Keep last 20; prioritize running
  return filtered
    .filter((j) => j.status === "running" || Date.now() - new Date(j.startedAt).getTime() < 3600_000)
    .slice(0, 20);
}

/** @param {string} jobId */
export function isJobCancelled(jobId) {
  return cancelRequested.has(jobId);
}

/**
 * @param {string} jobId
 * @param {Partial<Pick<AiJob, 'phase'|'current'|'total'|'message'|'status'>>} patch
 */
export function updateJob(jobId, patch) {
  const job = jobs.get(jobId);
  if (!job) return null;
  Object.assign(job, patch);
  return job;
}

/** @param {string} jobId */
export function completeJob(jobId, message) {
  const job = jobs.get(jobId);
  if (!job) return null;
  job.status = "completed";
  job.message = message;
  job.completedAt = new Date().toISOString();
  cancelRequested.delete(jobId);
  return job;
}

/** @param {string} jobId */
export function failJob(jobId, error) {
  const job = jobs.get(jobId);
  if (!job) return null;
  job.status = "error";
  job.error = error;
  job.message = error;
  job.completedAt = new Date().toISOString();
  cancelRequested.delete(jobId);
  return job;
}

/** @param {string} jobId */
export function cancelJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return { ok: false, error: "Job not found" };
  if (job.status !== "running") return { ok: false, error: "Job is not running" };
  cancelRequested.add(jobId);
  job.status = "cancelled";
  job.message = "Cancelled by user";
  job.completedAt = new Date().toISOString();
  return { ok: true, job };
}

/** @param {string} matterId @param {JobType} type */
export function hasRunningJob(matterId, type) {
  return [...jobs.values()].some(
    (j) => j.matterId === matterId && j.type === type && j.status === "running"
  );
}
