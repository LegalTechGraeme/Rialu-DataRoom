import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";
import {
  addDocuments,
  addActivity,
  findDocument,
  getDocuments,
  getFolderTree,
  getMatter,
  guessMimeType,
  matterFilesDir,
  updateDocument,
} from "./matterStore.js";
import { classifyDocument } from "./ai/documentClassifier.js";
import { isGroqConfigured } from "./config.js";
import { resolveFolderFromVdrPath, guessFolderFromFilename } from "./vdrFolderMap.js";
import { findFolderInTree } from "./folderTemplate.js";

const ALLOWED_EXT = new Set([
  ".pdf",
  ".xlsx",
  ".xls",
  ".csv",
  ".txt",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
]);

/**
 * @param {string} matterId
 * @param {{ originalname: string; buffer: Buffer; size: number; mimetype?: string }[]} files
 * @param {{ autoClassify?: boolean }} options
 */
export async function ingestUploadedFiles(matterId, files, options = {}) {
  const matter = getMatter(matterId);
  if (!matter) throw new Error("Matter not found");

  const autoClassify = options.autoClassify !== false && isGroqConfigured();
  const tree = getFolderTree(matterId);
  if (!tree) throw new Error("Folder tree not found");

  const filesDir = matterFilesDir(matterId);
  const expanded = expandFiles(files);
  /** @type {import('./types.js').DocumentRecord[]} */
  const newDocs = [];
  const results = [];

  for (const file of expanded) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      results.push({
        fileName: file.originalname,
        ok: false,
        error: `Unsupported file type: ${ext || "unknown"}`,
      });
      continue;
    }

    const docId = `doc-${crypto.randomBytes(6).toString("hex")}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageName = `${docId}-${safeName}`;
    const absPath = path.join(filesDir, storageName);
    fs.writeFileSync(absPath, file.buffer);

    const mimeType = file.mimetype && file.mimetype !== "application/octet-stream"
      ? file.mimetype
      : guessMimeType(file.originalname);

    const pathFolderId = file.relativePath
      ? resolveFolderFromVdrPath(file.relativePath, matterId)
      : null;
    const pathFolder = pathFolderId ? findFolderInTree(tree, pathFolderId) : null;

    /** @type {import('./types.js').DocumentRecord} */
    let doc = {
      id: docId,
      matterId,
      folderId: pathFolderId ?? `fld-misc-${matterId}`,
      fileName: file.originalname,
      uploadedAt: new Date().toISOString(),
      categoryLabel: pathFolder?.name ?? "Uncategorised",
      status: "pending",
      mimeType,
      sizeBytes: file.size ?? file.buffer.length,
      storagePath: storageName,
    };

    let classification = null;
    if (pathFolderId) {
      classification = {
        folderId: pathFolderId,
        categoryLabel: pathFolder?.name ?? doc.categoryLabel,
        confidence: "high",
        reasoning: `Filed from upload path: ${file.relativePath}`,
      };
    } else if (autoClassify) {
      classification = await classifyDocument(
        { fileName: file.originalname, mimeType },
        absPath,
        tree,
        matterId
      );
      doc.folderId = classification.folderId;
      doc.categoryLabel = classification.categoryLabel;
    }

    newDocs.push(doc);
    results.push({
      fileName: file.originalname,
      ok: true,
      documentId: docId,
      folderId: doc.folderId,
      categoryLabel: doc.categoryLabel,
      classification,
    });
  }

  if (newDocs.length > 0) {
    addDocuments(matterId, newDocs);
    addActivity(matterId, {
      id: `act-${matterId}-upload-${Date.now()}`,
      matterId,
      kind: "upload",
      message: `${newDocs.length} document${newDocs.length === 1 ? "" : "s"} uploaded${autoClassify ? " and classified" : ""}`,
      occurredAt: new Date().toISOString(),
      actorLabel: "Rialu",
    });
  }

  return { uploaded: newDocs.length, results, autoClassify };
}

/** @param {{ originalname: string; buffer: Buffer; size: number; mimetype?: string }[]} files */
function expandFiles(files) {
  /** @type {{ originalname: string; buffer: Buffer; size: number; mimetype?: string }[]} */
  const out = [];
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".zip") {
      try {
        const zip = new AdmZip(file.buffer);
        for (const entry of zip.getEntries()) {
          if (entry.isDirectory) continue;
          const name = path.basename(entry.entryName);
          if (!name || name.startsWith(".")) continue;
          const entryExt = path.extname(name).toLowerCase();
          if (!ALLOWED_EXT.has(entryExt)) continue;
          out.push({
            originalname: name,
            relativePath: entry.entryName,
            buffer: entry.getData(),
            size: entry.header.size,
          });
        }
      } catch {
        out.push(file);
      }
    } else {
      out.push(file);
    }
  }
  return out;
}

/** Re-file all documents in a matter using filename heuristics (fixes zip uploads without paths). */
export function refileDocumentsByFilename(matterId) {
  const tree = getFolderTree(matterId);
  if (!tree) throw new Error("Folder tree not found");
  const docs = getDocuments(matterId);
  let updated = 0;
  for (const doc of docs) {
    const folderId = guessFolderFromFilename(doc.fileName, matterId);
    if (!folderId) continue;
    const folder = findFolderInTree(tree, folderId);
    if (!folder) continue;
    updateDocument(matterId, doc.id, {
      folderId,
      categoryLabel: folder.name,
    });
    updated += 1;
  }
  return { updated, total: docs.length };
}

/** Re-classify an existing document */
export async function reclassifyDocument(matterId, documentId) {
  const tree = getFolderTree(matterId);
  if (!tree) throw new Error("Folder tree not found");
  const doc = findDocument(matterId, documentId);
  if (!doc?.storagePath) throw new Error("Document not found");

  const absPath = path.join(matterFilesDir(matterId), doc.storagePath);
  const classification = await classifyDocument(
    { fileName: doc.fileName, mimeType: doc.mimeType },
    absPath,
    tree
  );
  const updated = updateDocument(matterId, documentId, {
    folderId: classification.folderId,
    categoryLabel: classification.categoryLabel,
  });
  return { document: updated, classification };
}
