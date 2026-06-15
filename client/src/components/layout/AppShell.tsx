import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  title: string;
  subtitle?: string;
  matterId?: string;
  sidebarFooter?: ReactNode;
  fullBleed?: boolean;
  children?: ReactNode;
}

export function AppShell({
  title,
  subtitle,
  matterId,
  sidebarFooter,
  fullBleed,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-full min-h-0 bg-gradient-to-br from-surface via-surface to-brand-soft/30">
      <Sidebar>{sidebarFooter}</Sidebar>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} matterId={matterId} />
        {fullBleed ? (
          <div className="min-h-0 flex-1 overflow-hidden">{children ?? <Outlet />}</div>
        ) : (
          <main className="min-h-0 flex-1 overflow-auto px-6 py-8 md:px-10 md:py-10">
            <div className="mx-auto max-w-4xl">{children ?? <Outlet />}</div>
          </main>
        )}
      </div>
    </div>
  );
}
