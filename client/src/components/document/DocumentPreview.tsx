import type { ReactNode } from "react";
import type { DocumentRecord } from "../../types";
import { documentFileUrl } from "../../services/apiClient";

interface DocumentPreviewProps {
  matterId: string;
  document: DocumentRecord;
  fileUrl: string | null;
}

function isPdf(mime: string) {
  return mime === "application/pdf";
}

function isSpreadsheet(mime: string) {
  return (
    mime.includes("spreadsheet") ||
    mime === "text/csv" ||
    mime === "application/vnd.ms-excel"
  );
}

function MessagePanel({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[320px] flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-md text-xs leading-relaxed text-ink-muted">{detail}</p>
      {action}
    </div>
  );
}

export function DocumentPreview({ matterId, document: doc, fileUrl }: DocumentPreviewProps) {
  const downloadHref = documentFileUrl(matterId, doc.id, fileUrl);

  if (!fileUrl && !doc.storagePath) {
    return (
      <MessagePanel
        title="No file on disk"
        detail="This document has no file attached. Try re-uploading the file."
      />
    );
  }

  if (isPdf(doc.mimeType)) {
    return (
      <iframe
        title={doc.fileName}
        src={downloadHref}
        className="h-full min-h-[320px] w-full flex-1 border-0 bg-white dark:bg-slate-900"
      />
    );
  }

  if (doc.mimeType.startsWith("text/") || doc.fileName.endsWith(".txt")) {
    return (
      <iframe
        title={doc.fileName}
        src={downloadHref}
        className="h-full min-h-[320px] w-full flex-1 border-0 bg-white dark:bg-slate-900"
      />
    );
  }

  if (isSpreadsheet(doc.mimeType)) {
    return (
      <MessagePanel
        title="Spreadsheet"
        detail={
          doc.previewText ??
          "Schedules and registers are in the workbook. Download to open in Excel or Sheets."
        }
        action={
          <a
            href={downloadHref}
            download={doc.fileName}
            className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-muted dark:text-slate-950"
          >
            Download {doc.fileName}
          </a>
        }
      />
    );
  }

  return (
    <MessagePanel
      title="Preview not available"
      detail={`MIME type: ${doc.mimeType}`}
      action={
        <a href={downloadHref} className="text-sm font-medium text-accent hover:underline">
          Download file
        </a>
      }
    />
  );
}
