import { apiJson } from "./apiClient";

export interface DocumentTextPayload {
  text: string;
  truncated: boolean;
  charCount: number;
  documentId: string;
  fileName: string;
}

export async function fetchDocumentText(
  matterId: string,
  documentId: string
): Promise<DocumentTextPayload> {
  return apiJson<DocumentTextPayload>(
    `/api/matters/${matterId}/documents/${documentId}/text`
  );
}
