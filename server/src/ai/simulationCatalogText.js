import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.resolve(__dirname, "../../../simulation/manifest.json");

/** @type {Record<string, { previewText?: string }> | null} */
let byId = null;

function loadManifestDocs() {
  if (byId) return byId;
  if (!fs.existsSync(MANIFEST_PATH)) {
    byId = {};
    return byId;
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  byId = Object.fromEntries(
    (manifest.documents ?? []).map((d) => [d.id, d])
  );
  return byId;
}

/**
 * Plain text for LLM analysis when pdf-parse extraction is thin.
 * @param {string} documentId
 */
export function getCatalogAnalysisText(documentId) {
  const doc = loadManifestDocs()[documentId];
  return doc?.previewText ?? "";
}
