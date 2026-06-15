import { groqChat } from "./groqClient.js";
import { CHAT_SYSTEM } from "./prompts.js";
import { getAllDocumentAnalyses, getMatterSynthesis } from "./analysisStore.js";

/**
 * @param {string} matterId
 * @param {string} message
 * @param {import('../types.js').DocumentRecord[]} documents
 * @param {{ role: 'user'|'assistant'; content: string }[]} history
 */
export async function chatOverMatter(matterId, message, documents, history = []) {
  const synthesis = getMatterSynthesis(matterId);
  const analyses = getAllDocumentAnalyses(matterId);

  const contextDocs = documents.map((d) => {
    const a = analyses[d.id];
    if (!a) return { id: d.id, fileName: d.fileName, status: "not_analyzed" };
    return {
      id: d.id,
      fileName: d.fileName,
      document_type: a.document_type,
      summary: a.summary,
      risks: a.risks,
      key_clauses: a.key_clauses,
    };
  });

  const historyText =
    history.length > 0
      ? `\nRecent conversation:\n${history
          .slice(-6)
          .map((h) => `${h.role}: ${h.content}`)
          .join("\n")}\n`
      : "";

  const user = `Matter: ${matterId}
${historyText}
User question: ${message}

Matter synthesis:
${JSON.stringify(synthesis ?? { note: "Run matter synthesis for richer answers" }, null, 2).slice(0, 12000)}

Document analyses (${contextDocs.filter((c) => c.summary).length} analyzed):
${JSON.stringify(contextDocs, null, 2).slice(0, 35000)}`;

  return groqChat({
    system: CHAT_SYSTEM,
    user,
    json: true,
    temperature: 0.3,
  });
}
