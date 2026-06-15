import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

/** @param {string} matterId */
export function getAllReviews(matterId) {
  return readMatter(matterId).reviews;
}

/** @param {string} matterId @param {string} documentId */
export function getDocumentReview(matterId, documentId) {
  const reviews = getAllReviews(matterId);
  return reviews[documentId] ?? null;
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
