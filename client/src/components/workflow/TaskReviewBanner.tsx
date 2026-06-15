import { useUser } from "../../contexts/UserContext";
import type { ReviewTask } from "../../types/workflow";
import { taskHasTaggedPassage } from "../../lib/taskUtils";

interface TaskReviewBannerProps {
  task: ReviewTask;
  onDismiss?: () => void;
}

export function TaskReviewBanner({ task, onDismiss }: TaskReviewBannerProps) {
  const { user } = useUser();
  const isMine = user?.id === task.assignedTo;
  const hasPassage = taskHasTaggedPassage(task);

  return (
    <div className="flex items-start justify-between gap-4 border-b border-brand/25 bg-brand-soft/30 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink">
          {isMine ? "Your task" : "Review task"}: {task.title}
        </p>
        {hasPassage ? (
          <p className="mt-0.5 text-[11px] text-brand">Passage highlighted below</p>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-[11px] text-ink-faint hover:text-ink"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
