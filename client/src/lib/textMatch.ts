/** Locate snippet in document text for highlighting */
export function findTextInDocument(
  fullText: string,
  snippet: string
): { start: number; end: number } | null {
  if (!snippet?.trim() || !fullText) return null;

  const raw = snippet.trim();
  for (const len of [raw.length, 120, 80, 50, 30]) {
    const part = raw.slice(0, len);
    if (part.length < 12) continue;
    const idx = fullText.indexOf(part);
    if (idx >= 0) return { start: idx, end: idx + part.length };
  }

  const escaped = raw
    .slice(0, 80)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  try {
    const m = fullText.match(new RegExp(escaped, "i"));
    if (m?.index != null) return { start: m.index, end: m.index + m[0].length };
  } catch {
    /* ignore bad pattern */
  }

  return null;
}

export function isPreviewTextUsable(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  return !text.startsWith("[Preview not available");
}
