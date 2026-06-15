import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
    return <p className="text-sm text-ink-muted">Loading dashboard…</p>;
  }

  const stats = [
    { label: "Total documents", value: dash.stats.totalDocuments },
    { label: "Folders", value: dash.stats.folders, hint: "Standard diligence index" },
    {
      label: "Reviewed",
      value: `${dash.stats.reviewedPercent}%`,
      hint: "Documents with diligence flags",
    },
    { label: "Flagged issues", value: dash.stats.flaggedIssues },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="section-label">Matter</p>
        <h1 className="mt-2 page-title">{matter.name}</h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to={`/matters/${matterId}/room`} className="btn-primary">
            Open data room
          </Link>
          <Link to={`/matters/${matterId}/workflow`} className="btn-secondary">
            Workflow
          </Link>
          <Link to={`/matters/${matterId}/report`} className="btn-secondary">
            Diligence report
          </Link>
          <Link to={`/matters/${matterId}/risks`} className="btn-secondary">
            Risk register
          </Link>
          <Link to={`/matters/${matterId}/chat`} className="btn-ghost">
            Legal assistant
          </Link>
        </div>
      </div>

      <StatsCards items={stats} />

      {!isDemo ? (
        <section className="space-y-4">
          <h2 className="section-label">Upload documents</h2>
          <UploadDropzone matterId={matterId} onUploaded={load} />
          {dash.stats.totalDocuments > 0 ? (
            <button
              type="button"
              className="btn-secondary mt-3"
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
        <p className="rounded-lg border border-line bg-surface-muted/50 px-4 py-3 text-sm text-ink-muted">
          The Acme demo room uses simulated data. Create a new data room to upload your own
          documents.
        </p>
      )}

      <FullReviewPanel matterId={matterId} onComplete={load} />

      <section className="space-y-3">
        <h2 className="section-label">Export</h2>
        <ExportButtons matterId={matterId} />
      </section>

      <RecentActivity items={dash.recentActivity} />
    </div>
  );
}
