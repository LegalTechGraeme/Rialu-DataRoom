export type AiJobType =
  | "full-review"
  | "batch-analyze"
  | "document-analyze"
  | "synthesize"
  | "report";

export type AiJobStatus = "running" | "completed" | "cancelled" | "error";

export interface AiJob {
  id: string;
  matterId: string;
  type: AiJobType;
  label: string;
  status: AiJobStatus;
  phase: string;
  current: number;
  total: number;
  message: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export async function fetchAiJobs(matterId: string): Promise<AiJob[]> {
  const res = await fetch(`/api/matters/${matterId}/ai-jobs`);
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { jobs: AiJob[] };
  return data.jobs;
}

export async function cancelAiJob(jobId: string): Promise<AiJob> {
  const res = await fetch(`/api/ai-jobs/${jobId}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { job: AiJob };
  return data.job;
}

export function jobTypeLabel(type: AiJobType): string {
  switch (type) {
    case "full-review":
      return "Full diligence review";
    case "batch-analyze":
      return "Batch analysis";
    case "document-analyze":
      return "Document analysis";
    case "synthesize":
      return "Synthesis";
    case "report":
      return "Report generation";
    default:
      return type;
  }
}
