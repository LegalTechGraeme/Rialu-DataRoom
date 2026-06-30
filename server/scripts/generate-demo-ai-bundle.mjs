/**
 * Generates committed demo AI outputs for matter-acme (simulation).
 * Run: node server/scripts/generate-demo-ai-bundle.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const MANIFEST_PATH = path.join(REPO_ROOT, "simulation", "manifest.json");
const OUT_DIR = path.join(REPO_ROOT, "simulation", "ai", "matter-acme");

const MATTER_ID = "matter-acme";
const NOW = "2026-06-08T12:00:00.000Z";

function flagForDoc(doc) {
  const cat = `${doc.categoryLabel} ${doc.fileName}`.toLowerCase();
  if (/litigat|dispute|claim|regulatory|investigation|subpoena/.test(cat)) return "red";
  if (/employment|ip |intellectual|commercial|contract|lease|covenant|change of control|data protection|privacy/.test(cat)) return "amber";
  if (/minutes|charter|incorporation|register|certificate|cap table|shareholder/.test(cat)) return "green";
  return "amber";
}

function docType(doc) {
  const cat = doc.categoryLabel ?? "";
  const parts = cat.split("—").map((s) => s.trim());
  return parts[parts.length - 1] || cat || "Document";
}

function firstSentence(text) {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = t.match(/^(.{40,220}?[.!?])(\s|$)/);
  return (m ? m[1] : t.slice(0, 180)).trim();
}

function buildDocAnalysis(doc) {
  const flag = flagForDoc(doc);
  const preview = doc.previewText ?? "";
  const lead = firstSentence(preview) || `${doc.fileName} filed under ${doc.categoryLabel}.`;
  const summary = `${lead} Relevant to the Acme AI Limited Series B acquisition diligence.`;

  const risks = [];
  if (flag === "red") {
    risks.push({
      risk: "Material exposure requiring partner sign-off",
      severity: "high",
      explanation: `Content in ${doc.fileName} indicates elevated legal or commercial risk for the transaction.`,
      source_reference: doc.fileName,
    });
  } else if (flag === "amber") {
    risks.push({
      risk: "Standard diligence follow-up recommended",
      severity: "medium",
      explanation: `Review ${doc.categoryLabel} provisions for change-of-control, liability caps, and disclosure schedule alignment.`,
      source_reference: doc.fileName,
    });
  }

  const keyClauses = preview
    ? [
        {
          name: "Key extract",
          text: preview.slice(0, 280).trim() + (preview.length > 280 ? "…" : ""),
          source_reference: doc.fileName,
        },
      ]
    : [];

  return {
    documentId: doc.id,
    matterId: MATTER_ID,
    analyzedAt: NOW,
    fileName: doc.fileName,
    document_type: docType(doc),
    summary,
    key_clauses: keyClauses,
    obligations: [],
    risks,
    entities: [{ name: "Acme AI Limited", role: "Target", jurisdiction: "Ireland" }],
    suggested_diligence_flag: flag,
    suggested_summary: summary,
    suggested_pertinent_notes:
      flag === "green"
        ? "No immediate red flags from document review."
        : flag === "red"
          ? "Escalate to partner — confirm disclosure schedule and warranty coverage."
          : "Confirm against disclosure letter and management responses.",
  };
}

const synthesis = {
  matterId: MATTER_ID,
  synthesizedAt: NOW,
  executive_summary:
    "Acme AI Limited is an Irish SaaS target with a clean corporate constitution, recent Series B board approvals, and a 94-document data room spanning corporate, commercial, employment, IP, property, and litigation. Cross-document review surfaces moderate commercial and employment/IP follow-ups, one active litigation reserve, and strong recurring revenue metrics (€18.2m ARR, 118% NRR). No fatal structural issues identified; valuation sensitivity lies in customer concentration (top three = 41% ARR) and DACH sales cycle lengthening.",
  top_risks: [
    {
      risk: "Customer concentration — top three customers represent 41% ARR",
      severity: "high",
      explanation: "Globex (18%), Initech (14%), and Umbrella (9%) create revenue dependency; confirm MAE definitions and customer consent thresholds in MSAs.",
      document_ids: ["doc-ai-041"],
      document_names: ["Customer_Concentration_Analysis_Q3_2025.xlsx"],
      source_references: ["Commercial — Customer analysis"],
    },
    {
      risk: "Active litigation — Globex dispute reserved €400k–€750k",
      severity: "high",
      explanation: "Litigation register shows open matter; verify insurance, warranty disclosure, and escrow treatment.",
      document_ids: ["doc-ai-055"],
      document_names: ["Litigation_Register_2025.pdf"],
      source_references: ["Litigation — Register"],
    },
    {
      risk: "Change-of-control and assignment restrictions in key MSAs",
      severity: "medium",
      explanation: "Commercial contracts summary memo flags consent requirements across enterprise MSAs; map to closing condition list.",
      document_ids: ["doc-ai-028"],
      document_names: ["Commercial_Contracts_Summary_Memo_REDLINE.txt"],
      source_references: ["Commercial — Summary memo"],
    },
    {
      risk: "Employment — executive option vesting and IP assignment completeness",
      severity: "medium",
      explanation: "Executive agreements and option schedule require confirmation that invention assignment and non-compete terms are enforceable in Ireland and UK.",
      document_ids: ["doc-ai-048"],
      document_names: ["Executive_Employment_Agreements_Summary.pdf"],
      source_references: ["Employment — Executive"],
    },
    {
      risk: "GDPR / data processing — sub-processor list and SCCs",
      severity: "medium",
      explanation: "Privacy pack references EU hosting; confirm DPA chain and transfer mechanisms for US inference sub-processors.",
      document_ids: ["doc-ai-062"],
      document_names: ["Data_Protection_Pack_2025.pdf"],
      source_references: ["Regulatory — Privacy"],
    },
  ],
  conflicts: [
    {
      description: "Board minutes reference 22-month cash runway while management accounts show accelerated hiring in H2 — reconcile with FY2025 budget.",
      documents: ["Board_Minutes_2024_09_15_FINAL.pdf", "FY2025_Budget_Board_Approved.xlsx"],
      severity: "medium",
    },
    {
      description: "Constitution preferred share rights vs. cap table option pool — verify 4% pool increase was filed.",
      documents: ["Constitution_Acme_AI_Ltd_Amended_2024_v3_SIGNED.pdf", "Cap_Table_Series_B_Post_Close.xlsx"],
      severity: "low",
    },
  ],
  entities_map: [
    { name: "Acme AI Limited", relationship: "Target", documents: ["Certificate_of_Incorporation", "Constitution"] },
    { name: "Sequoia Capital", relationship: "Investor / board nominee", documents: ["Board minutes", "Shareholders agreement"] },
    { name: "Globex Industries", relationship: "Major customer / litigation counterparty", documents: ["MSA", "Litigation register"] },
  ],
  themes: [
    "Corporate clean-up complete post-Series B",
    "Commercial MSAs — consent and assignment",
    "Employment & IP — executive equity",
    "Customer concentration",
    "Litigation reserve",
    "Data protection & hosting",
  ],
};

const report = {
  matterId: MATTER_ID,
  matterName: "Project Northwind / Acme AI Ltd",
  generatedAt: NOW,
  riskCount: 12,
  report: {
    title: "Legal Due Diligence Report — Acme AI Limited (Simulation)",
    executive_summary:
      "We have completed a documentary review of the Acme AI Limited virtual data room (94 documents) in connection with the proposed Series B acquisition. The target is an Irish-incorporated enterprise AI SaaS business with established governance, recent board approvals for the funding round, and no fundamental corporate defects. Key areas for negotiation are customer concentration, an active Globex litigation reserve, change-of-control consents in commercial contracts, and standard employment/IP confirmations. This report is based on fictional simulation materials for demonstration purposes only.",
    sections: [
      {
        heading: "Corporate & Governance",
        body: "Certificate of incorporation, amended constitution (Sept 2024), and statutory registers are in order. Board minutes through 2025 evidence quorum, conflict management (Sequoia nominee abstention), and resolutions approving Series B, constitution amendments, and option pool increases. Subsidiary chart shows Irish holdco with UK and US trading subsidiaries — confirm intercompany charges and director appointments.",
      },
      {
        heading: "Commercial",
        body: "Customer and supplier contracts are indexed with a summary memo highlighting assignment restrictions and SLA credits. Top-three customers represent 41% ARR. Recommend customer call summaries and disclosure schedule cross-check for top ten MSAs.",
      },
      {
        heading: "Employment & Pensions",
        body: "85 FTE workforce; no unionisation. Executive employment agreements and option schedules reviewed — vesting profiles for CEO/CFO/CTO documented. Standard confirmatory steps: IP assignment audits, WARN/OSA compliance for US subsidiary.",
      },
      {
        heading: "Intellectual Property",
        body: "Registered and unregistered IP schedule filed. Open-source policy and third-party component register present. Verify chain of title for core model weights and training data representations in reps.",
      },
      {
        heading: "Property & Facilities",
        body: "Dublin HQ lease expires 2031 with renewal option; SF satellite office sublease reviewed. No material environmental reports required for office footprint.",
      },
      {
        heading: "Litigation & Regulatory",
        body: "Two active matters on register; Globex dispute largest exposure (€400k–€750k reserved). GDPR pack and SOC 2 bridge letter available. No material regulatory investigations noted.",
      },
      {
        heading: "Tax",
        body: "Irish CT returns and transfer pricing memo for UK/US intercompany services. R&D credit documentation present — confirm utilisation post-change of control.",
      },
      {
        heading: "Recommendations",
        body: "Proceed to confirmatory diligence subject to: (1) customer consent schedule, (2) litigation warranty and escrow, (3) employment/IP bring-down certificates, (4) management accounts to budget reconciliation.",
      },
    ],
    red_flags: [
      {
        item: "Globex litigation reserve",
        severity: "high",
        recommendation: "Obtain external counsel memo; consider specific indemnity or purchase price adjustment.",
      },
      {
        item: "Customer concentration",
        severity: "high",
        recommendation: "Model churn sensitivity; verify contract term and renewal dates for top accounts.",
      },
      {
        item: "MSA change-of-control consents",
        severity: "medium",
        recommendation: "Prepare consent solicitation plan as closing condition.",
      },
    ],
    conclusion:
      "Subject to the qualifications above, the simulation data room supports proceeding to definitive documentation. All content is fictional and for product demonstration only — not legal advice.",
  },
};

const chat = {
  responses: [
    {
      match: ["top risk", "main risk", "biggest risk", "key risk"],
      response: {
        answer:
          "The top cross-document risks for Acme AI are: (1) customer concentration — top three customers at 41% ARR; (2) active Globex litigation with €400k–€750k reserve; (3) change-of-control consent requirements across enterprise MSAs; and (4) employment/IP confirmation on executive equity. None appear fatal but items 1–2 should be on the IC agenda.",
        structured_points: [
          "Customer concentration: 41% ARR in top three accounts",
          "Litigation: Globex dispute reserved €400k–€750k",
          "Commercial: MSA assignment and consent clauses",
          "Employment: executive option vesting and IP assignments",
        ],
        citations: [
          {
            document_id: "doc-ai-041",
            document_name: "Customer_Concentration_Analysis_Q3_2025.xlsx",
            source_reference: "Commercial analysis",
            excerpt: "Top 3 customers = 41% ARR",
          },
          {
            document_id: "doc-ai-055",
            document_name: "Litigation_Register_2025.pdf",
            source_reference: "Litigation register",
            excerpt: "Globex dispute €400k–€750k reserved",
          },
        ],
        confidence: "high",
      },
    },
    {
      match: ["employment", "liabilit", "workforce", "option", "fte"],
      response: {
        answer:
          "Employment diligence shows 85 FTE (Engineering 42, Sales 18, G&A 25), no unionised staff. Executive option schedules show CEO at ~70% vested, CFO ~55%. Follow-up: confirm invention assignment deeds, restrictive covenants enforceability in Ireland/UK, and US WARN compliance for the San Francisco office.",
        structured_points: [
          "85 FTE — no unions",
          "Executive option vesting profiles documented",
          "IP assignment and non-compete confirmation needed",
        ],
        citations: [
          {
            document_id: "doc-ai-048",
            document_name: "Executive_Employment_Agreements_Summary.pdf",
            source_reference: "Employment pack",
            excerpt: "CEO/CFO/CTO equity and vesting",
          },
        ],
        confidence: "high",
      },
    },
    {
      match: ["change of control", "assignment", "contract", "msa", "commercial"],
      response: {
        answer:
          "The commercial contracts summary memo flags change-of-control and assignment restrictions across several enterprise MSAs. Recommend a consent matrix tied to revenue weighting and a closing condition for material customer consents (>10% ARR).",
        structured_points: [
          "Multiple MSAs require consent on change of control",
          "Commercial summary memo identifies restricted contracts",
          "Prepare consent solicitation plan pre-signing",
        ],
        citations: [
          {
            document_id: "doc-ai-028",
            document_name: "Commercial_Contracts_Summary_Memo_REDLINE.txt",
            source_reference: "Commercial memo",
            excerpt: "Change of control and assignment restrictions noted",
          },
        ],
        confidence: "medium",
      },
    },
    {
      match: ["valuation", "deal", "price", "arr", "revenue"],
      response: {
        answer:
          "Valuation sensitivities from the data room include: €18.2m ARR (42% YoY), 118% net revenue retention, but customer concentration at 41% for top three accounts and lengthening enterprise sales cycles in DACH. Litigation reserve for Globex may also affect net debt / working capital adjustments.",
        structured_points: [
          "€18.2m ARR, 118% NRR — strong fundamentals",
          "Customer concentration may compress multiple",
          "DACH sales cycle lengthening — pipeline risk",
          "Litigation reserve — adjustment item",
        ],
        citations: [
          {
            document_id: "doc-ai-004",
            document_name: "Board_Minutes_2024_09_15_FINAL.pdf",
            source_reference: "Board minutes",
            excerpt: "ARR €18.2m, NRR 118%",
          },
        ],
        confidence: "medium",
      },
    },
  ],
  fallback: {
    answer:
      "Based on the Acme AI simulation data room, I can help with risks, employment, commercial contracts, litigation, and valuation themes. Try asking about top risks, employment liabilities, change-of-control clauses, or deal valuation drivers. All responses are drawn from pre-analyzed demo materials.",
    structured_points: [
      "94-document fictional Acme AI Ltd matter",
      "Cross-document synthesis available",
      "Citations reference simulation files only",
    ],
    citations: [],
    confidence: "low",
  },
};

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const documents = manifest.documents ?? [];

  const analyses = {};
  for (const doc of documents) {
    analyses[doc.id] = buildDocAnalysis(doc);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "synthesis.json"), JSON.stringify(synthesis, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "chat.json"), JSON.stringify(chat, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "analyses.json"), JSON.stringify(analyses, null, 2));

  console.log(`Wrote demo AI bundle for ${documents.length} documents → ${OUT_DIR}`);
}

main();
