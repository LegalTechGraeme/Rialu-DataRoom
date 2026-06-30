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
  mobile?: boolean;
}

export function DocumentPeekPanel({ matterId, document: doc, review, mobile = false }: DocumentPeekPanelProps) {
  const blurb = useDocumentPeekBlurb(matterId, doc);

  if (!doc) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Preview</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-ink-muted">Select a document from the list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="shrink-0 space-y-3 px-5 py-4">
        {!mobile ? (
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
        ) : (
          <Link
            to={`/matters/${matterId}/documents/${doc.id}`}
            className="inline-flex rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand/90"
          >
            Open full viewer
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <DiligenceFlagBadge flag={review?.diligenceFlag ?? null} />
          <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            {doc.status}
          </span>
          <span className="font-mono text-xs text-ink-faint">{formatBytes(doc.sizeBytes)}</span>
        </div>

        {blurb.text ? (
          <p className="text-sm leading-relaxed text-ink-muted">{blurb.text}</p>
        ) : blurb.loading ? (
          <p className="text-sm text-ink-faint">Loading summary…</p>
        ) : null}
      </div>

      <div className="h-[min(55dvh,420px)] overflow-hidden border-t border-line bg-surface-elevated">
        <DocumentPreview matterId={matterId} document={doc} fileUrl={null} compact />
      </div>
    </div>
  );
}
