import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useDocumentText } from "../../hooks/useDocumentText";
import type { DocumentRecord, DocumentReview } from "../../types";
import type { KeyClause } from "../../types/ai";
import { DiligenceFlagBadge } from "../diligence/DiligenceFlagBadge";
import { CreateTaskModal, type CreateTaskContext } from "../workflow/CreateTaskModal";
import { TaskReviewBanner } from "../workflow/TaskReviewBanner";
import { fetchTask } from "../../services/tasksApi";
import type { ReviewTask } from "../../types/workflow";
import { DocumentPreview } from "./DocumentPreview";
import { DocumentWorkflowPanel } from "./DocumentWorkflowPanel";
import { DiligenceReviewPanel } from "./DiligenceReviewPanel";
import {
  findClauseOffsets,
  InteractiveDocumentPreview,
  type TextHighlight,
  type TextSelection,
} from "./InteractiveDocumentPreview";
import { SelectionActionBar } from "./SelectionActionBar";
import { fetchDocumentAnalysis } from "../../services/aiApi";
import type { DocumentAnalysis } from "../../types";

type SideTab = "review" | "workflow" | "ai";
type PreviewMode = "interactive" | "original";

interface DocumentViewerProps {
  matterId: string;
  document: DocumentRecord;
  folderLabel: string | null;
  fileUrl?: string | null;
  review: DocumentReview | null;
  onReviewSaved?: (review: DocumentReview) => void;
  onClose?: () => void;
  variant?: "modal" | "page";
  focusTaskId?: string | null;
}

export function DocumentViewer({
  matterId,
  document: doc,
  folderLabel,
  fileUrl = null,
  review,
  onReviewSaved,
  onClose,
  variant = "page",
  focusTaskId = null,
}: DocumentViewerProps) {
  const { user, users } = useUser();
  const { text: docText, loading: textLoading, error: textError } = useDocumentText(matterId, doc);
  const [sideTab, setSideTab] = useState<SideTab>(focusTaskId ? "workflow" : "review");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("interactive");
  const [currentReview, setCurrentReview] = useState<DocumentReview | null>(review);
  const [aiAnalysis, setAiAnalysis] = useState<DocumentAnalysis | null>(null);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [taskModal, setTaskModal] = useState<CreateTaskContext | null>(null);
  const [focusTask, setFocusTask] = useState<ReviewTask | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    setCurrentReview(review);
    setSelection(null);
    setBannerDismissed(false);
    setPreviewMode("interactive");
    setSideTab(focusTaskId ? "workflow" : "review");

    if (focusTaskId) {
      fetchTask(matterId, focusTaskId).then(setFocusTask).catch(() => setFocusTask(null));
    } else {
      setFocusTask(null);
    }

    fetchDocumentAnalysis(matterId, doc.id)
      .then(setAiAnalysis)
      .catch(() => setAiAnalysis(null));
  }, [review, doc.id, matterId, focusTaskId]);

  const title = doc.fileName;

  const taskHighlight = useMemo((): TextHighlight | null => {
    if (!focusTask || !docText) return null;
    if (
      focusTask.textStart != null &&
      focusTask.textEnd != null &&
      focusTask.textEnd > focusTask.textStart &&
      focusTask.textEnd <= docText.length
    ) {
      return {
        id: "task-focus",
        start: focusTask.textStart,
        end: focusTask.textEnd,
        label: focusTask.title,
      };
    }
    if (focusTask.selectedText) {
      const offsets = findClauseOffsets(docText, focusTask.selectedText);
      if (offsets) {
        return { id: "task-focus", ...offsets, label: focusTask.title };
      }
    }
    return null;
  }, [focusTask, docText]);

  const highlights = useMemo(() => (taskHighlight ? [taskHighlight] : []), [taskHighlight]);

  const openTaskModal = (ctx: Partial<CreateTaskContext> & { type?: CreateTaskContext["type"] }) => {
    setTaskModal({
      documentId: doc.id,
      documentName: title,
      selectedText: selection?.text,
      textStart: selection?.start,
      textEnd: selection?.end,
      ...ctx,
    });
    setSelection(null);
  };

  const shell =
    variant === "modal"
      ? "flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-line bg-surface-elevated shadow-card"
      : "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface-elevated shadow-card";

  return (
    <div className={shell}>
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-ink">{title}</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
            {folderLabel ? <span>{folderLabel}</span> : null}
            <DiligenceFlagBadge flag={currentReview?.diligenceFlag ?? null} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-muted"
            >
              Back
            </button>
          ) : (
            <Link
              to={`/matters/${matterId}/room`}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-muted"
            >
              Back
            </Link>
          )}
        </div>
      </div>

      {focusTask && !bannerDismissed ? (
        <TaskReviewBanner task={focusTask} onDismiss={() => setBannerDismissed(true)} />
      ) : null}

      <div className="grid min-h-0 flex-1 grid-rows-1 lg:grid-cols-[1fr_340px]">
        <div className="relative flex min-h-[280px] flex-col border-b border-line lg:border-b-0 lg:border-r">
          <div className="flex justify-end border-b border-line px-3 py-1.5">
            <div className="flex rounded-md border border-line p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setPreviewMode("interactive")}
                className={previewMode === "interactive" ? "rounded bg-brand px-2 py-0.5 text-white" : "px-2 py-0.5 text-ink-muted"}
              >
                Review
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("original")}
                className={previewMode === "original" ? "rounded bg-brand px-2 py-0.5 text-white" : "px-2 py-0.5 text-ink-muted"}
              >
                PDF
              </button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              className={[
                "absolute inset-0 flex min-h-0 flex-col",
                previewMode === "interactive" ? "z-10" : "pointer-events-none invisible",
              ].join(" ")}
              aria-hidden={previewMode !== "interactive"}
            >
              <InteractiveDocumentPreview
                matterId={matterId}
                document={doc}
                text={docText}
                loading={textLoading}
                error={textError}
                highlights={highlights}
                scrollToHighlightId={taskHighlight ? "task-focus" : null}
                onSelection={setSelection}
              />
            </div>
            <div
              className={[
                "absolute inset-0 flex min-h-0 flex-col",
                previewMode === "original" ? "z-10" : "pointer-events-none invisible",
              ].join(" ")}
              aria-hidden={previewMode !== "original"}
            >
              <DocumentPreview matterId={matterId} document={doc} fileUrl={fileUrl} />
            </div>
            {selection && previewMode === "interactive" ? (
              <SelectionActionBar
                selection={selection}
                users={users}
                onAssign={() => openTaskModal({ type: "clause_review" })}
                onEscalate={() => openTaskModal({ type: "escalation", title: "Escalation" })}
                onClear={() => setSelection(null)}
              />
            ) : null}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex border-b border-line">
            {(
              [
                { id: "review" as const, label: "Review" },
                { id: "workflow" as const, label: "Tasks" },
                { id: "ai" as const, label: "AI" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSideTab(t.id)}
                className={[
                  "flex-1 border-b-2 py-2.5 text-xs font-medium",
                  sideTab === t.id ? "border-brand text-brand" : "border-transparent text-ink-muted",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {sideTab === "review" ? (
              <DiligenceReviewPanel
                matterId={matterId}
                documentId={doc.id}
                initialReview={currentReview}
                onSaved={(r) => {
                  setCurrentReview(r);
                  onReviewSaved?.(r);
                }}
              />
            ) : sideTab === "workflow" ? (
              <DocumentWorkflowPanel
                matterId={matterId}
                documentId={doc.id}
                focusTaskId={focusTaskId}
              />
            ) : (
              <div className="space-y-3 p-4">
                {aiAnalysis ? (
                  <AiClausesCompact
                    analysis={aiAnalysis}
                    onAssign={(clause) =>
                      openTaskModal({
                        type: "clause_review",
                        title: clause.name,
                        clauseRef: clause.source_reference || clause.name,
                        selectedText: clause.text,
                      })
                    }
                  />
                ) : (
                  <p className="text-xs text-ink-faint">Run a full diligence review to populate AI clause analysis.</p>
                )}
                {user ? (
                  <button
                    type="button"
                    onClick={() =>
                      openTaskModal({ type: "document_review", title: `Review: ${title}` })
                    }
                    className="w-full rounded-lg border border-line py-2 text-xs font-medium text-ink-muted hover:border-brand/40"
                  >
                    Assign document review
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </aside>
      </div>

      {taskModal ? (
        <CreateTaskModal
          matterId={matterId}
          users={users}
          context={taskModal}
          onClose={() => setTaskModal(null)}
          onCreated={() => {
            setTaskModal(null);
            setSideTab("workflow");
          }}
        />
      ) : null}
    </div>
  );
}

function AiClausesCompact({
  analysis,
  onAssign,
}: {
  analysis: DocumentAnalysis;
  onAssign: (clause: KeyClause) => void;
}) {
  if (!analysis.key_clauses?.length) {
    return <p className="text-xs text-ink-muted">{analysis.summary}</p>;
  }
  return (
    <ul className="space-y-2">
      {analysis.key_clauses.slice(0, 6).map((c, i) => (
        <li key={i} className="rounded-lg border border-line p-2.5">
          <p className="text-xs font-medium text-ink">{c.name}</p>
          <button
            type="button"
            onClick={() => onAssign(c)}
            className="mt-1.5 text-[11px] font-medium text-brand hover:underline"
          >
            Assign review
          </button>
        </li>
      ))}
    </ul>
  );
}
