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
    "flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-colors",
    isActive ? "text-brand" : "text-ink-muted",
  ].join(" ");
}

export function MobileBottomNav() {
  const { matterId } = useParams<{ matterId?: string }>();

  const matterTabs = matterId
    ? [
        { to: `/matters/${matterId}`, label: "Overview", icon: <IconOverview />, end: true },
        { to: `/matters/${matterId}/room`, label: "Room", icon: <IconDocuments /> },
        { to: `/matters/${matterId}/workflow`, label: "Tasks", icon: <IconWorkflow /> },
        { to: `/matters/${matterId}/risks`, label: "Risks", icon: <IconRisks /> },
        { to: `/matters/${matterId}/chat`, label: "Assistant", icon: <IconChat /> },
      ]
    : [{ to: "/", label: "Matters", icon: <IconMatters />, end: true }];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-surface-elevated pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-stretch justify-around">
        {matterTabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
            <span className="h-5 w-5 [&_svg]:h-5 [&_svg]:w-5">{tab.icon}</span>
            <span className="truncate">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
