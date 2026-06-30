import { isSimulationMatter } from "../matterStore.js";
import { MATTER_ACME_DEMO_BUNDLE } from "./demoAiBundleData.js";

const SIMULATION_MATTER_ID = "matter-acme";

function bundleFor(matterId) {
  if (!isSimulationMatter(matterId)) return null;
  if (matterId !== SIMULATION_MATTER_ID) return null;
  return MATTER_ACME_DEMO_BUNDLE;
}

export function hasDemoAiBundle(matterId) {
  return bundleFor(matterId) !== null;
}

/** @param {string} matterId @param {string} documentId */
export function getDemoDocumentAnalysis(matterId, documentId) {
  const bundle = bundleFor(matterId);
  return bundle?.analyses[documentId] ?? null;
}

/** @param {string} matterId */
export function getDemoMatterSynthesis(matterId) {
  const bundle = bundleFor(matterId);
  return bundle?.synthesis ?? null;
}

/** @param {string} matterId */
export function getDemoGeneratedReport(matterId) {
  const bundle = bundleFor(matterId);
  return bundle?.report ?? null;
}

/** @param {string} message */
export function getDemoChatResponse(message) {
  const bundle = MATTER_ACME_DEMO_BUNDLE;
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
  const bundle = bundleFor(matterId);
  return bundle?.analyses ?? {};
}
