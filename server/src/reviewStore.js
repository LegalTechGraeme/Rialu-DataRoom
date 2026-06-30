import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isSimulationMatter } from "./matterStore.js";
import { getAllDemoDocumentAnalyses, getDemoDocumentAnalysis } from "./ai/demoAi.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REVIEWS_DIR = path.resolve(__dirname, "../../data/reviews");

function matterPath(matterId) {
  return path.join(REVIEWS_DIR, `${matterId}.json`);
}

function ensureDir() {
  fs.mkdirSync(REVIEWS_DIR, { recursive: true });
}

function emptyStore(matterId) {
  return { matterId, reviews: {} };
}

function readMatter(matterId) {
  ensureDir();
  const file = matterPath(matterId);
  if (!fs.existsSync(file)) return emptyStore(matterId);
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return { matterId, reviews: data.reviews ?? {} };
  } catch {
    return emptyStore(matterId);
  }
}

function writeMatter(matterId, store) {
  ensureDir();
  fs.writeFileSync(
    matterPath(matterId),
    JSON.stringify({ matterId, reviews: store.reviews }, null, 2),
    "utf8"
  );
}

function demoReviewFromAnalysis(matterId, documentId, analysis) {
  return {
    documentId,
    matterId,
    diligenceFlag: analysis.suggested_diligence_flag ?? null,
    summary: analysis.suggested_summary ?? analysis.summary ?? "",
    pertinentNotes: analysis.suggested_pertinent_notes ?? "",
    updatedAt: analysis.analyzedAt ?? new Date().toISOString(),
  };
}

/** @param {string} matterId */
export function getAllReviews(matterId) {
  const store = readMatter(matterId).reviews;
  if (!isSimulationMatter(matterId)) return store;

  const merged = { ...store };
  for (const [documentId, analysis] of Object.entries(getAllDemoDocumentAnalyses(matterId))) {
    if (!merged[documentId]) {
      merged[documentId] = demoReviewFromAnalysis(matterId, documentId, analysis);
    }
  }
  return merged;
}

/** @param {string} matterId @param {string} documentId */
export function getDocumentReview(matterId, documentId) {
  const reviews = getAllReviews(matterId);
  if (reviews[documentId]) return reviews[documentId];

  if (isSimulationMatter(matterId)) {
    const analysis = getDemoDocumentAnalysis(matterId, documentId);
    if (analysis) return demoReviewFromAnalysis(matterId, documentId, analysis);
  }
  return null;
}

/**
 * @param {string} matterId
 * @param {string} documentId
 * @param {{ diligenceFlag?: 'green'|'amber'|'red'|null; summary?: string; pertinentNotes?: string }} payload
 */
export function upsertDocumentReview(matterId, documentId, payload) {
  const store = readMatter(matterId);
  const existing = store.reviews[documentId] ?? {};
  const diligenceFlag =
    payload.diligenceFlag === undefined ? existing.diligenceFlag ?? null : payload.diligenceFlag;
  const summary = payload.summary !== undefined ? payload.summary : existing.summary ?? "";
  const pertinentNotes =
    payload.pertinentNotes !== undefined
      ? payload.pertinentNotes
      : existing.pertinentNotes ?? "";

  const review = {
    documentId,
    matterId,
    diligenceFlag: diligenceFlag === undefined ? null : diligenceFlag,
    summary: String(summary),
    pertinentNotes: String(pertinentNotes),
    updatedAt: new Date().toISOString(),
  };
  store.reviews[documentId] = review;
  writeMatter(matterId, store);
  return review;
}
