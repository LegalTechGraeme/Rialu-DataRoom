import { apiJson, apiUrl } from "./apiClient";

export interface UploadResult {
  uploaded: number;
  autoClassify: boolean;
  results: {
    fileName: string;
    ok: boolean;
    documentId?: string;
    folderId?: string;
    categoryLabel?: string;
    error?: string;
  }[];
}

export interface FullReviewJob {
  status: "idle" | "running" | "completed" | "error";
  phase: string;
  current: number;
  total: number;
  message: string;
  error?: string;
  completedAt?: string;
}

export async function createMatter(input: {
  name: string;
  clientRef?: string;
  dealType?: string;
}) {
  const data = await apiJson<{ matter: import("../types").Matter }>("/api/matters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.matter;
}

export async function uploadDocuments(
  matterId: string,
  files: File[],
  autoClassify = true
): Promise<UploadResult> {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  if (!autoClassify) form.append("autoClassify", "false");

  return apiJson<UploadResult>(`/api/matters/${matterId}/upload`, {
    method: "POST",
    body: form,
  });
}

export async function startFullReview(matterId: string) {
  const data = await apiJson<{ job: FullReviewJob }>(`/api/matters/${matterId}/full-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  return data.job;
}

export async function fetchFullReviewStatus(matterId: string) {
  const data = await apiJson<{ job: FullReviewJob }>(
    `/api/matters/${matterId}/full-review/status`
  );
  return data.job;
}

export async function cancelFullReview(matterId: string) {
  const data = await apiJson<{ job: FullReviewJob }>(
    `/api/matters/${matterId}/full-review/cancel`,
    { method: "POST" }
  );
  return data.job;
}

export async function refileDocuments(matterId: string) {
  return apiJson<{ updated: number; total: number }>(
    `/api/matters/${matterId}/refile-documents`,
    { method: "POST" }
  );
}

export function downloadExport(matterId: string, format: "pptx" | "xlsx") {
  const a = document.createElement("a");
  a.href = apiUrl(`/api/matters/${matterId}/export/${format}`);
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
