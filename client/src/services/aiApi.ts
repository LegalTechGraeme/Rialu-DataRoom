import { apiGet } from "./apiClient";
import type {
  ChatResponse,
  DocumentAnalysis,
  GeneratedReport,
  MatterSynthesis,
  AiRiskIssue,
} from "../types";

export async function fetchAiStatus() {
  return apiGet<{ configured: boolean; provider: string; ok?: boolean; error?: string }>(
    "/api/status"
  );
}

export async function fetchDocumentAnalysis(matterId: string, documentId: string) {
  const data = await apiGet<{ analysis: DocumentAnalysis | null }>(
    `/api/matters/${matterId}/documents/${documentId}/analysis`
  );
  return data.analysis;
}

export async function analyzeDocument(
  matterId: string,
  documentId: string,
  force = false
) {
  const res = await fetch(`/api/matters/${matterId}/documents/${documentId}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force, async: false }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { analysis: DocumentAnalysis };
  return data.analysis;
}

/** Starts analysis in background; returns job for AI processes widget. */
export async function startDocumentAnalysis(
  matterId: string,
  documentId: string,
  force = false
) {
  const res = await fetch(`/api/matters/${matterId}/documents/${documentId}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force, async: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { job: import("./aiJobsApi").AiJob };
  return data.job;
}

/** Starts background analysis and polls until results are ready. */
export async function runDocumentAnalysis(
  matterId: string,
  documentId: string,
  force = false
) {
  const { fetchAiJobs } = await import("./aiJobsApi");
  const job = await startDocumentAnalysis(matterId, documentId, force);
  const maxAttempts = 90;
  for (let i = 0; i < maxAttempts; i++) {
    const a = await fetchDocumentAnalysis(matterId, documentId);
    if (a?.analyzedAt) return a;

    const jobs = await fetchAiJobs(matterId);
    const tracked = jobs.find((j) => j.id === job.id);
    if (tracked?.status === "error") throw new Error(tracked.error ?? "Analysis failed");
    if (tracked?.status === "cancelled") throw new Error("Analysis cancelled");
    if (tracked?.status === "completed") {
      const done = await fetchDocumentAnalysis(matterId, documentId);
      if (done) return done;
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Analysis timed out — check the AI processes widget");
}

export async function suggestReview(matterId: string, documentId: string) {
  const res = await fetch(
    `/api/matters/${matterId}/documents/${documentId}/suggest-review`,
    { method: "POST", headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    diligenceFlag: "green" | "amber" | "red";
    summary: string;
    pertinentNotes: string;
  }>;
}

export async function analyzeBatch(matterId: string, limit = 8) {
  const res = await fetch(`/api/matters/${matterId}/analyze-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ job: import("./aiJobsApi").AiJob }>;
}

export async function synthesizeMatter(matterId: string, force = false) {
  const res = await fetch(`/api/matters/${matterId}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { synthesis: MatterSynthesis };
  return data.synthesis;
}

export async function fetchMatterSynthesis(matterId: string) {
  const data = await apiGet<{ synthesis: MatterSynthesis | null }>(
    `/api/matters/${matterId}/synthesis`
  );
  return data.synthesis;
}

export async function fetchAiRisks(matterId: string) {
  const data = await apiGet<{ issues: AiRiskIssue[] }>(`/api/matters/${matterId}/ai-risks`);
  return data.issues;
}

export async function sendChat(
  matterId: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
) {
  const res = await fetch(`/api/matters/${matterId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { response: ChatResponse };
  return data.response;
}

export async function generateReport(matterId: string) {
  const res = await fetch(`/api/matters/${matterId}/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<GeneratedReport>;
}
