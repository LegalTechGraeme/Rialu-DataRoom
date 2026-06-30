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
    <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-x-hidden">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Documents</h2>
        <p className="text-xs text-ink-muted">
          {documents.length} document{documents.length === 1 ? "" : "s"} in{" "}
          <span className="font-medium text-ink">{folderName}</span>
        </p>
      </div>

      {/* Mobile card list */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden lg:hidden">
        {documents.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">No documents in this folder.</p>
        ) : (
          <ul className="divide-y divide-line">
            {documents.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={[
                    "w-full px-4 py-3 text-left transition-colors",
                    selectedDocumentId === d.id ? "bg-brand-soft/60" : "hover:bg-surface-muted/80",
                  ].join(" ")}
                  onClick={() => onSelectDocument?.(d)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 break-words font-medium text-ink">{d.fileName}</p>
                    <DiligenceFlagBadge flag={reviews[d.id]?.diligenceFlag ?? null} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{d.categoryLabel}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={statusBadge(d.status)}>{d.status}</span>
                    <span className="font-mono text-[11px] text-ink-faint">{formatBytes(d.sizeBytes)}</span>
                  </div>
                </button>
                <div className="border-t border-line/60 px-4 pb-3">
                  <Link
                    to={`/matters/${matterId}/documents/${d.id}`}
                    className="inline-flex min-h-[44px] items-center text-xs font-medium text-brand"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open full viewer →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden min-h-0 flex-1 overflow-auto lg:block">
        <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface-elevated shadow-sm dark:bg-surface-elevated">
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
              <th className="w-[34%] min-w-[260px] px-4 py-2 font-medium">Name</th>
              <th className="w-[11%] min-w-[96px] px-4 py-2 font-medium">Diligence</th>
              <th className="w-[26%] min-w-[200px] px-4 py-2 font-medium">Category</th>
              <th className="w-[13%] min-w-[108px] px-4 py-2 font-medium">Room status</th>
              <th className="w-[8%] min-w-[72px] px-4 py-2 font-medium text-right">Size</th>
              <th className="w-[8%] min-w-[72px] px-4 py-2 font-medium text-right"> </th>
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
                  <td className="px-4 py-2.5">
                    <span className="block truncate font-medium text-ink" title={d.fileName}>
                      {d.fileName}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <DiligenceFlagBadge flag={reviews[d.id]?.diligenceFlag ?? null} />
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    <span className="line-clamp-2" title={d.categoryLabel}>
                      {d.categoryLabel}
                    </span>
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
                      className="rounded-md border border-brand/25 bg-brand-soft/50 px-2 py-1 text-xs font-medium text-brand hover:bg-brand/15"
                      onClick={(e) => e.stopPropagation()}
                      title="Open full viewer (or double-click row)"
                    >
                      Open
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
