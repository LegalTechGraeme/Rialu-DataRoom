export const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/** Build full API URL (uses VITE_API_BASE in production, relative /api in dev). */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** Resolve document file download/preview URL (API may return a relative /api/... path). */
export function documentFileUrl(
  matterId: string,
  documentId: string,
  fileUrl?: string | null
): string {
  if (fileUrl?.startsWith("http://") || fileUrl?.startsWith("https://")) {
    return fileUrl;
  }
  const path = fileUrl ?? `/api/matters/${matterId}/documents/${documentId}/file`;
  return apiUrl(path);
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path, {
    headers: { Accept: "application/json" },
  });
  return parseJson<T>(res);
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  return parseJson<T>(res);
}
