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

  return (
    <div className="flex h-full min-h-0 bg-surface max-lg:min-h-dvh">
      <Sidebar>{sidebarFooter}</Sidebar>
      <div className="relative flex min-w-0 flex-1 flex-col max-lg:pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <MobileTopBar />
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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children ?? <Outlet />}</div>
        ) : (
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-8 py-8 max-lg:px-5 max-lg:py-6 md:px-10 md:py-10">
            <div className="mx-auto w-full max-w-6xl">{children ?? <Outlet />}</div>
          </main>
        )}
        <MobileBottomNav />
      </div>
    </div>
  );
}
