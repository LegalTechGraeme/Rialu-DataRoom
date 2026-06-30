import type { ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { BRAND_NAME, BRAND_TAGLINE } from "../../brand";
import {
  IconChat,
  IconDocuments,
  IconMatters,
  IconOverview,
  IconReport,
  IconRisks,
  IconWorkflow,
} from "./NavIcons";
import { SidebarStats } from "./SidebarStats";

function navClass({ isActive }: { isActive: boolean }) {
  return ["nav-link", isActive ? "nav-link-active" : ""].join(" ");
}

function NavItem({
  to,
  end,
  icon,
  children,
}: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <NavLink to={to} end={end} className={navClass}>
      <span className="h-4 w-4 shrink-0 opacity-80 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      {children}
    </NavLink>
  );
}

export function Sidebar({ children }: { children?: ReactNode }) {
  const { matterId } = useParams<{ matterId?: string }>();

  return (
    <aside className="hidden w-[15.5rem] shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="px-5 py-6">
        <Link to="/" className="block transition hover:opacity-80">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-ink">{BRAND_NAME}</h1>
          <p className="mt-1 text-xs text-ink-muted">{BRAND_TAGLINE}</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        <NavItem to="/" end icon={<IconMatters />}>
          All matters
        </NavItem>

        {matterId ? (
          <>
            <p className="mb-1 mt-5 px-3 text-[10px] font-medium uppercase tracking-wider text-ink-faint">
              This matter
            </p>
            <NavItem to={`/matters/${matterId}`} end icon={<IconOverview />}>
              Overview
            </NavItem>
            <NavItem to={`/matters/${matterId}/room`} icon={<IconDocuments />}>
              Data room
            </NavItem>
            <NavItem to={`/matters/${matterId}/workflow`} icon={<IconWorkflow />}>
              Workflow
            </NavItem>
            <NavItem to={`/matters/${matterId}/report`} icon={<IconReport />}>
              Diligence report
            </NavItem>
            <NavItem to={`/matters/${matterId}/risks`} icon={<IconRisks />}>
              Risk register
            </NavItem>
            <NavItem to={`/matters/${matterId}/chat`} icon={<IconChat />}>
              Legal assistant
            </NavItem>
          </>
        ) : (
          <p className="px-3 py-3 text-xs leading-relaxed text-ink-faint">
            Open a matter to access the data room and diligence tools.
          </p>
        )}
      </nav>

      <div className="border-t border-line px-5 py-4">
        {children ?? <SidebarStats />}
      </div>
    </aside>
  );
}
