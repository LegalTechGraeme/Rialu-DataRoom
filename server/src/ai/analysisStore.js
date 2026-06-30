import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isSimulationMatter } from "../matterStore.js";
import {
  getAllDemoDocumentAnalyses,
  getDemoDocumentAnalysis,
  getDemoMatterSynthesis,
} from "./demoAi.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ANALYSES_DIR = path.resolve(__dirname, "../../../data/analyses");

function matterDir(matterId) {
  return path.join(ANALYSES_DIR, matterId);
}

function docPath(matterId, documentId) {
  return path.join(matterDir(matterId), `${documentId}.json`);
}

function matterMetaPath(matterId) {
  return path.join(matterDir(matterId), "_matter.json");
}

function ensureMatter(matterId) {
  fs.mkdirSync(matterDir(matterId), { recursive: true });
}

/** @param {string} matterId @param {string} documentId @param {object} analysis */
export function saveDocumentAnalysis(matterId, documentId, analysis) {
  ensureMatter(matterId);
  const record = {
    documentId,
    matterId,
    analyzedAt: new Date().toISOString(),
    ...analysis,
  };
  fs.writeFileSync(docPath(matterId, documentId), JSON.stringify(record, null, 2));
  return record;
}

export function getDocumentAnalysis(matterId, documentId) {
  if (isSimulationMatter(matterId)) {
    const demo = getDemoDocumentAnalysis(matterId, documentId);
    if (demo) return demo;
  }
  const p = docPath(matterId, documentId);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  return null;
}

export function getAllDocumentAnalyses(matterId) {
  const dir = matterDir(matterId);
  const out = {};
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json") || f.startsWith("_")) continue;
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      out[data.documentId] = data;
    }
  }
  if (isSimulationMatter(matterId)) {
    return { ...getAllDemoDocumentAnalyses(matterId), ...out };
  }
  return out;
}

export function saveMatterSynthesis(matterId, synthesis) {
  ensureMatter(matterId);
  const record = {
    matterId,
    synthesizedAt: new Date().toISOString(),
    ...synthesis,
  };
  fs.writeFileSync(matterMetaPath(matterId), JSON.stringify(record, null, 2));
  return record;
}

export function getMatterSynthesis(matterId) {
  if (isSimulationMatter(matterId)) {
    const demo = getDemoMatterSynthesis(matterId);
    if (demo) return demo;
  }
  const p = matterMetaPath(matterId);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  return null;
}
