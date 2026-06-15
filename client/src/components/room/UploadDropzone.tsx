import { useRef, useState } from "react";
import { uploadDocuments } from "../../services/workflowApi";

interface UploadDropzoneProps {
  matterId: string;
  onUploaded?: () => void;
  compact?: boolean;
}

export function UploadDropzone({ matterId, onUploaded, compact }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await uploadDocuments(matterId, list, true);
      const failed = result.results.filter((r) => !r.ok);
      setMessage(
        `${result.uploaded} file${result.uploaded === 1 ? "" : "s"} uploaded${
          result.autoClassify ? " (AI classification where needed)" : ""
        }${failed.length ? ` (${failed.length} failed)` : ""}. Open the data room explorer — root index shows all documents.`
      );
      onUploaded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          "cursor-pointer rounded-lg border-2 border-dashed transition-colors",
          compact ? "px-3 py-2 text-center" : "px-4 py-6 text-center",
          dragging
            ? "border-brand bg-brand-soft"
            : "border-line bg-surface-muted/40 hover:border-brand/40 hover:bg-brand-soft/50",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx,.ppt,.pptx,.zip"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
          }}
        />
        <p className={compact ? "text-xs font-medium text-ink-muted" : "text-sm font-medium text-ink"}>
          {uploading ? "Uploading…" : compact ? "Drop files or ZIP" : "Drop files or ZIP here"}
        </p>
        {!compact ? (
          <p className="mt-1 text-xs text-ink-faint">
            PDF, Word, Excel, PowerPoint, CSV, TXT — or a ZIP of documents. Rialu will auto-file into
            diligence folders.
          </p>
        ) : null}
      </div>
      {message ? <p className="text-xs text-ok">{message}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
