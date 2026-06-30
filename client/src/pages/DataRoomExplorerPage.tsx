import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CreateTaskModal } from "../components/workflow/CreateTaskModal";
import { useUser } from "../contexts/UserContext";
import { DocumentTable } from "../components/explorer/DocumentTable";
import { DocumentPeekPanel } from "../components/explorer/DocumentPeekPanel";
import { FolderTree } from "../components/explorer/FolderTree";
import { UploadDropzone } from "../components/room/UploadDropzone";
import { findFolderById } from "../lib/folderUtils";
import {
  fetchFolderDocuments,
  fetchFolderTree,
  fetchMatter,
} from "../services/mattersApi";
import { fetchMatterReviews } from "../services/reviewsApi";
import type { DocumentRecord, DocumentReview, FolderNode, Matter } from "../types";

type MobilePane = "documents" | "folders" | "preview";

export function DataRoomExplorerPage() {
  const { matterId = "" } = useParams();
  const { user, users } = useUser();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [tree, setTree] = useState<FolderNode | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [docsList, setDocsList] = useState<DocumentRecord[] | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("documents");
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
          setSelectedDocumentId((prev) => {
            const next =
              prev && payload.documents.some((d) => d.id === prev) ? prev : null;
            if (!next) {
              setRightOpen(false);
              setMobilePane("documents");
            }
            return next;
          });
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

  const selectedReview = selectedDocument ? reviews[selectedDocument.id] ?? null : null;

  const gridTemplate = useMemo(() => {
    const left = leftOpen ? "minmax(0,240px)" : "40px";
    const right = "minmax(0,360px)";
    if (rightOpen) {
      return `${left} minmax(0,1fr) ${right}`;
    }
    return `${left} minmax(0,1fr)`;
  }, [leftOpen, rightOpen]);

  const selectDocument = (d: DocumentRecord) => {
    setSelectedDocumentId(d.id);
    setRightOpen(true);
    setMobilePane("preview");
  };

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

  const explorerHeader = (
    <div className="shrink-0 space-y-2 border-b border-line bg-surface-elevated px-4 py-2 max-lg:px-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-muted max-lg:w-full">
          <span className="font-medium text-ink">{matter.name}</span>
          <span className="text-ink-faint"> · </span>
          {folderName ? (
            <>
              <strong className="text-ink">{folderName}</strong>
              {user ? (
                <button
                  type="button"
                  onClick={() => setShowFolderTask(true)}
                  className="ml-2 rounded-md border border-brand/30 bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand hover:bg-brand/20"
                >
                  Assign folder review
                </button>
              ) : null}
              <span className="hidden text-ink-faint lg:inline"> · </span>
            </>
          ) : null}
          <span className="hidden lg:inline">Click a row to preview · double-click for full review workspace</span>
          <span className="lg:hidden">Tap a document to preview</span>
        </p>
        {matterId !== "matter-acme" ? (
          <div className="w-full max-w-xs sm:w-auto max-lg:max-w-none">
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
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {explorerHeader}

      {/* Mobile: single-pane flow */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        {mobilePane === "folders" ? (
          <>
            <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
              <button
                type="button"
                className="min-h-[44px] rounded-md px-2 text-sm font-medium text-brand"
                onClick={() => setMobilePane("documents")}
              >
                ← Documents
              </button>
              <span className="text-sm font-medium text-ink">Folders</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-surface-elevated">
              <FolderTree
                root={tree}
                selectedFolderId={selectedFolderId}
                onSelectFolder={(f) => {
                  setSelectedFolderId(f.id);
                  setMobilePane("documents");
                }}
              />
            </div>
          </>
        ) : null}

        {mobilePane === "preview" && selectedDocument ? (
          <>
            <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
              <button
                type="button"
                className="min-h-[44px] rounded-md px-2 text-sm font-medium text-brand"
                onClick={() => setMobilePane("documents")}
              >
                ← Back
              </button>
              <span className="min-w-0 truncate text-sm font-medium text-ink">
                {selectedDocument.fileName}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-surface-elevated">
              <DocumentPeekPanel
                matterId={matterId}
                document={selectedDocument}
                review={selectedReview}
              />
            </div>
          </>
        ) : null}

        {mobilePane === "documents" ? (
          <>
            <div className="flex shrink-0 items-center gap-2 border-b border-line bg-surface-muted/40 px-3 py-2">
              <button
                type="button"
                className="min-h-[44px] flex-1 truncate rounded-lg border border-line bg-surface-elevated px-3 text-left text-sm font-medium text-ink"
                onClick={() => setMobilePane("folders")}
              >
                Folder: {folderName}
              </button>
            </div>
            <section className="min-h-0 flex-1 bg-surface">
              <DocumentTable
                matterId={matterId}
                folderName={folderName}
                documents={docsList}
                reviews={reviews}
                selectedDocumentId={selectedDocumentId}
                onSelectDocument={selectDocument}
              />
            </section>
          </>
        ) : null}
      </div>

      {/* Desktop: three-pane grid (unchanged) */}
      <div
        className="hidden min-h-0 min-w-[720px] flex-1 grid divide-x divide-line overflow-x-auto lg:grid"
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

        <section className="min-h-0 min-w-0 bg-surface">
          <DocumentTable
            matterId={matterId}
            folderName={folderName}
            documents={docsList}
            reviews={reviews}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={(d) => {
              setSelectedDocumentId(d.id);
              setRightOpen(true);
            }}
          />
        </section>

        {rightOpen ? (
          <section className="flex min-h-0 min-w-0 flex-col bg-surface-elevated">
            <div className="flex min-h-0 flex-1 flex-col">
              <DocumentPeekPanel
                matterId={matterId}
                document={selectedDocument}
                review={selectedReview}
              />
            </div>
            <button
              type="button"
              className="shrink-0 border-t border-line py-2 text-center text-[11px] font-medium text-ink-muted hover:bg-surface-muted"
              onClick={() => setRightOpen(false)}
            >
              Hide preview
            </button>
          </section>
        ) : null}
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
