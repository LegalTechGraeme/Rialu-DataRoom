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
  const res = await fetch(`/api/matters/${matterId}/documents/${documentId}/text`);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as DocumentTextPayload;
}
