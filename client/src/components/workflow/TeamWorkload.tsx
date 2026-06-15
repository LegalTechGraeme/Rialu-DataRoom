import type { TaskSummary } from "../../types/workflow";
import { roleLabel } from "../../types/users";

interface TeamWorkloadProps {
  summary: TaskSummary;
  currentUserId?: string;
  onSelectUser?: (userId: string) => void;
}

export function TeamWorkload({ summary, currentUserId, onSelectUser }: TeamWorkloadProps) {
  const members = Object.values(summary.byUser);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {members.map(({ user, assigned }) => {
        const isMe = user.id === currentUserId;
        return (
          <button
            key={user.id}
            type="button"
            onClick={() => onSelectUser?.(user.id)}
            className={[
              "card flex items-center gap-3 p-4 text-left transition hover:border-brand/35",
              isMe ? "border-brand/40 bg-brand-soft/40" : "",
            ].join(" ")}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.initials}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{user.name.split(" ")[0]}</p>
              <p className="text-xs text-ink-muted">
                {roleLabel(user.role)} · {assigned} active
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
