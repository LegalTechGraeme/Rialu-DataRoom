import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CreateTaskModal } from "../components/workflow/CreateTaskModal";
import { useUser } from "../contexts/UserContext";
import { DocumentTable } from "../components/explorer/DocumentTable";
import { FolderTree } from "../components/explorer/FolderTree";
import { UploadDropzone } from "../components/room/UploadDropzone";
import { DocumentPreview } from "../components/document/DocumentPreview";
import { AiAnalysisPanel } from "../features/ai/AiAnalysisPanel";
import { findFolderById } from "../lib/folderUtils";
import {
  fetchFolderDocuments,
  fetchFolderTree,
  fetchMatter,
} from "../services/mattersApi";
import { fetchMatterReviews } from "../services/reviewsApi";
import type { DocumentRecord, DocumentReview, FolderNode, Matter } from "../types";

export function DataRoomExplorerPage() {
  const { matterId = "" } = useParams();
  const { user, users } = useUser();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [tree, setTree] = useState<FolderNode | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [docsList, setDocsList] = useState<DocumentRecord[] | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, DocumentReview>>({});
  const [reviewsWarning, setReviewsWarning] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showFolderTask, setShowFolderTask] = useState(false);

  const reloadDocs = useCallback(() => {
    const folderId = tree?.id ?? selectedFolderId;
    if (!tree || !folderId) return;
    fetchFolderDocuments(matterId, folderId)
      .then((payload) => {
        setFolderName(payload.folderName);
        setDocsList(payload.documents);
      })
      .catch(() => {});
    fetchMatterReviews(matterId)
      .then(setReviews)
      .catch(() => {});
  }, [matterId, selectedFolderId, tree]);

  const loadTree = useCallback(async () => {
    const [m, t] = await Promise.all([fetchMatter(matterId), fetchFolderTree(matterId)]);
    setMatter(m);
    setTree(t);
    // Default to root index so all uploaded documents are visible (recursive listing).
    setSelectedFolderId(t.id);
  }, [matterId]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setReviewsWarning(null);
    loadTree().catch((e: unknown) => {
      if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load explorer");
    });
    fetchMatterReviews(matterId)
      .then((rev) => {
        if (!cancelled) setReviews(rev);
      })
      .catch(() => {
        if (!cancelled) {
          setReviews({});
          setReviewsWarning(
            "Diligence flags could not be loaded. Restart the API (npm run dev from the project root)."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadTree, matterId]);

  useEffect(() => {
    if (!tree || !selectedFolderId) return;
    let cancelled = false;
    const folder = findFolderById(tree, selectedFolderId);
    if (!folder) return;
    fetchFolderDocuments(matterId, selectedFolderId)
      .then((payload) => {
        if (!cancelled) {
          setFolderName(payload.folderName);
          setDocsList(payload.documents);
          setSelectedDocumentId((prev) =>
            payload.documents.some((d) => d.id === prev) ? prev : payload.documents[0]?.id ?? null
          );
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load documents");
      });
    return () => {
      cancelled = true;
    };
  }, [matterId, selectedFolderId, tree]);

  const selectedDocument = useMemo(
    () => docsList?.find((d) => d.id === selectedDocumentId) ?? null,
    [docsList, selectedDocumentId]
  );

  const gridTemplate = useMemo(() => {
    const left = leftOpen ? "minmax(0,260px)" : "40px";
    const right = rightOpen ? "minmax(0,280px)" : "40px";
    return `${left} minmax(0,1fr) ${right}`;
  }, [leftOpen, rightOpen]);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!tree || !matter || selectedFolderId === null || docsList === null) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-ink-muted">
        Loading data room…
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 border-b border-line bg-surface-elevated px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">
            <span className="font-medium text-ink">{matter.name}</span>
            <span className="text-ink-faint"> · </span>
            {folderName ? (
              <>
                Viewing <strong className="text-ink">{folderName}</strong>
                {user ? (
                  <button
                    type="button"
                    onClick={() => setShowFolderTask(true)}
                    className="ml-2 rounded-md border border-brand/30 bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand hover:bg-brand/20"
                  >
                    Assign folder review
                  </button>
                ) : null}
                <span className="text-ink-faint"> · </span>
              </>
            ) : null}
            Select documents to review, or assign an entire section to a team member.
          </p>
          {matterId !== "matter-acme" ? (
            <div className="w-full max-w-xs sm:w-auto">
              <UploadDropzone
                matterId={matterId}
                onUploaded={() => {
                  if (tree) setSelectedFolderId(tree.id);
                  reloadDocs();
                }}
                compact
              />
            </div>
          ) : null}
        </div>
        {reviewsWarning ? (
          <p className="rounded-md border border-warn/30 bg-warn/10 px-2 py-1.5 text-xs text-warn">
            {reviewsWarning}
          </p>
        ) : null}
      </div>
      <div
        className="grid min-h-0 min-w-[720px] flex-1 divide-x divide-line overflow-x-auto"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <section className="flex min-h-0 min-w-0 flex-col bg-surface-elevated">
          <div className="flex min-h-0 flex-1 flex-col">
            {leftOpen ? (
              <FolderTree
                root={tree}
                selectedFolderId={selectedFolderId}
                onSelectFolder={(f) => setSelectedFolderId(f.id)}
              />
            ) : (
              <div className="flex h-full min-h-[120px] flex-col items-center justify-center border-r border-line py-3">
                <button
                  type="button"
                  className="rounded-md border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted hover:bg-surface-muted"
                  onClick={() => setLeftOpen(true)}
                  aria-label="Show folder tree"
                >
                  Tree
                </button>
              </div>
            )}
          </div>
          {leftOpen ? (
            <button
              type="button"
              className="shrink-0 border-t border-line py-2 text-center text-[11px] font-medium text-ink-muted hover:bg-surface-muted"
              onClick={() => setLeftOpen(false)}
            >
              Hide tree
            </button>
          ) : null}
        </section>

        <section className="flex min-h-0 min-w-0 flex-col bg-surface">
          <div className="min-h-0 flex-[0_0_42%] border-b border-line">
            <DocumentTable
              matterId={matterId}
              folderName={folderName}
              documents={docsList}
              reviews={reviews}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={(d) => setSelectedDocumentId(d.id)}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            {selectedDocument ? (
              <>
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface-elevated px-4 py-2">
                  <p className="min-w-0 truncate text-xs font-medium text-ink">
                    {selectedDocument.fileName}
                  </p>
                  <Link
                    to={`/matters/${matterId}/documents/${selectedDocument.id}`}
                    className="shrink-0 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand hover:bg-brand/20"
                  >
                    Open full viewer
                  </Link>
                </div>
                <div className="min-h-0 flex-1">
                  <DocumentPreview
                    matterId={matterId}
                    document={selectedDocument}
                    fileUrl={null}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-ink-muted">
                Select a document above to preview it here.
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 min-w-0 flex-col bg-surface-elevated">
          <div className="flex min-h-0 flex-1 flex-col">
            {rightOpen ? (
              <AiAnalysisPanel
                matterId={matterId}
                selectedDocument={
                  docsList.find((d) => d.id === selectedDocumentId) ?? null
                }
                documentsInFolder={docsList}
              />
            ) : (
              <div className="flex h-full min-h-[120px] flex-col items-center justify-center py-3">
                <button
                  type="button"
                  className="rounded-md border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted hover:bg-surface-muted"
                  onClick={() => setRightOpen(true)}
                  aria-label="Show AI panel"
                >
                  AI
                </button>
              </div>
            )}
          </div>
          {rightOpen ? (
            <button
              type="button"
              className="shrink-0 border-t border-line py-2 text-center text-[11px] font-medium text-ink-muted hover:bg-surface-muted"
              onClick={() => setRightOpen(false)}
            >
              Hide panel
            </button>
          ) : null}
        </section>
      </div>

      {showFolderTask && selectedFolderId ? (
        <CreateTaskModal
          matterId={matterId}
          users={users}
          context={{
            type: "folder_review",
            folderId: selectedFolderId,
            folderName: folderName,
            title: `Review folder: ${folderName}`,
            description: `Review all documents in ${folderName} (${docsList.length} document${docsList.length !== 1 ? "s" : ""}).`,
          }}
          onClose={() => setShowFolderTask(false)}
          onCreated={() => setShowFolderTask(false)}
        />
      ) : null}
    </div>
  );
}
