import { Link } from "react-router-dom";
import { DocumentPreview } from "../document/DocumentPreview";
import { DiligenceFlagBadge } from "../diligence/DiligenceFlagBadge";
import { useDocumentPeekBlurb } from "../../hooks/useDocumentPeekBlurb";
import type { DocumentRecord, DocumentReview } from "../../types";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentPeekPanelProps {
  matterId: string;
  document: DocumentRecord | null;
  review: DocumentReview | null;
}

export function DocumentPeekPanel({ matterId, document: doc, review }: DocumentPeekPanelProps) {
  const blurb = useDocumentPeekBlurb(matterId, doc);

  if (!doc) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Preview</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-ink-muted">Select a document from the list</p>
          <p className="max-w-[220px] text-xs leading-relaxed text-ink-faint">
            <span className="font-medium text-ink-muted">Single click</span> — quick preview here
            <br />
            <span className="font-medium text-ink-muted">Double click</span> — full viewer with review, tasks &amp; AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-x-hidden">
      <div className="shrink-0 border-b border-line px-4 py-3 max-lg:px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-ink">Preview</h2>
            <p className="mt-1 break-words text-xs font-medium leading-snug text-ink">{doc.fileName}</p>
          </div>
          <Link
            to={`/matters/${matterId}/documents/${doc.id}`}
            className="shrink-0 rounded-md bg-brand px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-brand/90"
          >
            Open viewer
          </Link>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <DiligenceFlagBadge flag={review?.diligenceFlag ?? null} />
          <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            {doc.status}
          </span>
          <span className="font-mono text-[10px] text-ink-faint">{formatBytes(doc.sizeBytes)}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] text-ink-muted">{doc.categoryLabel}</p>

        <div className="mt-2.5 rounded-md border border-brand/20 bg-brand-soft/25 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">
            {blurb.source === "ai" ? "AI summary" : blurb.source === "catalog" ? "About this document" : "Summary"}
          </p>
          {blurb.loading && !blurb.text ? (
            <p className="mt-1 text-[11px] text-ink-faint animate-pulse">Generating summary…</p>
          ) : blurb.text ? (
            <p className="mt-1 line-clamp-4 text-[11px] leading-relaxed text-ink-muted">{blurb.text}</p>
          ) : blurb.error ? (
            <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">{blurb.error}</p>
          ) : (
            <p className="mt-1 text-[11px] text-ink-faint">No summary available.</p>
          )}
          {blurb.loading && blurb.text ? (
            <p className="mt-1 text-[10px] text-ink-faint animate-pulse">Refreshing with AI…</p>
          ) : null}
        </div>

        {review?.summary && review.summary !== blurb.text ? (
          <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-muted">
            <span className="font-medium text-ink-faint">Reviewer: </span>
            {review.summary}
          </p>
        ) : null}
        <p className="mt-2 text-[10px] text-ink-faint">
          Double-click the row for the full workspace — PDF, clause review, tasks &amp; AI.
        </p>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-surface-muted/30">
        <DocumentPreview matterId={matterId} document={doc} fileUrl={null} compact />
      </div>
    </div>
  );
}
