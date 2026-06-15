import fs from "fs";
import path from "path";
import XLSX from "xlsx";

/**
 * @param {string} outPath
 * @param {{ sheets: { name: string; rows: unknown[][] }[] }} spec
 */
export function writeXlsx(outPath, spec) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const wb = XLSX.utils.book_new();
  for (const sheet of spec.sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }
  XLSX.writeFile(wb, outPath);
}
