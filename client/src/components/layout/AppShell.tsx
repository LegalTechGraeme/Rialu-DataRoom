import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileTopBar } from "./MobileTopBar";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  title?: string;
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
  const showTopbar = Boolean(title || subtitle);
  const mobileTitle = title || undefined;

  return (
    <div className="flex h-full min-h-0 bg-surface">
      <Sidebar>{sidebarFooter}</Sidebar>
      <div className="relative flex min-w-0 flex-1 flex-col max-lg:pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <MobileTopBar title={mobileTitle} />
        {showTopbar ? (
          <div className="hidden lg:block">
            <Topbar title={title ?? ""} subtitle={subtitle} matterId={matterId} />
          </div>
        ) : (
          <div className="hidden lg:block">
            <Topbar title="" matterId={matterId} minimal />
          </div>
        )}
        {fullBleed ? (
          <div className="min-h-0 flex-1 overflow-hidden">{children ?? <Outlet />}</div>
        ) : (
          <main className="min-h-0 flex-1 overflow-auto px-8 py-8 max-lg:px-4 max-lg:py-4 md:px-10 md:py-10">
            <div className="mx-auto max-w-6xl">{children ?? <Outlet />}</div>
          </main>
        )}
        <MobileBottomNav />
      </div>
    </div>
  );
}
