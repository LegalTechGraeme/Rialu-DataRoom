import { Link, useNavigate } from "react-router-dom";
import type { DocumentRecord, DocumentReview, DocumentStatus } from "../../types";
import { DiligenceFlagBadge } from "../diligence/DiligenceFlagBadge";

function statusBadge(status: DocumentStatus) {
  const base =
    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide";
  switch (status) {
    case "reviewed":
      return `${base} border-ok/30 bg-ok/10 text-ok`;
    case "flagged":
      return `${base} border-danger/30 bg-danger/10 text-danger`;
    default:
      return `${base} border-line bg-surface-muted text-ink-muted`;
  }
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentTableProps {
  matterId: string;
  folderName: string;
  documents: DocumentRecord[];
  reviews?: Record<string, DocumentReview>;
  selectedDocumentId?: string | null;
  onSelectDocument?: (doc: DocumentRecord) => void;
}

export function DocumentTable({
  matterId,
  folderName,
  documents,
  reviews = {},
  selectedDocumentId = null,
  onSelectDocument,
}: DocumentTableProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Documents</h2>
        <p className="text-xs text-ink-muted">
          Folder: <span className="font-medium text-ink">{folderName}</span> ·{" "}
          {documents.length} item{documents.length === 1 ? "" : "s"} · Click a row to preview
          below · Double-click or use View for the full viewer
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface-elevated shadow-sm dark:bg-surface-elevated">
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Diligence</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Room status</th>
              <th className="px-4 py-2 font-medium text-right">Size</th>
              <th className="px-4 py-2 font-medium text-right"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No documents in this folder.
                </td>
              </tr>
            ) : (
              documents.map((d) => (
                <tr
                  key={d.id}
                  className={[
                    "cursor-pointer hover:bg-surface-muted/80",
                    selectedDocumentId === d.id ? "bg-brand-soft/60 ring-1 ring-inset ring-brand/20" : "",
                  ].join(" ")}
                  onClick={() => onSelectDocument?.(d)}
                  onDoubleClick={() =>
                    navigate(`/matters/${matterId}/documents/${d.id}`, {
                      state: { fromExplorer: true },
                    })
                  }
                >
                  <td className="max-w-[280px] px-4 py-2.5">
                    <span className="block truncate font-medium text-ink">{d.fileName}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <DiligenceFlagBadge flag={reviews[d.id]?.diligenceFlag ?? null} />
                  </td>
                  <td className="max-w-[180px] px-4 py-2.5 text-ink-muted">
                    <span className="line-clamp-2">{d.categoryLabel}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={statusBadge(d.status)}>{d.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs text-ink-muted">
                    {formatBytes(d.sizeBytes)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    <Link
                      to={`/matters/${matterId}/documents/${d.id}`}
                      className="btn-ghost !px-2 !py-1 text-xs text-brand"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
