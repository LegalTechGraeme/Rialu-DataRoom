import type { ReactNode } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { RoleLoginGate } from "./components/auth/RoleLoginGate";
import { AppShell } from "./components/layout/AppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import { DataRoomExplorerPage } from "./pages/DataRoomExplorerPage";
import { DocumentPage } from "./pages/DocumentPage";
import { HomePage } from "./pages/HomePage";
import { MatterDashboardPage } from "./pages/MatterDashboardPage";
import { DiligenceReportPage } from "./pages/DiligenceReportPage";
import { ChatPage } from "./pages/ChatPage";
import { RiskRegisterPage } from "./pages/RiskRegisterPage";
import { WorkflowPage } from "./pages/WorkflowPage";

function MatterShell({
  title,
  fullBleed,
  children,
}: {
  title: string;
  fullBleed?: boolean;
  children: ReactNode;
}) {
  const { matterId } = useParams();
  return (
    <AppShell title={title} matterId={matterId} fullBleed={fullBleed}>
      {children}
    </AppShell>
  );
}

function ExplorerRoute() {
  return (
    <MatterShell title="Data room" fullBleed>
      <DataRoomExplorerPage />
    </MatterShell>
  );
}

function DocumentRoute() {
  return (
    <MatterShell title="Document" fullBleed>
      <div className="flex h-full min-h-0 flex-col px-6 py-4">
        <DocumentPage />
      </div>
    </MatterShell>
  );
}

function WorkflowRoute() {
  return (
    <MatterShell title="Workflow" fullBleed>
      <div className="h-full overflow-auto px-8 py-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          <WorkflowPage />
        </div>
      </div>
    </MatterShell>
  );
}

function AuthenticatedApp() {
  const { user, users, login } = useUser();

  if (!user) {
    return <RoleLoginGate users={users} onSelect={login} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppShell title="">
            <HomePage />
          </AppShell>
        }
      />
      <Route
        path="/matters/:matterId"
        element={
          <MatterShell title="Overview">
            <MatterDashboardPage />
          </MatterShell>
        }
      />
      <Route path="/matters/:matterId/room" element={<ExplorerRoute />} />
      <Route path="/matters/:matterId/workflow" element={<WorkflowRoute />} />
      <Route
        path="/matters/:matterId/report"
        element={
          <MatterShell title="Diligence report">
            <DiligenceReportPage />
          </MatterShell>
        }
      />
      <Route
        path="/matters/:matterId/chat"
        element={
          <MatterShell title="Assistant">
            <ChatPage />
          </MatterShell>
        }
      />
      <Route
        path="/matters/:matterId/risks"
        element={
          <MatterShell title="Risks">
            <RiskRegisterPage />
          </MatterShell>
        }
      />
      <Route path="/matters/:matterId/documents/:documentId" element={<DocumentRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AuthenticatedApp />
      </UserProvider>
    </ThemeProvider>
  );
}
