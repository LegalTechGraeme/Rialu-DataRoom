import { groqChat } from "./groqClient.js";
import { MATTER_SYNTHESIS_SYSTEM } from "./prompts.js";
import {
  getAllDocumentAnalyses,
  getMatterSynthesis,
  saveMatterSynthesis,
} from "./analysisStore.js";
import { isSimulationMatter } from "../matterStore.js";
import { getDemoMatterSynthesis, hasDemoAiBundle } from "./demoAi.js";

/**
 * @param {string} matterId
 * @param {import('../types.js').DocumentRecord[]} documents
 * @param {boolean} force
 */
export async function synthesizeMatter(matterId, documents, force = false) {
  if (!force) {
    const existing = getMatterSynthesis(matterId);
    if (existing?.synthesizedAt) return existing;
  }

  if (isSimulationMatter(matterId) && hasDemoAiBundle(matterId)) {
    const demo = getDemoMatterSynthesis(matterId);
    if (!demo) throw new Error("No demo synthesis for this matter");
    return saveMatterSynthesis(matterId, demo);
  }

  const analyses = getAllDocumentAnalyses(matterId);
  const analyzed = documents
    .filter((d) => analyses[d.id])
    .map((d) => {
      const a = analyses[d.id];
      return {
        document_id: d.id,
        file_name: d.fileName,
        document_type: a.document_type,
        summary: a.summary,
        risks: a.risks,
        key_clauses: a.key_clauses?.slice(0, 8),
        entities: a.entities,
      };
    });

  if (analyzed.length === 0) {
    throw new Error("No analyzed documents. Run document analysis first.");
  }

  const user = `Matter ID: ${matterId}
Documents analyzed: ${analyzed.length} of ${documents.length}

Per-document extracts (JSON):
${JSON.stringify(analyzed, null, 2).slice(0, 50000)}

Identify cross-document conflicts, aggregated risks, entity map, and diligence themes.`;

  const parsed = await groqChat({
    system: MATTER_SYNTHESIS_SYSTEM,
    user,
    json: true,
  });

  return saveMatterSynthesis(matterId, parsed);
}

/** @param {string} matterId @param {import('../types.js').DocumentRecord[]} documents */
export function buildRiskRegister(matterId, documents) {
  const analyses = getAllDocumentAnalyses(matterId);
  const synthesis = getMatterSynthesis(matterId);
  const docById = Object.fromEntries(documents.map((d) => [d.id, d]));
  const issues = [];
  const seen = new Set();

  if (synthesis?.top_risks) {
    for (const r of synthesis.top_risks) {
      const key = r.risk?.slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        id: `syn-${issues.length + 1}`,
        issue: r.risk,
        severity: r.severity ?? "medium",
        documentId: r.document_ids?.[0] ?? null,
        documentName: r.document_names?.join(", ") ?? "Multiple",
        status: "open",
        assignedTo: null,
        source: "cross-document",
        explanation: r.explanation,
        sourceReference: r.source_references?.join("; ") ?? "",
      });
    }
  }

  for (const doc of documents) {
    const a = analyses[doc.id];
    if (!a?.risks) continue;
    for (const r of a.risks) {
      if (r.severity === "low") continue;
      const key = `${doc.id}-${r.risk?.slice(0, 60)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        id: `doc-${doc.id}-${issues.length}`,
        issue: r.risk,
        severity: r.severity ?? "medium",
        documentId: doc.id,
        documentName: doc.fileName,
        status: "open",
        assignedTo: null,
        source: "document",
        explanation: r.explanation,
        sourceReference: r.source_reference ?? "",
      });
    }
  }

  const order = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  return issues;
}
