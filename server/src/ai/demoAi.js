import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isSimulationMatter } from "../matterStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_AI_ROOT = path.resolve(__dirname, "../../../simulation/ai");

/** @type {Map<string, { analyses: Record<string, object>; synthesis: object; report: object; chat: object }>} */
const cache = new Map();

function bundleDir(matterId) {
  return path.join(DEMO_AI_ROOT, matterId);
}

function loadBundle(matterId) {
  if (!isSimulationMatter(matterId)) return null;
  if (cache.has(matterId)) return cache.get(matterId);

  const dir = bundleDir(matterId);
  const analysesPath = path.join(dir, "analyses.json");
  if (!fs.existsSync(analysesPath)) return null;

  const bundle = {
    analyses: JSON.parse(fs.readFileSync(analysesPath, "utf8")),
    synthesis: JSON.parse(fs.readFileSync(path.join(dir, "synthesis.json"), "utf8")),
    report: JSON.parse(fs.readFileSync(path.join(dir, "report.json"), "utf8")),
    chat: JSON.parse(fs.readFileSync(path.join(dir, "chat.json"), "utf8")),
  };
  cache.set(matterId, bundle);
  return bundle;
}

export function hasDemoAiBundle(matterId) {
  return loadBundle(matterId) !== null;
}

/** @param {string} matterId @param {string} documentId */
export function getDemoDocumentAnalysis(matterId, documentId) {
  const bundle = loadBundle(matterId);
  return bundle?.analyses[documentId] ?? null;
}

/** @param {string} matterId */
export function getDemoMatterSynthesis(matterId) {
  const bundle = loadBundle(matterId);
  return bundle?.synthesis ?? null;
}

/** @param {string} matterId */
export function getDemoGeneratedReport(matterId) {
  const bundle = loadBundle(matterId);
  return bundle?.report ?? null;
}

/** @param {string} message */
export function getDemoChatResponse(message) {
  const bundle = loadBundle("matter-acme");
  if (!bundle?.chat) {
    return {
      answer: "Demo AI responses are not available for this matter.",
      structured_points: [],
      citations: [],
      confidence: "low",
    };
  }

  const lower = message.toLowerCase();
  for (const entry of bundle.chat.responses ?? []) {
    if (entry.match.some((m) => lower.includes(m.toLowerCase()))) {
      return entry.response;
    }
  }
  return bundle.chat.fallback;
}

/** @param {string} matterId */
export function getAllDemoDocumentAnalyses(matterId) {
  const bundle = loadBundle(matterId);
  return bundle?.analyses ?? {};
}
