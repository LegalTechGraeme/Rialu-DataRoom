import { groqChat } from "./groqClient.js";
import { DOCUMENT_ANALYSIS_SYSTEM } from "./prompts.js";
import { extractTextFromFile } from "./textExtract.js";
import { getCatalogAnalysisText } from "./simulationCatalogText.js";
import { saveDocumentAnalysis, getDocumentAnalysis } from "./analysisStore.js";

/**
 * @param {{ id: string; fileName: string; categoryLabel: string; mimeType: string }} doc
 * @param {string} absPath
 * @param {string} matterId
 * @param {boolean} force
 */
export async function analyzeDocument(doc, absPath, matterId, force = false) {
  if (!force) {
    const existing = getDocumentAnalysis(matterId, doc.id);
    if (existing?.analyzedAt) return existing;
  }

  let text = await extractTextFromFile(absPath, doc.mimeType);
  const catalogText = getCatalogAnalysisText(doc.id);
  if (catalogText && text.length < 120) {
    text = catalogText + (text ? `\n\n[PDF extract fragment]\n${text}` : "");
  } else if (!text && catalogText) {
    text = catalogText;
  }
  if (!text.trim()) {
    throw new Error("No extractable text for this document");
  }

  // Keep prompts smaller to stay within Groq free-tier tokens-per-minute limits.
  const ANALYSIS_TEXT_CAP = 6_000;
  if (text.length > ANALYSIS_TEXT_CAP) {
    text = `${text.slice(0, ANALYSIS_TEXT_CAP)}\n\n[Truncated for API rate limits — full file retained in data room.]`;
  }

  const user = `Analyze this diligence document.

File name: ${doc.fileName}
Category label: ${doc.categoryLabel}
Document ID: ${doc.id}

--- DOCUMENT TEXT ---
${text}
--- END ---`;

  const parsed = await groqChat({
    system: DOCUMENT_ANALYSIS_SYSTEM,
    user,
    json: true,
  });

  return saveDocumentAnalysis(matterId, doc.id, {
    fileName: doc.fileName,
    ...parsed,
  });
}
