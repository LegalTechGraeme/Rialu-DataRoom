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
  const res = await fetch("/api/matters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { matter: import("../types").Matter };
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

  const res = await fetch(`/api/matters/${matterId}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<UploadResult>;
}

export async function startFullReview(matterId: string) {
  const res = await fetch(`/api/matters/${matterId}/full-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { job: FullReviewJob };
  return data.job;
}

export async function fetchFullReviewStatus(matterId: string) {
  const res = await fetch(`/api/matters/${matterId}/full-review/status`);
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { job: FullReviewJob };
  return data.job;
}

export async function refileDocuments(matterId: string) {
  const res = await fetch(`/api/matters/${matterId}/refile-documents`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ updated: number; total: number }>;
}

export function downloadExport(matterId: string, format: "pptx" | "xlsx") {
  const a = document.createElement("a");
  a.href = `/api/matters/${matterId}/export/${format}`;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
