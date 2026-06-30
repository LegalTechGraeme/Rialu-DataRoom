import { FormEvent, useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { createTask } from "../../services/tasksApi";
import type { DemoUser } from "../../types/users";
import { roleLabel, suggestedDelegateRole, suggestedEscalationRole } from "../../types/users";
import type { ReviewTask, TaskType } from "../../types/workflow";

export interface CreateTaskContext {
  documentId?: string;
  documentName?: string;
  folderId?: string;
  folderName?: string;
  clauseRef?: string;
  selectedText?: string;
  textStart?: number;
  textEnd?: number;
  type?: TaskType;
  title?: string;
  description?: string;
}

interface CreateTaskModalProps {
  matterId: string;
  users: DemoUser[];
  context?: CreateTaskContext;
  onClose: () => void;
  onCreated: (task: ReviewTask) => void;
}

export function CreateTaskModal({
  matterId,
  users,
  context,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const { user } = useUser();
  const [title, setTitle] = useState(
    context?.title ??
      (context?.clauseRef
        ? `Review: ${context.clauseRef}`
        : context?.documentName
          ? `Review: ${context.documentName}`
          : context?.folderName
            ? `Review folder: ${context.folderName}`
            : "")
  );
  const [description, setDescription] = useState(context?.description ?? "");
  const [type, setType] = useState<TaskType>(
    context?.type ??
      (context?.selectedText ? "clause_review" : context?.folderId ? "folder_review" : "document_review")
  );
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<ReviewTask["priority"]>("normal");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultAssignee = useMemo(() => {
    if (!user) return users[0]?.id ?? "";
    const escalateRole = suggestedEscalationRole(user.role);
    const delegateRole = suggestedDelegateRole(user.role);
    const isEscalation = type === "escalation";
    const targetRole = isEscalation ? escalateRole : delegateRole;
    return users.find((u) => u.role === targetRole)?.id ?? users[0]?.id ?? "";
  }, [user, users, type]);

  const effectiveAssignee = assignedTo || defaultAssignee;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const task = await createTask(matterId, {
        type,
        title: title.trim(),
        description,
        priority,
        createdBy: user.id,
        assignedTo: effectiveAssignee,
        documentId: context?.documentId,
        documentName: context?.documentName,
        folderId: context?.folderId,
        folderName: context?.folderName,
        clauseRef: context?.clauseRef,
        selectedText: context?.selectedText,
        textStart: context?.textStart,
        textEnd: context?.textEnd,
      });
      onCreated(task);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm max-lg:items-end max-lg:p-0">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-lg rounded-xl border border-line bg-surface-elevated shadow-xl max-lg:max-h-[92vh] max-lg:overflow-y-auto max-lg:rounded-b-none max-lg:rounded-t-2xl"
      >
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Assign review task</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Creates a tracked task linked to this {context?.selectedText ? "clause" : context?.folderId ? "folder" : "document"}
          </p>
        </div>

        <div className="space-y-4 p-5">
          {context?.selectedText ? (
            <blockquote className="rounded-lg border-l-4 border-brand/40 bg-brand-soft/30 px-3 py-2 text-xs italic text-ink-muted">
              "{context.selectedText.slice(0, 200)}
              {context.selectedText.length > 200 ? "…" : ""}"
            </blockquote>
          ) : null}

          <label className="block">
            <span className="text-xs font-medium text-ink-muted">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-muted">Instructions</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What should the assignee focus on?"
              className="mt-1 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
              >
                <option value="document_review">Document review</option>
                <option value="folder_review">Folder review</option>
                <option value="clause_review">Clause review</option>
                <option value="escalation">Escalation</option>
                <option value="follow_up">Follow-up</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReviewTask["priority"])}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-ink-muted">Assign to</span>
            <select
              value={effectiveAssignee}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {roleLabel(u.role)}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="rounded-md border border-danger/30 bg-danger/10 p-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4 max-lg:flex-col-reverse max-lg:[&>button]:w-full">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
}
