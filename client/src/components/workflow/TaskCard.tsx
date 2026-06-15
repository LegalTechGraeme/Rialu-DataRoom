import type { ReviewTask } from "../../types/workflow";
import { taskStatusLabel, taskTypeLabel } from "../../types/workflow";
import { roleLabel, type DemoRole } from "../../types/users";

interface TaskCardProps {
  task: ReviewTask;
  currentUserId?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function TaskCard({ task, currentUserId, selected, onSelect }: TaskCardProps) {
  const isMine = currentUserId === task.assignedTo;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-lg border p-3 text-left transition",
        selected
          ? "border-brand bg-brand-soft/60 shadow-sm"
          : "border-line bg-surface-elevated hover:border-brand/30",
        isMine && !selected ? "ring-1 ring-brand/15" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{task.title}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {taskTypeLabel(task.type)} · {task.assignedToName}
            {isMine ? " (you)" : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-muted">
          {taskStatusLabel(task.status)}
        </span>
      </div>
    </button>
  );
}

export function RoleChip({ role }: { role: DemoRole }) {
  return (
    <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium text-brand">
      {roleLabel(role)}
    </span>
  );
}
