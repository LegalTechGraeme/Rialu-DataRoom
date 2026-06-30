import { groqChat } from "./groqClient.js";
import { DOCUMENT_CLASSIFY_SYSTEM } from "./prompts.js";
import { extractTextFromFile } from "./textExtract.js";
import { flattenFolders } from "../folderTemplate.js";
import { isGroqConfigured } from "../config.js";
import { useDemoAiOnly } from "./simulationAiPolicy.js";

/**
 * @param {{ fileName: string; mimeType: string }} fileMeta
 * @param {string} absPath
 * @param {import('../types.js').FolderNode} tree
 */
/**
 * @param {string} [matterId]
 */
export async function classifyDocument(fileMeta, absPath, tree, matterId) {
  const folders = flattenFolders(tree);
  const miscFolder = folders.find((f) => f.name === "Uncategorised") ?? folders[0];
  const fallback = {
    folderId: miscFolder.id,
    categoryLabel: `${miscFolder.name}`,
    confidence: "low",
    reasoning: "Default classification — AI unavailable or insufficient context",
  };

  if (useDemoAiOnly(matterId)) return fallback;

  if (!isGroqConfigured()) return fallback;

  let text = "";
  try {
    text = await extractTextFromFile(absPath, fileMeta.mimeType);
  } catch {
    text = "";
  }

  const folderList = folders
    .filter((f) => f.parentId !== null)
    .map((f) => `- ${f.id}: ${f.name}`)
    .join("\n");

  const user = `Classify this uploaded diligence document.

File name: ${fileMeta.fileName}
MIME type: ${fileMeta.mimeType}

Available folders (use folder_id exactly as shown):
${folderList}

--- TEXT EXCERPT (may be partial) ---
${text.slice(0, 4000) || "[No extractable text — classify from filename only]"}
--- END ---`;

  try {
    const parsed = await groqChat({
      system: DOCUMENT_CLASSIFY_SYSTEM,
      user,
      json: true,
      matterId,
    });
    const folderId = resolveFolderId(parsed.folder_id, folders, matterId, miscFolder.id);
    const folder = folders.find((f) => f.id === folderId);
    return {
      folderId,
      categoryLabel: parsed.category_label ?? folder?.name ?? miscFolder.name,
      confidence: parsed.confidence ?? "medium",
      reasoning: parsed.reasoning ?? "",
    };
  } catch {
    return fallback;
  }
}

/** @param {string} rawId @param {{ id: string }[]} folders @param {string} [matterId] @param {string} fallback */
function resolveFolderId(rawId, folders, matterId, fallback) {
  if (!rawId) return fallback;
  if (folders.some((f) => f.id === rawId)) return rawId;
  if (matterId) {
    const suffixed = `${rawId}-${matterId}`;
    if (folders.some((f) => f.id === suffixed)) return suffixed;
  }
  const partial = folders.find(
    (f) => f.id === rawId || f.id.startsWith(`${rawId}-`) || rawId.startsWith(f.id)
  );
  return partial?.id ?? fallback;
}
