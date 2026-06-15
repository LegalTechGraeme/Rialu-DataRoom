import { Router } from "express";
import { isGroqConfigured } from "../config.js";
import { analyzeDocument } from "../ai/documentAnalyzer.js";
import {
  getDocumentAnalysis,
  getAllDocumentAnalyses,
  getMatterSynthesis,
} from "../ai/analysisStore.js";
import { synthesizeMatter, buildRiskRegister } from "../ai/matterIntelligence.js";
import { chatOverMatter } from "../ai/chatService.js";
import { generateDiligenceReport } from "../ai/reportGenerator.js";
import { resolveDocumentFile } from "../fileResolver.js";
import { startBatchAnalyze } from "../batchAnalyzeJob.js";
import {
  createJob,
  completeJob,
  failJob,
  isJobCancelled,
  updateJob,
  getJob,
} from "../aiJobManager.js";

/** @param {(matterId: string) => import('../types.js').DocumentRecord[]} getMatterDocs */
/** @param {(matterId: string, docId: string) => import('../types.js').DocumentRecord | undefined} findDoc */
/** @param {(matterId: string) => import('../types.js').Matter | null} getMatter */

export function createAiRouter(getMatterDocs, findDoc, getMatter) {
  const router = Router();

  router.get("/status", async (_req, res) => {
    if (!isGroqConfigured()) {
      return res.json({ configured: false, provider: "groq", ok: false });
    }
    try {
      const { groqChat } = await import("../ai/groqClient.js");
      await groqChat({
        system: "Reply with JSON only.",
        user: 'Return {"ok":true}',
        json: true,
        temperature: 0,
      });
      res.json({ configured: true, provider: "groq", ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Groq check failed";
      res.json({
        configured: true,
        provider: "groq",
        ok: false,
        error: msg.includes("401") || msg.includes("expired_api_key")
          ? "Groq API key is invalid or expired — update server/.env and restart the API"
          : msg,
      });
    }
  });

  router.get("/matters/:matterId/documents/:documentId/analysis", (req, res) => {
    const analysis = getDocumentAnalysis(req.params.matterId, req.params.documentId);
    res.json({ analysis });
  });

  router.post("/matters/:matterId/documents/:documentId/analyze", async (req, res) => {
    try {
      const doc = findDoc(req.params.matterId, req.params.documentId);
      if (!doc?.storagePath) return res.status(404).json({ error: "Document not found" });
      const abs = resolveDocumentFile(req.params.matterId, doc.storagePath);
      const force = req.body?.force === true;
      const runInBackground = req.body?.async !== false;

      const job = createJob({
        matterId: req.params.matterId,
        type: "document-analyze",
        label: `Analyze: ${doc.fileName}`,
        total: 1,
      });
      updateJob(job.id, { phase: "analyze", message: `Analyzing ${doc.fileName}…` });

      const run = async () => {
        try {
          if (isJobCancelled(job.id)) return null;
          const analysis = await analyzeDocument(doc, abs, req.params.matterId, force);
          if (!isJobCancelled(job.id)) {
            updateJob(job.id, { current: 1, message: `Analysis complete: ${doc.fileName}` });
            completeJob(job.id, `Analysis complete: ${doc.fileName}`);
          }
          return analysis;
        } catch (e) {
          if (!isJobCancelled(job.id)) {
            failJob(job.id, e instanceof Error ? e.message : "Analysis failed");
          }
          throw e;
        }
      };

      if (runInBackground) {
        run();
        return res.json({ job });
      }

      const analysis = await run();
      res.json({ analysis, job: getJob(job.id) });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Analysis failed" });
    }
  });

  router.post("/matters/:matterId/analyze-batch", async (req, res) => {
    try {
      const docs = getMatterDocs(req.params.matterId);
      const limit = Math.min(req.body?.limit ?? 8, 50);
      const force = req.body?.force === true;
      const job = startBatchAnalyze(req.params.matterId, docs, { limit, force });
      res.json({ job });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Batch failed" });
    }
  });

  router.get("/matters/:matterId/analyses", (req, res) => {
    res.json({ analyses: getAllDocumentAnalyses(req.params.matterId) });
  });

  router.post("/matters/:matterId/synthesize", async (req, res) => {
    try {
      const docs = getMatterDocs(req.params.matterId);
      const synthesis = await synthesizeMatter(
        req.params.matterId,
        docs,
        req.body?.force === true
      );
      res.json({ synthesis });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Synthesis failed" });
    }
  });

  router.get("/matters/:matterId/synthesis", (req, res) => {
    res.json({ synthesis: getMatterSynthesis(req.params.matterId) });
  });

  router.get("/matters/:matterId/ai-risks", (req, res) => {
    const docs = getMatterDocs(req.params.matterId);
    const issues = buildRiskRegister(req.params.matterId, docs);
    res.json({ issues });
  });

  router.post("/matters/:matterId/chat", async (req, res) => {
    try {
      const { message, history } = req.body ?? {};
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message required" });
      }
      const docs = getMatterDocs(req.params.matterId);
      const response = await chatOverMatter(
        req.params.matterId,
        message,
        docs,
        Array.isArray(history) ? history : []
      );
      res.json({ response });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Chat failed" });
    }
  });

  router.post("/matters/:matterId/generate-report", async (req, res) => {
    try {
      const m = getMatter(req.params.matterId);
      const docs = getMatterDocs(req.params.matterId);
      const payload = await generateDiligenceReport(
        req.params.matterId,
        m?.name ?? req.params.matterId,
        docs
      );
      res.json(payload);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Report failed" });
    }
  });

  router.post("/matters/:matterId/documents/:documentId/suggest-review", async (req, res) => {
    try {
      const doc = findDoc(req.params.matterId, req.params.documentId);
      if (!doc) return res.status(404).json({ error: "Document not found" });
      let analysis = getDocumentAnalysis(req.params.matterId, doc.id);
      if (!analysis && doc.storagePath) {
        const abs = resolveDocumentFile(req.params.matterId, doc.storagePath);
        analysis = await analyzeDocument(doc, abs, req.params.matterId, false);
      }
      if (!analysis) return res.status(404).json({ error: "No analysis available" });
      res.json({
        diligenceFlag: analysis.suggested_diligence_flag ?? "amber",
        summary: analysis.suggested_summary ?? analysis.summary,
        pertinentNotes: analysis.suggested_pertinent_notes ?? "",
        analysis,
      });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Suggest failed" });
    }
  });

  return router;
}
