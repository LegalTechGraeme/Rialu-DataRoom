import { useMemo } from "react";
import type { DemoUser } from "../../types/users";
import { roleLabel } from "../../types/users";

interface UserBadgeProps {
  user: DemoUser;
  onSwitch?: () => void;
  compact?: boolean;
}

export function UserBadge({ user, onSwitch, compact }: UserBadgeProps) {
  const role = useMemo(() => roleLabel(user.role), [user.role]);

  if (compact) {
    return (
      <button
        type="button"
        onClick={onSwitch}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface-elevated px-2 py-1.5 shadow-sm transition hover:border-brand/30 hover:bg-brand-soft"
        title={`${user.name} — click to switch`}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: user.color }}
        >
          {user.initials}
        </span>
        <span className="hidden text-xs font-medium text-ink sm:inline">{user.name.split(" ")[0]}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-elevated px-3 py-2 shadow-sm">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: user.color }}
      >
        {user.initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
        <p className="text-[11px] text-ink-muted">{role}</p>
      </div>
      {onSwitch ? (
        <button
          type="button"
          onClick={onSwitch}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-brand hover:bg-brand-soft"
        >
          Switch
        </button>
      ) : null}
    </div>
  );
}
