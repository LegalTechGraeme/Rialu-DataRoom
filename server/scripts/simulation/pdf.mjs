import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const MARGIN = 54;
const FOOTER =
  "SIMULATION ONLY — Fictional diligence document for Acme Corp. (Project Northwind). Not legal advice.";

/**
 * @param {string} outPath
 * @param {{ title: string; subtitle?: string; sections: { heading?: string; body: string[] }[] }} spec
 */
export function writePdf(outPath, spec) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: MARGIN });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    doc.fontSize(9).fillColor("#64748b").text(FOOTER, { align: "center" });
    doc.moveDown(1.2);
    doc.fontSize(16).fillColor("#0f172a").text(spec.title, { align: "left" });
    if (spec.subtitle) {
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#475569").text(spec.subtitle);
    }
    doc.moveDown(1);

    for (const section of spec.sections) {
      if (section.heading) {
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor("#1e40af").text(section.heading);
        doc.moveDown(0.35);
      }
      for (const para of section.body) {
        doc.fontSize(10).fillColor("#0f172a").text(para, {
          align: "justify",
          lineGap: 3,
        });
        doc.moveDown(0.45);
      }
    }

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
  });
}
