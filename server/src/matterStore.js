import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { matters as seedMatters, folderTrees as seedFolderTrees } from "./mockData.js";
import { loadSimulation } from "./simulationLoader.js";
import {
  createStandardFolderTree,
  defaultExplorerFolderId,
  findFolderInTree,
} from "./folderTemplate.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATTERS_DIR = path.resolve(__dirname, "../../data/matters");

/** @param {string} matterId */
export function matterFilesDir(matterId) {
  const dir = path.join(MATTERS_DIR, matterId, "files");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const SIMULATION_MATTER_ID = "matter-acme";

function ensureMattersDir() {
  fs.mkdirSync(MATTERS_DIR, { recursive: true });
}

function manifestPath(matterId) {
  return path.join(MATTERS_DIR, matterId, "manifest.json");
}

/** @param {string} matterId */
export function isSimulationMatter(matterId) {
  return matterId === SIMULATION_MATTER_ID;
}

/** @param {string} matterId */
function readUserManifest(matterId) {
  const file = manifestPath(matterId);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** @param {string} matterId @param {object} data */
function writeUserManifest(matterId, data) {
  const dir = path.join(MATTERS_DIR, matterId);
  fs.mkdirSync(dir, { recursive: true });
  matterFilesDir(matterId);
  fs.writeFileSync(manifestPath(matterId), JSON.stringify(data, null, 2), "utf8");
}

function listUserMatterIds() {
  ensureMattersDir();
  return fs
    .readdirSync(MATTERS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(manifestPath(d.name)))
    .map((d) => d.name);
}

/** @returns {import('./types.js').Matter[]} */
export function listMatters() {
  const sim = seedMatters.filter((m) => m.id === SIMULATION_MATTER_ID);
  const user = listUserMatterIds()
    .map((id) => readUserManifest(id)?.matter)
    .filter(Boolean);
  return [...sim, ...user];
}

/** @param {string} matterId */
export function getMatter(matterId) {
  if (isSimulationMatter(matterId)) {
    return seedMatters.find((m) => m.id === matterId) ?? null;
  }
  return readUserManifest(matterId)?.matter ?? null;
}

/** @param {string} matterId */
export function getFolderTree(matterId) {
  if (isSimulationMatter(matterId)) {
    return seedFolderTrees[matterId] ?? null;
  }
  return readUserManifest(matterId)?.tree ?? null;
}

/** @param {string} matterId */
export function getDocuments(matterId) {
  if (isSimulationMatter(matterId)) {
    return loadSimulation().documents.filter((d) => d.matterId === matterId);
  }
  return readUserManifest(matterId)?.documents ?? [];
}

/** @param {string} matterId */
export function getActivities(matterId) {
  if (isSimulationMatter(matterId)) {
    return loadSimulation().activities.filter((a) => a.matterId === matterId);
  }
  return readUserManifest(matterId)?.activities ?? [];
}

/** @param {string} matterId @param {string} documentId */
export function findDocument(matterId, documentId) {
  return getDocuments(matterId).find((d) => d.id === documentId);
}

/**
 * @param {{ name: string; clientRef?: string; dealType?: string }} input
 */
export function createMatter(input) {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const matterId = `matter-${slug || "room"}-${Date.now().toString(36)}`;
  const openedAt = new Date().toISOString();
  const tree = createStandardFolderTree(matterId);

  /** @type {import('./types.js').Matter} */
  const matter = {
    id: matterId,
    name: input.name.trim(),
    clientRef: input.clientRef?.trim() || undefined,
    openedAt,
    explorerDefaultFolderId: defaultExplorerFolderId(matterId),
    dealType: input.dealType?.trim() || "M&A",
    source: "user",
  };

  const manifest = {
    matter,
    tree,
    documents: [],
    activities: [
      {
        id: `act-${matterId}-created`,
        matterId,
        kind: "folder",
        message: `Data room "${matter.name}" created`,
        occurredAt: openedAt,
        actorLabel: "Rialu",
      },
    ],
  };

  writeUserManifest(matterId, manifest);
  return matter;
}

/** @param {string} matterId */
function loadUserManifestOrThrow(matterId) {
  if (isSimulationMatter(matterId)) {
    throw new Error("Cannot modify simulation matter");
  }
  const manifest = readUserManifest(matterId);
  if (!manifest) throw new Error("Matter not found");
  return manifest;
}

/**
 * @param {string} matterId
 * @param {import('./types.js').DocumentRecord[]} newDocs
 */
export function addDocuments(matterId, newDocs) {
  const manifest = loadUserManifestOrThrow(matterId);
  manifest.documents.push(...newDocs);
  writeUserManifest(matterId, manifest);
  return newDocs;
}

/**
 * @param {string} matterId
 * @param {string} documentId
 * @param {Partial<import('./types.js').DocumentRecord>} updates
 */
export function updateDocument(matterId, documentId, updates) {
  const manifest = loadUserManifestOrThrow(matterId);
  const idx = manifest.documents.findIndex((d) => d.id === documentId);
  if (idx < 0) throw new Error("Document not found");
  manifest.documents[idx] = { ...manifest.documents[idx], ...updates };
  writeUserManifest(matterId, manifest);
  return manifest.documents[idx];
}

/** @param {string} matterId @param {import('./types.js').ActivityItem} activity */
export function addActivity(matterId, activity) {
  if (isSimulationMatter(matterId)) return activity;
  const manifest = loadUserManifestOrThrow(matterId);
  manifest.activities.unshift(activity);
  manifest.activities = manifest.activities.slice(0, 100);
  writeUserManifest(matterId, manifest);
  return activity;
}

/** @param {string} matterId @param {string} documentId */
export function updateDocumentStatusFromReview(matterId, documentId, flag) {
  if (isSimulationMatter(matterId)) return;
  const manifest = loadUserManifestOrThrow(matterId);
  const doc = manifest.documents.find((d) => d.id === documentId);
  if (!doc) return;
  if (flag === "red") doc.status = "flagged";
  else if (flag === "green" || flag === "amber") doc.status = "reviewed";
  else doc.status = "pending";
  writeUserManifest(matterId, manifest);
}

/** @param {string} matterId @param {string} folderId */
export function getFolderName(matterId, folderId) {
  const tree = getFolderTree(matterId);
  const folder = tree ? findFolderInTree(tree, folderId) : null;
  return folder?.name ?? "—";
}

/** @param {string} fileName */
export function guessMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const map = {
    ".pdf": "application/pdf",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".csv": "text/csv",
    ".txt": "text/plain",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return map[ext] ?? "application/octet-stream";
}
