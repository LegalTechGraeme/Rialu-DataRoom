import { apiJson } from "./apiClient";
import type { DemoUser } from "../types/users";
import type { ReviewTask, TaskSummary } from "../types/workflow";

export async function fetchTask(matterId: string, taskId: string): Promise<ReviewTask> {
  const data = await apiJson<{ task: ReviewTask }>(
    `/api/matters/${matterId}/tasks/${taskId}`
  );
  return data.task;
}

export async function fetchDemoUsers(): Promise<DemoUser[]> {
  const data = await apiJson<{ users: DemoUser[] }>("/api/users");
  return data.users;
}

export async function fetchTasks(
  matterId: string,
  filters?: {
    assignedTo?: string;
    documentId?: string;
    folderId?: string;
    status?: string;
  }
): Promise<ReviewTask[]> {
  const params = new URLSearchParams();
  if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
  if (filters?.documentId) params.set("documentId", filters.documentId);
  if (filters?.folderId) params.set("folderId", filters.folderId);
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  const data = await apiJson<{ tasks: ReviewTask[] }>(
    `/api/matters/${matterId}/tasks${qs ? `?${qs}` : ""}`
  );
  return data.tasks;
}

export async function fetchTaskSummary(matterId: string): Promise<TaskSummary> {
  const data = await apiJson<{ summary: TaskSummary }>(
    `/api/matters/${matterId}/tasks/summary`
  );
  return data.summary;
}

export interface CreateTaskInput {
  type?: ReviewTask["type"];
  title: string;
  description?: string;
  priority?: ReviewTask["priority"];
  createdBy: string;
  assignedTo: string;
  documentId?: string;
  documentName?: string;
  folderId?: string;
  folderName?: string;
  clauseRef?: string;
  selectedText?: string;
  textStart?: number;
  textEnd?: number;
  parentTaskId?: string;
}

export async function createTask(matterId: string, input: CreateTaskInput): Promise<ReviewTask> {
  const data = await apiJson<{ task: ReviewTask }>(`/api/matters/${matterId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.task;
}

export async function updateTask(
  matterId: string,
  taskId: string,
  patch: {
    status?: ReviewTask["status"];
    assignedTo?: string;
    priority?: ReviewTask["priority"];
    description?: string;
    actorId?: string;
  }
): Promise<ReviewTask> {
  const data = await apiJson<{ task: ReviewTask }>(
    `/api/matters/${matterId}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  return data.task;
}

export async function addTaskComment(
  matterId: string,
  taskId: string,
  authorId: string,
  body: string
): Promise<ReviewTask> {
  const data = await apiJson<{ task: ReviewTask }>(
    `/api/matters/${matterId}/tasks/${taskId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorId, body }),
    }
  );
  return data.task;
}
