import type { ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { BRAND_NAME, BRAND_TAGLINE } from "../../brand";

function navClass({ isActive }: { isActive: boolean }) {
  return ["nav-link", isActive ? "nav-link-active" : ""].join(" ");
}

export function Sidebar({ children }: { children?: ReactNode }) {
  const { matterId } = useParams<{ matterId?: string }>();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line/80 bg-surface-elevated">
      <div className="border-b border-line/70 px-4 py-5">
        <Link to="/" className="block rounded-lg p-1 transition hover:bg-brand-soft/50">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand shadow-sm" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand">
              {BRAND_TAGLINE}
            </span>
          </div>
          <span className="text-base font-semibold tracking-tight text-ink">{BRAND_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        <NavLink to="/" end className={navClass}>
          All matters
        </NavLink>

        {matterId ? (
          <>
            <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              This matter
            </p>
            <NavLink to={`/matters/${matterId}`} end className={navClass}>
              Overview
            </NavLink>
            <NavLink to={`/matters/${matterId}/room`} className={navClass}>
              Data room
            </NavLink>
            <NavLink to={`/matters/${matterId}/workflow`} className={navClass}>
              Workflow
            </NavLink>
            <NavLink to={`/matters/${matterId}/report`} className={navClass}>
              Diligence report
            </NavLink>
            <NavLink to={`/matters/${matterId}/risks`} className={navClass}>
              Risk register
            </NavLink>
            <NavLink to={`/matters/${matterId}/chat`} className={navClass}>
              Legal assistant
            </NavLink>
          </>
        ) : (
          <p className="px-3 py-2 text-xs leading-relaxed text-ink-faint">
            Open a matter to access the data room and diligence tools.
          </p>
        )}
      </nav>

      {children ? <div className="border-t border-line/70 p-3">{children}</div> : null}
    </aside>
  );
}
