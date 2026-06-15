export type DocumentStatus = "pending" | "reviewed" | "flagged";

export interface Matter {
  id: string;
  name: string;
  clientRef?: string;
  openedAt: string;
  dealType?: string;
  source?: "user" | "simulation";
  /** Server-provided default selection for the data room explorer */
  explorerDefaultFolderId?: string;
}

export interface FolderNode {
  id: string;
  name: string;
  matterId: string;
  parentId: string | null;
  children: FolderNode[];
}

export interface DocumentRecord {
  id: string;
  matterId: string;
  folderId: string;
  fileName: string;
  uploadedAt: string;
  categoryLabel: string;
  status: DocumentStatus;
  mimeType: string;
  sizeBytes: number;
  storagePath?: string;
  previewText?: string;
}

export type ActivityKind = "upload" | "review" | "flag" | "folder" | "comment";

export interface ActivityItem {
  id: string;
  matterId: string;
  kind: ActivityKind;
  message: string;
  occurredAt: string;
  actorLabel?: string;
}

export interface DashboardPayload {
  stats: {
    totalDocuments: number;
    folders: number;
    reviewedPercent: number;
    flaggedIssues: number;
  };
  recentActivity: ActivityItem[];
}

export interface FolderDocumentsPayload {
  folderId: string;
  folderName: string;
  documents: DocumentRecord[];
}

export type DiligenceFlag = "green" | "amber" | "red";

export interface DocumentReview {
  documentId: string;
  matterId: string;
  diligenceFlag: DiligenceFlag | null;
  summary: string;
  pertinentNotes: string;
  updatedAt: string;
}

export interface DocumentDetailPayload {
  document: DocumentRecord;
  folder: { id: string; name: string } | null;
  fileUrl: string | null;
  review: DocumentReview | null;
}

export interface DiligenceReportEntry {
  document: DocumentRecord;
  folderId: string;
  folderName: string;
  review: DocumentReview | null;
}

export interface DiligenceReportPayload {
  entries: DiligenceReportEntry[];
  counts: {
    green: number;
    amber: number;
    red: number;
    unreviewed: number;
  };
  total: number;
}
