import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SIMULATION_ROOT = path.resolve(__dirname, "../../simulation");
const MANIFEST_PATH = path.join(SIMULATION_ROOT, "manifest.json");
const FILES_ROOT = path.join(SIMULATION_ROOT, "files");

/** @type {{ documents: import('./types.js').DocumentRecord[]; activities: import('./types.js').ActivityItem[]; ready: boolean } | null} */
let cache = null;

export function isSimulationReady() {
  return fs.existsSync(MANIFEST_PATH);
}

export function loadSimulation() {
  if (cache?.manifestMtime && fs.existsSync(MANIFEST_PATH)) {
    const mtime = fs.statSync(MANIFEST_PATH).mtimeMs;
    if (mtime !== cache.manifestMtime) cache = null;
  }
  if (cache) return cache;
  if (!isSimulationReady()) {
    cache = { documents: [], activities: [], ready: false };
    return cache;
  }
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  /** @type {import('./types.js').DocumentRecord[]} */
  const documents = raw.documents.map((d) => ({
    id: d.id,
    matterId: d.matterId,
    folderId: d.folderId,
    fileName: d.fileName,
    uploadedAt: d.uploadedAt,
    categoryLabel: d.categoryLabel,
    status: d.status,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    storagePath: d.storagePath,
    previewText: d.previewText ?? undefined,
  }));
  cache = {
    documents,
    activities: raw.activities ?? [],
    ready: true,
    manifestMtime: fs.statSync(MANIFEST_PATH).mtimeMs,
  };
  return cache;
}

/** @param {string} storagePath */
export function resolveSimulationFile(storagePath) {
  const abs = path.join(FILES_ROOT, storagePath);
  const normalized = path.normalize(abs);
  if (!normalized.startsWith(FILES_ROOT)) {
    throw new Error("Invalid storage path");
  }
  return normalized;
}
