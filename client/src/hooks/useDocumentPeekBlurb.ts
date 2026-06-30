import { useEffect, useState } from "react";
import { fetchDocumentAnalysis } from "../services/aiApi";
import type { DocumentRecord } from "../types";

type BlurbSource = "ai" | "catalog" | null;

interface PeekBlurbState {
  text: string | null;
  source: BlurbSource;
  loading: boolean;
  error: string | null;
}

export function useDocumentPeekBlurb(matterId: string, doc: DocumentRecord | null): PeekBlurbState {
  const [text, setText] = useState<string | null>(null);
  const [source, setSource] = useState<BlurbSource>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doc) {
      setText(null);
      setSource(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setError(null);
      setLoading(true);
      setText(null);
      setSource(null);

      try {
        const cached = await fetchDocumentAnalysis(matterId, doc.id);
        if (cancelled) return;

        if (cached?.summary?.trim()) {
          setText(cached.summary.trim());
          setSource("ai");
        } else if (doc.previewText?.trim()) {
          setText(doc.previewText.trim());
          setSource("catalog");
        } else {
          setError("No summary available for this document.");
        }
      } catch (e: unknown) {
        if (!cancelled) {
          if (doc.previewText?.trim()) {
            setText(doc.previewText.trim());
            setSource("catalog");
          } else {
            setError(e instanceof Error ? e.message : "Could not load summary");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [matterId, doc?.id, doc?.previewText]);

  return { text, source, loading, error };
}
