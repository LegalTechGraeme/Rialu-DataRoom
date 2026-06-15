import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const MAX_CHARS = 14_000;

/**
 * @param {string} absPath
 * @param {string} mimeType
 */
export async function extractTextFromFile(absPath, mimeType) {
  if (!fs.existsSync(absPath)) {
    throw new Error("File not found on disk");
  }

  let text = "";

  if (mimeType === "application/pdf") {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = fs.readFileSync(absPath);
      const parsed = await pdfParse(buffer);
      text = parsed.text ?? "";
    } catch {
      text = "";
    }
  } else if (
    mimeType.includes("spreadsheet") ||
    mimeType === "text/csv" ||
    absPath.endsWith(".xlsx")
  ) {
    const wb = XLSX.readFile(absPath);
    const parts = [];
    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      parts.push(`## Sheet: ${name}\n${rows.map((r) => r.join("\t")).join("\n")}`);
    }
    text = parts.join("\n\n");
  } else if (mimeType.startsWith("text/") || absPath.endsWith(".txt")) {
    text = fs.readFileSync(absPath, "utf8");
  } else {
    text = `[Binary or unsupported type: ${mimeType}. Metadata only.]`;
  }

  text = text.replace(/\s+/g, " ").trim();
  if (text.length > MAX_CHARS) {
    text = `${text.slice(0, MAX_CHARS)}\n\n[Truncated for analysis — full file retained in data room.]`;
  }
  return text;
}

export function basename(p) {
  return path.basename(p);
}
