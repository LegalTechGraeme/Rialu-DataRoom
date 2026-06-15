import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DocumentViewer } from "../components/document/DocumentViewer";
import { fetchDocumentDetail } from "../services/mattersApi";
import type { DocumentDetailPayload } from "../types";

export function DocumentPage() {
  const { matterId = "", documentId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const focusTaskId = searchParams.get("task");
  const navigate = useNavigate();
  const [data, setData] = useState<DocumentDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchDocumentDetail(matterId, documentId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load document");
      });
    return () => {
      cancelled = true;
    };
  }, [matterId, documentId]);

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-ink-muted">Loading document…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DocumentViewer
        variant="page"
        matterId={matterId}
        document={data.document}
        folderLabel={data.folder?.name ?? null}
        fileUrl={data.fileUrl}
        review={data.review}
        focusTaskId={focusTaskId}
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
