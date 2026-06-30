import { getMatterSynthesis } from "./ai/analysisStore.js";
import { buildRiskRegister } from "./ai/matterIntelligence.js";
import { getDocuments } from "./matterStore.js";
import { getAllReviews } from "./reviewStore.js";

/** @param {string} matterId */
export function buildReviewSummary(matterId) {
  const docs = getDocuments(matterId).filter((d) => d.storagePath);
  const reviews = getAllReviews(matterId);
  const flags = { green: 0, amber: 0, red: 0 };

  for (const doc of docs) {
    const f = reviews[doc.id]?.diligenceFlag;
    if (f === "green") flags.green += 1;
    else if (f === "amber") flags.amber += 1;
    else if (f === "red") flags.red += 1;
  }

  const flagged = flags.red;
  const reviewed = flags.green + flags.amber + flags.red;
  const synthesis = getMatterSynthesis(matterId);
  const risks = buildRiskRegister(matterId, docs);

  return {
    documentsReviewed: docs.length,
    flags,
    flaggedIssues: flagged,
    reviewedPercent: docs.length ? Math.round((reviewed / docs.length) * 100) : 0,
    executiveSummary: synthesis?.executive_summary ?? "",
    topRisks: (synthesis?.top_risks ?? []).slice(0, 5).map((r) => ({
      risk: r.risk,
      severity: r.severity ?? "medium",
      explanation: r.explanation ?? "",
    })),
    riskRegisterCount: risks.length,
  };
}
