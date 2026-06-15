import { useCallback, useEffect, useState } from "react";
import type { DiligenceFlag, DocumentReview } from "../../types";
import { DiligenceFlagBadge } from "../diligence/DiligenceFlagBadge";
import { suggestReview } from "../../services/aiApi";
import { saveDocumentReview } from "../../services/reviewsApi";

const FLAGS: { value: DiligenceFlag; label: string; hint: string }[] = [
  { value: "green", label: "Green", hint: "No material issues" },
  { value: "amber", label: "Amber", hint: "Review or qualify" },
  { value: "red", label: "Red", hint: "Material risk / action required" },
];

interface DiligenceReviewPanelProps {
  matterId: string;
  documentId: string;
  initialReview: DocumentReview | null;
  onSaved?: (review: DocumentReview) => void;
}

export function DiligenceReviewPanel({
  matterId,
  documentId,
  initialReview,
  onSaved,
}: DiligenceReviewPanelProps) {
  const [diligenceFlag, setDiligenceFlag] = useState<DocumentReview["diligenceFlag"]>(
    initialReview?.diligenceFlag ?? null
  );
  const [summary, setSummary] = useState(initialReview?.summary ?? "");
  const [pertinentNotes, setPertinentNotes] = useState(initialReview?.pertinentNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initialReview?.updatedAt ?? null);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setDiligenceFlag(initialReview?.diligenceFlag ?? null);
    setSummary(initialReview?.summary ?? "");
    setPertinentNotes(initialReview?.pertinentNotes ?? "");
    setSavedAt(initialReview?.updatedAt ?? null);
  }, [documentId, initialReview]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const review = await saveDocumentReview(matterId, documentId, {
        diligenceFlag,
        summary,
        pertinentNotes,
      });
      setSavedAt(review.updatedAt);
      onSaved?.(review);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save review");
    } finally {
      setSaving(false);
    }
  }, [matterId, documentId, diligenceFlag, summary, pertinentNotes, onSaved]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Diligence assessment
          </p>
          <DiligenceFlagBadge flag={diligenceFlag} />
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          Record your flag and notes for the due diligence report. Saved on the server for this
          matter.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-ink-muted">Traffic light</legend>
        <div className="grid grid-cols-3 gap-2">
          {FLAGS.map((f) => {
            const selected = diligenceFlag === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setDiligenceFlag(f.value)}
                className={[
                  "rounded-lg border px-2 py-2 text-left transition-colors",
                  selected
                    ? f.value === "green"
                      ? "border-ok bg-ok/15 ring-1 ring-ok/50"
                      : f.value === "amber"
                        ? "border-warn bg-warn/15 ring-1 ring-warn/50"
                        : "border-danger bg-danger/15 ring-1 ring-danger/50"
                    : "border-line bg-surface hover:bg-surface-muted",
                ].join(" ")}
              >
                <span className="block text-sm font-semibold text-ink">{f.label}</span>
                <span className="mt-0.5 block text-[10px] leading-tight text-ink-muted">
                  {f.hint}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setDiligenceFlag(null)}
          className="mt-2 text-xs text-ink-muted underline hover:text-ink"
        >
          Clear flag
        </button>
      </fieldset>

      <label className="block">
        <span className="text-xs font-medium text-ink-muted">High-level summary</span>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          placeholder="Brief description of the document and its relevance to the transaction…"
          className="mt-1 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-ink-muted">Pertinent information</span>
        <textarea
          value={pertinentNotes}
          onChange={(e) => setPertinentNotes(e.target.value)}
          rows={5}
          placeholder="Key clauses, dates, parties, caps, change-of-control triggers, follow-up actions…"
          className="mt-1 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>

      <div className="rounded-lg border border-brand/20 bg-brand-soft/40 px-3 py-3">
        <p className="text-xs font-medium text-brand">AI assist (Groq)</p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
          Runs document analysis and pre-fills your diligence fields. Review before saving.
        </p>
        <button
          type="button"
          disabled={aiLoading}
          onClick={() => {
            setAiLoading(true);
            setError(null);
            suggestReview(matterId, documentId)
              .then((s) => {
                if (s.diligenceFlag) setDiligenceFlag(s.diligenceFlag);
                setSummary(s.summary);
                setPertinentNotes(s.pertinentNotes);
              })
              .catch((e: unknown) =>
                setError(e instanceof Error ? e.message : "AI suggestion failed")
              )
              .finally(() => setAiLoading(false));
          }}
          className="mt-2 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {aiLoading ? "Generating…" : "Generate AI suggestion"}
        </button>
      </div>

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : savedAt ? (
        <p className="text-xs text-ink-faint">Last saved {new Date(savedAt).toLocaleString()}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-muted disabled:opacity-60 dark:text-slate-950"
      >
        {saving ? "Saving…" : "Save diligence notes"}
      </button>
    </div>
  );
}
