import "./config.js";
import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import {
  listMatters,
  getMatter,
  getFolderTree,
  getDocuments,
  getActivities,
  findDocument,
  createMatter,
  isSimulationMatter,
} from "./matterStore.js";
import { loadSimulation, isSimulationReady } from "./simulationLoader.js";
import { hasDemoAiBundle } from "./ai/demoAi.js";
import { resolveDocumentFile } from "./fileResolver.js";
import {
  getAllReviews,
  getDocumentReview,
  upsertDocumentReview,
} from "./reviewStore.js";
import { isGroqConfigured } from "./config.js";
import { createAiRouter } from "./routes/aiRoutes.js";
import {
  ingestUploadedFiles,
  reclassifyDocument,
  refileDocumentsByFilename,
} from "./uploadService.js";
import { startFullReview, getFullReviewStatus, cancelJob as cancelFullReviewJob } from "./ddOrchestrator.js";
import { runDemoFullReviewImmediate, cancelStaleGroqFullReviews } from "./demoFullReview.js";
import { listJobs, cancelJob, getJob } from "./aiJobManager.js";
import { generatePptxExport, generateExcelExport } from "./exportService.js";
import { findFolderInTree } from "./folderTemplate.js";
import { updateDocumentStatusFromReview } from "./matterStore.js";
import { createTaskRouter } from "./routes/taskRoutes.js";
import { extractDocumentViewText } from "./documentTextService.js";

const app = express();
const PORT = process.env.PORT || 3001;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 100 },
});

app.use(cors({ origin: true }));
app.use(express.json());

function countFolders(node) {
  if (!node) return 0;
  let n = 0;
  if (node.parentId !== null) n += 1;
  for (const c of node.children || []) n += countFolders(c);
  return n;
}

function flattenFolderIds(node, acc = []) {
  if (!node) return acc;
  acc.push(node.id);
  for (const c of node.children || []) flattenFolderIds(c, acc);
  return acc;
}

function docsInSubtree(root, folderId, matterId) {
  const documents = getDocuments(matterId);
  const ids = new Set(flattenFolderIds(findFolderInTree(root, folderId)));
  return documents.filter((d) => ids.has(d.folderId));
}

function matterDocuments(matterId) {
  return getDocuments(matterId);
}

function fileUrl(matterId, documentId) {
  return `/api/matters/${matterId}/documents/${documentId}/file`;
}

function buildFolderNameMap(tree, map = {}) {
  if (!tree) return map;
  map[tree.id] = tree.name;
  for (const c of tree.children ?? []) buildFolderNameMap(c, map);
  return map;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    simulation: isSimulationReady(),
    demoAiBundle: hasDemoAiBundle("matter-acme"),
    groq: isGroqConfigured(),
    brand: "Rialu",
  });
});

app.use(
  "/api",
  createAiRouter(
    (matterId) => matterDocuments(matterId),
    (matterId, documentId) => findDocument(matterId, documentId),
    (matterId) => getMatter(matterId)
  )
);

app.get("/api/matters", (_req, res) => {
  res.json({ matters: listMatters() });
});

app.post("/api/matters", (req, res) => {
  try {
    const { name, clientRef, dealType } = req.body ?? {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const matter = createMatter({ name, clientRef, dealType });
    res.status(201).json({ matter });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Failed to create matter" });
  }
});

app.get("/api/matters/:matterId", (req, res) => {
  const m = getMatter(req.params.matterId);
  if (!m) return res.status(404).json({ error: "Matter not found" });
  res.json({ matter: m });
});

app.get("/api/matters/:matterId/dashboard", (req, res) => {
  const m = getMatter(req.params.matterId);
  if (!m) return res.status(404).json({ error: "Matter not found" });
  const tree = getFolderTree(req.params.matterId);
  const docs = matterDocuments(req.params.matterId);
  const reviews = getAllReviews(req.params.matterId);
  const totalDocs = docs.length;
  const folderCount = tree ? countFolders(tree) : 0;
  const reviewed = docs.filter((d) => {
    const flag = reviews[d.id]?.diligenceFlag;
    return flag === "green" || flag === "amber" || flag === "red" || d.status === "reviewed" || d.status === "flagged";
  }).length;
  const flagged = docs.filter((d) => reviews[d.id]?.diligenceFlag === "red" || d.status === "flagged").length;
  const reviewedPct = totalDocs ? Math.round((reviewed / totalDocs) * 100) : 0;
  const recent = getActivities(req.params.matterId)
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, 12);
  res.json({
    stats: {
      totalDocuments: totalDocs,
      folders: folderCount,
      reviewedPercent: reviewedPct,
      flaggedIssues: flagged,
    },
    recentActivity: recent,
  });
});

app.get("/api/matters/:matterId/tree", (req, res) => {
  const tree = getFolderTree(req.params.matterId);
  if (!tree) return res.status(404).json({ error: "Tree not found" });
  res.json({ tree });
});

app.get("/api/matters/:matterId/folders/:folderId/documents", (req, res) => {
  const tree = getFolderTree(req.params.matterId);
  if (!tree) return res.status(404).json({ error: "Matter tree not found" });
  const folder = findFolderInTree(tree, req.params.folderId);
  if (!folder) return res.status(404).json({ error: "Folder not found" });
  const documents = getDocuments(req.params.matterId);
  const direct = documents.filter(
    (d) => d.matterId === req.params.matterId && d.folderId === req.params.folderId
  );
  res.json({ folderId: folder.id, folderName: folder.name, documents: direct });
});

app.get("/api/matters/:matterId/folders/:folderId/documents-recursive", (req, res) => {
  const tree = getFolderTree(req.params.matterId);
  if (!tree) return res.status(404).json({ error: "Matter tree not found" });
  const folder = findFolderInTree(tree, req.params.folderId);
  if (!folder) return res.status(404).json({ error: "Folder not found" });
  const list = docsInSubtree(tree, req.params.folderId, req.params.matterId);
  res.json({ folderId: folder.id, folderName: folder.name, documents: list });
});

app.get("/api/matters/:matterId/documents/:documentId", (req, res) => {
  const doc = findDocument(req.params.matterId, req.params.documentId);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  const tree = getFolderTree(req.params.matterId);
  const folder = tree ? findFolderInTree(tree, doc.folderId) : null;
  const review = getDocumentReview(req.params.matterId, req.params.documentId);
  res.json({
    document: doc,
    folder: folder ? { id: folder.id, name: folder.name } : null,
    fileUrl: doc.storagePath ? fileUrl(req.params.matterId, doc.id) : null,
    review,
  });
});

app.post("/api/matters/:matterId/upload", upload.array("files", 100), async (req, res) => {
  try {
    const m = getMatter(req.params.matterId);
    if (!m) return res.status(404).json({ error: "Matter not found" });
    if (isSimulationMatter(req.params.matterId)) {
      return res.status(400).json({ error: "Cannot upload to the demo simulation room — create a new room instead" });
    }
    const files = req.files ?? [];
    if (!files.length) return res.status(400).json({ error: "No files provided" });
    const autoClassify = req.body?.autoClassify !== "false";
    const result = await ingestUploadedFiles(req.params.matterId, files, { autoClassify });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Upload failed" });
  }
});

app.post("/api/matters/:matterId/refile-documents", (req, res) => {
  try {
    if (isSimulationMatter(req.params.matterId)) {
      return res.status(400).json({ error: "Cannot refile simulation matter" });
    }
    const result = refileDocumentsByFilename(req.params.matterId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Refile failed" });
  }
});

app.post("/api/matters/:matterId/documents/:documentId/classify", async (req, res) => {
  try {
    if (isSimulationMatter(req.params.matterId)) {
      return res.status(400).json({ error: "Cannot reclassify simulation documents" });
    }
    const result = await reclassifyDocument(req.params.matterId, req.params.documentId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Classification failed" });
  }
});

app.post("/api/matters/:matterId/full-review", async (req, res) => {
  try {
    const matterId = req.params.matterId;
    if (isSimulationMatter(matterId)) {
      const job = await runDemoFullReviewImmediate(matterId, req.body ?? {});
      return res.json({ job });
    }
    const status = await startFullReview(matterId, req.body ?? {});
    res.json({ job: status });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Could not start review" });
  }
});

app.post("/api/matters/:matterId/full-review/cancel", (req, res) => {
  const m = getMatter(req.params.matterId);
  if (!m) return res.status(404).json({ error: "Matter not found" });
  const status = getFullReviewStatus(req.params.matterId);
  if (!status.jobId) return res.json({ job: status });
  const result = cancelFullReviewJob(status.jobId);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json({ job: getFullReviewStatus(req.params.matterId) });
});

app.get("/api/matters/:matterId/full-review/status", (req, res) => {
  const m = getMatter(req.params.matterId);
  if (!m) return res.status(404).json({ error: "Matter not found" });
  if (isSimulationMatter(req.params.matterId)) {
    cancelStaleGroqFullReviews(req.params.matterId);
  }
  res.json({ job: getFullReviewStatus(req.params.matterId) });
});

app.get("/api/matters/:matterId/ai-jobs", (req, res) => {
  const m = getMatter(req.params.matterId);
  if (!m) return res.status(404).json({ error: "Matter not found" });
  res.json({ jobs: listJobs(req.params.matterId) });
});

app.post("/api/ai-jobs/:jobId/cancel", (req, res) => {
  const result = cancelJob(req.params.jobId);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json({ job: result.job });
});

app.get("/api/ai-jobs/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ job });
});

app.get("/api/matters/:matterId/export/pptx", async (req, res) => {
  try {
    const m = getMatter(req.params.matterId);
    if (!m) return res.status(404).json({ error: "Matter not found" });
    const buffer = await generatePptxExport(req.params.matterId);
    const safeName = m.name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "report";
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="Rialu-${safeName}-DD-Report.pptx"`);
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Export failed" });
  }
});

app.get("/api/matters/:matterId/export/xlsx", (req, res) => {
  try {
    const m = getMatter(req.params.matterId);
    if (!m) return res.status(404).json({ error: "Matter not found" });
    const buffer = generateExcelExport(req.params.matterId);
    const safeName = m.name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "report";
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Rialu-${safeName}-DD-Report.xlsx"`);
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Export failed" });
  }
});

app.get("/api/matters/:matterId/reviews", (req, res) => {
  const m = getMatter(req.params.matterId);
  if (!m) return res.status(404).json({ error: "Matter not found" });
  res.json({ reviews: getAllReviews(req.params.matterId) });
});

app.get("/api/matters/:matterId/documents/:documentId/review", (req, res) => {
  const doc = findDocument(req.params.matterId, req.params.documentId);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json({ review: getDocumentReview(req.params.matterId, req.params.documentId) });
});

app.put("/api/matters/:matterId/documents/:documentId/review", (req, res) => {
  const doc = findDocument(req.params.matterId, req.params.documentId);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  const { diligenceFlag, summary, pertinentNotes } = req.body ?? {};
  const allowed = ["green", "amber", "red", null];
  if (diligenceFlag !== undefined && !allowed.includes(diligenceFlag)) {
    return res.status(400).json({ error: "diligenceFlag must be green, amber, red, or null" });
  }
  const review = upsertDocumentReview(req.params.matterId, req.params.documentId, {
    diligenceFlag,
    summary,
    pertinentNotes,
  });
  if (diligenceFlag !== undefined) {
    updateDocumentStatusFromReview(req.params.matterId, req.params.documentId, diligenceFlag);
  }
  res.json({ review });
});

app.get("/api/matters/:matterId/diligence-report", (req, res) => {
  const m = getMatter(req.params.matterId);
  if (!m) return res.status(404).json({ error: "Matter not found" });
  const tree = getFolderTree(req.params.matterId);
  const folderNames = buildFolderNameMap(tree);
  const reviews = getAllReviews(req.params.matterId);
  const docs = matterDocuments(req.params.matterId).sort((a, b) =>
    a.fileName.localeCompare(b.fileName)
  );
  const entries = docs.map((document) => ({
    document,
    folderId: document.folderId,
    folderName: folderNames[document.folderId] ?? "—",
    review: reviews[document.id] ?? null,
  }));
  const counts = { green: 0, amber: 0, red: 0, unreviewed: 0 };
  for (const e of entries) {
    const f = e.review?.diligenceFlag;
    if (f === "green") counts.green += 1;
    else if (f === "amber") counts.amber += 1;
    else if (f === "red") counts.red += 1;
    else counts.unreviewed += 1;
  }
  res.json({ entries, counts, total: entries.length });
});

app.use(
  "/api",
  createTaskRouter(
    (matterId) => matterDocuments(matterId),
    (matterId) => buildFolderNameMap(getFolderTree(matterId))
  )
);

app.get("/api/matters/:matterId/documents/:documentId/text", async (req, res) => {
  const doc = findDocument(req.params.matterId, req.params.documentId);
  if (!doc?.storagePath) return res.status(404).json({ error: "Document not found" });
  try {
    const abs = resolveDocumentFile(req.params.matterId, doc.storagePath);
    const result = await extractDocumentViewText(abs, doc.mimeType, {
      documentId: doc.id,
      previewText: doc.previewText,
    });
    res.json({
      ...result,
      documentId: doc.id,
      fileName: doc.fileName,
      previewText: doc.previewText ?? null,
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Text extraction failed" });
  }
});

app.get("/api/matters/:matterId/documents/:documentId/file", (req, res) => {
  const doc = findDocument(req.params.matterId, req.params.documentId);
  if (!doc?.storagePath) {
    return res.status(404).json({ error: "File not found" });
  }
  try {
    const abs = resolveDocumentFile(req.params.matterId, doc.storagePath);
    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(doc.fileName)}"`
    );
    res.sendFile(abs);
  } catch {
    res.status(404).json({ error: "File missing on disk" });
  }
});

app.listen(PORT, () => {
  const sim = loadSimulation();
  const matterCount = listMatters().length;
  console.log(`Rialu API http://localhost:${PORT}`);
  console.log(`${matterCount} matter(s) available`);
  console.log(
    sim.ready
      ? `Simulation: ${sim.documents.length} demo documents loaded`
      : "Simulation: not generated (run npm run simulate:generate)"
  );
  console.log(
    isGroqConfigured() ? "Groq AI: configured" : "Groq AI: missing GROQ_API_KEY in server/.env"
  );
});
