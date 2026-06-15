/**
 * Generates demo-data-rooms/acme_ai_ltd/ and syncs simulation/manifest.json for matter-acme.
 * Run: npm run dataroom:generate -w server
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildCatalog } from "./document-catalog.mjs";
import { writeLongPdf, writeTxt } from "./pdf-long.mjs";
import { writeXlsx } from "../simulation/xlsx.mjs";
import { CO, DISCLAIMER } from "./company.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const DEMO_ROOT = path.join(REPO_ROOT, "demo-data-rooms", "acme_ai_ltd");
const SIM_FILES_ROOT = path.join(REPO_ROOT, "simulation", "files", "matter-acme");
const MANIFEST_PATH = path.join(REPO_ROOT, "simulation", "manifest.json");
const MATTER_ID = "matter-acme";

/** @param {object} entry */
function buildPreviewText(entry) {
  if (entry.txt) return entry.txt.slice(0, 12000);
  if (entry.pdf) {
    const parts = [entry.pdf.title, entry.pdf.subtitle, entry.pdf.parties].filter(Boolean);
    for (const s of entry.pdf.sections ?? []) {
      if (s.heading) parts.push(s.heading);
      parts.push(...(s.body ?? []));
    }
    return parts.join("\n\n").slice(0, 14000);
  }
  if (entry.xlsx) {
    return (entry.xlsx.sheets ?? [])
      .flatMap((sh) => sh.rows.map((r) => r.join(" | ")))
      .join("\n")
      .slice(0, 8000);
  }
  return null;
}

async function main() {
  if (fs.existsSync(DEMO_ROOT)) {
    fs.rmSync(DEMO_ROOT, { recursive: true, force: true });
  }
  if (fs.existsSync(SIM_FILES_ROOT)) {
    fs.rmSync(SIM_FILES_ROOT, { recursive: true, force: true });
  }
  fs.mkdirSync(DEMO_ROOT, { recursive: true });
  fs.mkdirSync(SIM_FILES_ROOT, { recursive: true });

  const catalog = buildCatalog();
  console.log(`Catalog: ${catalog.length} documents`);

  /** @type {object[]} */
  const documents = [];

  for (const entry of catalog) {
    const demoDir = path.join(DEMO_ROOT, entry.vdrPath);
    const demoFile = path.join(demoDir, entry.fileName);
    fs.mkdirSync(demoDir, { recursive: true });

    if (entry.type === "pdf" && entry.pdf) {
      await writeLongPdf(demoFile, { ...entry.pdf, footer: DISCLAIMER });
    } else if (entry.type === "xlsx" && entry.xlsx) {
      writeXlsx(demoFile, entry.xlsx);
    } else if (entry.type === "txt" && entry.txt) {
      writeTxt(demoFile, entry.txt);
    } else {
      throw new Error(`Missing content for ${entry.id} ${entry.fileName}`);
    }

    const simDir = path.join(SIM_FILES_ROOT, entry.rialuFolderId);
    fs.mkdirSync(simDir, { recursive: true });
    const simFile = path.join(simDir, entry.fileName);
    fs.copyFileSync(demoFile, simFile);

    const stat = fs.statSync(demoFile);
    const previewText = entry.previewText ?? buildPreviewText(entry);
    documents.push({
      id: entry.id,
      matterId: MATTER_ID,
      folderId: entry.rialuFolderId,
      fileName: entry.fileName,
      uploadedAt: entry.uploadedAt,
      categoryLabel: entry.categoryLabel,
      status: entry.status,
      mimeType: entry.mimeType,
      sizeBytes: stat.size,
      storagePath: `matter-acme/${entry.rialuFolderId}/${entry.fileName}`,
      previewText,
    });
  }

  const flagged = documents.filter((d) => d.status === "flagged");
  const activities = [
    {
      id: "act-1",
      matterId: MATTER_ID,
      kind: "upload",
      message: `Acme AI Ltd data room loaded: ${documents.length} documents across diligence index`,
      occurredAt: new Date().toISOString(),
      actorLabel: "Rialu",
    },
    {
      id: "act-2",
      matterId: MATTER_ID,
      kind: "folder",
      message: "Series B M&A due diligence index synchronized",
      occurredAt: "2025-10-01T08:00:00.000Z",
      actorLabel: "Deal Team",
    },
    ...flagged.slice(0, 6).map((d, i) => ({
      id: `act-flag-${i + 1}`,
      matterId: MATTER_ID,
      kind: "flag",
      message: `${d.fileName} flagged for diligence follow-up`,
      occurredAt: d.uploadedAt,
      actorLabel: "Partner",
    })),
  ];

  const manifest = {
    version: 2,
    matterId: MATTER_ID,
    company: CO,
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    demoDataRoomPath: "demo-data-rooms/acme_ai_ltd",
    documents,
    activities,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const readme = `# Acme AI Ltd — Demo Data Room

Fictional Series B Irish AI SaaS company (${CO}) being acquired in an M&A transaction.

- **${documents.length} documents** across 11 diligence folders
- Generated for **Rialu** virtual data room testing
- Upload: zip this folder into a new Rialu data room, or use the built-in \`matter-acme\` simulation

## Structure

01 Corporate · 02 Capitalisation · 03 Financials · 04 Commercial Contracts ·
05 Employment · 06 Intellectual Property · 07 Litigation · 08 Data Protection/GDPR ·
09 Tax · 10 Insurance · 11 Regulatory/Compliance

Regenerate: \`npm run dataroom:generate\` from project root.

**Not legal advice. Simulation only.**
`;
  fs.writeFileSync(path.join(DEMO_ROOT, "README.md"), readme);

  console.log(`Demo data room: ${DEMO_ROOT}`);
  console.log(`Simulation files: ${SIM_FILES_ROOT}`);
  console.log(`Manifest: ${MANIFEST_PATH} (${documents.length} docs)`);
  console.log(`Total size: ${(documents.reduce((s, d) => s + d.sizeBytes, 0) / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
