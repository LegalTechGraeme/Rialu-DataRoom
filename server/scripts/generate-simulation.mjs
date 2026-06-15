/**
 * Generates simulation files + manifest for Project Northwind / Acme Corp.
 * Run: npm run simulate:generate -w server
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { catalog } from "./simulation/catalog.mjs";
import { writePdf } from "./simulation/pdf.mjs";
import { writeXlsx } from "./simulation/xlsx.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FILES_ROOT = path.join(REPO_ROOT, "simulation", "files", "matter-acme");
const MANIFEST_PATH = path.join(REPO_ROOT, "simulation", "manifest.json");

const MATTER_ID = "matter-acme";

async function main() {
  if (fs.existsSync(FILES_ROOT)) {
    fs.rmSync(FILES_ROOT, { recursive: true, force: true });
  }
  fs.mkdirSync(FILES_ROOT, { recursive: true });

  /** @type {import('../src/types.js').ManifestDocument[]} */
  const documents = [];

  for (const entry of catalog) {
    const folderDir = path.join(FILES_ROOT, entry.folderId);
    fs.mkdirSync(folderDir, { recursive: true });
    const outFile = path.join(folderDir, entry.fileName);

    if (entry.type === "pdf" && entry.pdf) {
      await writePdf(outFile, entry.pdf);
    } else if (entry.type === "xlsx" && entry.xlsx) {
      writeXlsx(outFile, entry.xlsx);
    } else {
      throw new Error(`Missing content for ${entry.id}`);
    }

    const stat = fs.statSync(outFile);
    documents.push({
      id: entry.id,
      matterId: MATTER_ID,
      folderId: entry.folderId,
      fileName: entry.fileName,
      uploadedAt: entry.uploadedAt,
      categoryLabel: entry.categoryLabel,
      status: entry.status,
      mimeType: entry.mimeType,
      sizeBytes: stat.size,
      storagePath: `matter-acme/${entry.folderId}/${entry.fileName}`,
      previewText: entry.previewText ?? null,
    });
  }

  const flagged = documents.filter((d) => d.status === "flagged");
  const activities = [
    {
      id: "act-1",
      matterId: MATTER_ID,
      kind: "upload",
      message: `Simulation pack loaded: ${documents.length} documents across diligence index`,
      occurredAt: "2026-03-12T18:00:00.000Z",
      actorLabel: "Deal Team",
    },
    {
      id: "act-2",
      matterId: MATTER_ID,
      kind: "upload",
      message: `${documents[documents.length - 1].fileName} uploaded to Shareholder Documents / Cap Table & Equity`,
      occurredAt: "2026-03-12T15:00:00.000Z",
      actorLabel: "Deal Team",
    },
    {
      id: "act-3",
      matterId: MATTER_ID,
      kind: "review",
      message: "Employee_Handbook_US.pdf marked reviewed",
      occurredAt: "2026-03-08T09:12:00.000Z",
      actorLabel: "Associate",
    },
    ...flagged.map((d, i) => ({
      id: `act-flag-${i + 1}`,
      matterId: MATTER_ID,
      kind: "flag",
      message: `${d.fileName} flagged for diligence follow-up`,
      occurredAt: d.uploadedAt,
      actorLabel: "Partner",
    })),
    {
      id: "act-4",
      matterId: MATTER_ID,
      kind: "folder",
      message: "Index synchronized from simulation manifest",
      occurredAt: "2026-03-05T08:00:00.000Z",
      actorLabel: "Admin",
    },
  ];

  const manifest = {
    version: 1,
    matterId: MATTER_ID,
    generatedAt: new Date().toISOString(),
    disclaimer:
      "All documents are fictional simulation artifacts for Acme Corp. / Project Northwind. Not legal advice.",
    documents,
    activities,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Generated ${documents.length} files under simulation/files/`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
