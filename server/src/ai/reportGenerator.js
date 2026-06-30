import { groqChat } from "./groqClient.js";
import { REPORT_SYSTEM } from "./prompts.js";
import { getMatterSynthesis, getAllDocumentAnalyses } from "./analysisStore.js";
import { buildRiskRegister } from "./matterIntelligence.js";
import { isSimulationMatter } from "../matterStore.js";
import { getDemoGeneratedReport, hasDemoAiBundle } from "./demoAi.js";

/**
 * @param {string} matterId
 * @param {string} matterName
 * @param {import('../types.js').DocumentRecord[]} documents
 */
export async function generateDiligenceReport(matterId, matterName, documents) {
  if (isSimulationMatter(matterId) && hasDemoAiBundle(matterId)) {
    const demo = getDemoGeneratedReport(matterId);
    if (demo) {
      return {
        ...demo,
        matterName: demo.matterName ?? matterName,
        generatedAt: demo.generatedAt ?? new Date().toISOString(),
      };
    }
  }

  const synthesis = getMatterSynthesis(matterId);
  const analyses = getAllDocumentAnalyses(matterId);
  const risks = buildRiskRegister(matterId, documents);

  const user = `Generate a legal due diligence report for: ${matterName} (${matterId})
Total documents: ${documents.length}
Analyzed: ${Object.keys(analyses).length}

Matter synthesis:
${JSON.stringify(synthesis, null, 2).slice(0, 20000)}

Aggregated risk register (${risks.length} items):
${JSON.stringify(risks.slice(0, 40), null, 2)}

Include sections: Corporate, Commercial, Employment, Property, Litigation, Tax/Regulatory (if data), Intellectual Property, Recommendations.
Partner-ready tone. Note this is a simulation data room.`;

  const report = await groqChat({
    system: REPORT_SYSTEM,
    user,
    json: true,
  });

  return {
    matterId,
    matterName,
    generatedAt: new Date().toISOString(),
    report,
    riskCount: risks.length,
  };
}
