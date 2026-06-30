import { NavLink, useParams } from "react-router-dom";
import {
  IconChat,
  IconDocuments,
  IconMatters,
  IconOverview,
  IconRisks,
  IconWorkflow,
} from "./NavIcons";

function tabClass({ isActive }: { isActive: boolean }) {
  return [
    "flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden px-0.5 py-1 text-[9px] font-medium leading-tight transition-colors sm:text-[10px]",
    isActive ? "text-brand" : "text-ink-muted",
  ].join(" ");
}

export function MobileBottomNav() {
  const { matterId } = useParams<{ matterId?: string }>();

  const matterTabs = matterId
    ? [
        { to: `/matters/${matterId}`, label: "Home", icon: <IconOverview />, end: true },
        { to: `/matters/${matterId}/room`, label: "Room", icon: <IconDocuments /> },
        { to: `/matters/${matterId}/workflow`, label: "Tasks", icon: <IconWorkflow /> },
        { to: `/matters/${matterId}/risks`, label: "Risks", icon: <IconRisks /> },
        { to: `/matters/${matterId}/chat`, label: "Chat", icon: <IconChat /> },
      ]
    : [{ to: "/", label: "Matters", icon: <IconMatters />, end: true }];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-full overflow-hidden border-t border-line bg-surface-elevated pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:hidden"
      aria-label="Main navigation"
    >
      <div
        className={[
          "grid h-14 w-full max-w-full overflow-hidden",
          matterTabs.length === 5 ? "grid-cols-5" : "grid-cols-1",
        ].join(" ")}
      >
        {matterTabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
            <span className="h-5 w-5 shrink-0 [&_svg]:h-5 [&_svg]:w-5">{tab.icon}</span>
            <span className="w-full truncate text-center">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
