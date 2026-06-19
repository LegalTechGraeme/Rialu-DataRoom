import { useEffect, useState } from "react";
import { fetchAiStatus, fetchDocumentAnalysis, startDocumentAnalysis } from "../services/aiApi";
import type { DocumentRecord } from "../types";

type BlurbSource = "ai" | "catalog" | null;

interface PeekBlurbState {
  text: string | null;
  source: BlurbSource;
  loading: boolean;
  error: string | null;
}

const POLL_MS = 1500;
const MAX_POLLS = 40;

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
          setLoading(false);
          return;
        }

        if (doc.previewText?.trim()) {
          setText(doc.previewText.trim());
          setSource("catalog");
        }

        const status = await fetchAiStatus();
        if (cancelled) return;

        if (!status.configured || !status.ok) {
          setLoading(false);
          if (!doc.previewText?.trim()) {
            setError("AI not configured — add GROQ_API_KEY on the server for summaries.");
          }
          return;
        }

        await startDocumentAnalysis(matterId, doc.id, false);

        for (let i = 0; i < MAX_POLLS && !cancelled; i++) {
          await new Promise((r) => setTimeout(r, POLL_MS));
          const analysis = await fetchDocumentAnalysis(matterId, doc.id);
          if (cancelled) return;
          if (analysis?.summary?.trim()) {
            setText(analysis.summary.trim());
            setSource("ai");
            setLoading(false);
            return;
          }
        }

        if (!cancelled) {
          setLoading(false);
          if (!doc.previewText?.trim()) {
            setError("Summary is taking longer than expected — open the full viewer to retry.");
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setLoading(false);
          if (!doc.previewText?.trim()) {
            setError(e instanceof Error ? e.message : "Could not load summary");
          }
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [matterId, doc?.id, doc?.previewText]);

  return { text, source, loading, error };
}
