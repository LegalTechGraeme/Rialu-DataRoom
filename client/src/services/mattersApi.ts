import { apiGet } from "./apiClient";
import type {
  ActivityItem,
  DashboardPayload,
  DocumentDetailPayload,
  DocumentRecord,
  FolderDocumentsPayload,
  FolderNode,
  Matter,
} from "../types";

export async function fetchMatters(): Promise<Matter[]> {
  const data = await apiGet<{ matters: Matter[] }>("/api/matters");
  return data.matters;
}

export async function fetchMatter(matterId: string): Promise<Matter> {
  const data = await apiGet<{ matter: Matter }>(`/api/matters/${matterId}`);
  return data.matter;
}

export async function fetchDashboard(matterId: string): Promise<DashboardPayload> {
  return apiGet<DashboardPayload>(`/api/matters/${matterId}/dashboard`);
}

export async function fetchFolderTree(matterId: string): Promise<FolderNode> {
  const data = await apiGet<{ tree: FolderNode }>(`/api/matters/${matterId}/tree`);
  return data.tree;
}

export async function fetchFolderDocuments(
  matterId: string,
  folderId: string,
  recursive = true
): Promise<FolderDocumentsPayload> {
  const path = recursive
    ? `/api/matters/${matterId}/folders/${folderId}/documents-recursive`
    : `/api/matters/${matterId}/folders/${folderId}/documents`;
  return apiGet<FolderDocumentsPayload>(path);
}

export async function fetchDocumentDetail(
  matterId: string,
  documentId: string
): Promise<DocumentDetailPayload> {
  return apiGet<DocumentDetailPayload>(
    `/api/matters/${matterId}/documents/${documentId}`
  );
}

export type { ActivityItem, DocumentRecord, FolderNode, Matter };
