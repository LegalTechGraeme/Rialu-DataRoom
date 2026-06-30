import { Link } from "react-router-dom";
import { UserBadge } from "../auth/UserBadge";
import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import { BRAND_NAME } from "../../brand";

export function MobileTopBar() {
  const { theme, toggle } = useTheme();
  const { user, switchUser } = useUser();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line bg-surface pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="flex h-11 items-center justify-between gap-3 px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
        <Link to="/" className="font-serif text-base font-semibold text-ink">
          {BRAND_NAME}
        </Link>
        <div className="flex items-center gap-1">
          {user ? <UserBadge user={user} onSwitch={switchUser} compact /> : null}
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg px-2 py-1.5 text-xs text-ink-muted hover:bg-surface-muted"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}
