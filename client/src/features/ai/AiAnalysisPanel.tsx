import { useCallback, useEffect, useState } from "react";
import {
  fetchDocumentAnalysis,
  runDocumentAnalysis,
  synthesizeMatter,
} from "../../services/aiApi";
import { DocumentAnalysisView } from "../../components/ai/DocumentAnalysisView";
import type { DocumentAnalysis, DocumentRecord } from "../../types";

interface AiAnalysisPanelProps {
  matterId: string;
  selectedDocument: DocumentRecord | null;
  documentsInFolder: DocumentRecord[];
}

export function AiAnalysisPanel({
  matterId,
  selectedDocument,
  documentsInFolder,
}: AiAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synthLoading, setSynthLoading] = useState(false);

  const doc = selectedDocument ?? documentsInFolder[0] ?? null;

  const load = useCallback(async () => {
    if (!doc) return;
    setError(null);
    try {
      const a = await fetchDocumentAnalysis(matterId, doc.id);
      setAnalysis(a);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analysis");
    }
  }, [matterId, doc]);

  useEffect(() => {
    setAnalysis(null);
    void load();
  }, [load]);

  const runAnalyze = async () => {
    if (!doc) return;
    setLoading(true);
    setError(null);
    try {
      const a = await runDocumentAnalysis(matterId, doc.id, true);
      setAnalysis(a);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const runSynthesize = async () => {
    setSynthLoading(true);
    setError(null);
    try {
      await synthesizeMatter(matterId, true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Synthesis failed");
    } finally {
      setSynthLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-line/70 bg-brand-soft/20">
      <div className="border-b border-line/70 px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">AI copilot</h2>
        <p className="text-[11px] text-ink-muted">Powered by Groq · track jobs bottom-right</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line/70 p-2">
        <button
          type="button"
          disabled={!doc || loading}
          onClick={() => void runAnalyze()}
          className="rounded-md bg-brand px-2.5 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Analyze doc"}
        </button>
        <button
          type="button"
          disabled={synthLoading}
          onClick={() => void runSynthesize()}
          className="rounded-md border border-line bg-surface-elevated px-2.5 py-1.5 text-[11px] font-medium text-ink-muted"
        >
          {synthLoading ? "Synthesizing…" : "Cross-doc sync"}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {!doc ? (
          <p className="text-xs text-ink-muted">Select a folder with documents to analyze.</p>
        ) : (
          <p className="mb-3 truncate text-xs font-medium text-ink">{doc.fileName}</p>
        )}
        {error ? (
          <p className="mb-3 rounded-md border border-danger/30 bg-danger/10 p-2 text-xs text-danger">
            {error}
          </p>
        ) : null}
        {analysis ? (
          <DocumentAnalysisView analysis={analysis} />
        ) : doc && !loading ? (
          <p className="text-xs text-ink-muted">
            No analysis yet. Click Analyze doc to extract clauses and risks.
          </p>
        ) : null}
      </div>
    </div>
  );
}
