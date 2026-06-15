import { apiGet } from "./apiClient";
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
  const res = await fetch(
    `/api/matters/${matterId}/documents/${documentId}/review`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const data = (await res.json()) as { review: DocumentReview };
  return data.review;
}

export async function fetchDiligenceReport(
  matterId: string
): Promise<DiligenceReportPayload> {
  return apiGet<DiligenceReportPayload>(`/api/matters/${matterId}/diligence-report`);
}
