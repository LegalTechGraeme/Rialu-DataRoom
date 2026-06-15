import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { DISCLAIMER } from "./company.mjs";

const MARGIN = 54;

/**
 * Long-form legal PDF with simulation disclaimer.
 * @param {string} outPath
 * @param {{ title: string; subtitle?: string; docType?: string; parties?: string; sections: { heading?: string; body: string[] }[]; footer?: string }} spec
 */
export function writeLongPdf(outPath, spec) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, autoFirstPage: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    const footer = spec.footer ?? DISCLAIMER;

    doc.fontSize(7).fillColor("#94a3b8").text(footer, { align: "center" });
    doc.moveDown(1.2);

    if (spec.docType) {
      doc.fontSize(9).fillColor("#475569").text(spec.docType.toUpperCase());
      doc.moveDown(0.3);
    }
    doc.fontSize(16).fillColor("#0f172a").text(spec.title);
    if (spec.subtitle) {
      doc.moveDown(0.35);
      doc.fontSize(11).fillColor("#475569").text(spec.subtitle);
    }
    if (spec.parties) {
      doc.moveDown(0.6);
      doc.fontSize(10).fillColor("#334155").text(spec.parties, { lineGap: 2 });
    }
    doc.moveDown(1);

    for (const section of spec.sections) {
      if (section.heading) {
        doc.moveDown(0.35);
        doc.fontSize(11).fillColor("#1e3a5f").text(section.heading);
        doc.moveDown(0.3);
      }
      for (const para of section.body) {
        if (!para) continue;
        doc.fontSize(9.5).fillColor("#0f172a").text(para, { align: "justify", lineGap: 2.5 });
        doc.moveDown(0.35);
      }
    }

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
  });
}

/** @param {string} outPath @param {string} content */
export function writeTxt(outPath, content) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf8");
}
