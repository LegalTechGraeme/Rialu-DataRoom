import { apiGet, apiJson } from "./apiClient";
import type { DocumentReview, DiligenceReportPayload } from "../types";

export async function fetchMatterReviews(
  matterId: string
): Promise<Record<string, DocumentReview>> {
  const data = await apiGet<{ reviews: Record<string, DocumentReview> }>(
    `/api/matters/${matterId}/reviews`
  );
  return data.reviews;
}

export async function saveDocumentReview(
  matterId: string,
  documentId: string,
  body: {
    diligenceFlag: DocumentReview["diligenceFlag"];
    summary: string;
    pertinentNotes: string;
  }
): Promise<DocumentReview> {
  return apiJson<{ review: DocumentReview }>(
    `/api/matters/${matterId}/documents/${documentId}/review`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    }
  ).then((data) => data.review);
}

export async function fetchDiligenceReport(
  matterId: string
): Promise<DiligenceReportPayload> {
  return apiGet<DiligenceReportPayload>(`/api/matters/${matterId}/diligence-report`);
}
