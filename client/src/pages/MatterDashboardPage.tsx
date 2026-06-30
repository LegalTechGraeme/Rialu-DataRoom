import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ClauseTypeLegend } from "../components/dashboard/ClauseTypeLegend";
import { HowToUsePanel } from "../components/dashboard/HowToUsePanel";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { StatsCards } from "../components/dashboard/StatsCards";
import { ExportButtons } from "../components/room/ExportButtons";
import { FullReviewPanel } from "../components/room/FullReviewPanel";
import { UploadDropzone } from "../components/room/UploadDropzone";
import { fetchDashboard, fetchMatter } from "../services/mattersApi";
import { refileDocuments } from "../services/workflowApi";
import type { DashboardPayload, Matter } from "../types";

export function MatterDashboardPage() {
  const { matterId = "" } = useParams();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [dash, setDash] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refiling, setRefiling] = useState(false);
  const [statsPulse, setStatsPulse] = useState(false);
  const isDemo = matterId === "matter-acme";

  const load = useCallback(() => {
    Promise.all([fetchMatter(matterId), fetchDashboard(matterId)])
      .then(([m, d]) => {
        setMatter(m);
        setDash(d);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      });
  }, [matterId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!matter || !dash) {
    return <p className="text-sm text-ink-muted">Loading overview…</p>;
  }

  const stats = [
    { label: "Documents in portfolio", value: dash.stats.totalDocuments },
    { label: "Folders indexed", value: dash.stats.folders },
    {
      label: "Reviewed",
      value: `${dash.stats.reviewedPercent}%`,
      hint: "Share with diligence flags",
    },
    { label: "Flagged issues", value: dash.stats.flaggedIssues },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          {matter.name} — upload documents, run AI review, and track diligence across the data room.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 max-lg:flex-col">
          <Link to={`/matters/${matterId}/room`} className="btn-primary max-lg:w-full max-lg:justify-center">
            Open data room
          </Link>
          <Link to={`/matters/${matterId}/workflow`} className="btn-secondary max-lg:w-full max-lg:justify-center">
            Workflow
          </Link>
          <Link to={`/matters/${matterId}/chat`} className="btn-secondary max-lg:w-full max-lg:justify-center">
            Legal assistant
          </Link>
        </div>
      </div>

      <StatsCards items={stats} pulse={statsPulse} />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <RecentActivity items={dash.recentActivity} />
        <div className="space-y-6">
          <HowToUsePanel />
          <ClauseTypeLegend />
        </div>
      </div>

      {!isDemo ? (
        <section className="card space-y-4 p-5">
          <h2 className="text-sm font-semibold text-ink">Upload documents</h2>
          <UploadDropzone matterId={matterId} onUploaded={load} />
          {dash.stats.totalDocuments > 0 ? (
            <button
              type="button"
              className="btn-secondary"
              disabled={refiling}
              onClick={() => {
                setRefiling(true);
                refileDocuments(matterId)
                  .then(() => load())
                  .catch((e: unknown) =>
                    setError(e instanceof Error ? e.message : "Re-file failed")
                  )
                  .finally(() => setRefiling(false));
              }}
            >
              {refiling ? "Re-filing…" : "Re-file documents into folders"}
            </button>
          ) : null}
        </section>
      ) : (
        <p className="card px-5 py-4 text-sm text-ink-muted">
          This matter ships with a sample document portfolio. Create a new data room to upload your
          own documents.
        </p>
      )}

      <FullReviewPanel
        matterId={matterId}
        onComplete={() => {
          load();
          setStatsPulse(true);
          window.setTimeout(() => setStatsPulse(false), 2500);
        }}
      />

      <section className="space-y-3">
        <h2 className="section-label">Export</h2>
        <ExportButtons matterId={matterId} />
      </section>
    </div>
  );
}
