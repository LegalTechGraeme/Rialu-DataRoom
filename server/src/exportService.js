import PptxGenJS from "pptxgenjs";
import XLSX from "xlsx";
import { getMatter, getDocuments, getFolderName } from "./matterStore.js";
import { getAllReviews } from "./reviewStore.js";
import { getMatterSynthesis } from "./ai/analysisStore.js";
import { buildRiskRegister } from "./ai/matterIntelligence.js";

/**
 * @param {string} matterId
 * @returns {Promise<Buffer>}
 */
export async function generatePptxExport(matterId) {
  const matter = getMatter(matterId);
  if (!matter) throw new Error("Matter not found");

  const docs = getDocuments(matterId);
  const reviews = getAllReviews(matterId);
  const synthesis = getMatterSynthesis(matterId);
  const risks = buildRiskRegister(matterId, docs);

  const counts = { green: 0, amber: 0, red: 0, unreviewed: 0 };
  for (const doc of docs) {
    const f = reviews[doc.id]?.diligenceFlag;
    if (f === "green") counts.green += 1;
    else if (f === "amber") counts.amber += 1;
    else if (f === "red") counts.red += 1;
    else counts.unreviewed += 1;
  }

  const pptx = new PptxGenJS();
  pptx.author = "Rialu";
  pptx.title = `${matter.name} — Due Diligence Report`;
  pptx.subject = "Legal Due Diligence";

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText("Rialu", { x: 0.5, y: 0.8, w: 9, h: 0.6, fontSize: 14, color: "2D5F5D" });
  titleSlide.addText(matter.name, { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 28, bold: true, color: "1A2330" });
  titleSlide.addText("Due Diligence Report", { x: 0.5, y: 2.5, w: 9, h: 0.5, fontSize: 18, color: "526070" });
  titleSlide.addText(new Date().toLocaleDateString(), { x: 0.5, y: 4.8, w: 9, h: 0.4, fontSize: 12, color: "8291A0" });
  if (matter.clientRef) {
    titleSlide.addText(`Ref: ${matter.clientRef}`, { x: 0.5, y: 5.2, w: 9, h: 0.4, fontSize: 12, color: "8291A0" });
  }

  // Executive summary
  const summarySlide = pptx.addSlide();
  summarySlide.addText("Executive Summary", { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 22, bold: true, color: "1A2330" });
  const summaryText =
    synthesis?.executive_summary ??
    `This report covers ${docs.length} documents in the ${matter.name} data room. ${counts.red} red, ${counts.amber} amber, and ${counts.green} green diligence flags recorded.`;
  summarySlide.addText(summaryText, { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 14, color: "526070", valign: "top" });

  // Flag summary
  const flagSlide = pptx.addSlide();
  flagSlide.addText("Diligence Overview", { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 22, bold: true });
  const flagRows = [
    ["Flag", "Count", "% of corpus"],
    ["Green", String(counts.green), `${docs.length ? Math.round((counts.green / docs.length) * 100) : 0}%`],
    ["Amber", String(counts.amber), `${docs.length ? Math.round((counts.amber / docs.length) * 100) : 0}%`],
    ["Red", String(counts.red), `${docs.length ? Math.round((counts.red / docs.length) * 100) : 0}%`],
    ["Not reviewed", String(counts.unreviewed), `${docs.length ? Math.round((counts.unreviewed / docs.length) * 100) : 0}%`],
    ["Total documents", String(docs.length), "100%"],
  ];
  flagSlide.addTable(flagRows, {
    x: 0.5,
    y: 1.2,
    w: 9,
    fontSize: 12,
    border: { type: "solid", color: "DEDAD2", pt: 1 },
    fill: { color: "FAF9F6" },
    color: "1A2330",
  });

  // Top risks
  const topRisks = (synthesis?.top_risks ?? risks.slice(0, 8)).slice(0, 8);
  if (topRisks.length > 0) {
    const riskSlide = pptx.addSlide();
    riskSlide.addText("Key Risks", { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 22, bold: true });
    const riskBullets = topRisks.map((r) => ({
      text: `${r.risk ?? r.issue ?? "Risk"} [${(r.severity ?? "medium").toUpperCase()}]`,
      options: { fontSize: 13, color: "1A2330", bullet: true, breakLine: true },
    }));
    riskSlide.addText(riskBullets, { x: 0.5, y: 1.1, w: 9, h: 4.5, valign: "top" });
  }

  // Red flags detail
  const redDocs = docs.filter((d) => reviews[d.id]?.diligenceFlag === "red").slice(0, 10);
  if (redDocs.length > 0) {
    const redSlide = pptx.addSlide();
    redSlide.addText("Red Flag Documents", { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 22, bold: true, color: "B94848" });
    const redRows = [
      ["Document", "Folder", "Summary"],
      ...redDocs.map((d) => [
        d.fileName,
        getFolderName(matterId, d.folderId),
        (reviews[d.id]?.summary ?? "").slice(0, 120),
      ]),
    ];
    redSlide.addTable(redRows, { x: 0.5, y: 1.1, w: 9, fontSize: 10, colW: [2.5, 2, 4.5] });
  }

  // Themes
  if (synthesis?.themes?.length) {
    const themeSlide = pptx.addSlide();
    themeSlide.addText("Cross-Cutting Themes", { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 22, bold: true });
    themeSlide.addText(
      synthesis.themes.map((t) => ({ text: t, options: { bullet: true, fontSize: 14 } })),
      { x: 0.5, y: 1.1, w: 9, h: 4.5 }
    );
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return /** @type {Buffer} */ (buffer);
}

/**
 * @param {string} matterId
 * @returns {Buffer}
 */
export function generateExcelExport(matterId) {
  const matter = getMatter(matterId);
  if (!matter) throw new Error("Matter not found");

  const docs = getDocuments(matterId);
  const reviews = getAllReviews(matterId);
  const risks = buildRiskRegister(matterId, docs);

  const reportRows = docs.map((d) => ({
    Document: d.fileName,
    Folder: getFolderName(matterId, d.folderId),
    Category: d.categoryLabel,
    Flag: reviews[d.id]?.diligenceFlag ?? "unreviewed",
    Summary: reviews[d.id]?.summary ?? "",
    Notes: reviews[d.id]?.pertinentNotes ?? "",
    Uploaded: d.uploadedAt,
  }));

  const riskRows = risks.map((r) => ({
    Risk: r.risk ?? r.issue ?? "",
    Severity: r.severity,
    Documents: r.documentName ?? (r.document_names ?? []).join("; "),
    Explanation: r.explanation ?? "",
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportRows), "Diligence Report");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(riskRows), "Risk Register");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
