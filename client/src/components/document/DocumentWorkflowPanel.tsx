import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { fetchTasks } from "../../services/tasksApi";
import { taskHasTaggedPassage } from "../../lib/taskUtils";
import type { ReviewTask } from "../../types/workflow";

interface DocumentWorkflowPanelProps {
  matterId: string;
  documentId: string;
  focusTaskId?: string | null;
}

export function DocumentWorkflowPanel({
  matterId,
  documentId,
  focusTaskId,
}: DocumentWorkflowPanelProps) {
  const { user } = useUser();
  const [tasks, setTasks] = useState<ReviewTask[]>([]);

  const load = useCallback(() => {
    fetchTasks(matterId, { documentId }).then(setTasks).catch(() => {});
  }, [matterId, documentId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const open = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-ink-muted">Open tasks ({open.length})</p>
        <Link to={`/matters/${matterId}/workflow`} className="text-[11px] text-brand hover:underline">
          Inbox
        </Link>
      </div>

      {open.length === 0 ? (
        <p className="text-xs text-ink-faint">No open tasks. Select text in the preview to assign work.</p>
      ) : (
        <ul className="space-y-2">
          {open.map((task) => {
            const isActive = task.id === focusTaskId;
            const hasPassage = taskHasTaggedPassage(task);
            return (
              <li
                key={task.id}
                className={[
                  "rounded-lg border px-3 py-2.5",
                  isActive ? "border-brand bg-brand-soft/30" : "border-line",
                ].join(" ")}
              >
                <p className="text-sm font-medium text-ink">{task.title}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">
                  {task.assignedToName}
                  {user?.id === task.assignedTo ? " · you" : ""}
                </p>
                {hasPassage ? (
                  <Link
                    to={`/matters/${matterId}/documents/${documentId}?task=${task.id}`}
                    className="mt-1.5 inline-block text-[11px] font-medium text-brand hover:underline"
                  >
                    {isActive ? "Viewing passage" : "View passage →"}
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
