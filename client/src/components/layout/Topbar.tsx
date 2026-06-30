import { Link } from "react-router-dom";
import { UserBadge } from "../auth/UserBadge";
import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import { useEffect, useState } from "react";
import { fetchTasks } from "../../services/tasksApi";

interface TopbarProps {
  title: string;
  subtitle?: string;
  matterId?: string;
  minimal?: boolean;
}

export function Topbar({ title, subtitle, matterId, minimal }: TopbarProps) {
  const { theme, toggle } = useTheme();
  const { user, switchUser } = useUser();
  const [myTasks, setMyTasks] = useState(0);

  useEffect(() => {
    if (!matterId || !user) {
      setMyTasks(0);
      return;
    }
    fetchTasks(matterId, { assignedTo: user.id })
      .then((tasks) => setMyTasks(tasks.filter((t) => t.status !== "completed").length))
      .catch(() => setMyTasks(0));
  }, [matterId, user]);

  return (
    <header
      className={[
        "shrink-0 border-b border-line bg-surface",
        minimal ? "py-3" : "py-4",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4 px-8 md:px-10">
        <div className="min-w-0">
          {title && !minimal ? (
            <h1 className="truncate text-sm font-semibold text-ink">{title}</h1>
          ) : null}
          {subtitle && !minimal ? (
            <p className="mt-0.5 truncate text-xs text-ink-muted">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {matterId && myTasks > 0 ? (
            <Link
              to={`/matters/${matterId}/workflow`}
              className="rounded-md border border-line bg-surface-elevated px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-brand"
            >
              {myTasks} open task{myTasks !== 1 ? "s" : ""}
            </Link>
          ) : null}
          {user ? <UserBadge user={user} onSwitch={switchUser} compact /> : null}
          <button
            type="button"
            onClick={toggle}
            className="btn-ghost text-xs"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}
