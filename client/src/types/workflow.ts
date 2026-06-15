import type { DemoRole } from "./users";

export type TaskType =
  | "document_review"
  | "folder_review"
  | "clause_review"
  | "escalation"
  | "follow_up";

export type TaskStatus = "open" | "in_progress" | "awaiting_review" | "completed";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: DemoRole;
  body: string;
  createdAt: string;
}

export interface ReviewTask {
  id: string;
  matterId: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  createdByName: string;
  createdByRole: DemoRole;
  assignedTo: string;
  assignedToName: string;
  assignedToRole: DemoRole;
  documentId: string | null;
  documentName: string | null;
  folderId: string | null;
  folderName: string | null;
  clauseRef: string | null;
  selectedText: string | null;
  textStart: number | null;
  textEnd: number | null;
  parentTaskId: string | null;
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummaryUser {
  user: {
    id: string;
    name: string;
    role: DemoRole;
    title: string;
    initials: string;
    color: string;
  };
  assigned: number;
  created: number;
  open: number;
  inProgress: number;
  awaitingReview: number;
}

export interface TaskSummary {
  total: number;
  open: number;
  completed: number;
  byUser: Record<string, TaskSummaryUser>;
}

export function taskTypeLabel(type: TaskType): string {
  switch (type) {
    case "document_review":
      return "Document review";
    case "folder_review":
      return "Folder review";
    case "clause_review":
      return "Clause review";
    case "escalation":
      return "Escalation";
    case "follow_up":
      return "Follow-up";
    default:
      return type;
  }
}

export function taskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In progress";
    case "awaiting_review":
      return "Awaiting review";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case "urgent":
      return "text-danger bg-danger/10 border-danger/30";
    case "high":
      return "text-warn bg-warn/10 border-warn/30";
    case "low":
      return "text-ink-faint bg-surface-muted border-line";
    default:
      return "text-brand bg-brand-soft border-brand/20";
  }
}
