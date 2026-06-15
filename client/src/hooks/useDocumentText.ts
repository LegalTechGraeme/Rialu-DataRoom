import { useEffect, useState } from "react";
import { fetchDocumentText } from "../services/documentsApi";
import { isPreviewTextUsable } from "../lib/textMatch";
import type { DocumentRecord } from "../types";

function resolveInitialText(doc: DocumentRecord): string | null {
  const preview = doc.previewText?.trim();
  return preview && isPreviewTextUsable(preview) ? preview : null;
}

export function useDocumentText(matterId: string, doc: DocumentRecord) {
  const [text, setText] = useState<string | null>(() => resolveInitialText(doc));
  const [loading, setLoading] = useState(() => !resolveInitialText(doc));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initial = resolveInitialText(doc);
    setText(initial);
    setError(null);
    setLoading(!initial);

    let cancelled = false;

    fetchDocumentText(matterId, doc.id)
      .then((payload) => {
        if (cancelled) return;
        const fromApi = isPreviewTextUsable(payload.text) ? payload.text : "";
        const fallback = resolveInitialText(doc) ?? "";
        const content = fromApi || fallback;
        if (!content) {
          setError("Could not load document text");
          setText(null);
          return;
        }
        setText(content);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        if (initial) {
          setText(initial);
          setError(null);
        } else {
          setError("Could not load document text");
          setText(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [matterId, doc.id, doc.previewText]);

  return { text, loading, error };
}
