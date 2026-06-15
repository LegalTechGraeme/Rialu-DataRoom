import fs from "fs";
import { getCatalogAnalysisText } from "./ai/simulationCatalogText.js";

const VIEW_MAX_CHARS = 120_000;

/**
 * @param {string} absPath
 * @param {string} mimeType
 * @param {{ documentId?: string; previewText?: string }} [opts]
 */
export async function extractDocumentViewText(absPath, mimeType, opts = {}) {
  const catalog =
    opts.previewText?.trim() ||
    (opts.documentId ? getCatalogAnalysisText(opts.documentId) : "");

  let text = "";
  let source = "file";

  if (mimeType === "application/pdf") {
    // Demo PDFs are often image-based — prefer rich catalog text when available
    if (catalog.length >= 80) {
      text = catalog.replace(/\r\n/g, "\n");
      source = "catalog";
    } else {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const buffer = fs.readFileSync(absPath);
        const parsed = await pdfParse(buffer);
        text = formatPdfText(parsed.text ?? "");
      } catch {
        text = "";
      }
      if (text.trim().length < 80 && catalog) {
        text = catalog.replace(/\r\n/g, "\n");
        source = "catalog";
      }
    }
  } else if (
    mimeType.includes("spreadsheet") ||
    mimeType === "text/csv" ||
    absPath.endsWith(".xlsx")
  ) {
    const XLSX = (await import("xlsx")).default;
    const wb = XLSX.readFile(absPath);
    const parts = [];
    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      parts.push(`## ${name}\n${rows.map((r) => r.join("\t")).join("\n")}`);
    }
    text = parts.join("\n\n");
  } else if (mimeType.startsWith("text/") || absPath.endsWith(".txt")) {
    text = fs.readFileSync(absPath, "utf8");
  }

  if (text.trim().length < 40 && catalog) {
    text = catalog.replace(/\r\n/g, "\n");
    source = "catalog";
  }

  text = text.replace(/\n{3,}/g, "\n\n").trim();
  const available = text.length > 0;
  const truncated = text.length > VIEW_MAX_CHARS;
  if (truncated) {
    text = `${text.slice(0, VIEW_MAX_CHARS)}\n\n[Document truncated for preview.]`;
  }

  return { text, truncated, charCount: text.length, source, available };
}

function formatPdfText(raw) {
  let t = raw.replace(/\r\n/g, "\n");
  t = t.replace(/(\n?)(\d+\.\d+\s)/g, "\n\n$2");
  t = t.replace(/[^\S\n]+/g, " ");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

export function findTextOffsets(fullText, snippet) {
  if (!snippet?.trim() || !fullText) return null;
  const raw = snippet.trim();
  let idx = fullText.indexOf(raw.slice(0, 120));
  if (idx >= 0) return { start: idx, end: idx + Math.min(raw.length, 120) };

  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const fullNorm = norm(fullText);
  const needle = norm(raw).slice(0, 100);
  idx = fullNorm.indexOf(needle);
  if (idx < 0) {
    const short = needle.slice(0, 40);
    idx = fullNorm.indexOf(short);
    if (idx < 0) return null;
    return mapNormOffset(fullText, fullNorm, idx, short.length);
  }
  return mapNormOffset(fullText, fullNorm, idx, needle.length);
}

function mapNormOffset(fullText, fullNorm, normStart, normLen) {
  let normIdx = 0;
  let start = -1;
  let end = -1;
  for (let i = 0; i < fullText.length && normIdx <= normStart + normLen; i++) {
    if (/\s/.test(fullText[i]) && (i === 0 || /\s/.test(fullText[i - 1]))) continue;
    if (normIdx === normStart) start = i;
    if (normIdx === normStart + normLen) {
      end = i;
      break;
    }
    normIdx++;
  }
  if (start < 0) return null;
  if (end < 0) end = Math.min(fullText.length, start + normLen + 20);
  return { start, end };
}
