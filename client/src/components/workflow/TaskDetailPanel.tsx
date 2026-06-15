import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { addTaskComment, updateTask } from "../../services/tasksApi";
import type { ReviewTask } from "../../types/workflow";
import { taskStatusLabel, taskTypeLabel } from "../../types/workflow";
import { RoleChip } from "./TaskCard";
import type { DemoUser } from "../../types/users";
import { roleLabel } from "../../types/users";
import { taskHasTaggedPassage } from "../../lib/taskUtils";

interface TaskDetailPanelProps {
  matterId: string;
  task: ReviewTask | null;
  users: DemoUser[];
  onUpdated: (task: ReviewTask) => void;
}

export function TaskDetailPanel({ matterId, task, users, onUpdated }: TaskDetailPanelProps) {
  const { user } = useUser();
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setComment("");
  }, [task?.id]);

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-ink-muted">Select a task to view details and comments</p>
      </div>
    );
  }

  const reassignOptions = users.filter((u) => u.id !== task.assignedTo);
  const hasPassage = taskHasTaggedPassage(task);
  const docLink = task.documentId
    ? hasPassage
      ? `/matters/${matterId}/documents/${task.documentId}?task=${task.id}`
      : `/matters/${matterId}/documents/${task.documentId}`
    : null;

  const handleStatus = async (status: ReviewTask["status"]) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateTask(matterId, task.id, { status, actorId: user.id });
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleReassign = async (assignedTo: string) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateTask(matterId, task.id, { assignedTo, actorId: user.id });
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleComment = async () => {
    if (!user || !comment.trim()) return;
    setSaving(true);
    try {
      const updated = await addTaskComment(matterId, task.id, user.id, comment.trim());
      onUpdated(updated);
      setComment("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium uppercase text-ink-faint">
            {taskTypeLabel(task.type)}
          </span>
          <span className="text-ink-faint">·</span>
          <span className="text-[10px] text-ink-muted">{taskStatusLabel(task.status)}</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-ink">{task.title}</h2>
        {task.description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{task.description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {docLink ? (
            <Link
              to={docLink}
              className="rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1.5 font-medium text-brand"
            >
              {hasPassage ? "View passage →" : "Open document →"}
            </Link>
          ) : null}
          {task.folderId ? (
            <Link
              to={`/matters/${matterId}/room`}
              className="rounded-md border border-line px-2.5 py-1.5 font-medium text-ink-muted"
            >
              {task.folderName ?? "Folder"} →
            </Link>
          ) : null}
        </div>

        {hasPassage && task.selectedText ? (
          <blockquote className="mt-3 rounded-md border-l-2 border-brand/40 pl-3 text-xs italic text-ink-muted">
            {task.clauseRef ? (
              <span className="mb-1 block font-medium not-italic text-brand">{task.clauseRef}</span>
            ) : null}
            "{task.selectedText.slice(0, 200)}
            {task.selectedText.length > 200 ? "…" : ""}"
          </blockquote>
        ) : null}
      </div>

      <div className="border-b border-line p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Assignment
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-muted">Assigned to</span>
          <strong>{task.assignedToName}</strong>
          <RoleChip role={task.assignedToRole} />
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          Raised by {task.createdByName} · {roleLabel(task.createdByRole)}
        </p>

        {user ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-ink-muted">Update status</p>
              <div className="flex flex-wrap gap-1.5">
                {(["open", "in_progress", "awaiting_review", "completed"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={saving || task.status === s}
                    onClick={() => void handleStatus(s)}
                    className={[
                      "rounded-md px-2.5 py-1 text-[11px] font-medium transition",
                      task.status === s
                        ? "bg-brand text-white"
                        : "border border-line text-ink-muted hover:border-brand/40",
                    ].join(" ")}
                  >
                    {taskStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {reassignOptions.length > 0 ? (
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-ink-muted">
                  Reassign to any team member
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reassignOptions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      disabled={saving}
                      onClick={() => void handleReassign(u.id)}
                      className="rounded-md border border-line px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:border-brand/40 hover:text-brand"
                    >
                      {u.name}
                      <span className="ml-1 text-ink-faint">({roleLabel(u.role)})</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Discussion ({task.comments.length})
        </p>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto">
          {task.comments.length === 0 ? (
            <p className="text-xs text-ink-faint">No comments yet — start the thread below.</p>
          ) : (
            task.comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-line/70 bg-surface-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink">{c.authorName}</span>
                  <RoleChip role={c.authorRole} />
                  <span className="text-[10px] text-ink-faint">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{c.body}</p>
              </div>
            ))
          )}
        </div>

        {user ? (
          <div className="mt-3 shrink-0 border-t border-line pt-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              disabled={saving || !comment.trim()}
              onClick={() => void handleComment()}
              className="btn-primary mt-2 !px-3 !py-1.5 text-xs disabled:opacity-50"
            >
              Post comment
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
