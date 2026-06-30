import { Link } from "react-router-dom";
import { UserBadge } from "../auth/UserBadge";
import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import { BRAND_NAME } from "../../brand";

interface MobileTopBarProps {
  title?: string;
}

export function MobileTopBar({ title }: MobileTopBarProps) {
  const { theme, toggle } = useTheme();
  const { user, switchUser } = useUser();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line bg-surface-elevated pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <Link to="/" className="shrink-0 font-serif text-base font-semibold text-ink">
          {BRAND_NAME}
        </Link>
        {title ? (
          <p className="min-w-0 flex-1 truncate text-center text-xs font-medium text-ink-muted">
            {title}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        <div className="flex shrink-0 items-center gap-1">
          {user ? <UserBadge user={user} onSwitch={switchUser} compact /> : null}
          <button
            type="button"
            onClick={toggle}
            className="btn-ghost px-2 text-xs"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </header>
  );
}
