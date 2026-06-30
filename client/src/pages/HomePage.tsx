import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BRAND_NAME } from "../brand";
import { CreateRoomModal } from "../components/room/CreateRoomModal";
import { fetchMatters } from "../services/mattersApi";
import { createMatter } from "../services/workflowApi";
import type { Matter } from "../types";

export function HomePage() {
  const navigate = useNavigate();
  const [matters, setMatters] = useState<Matter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    fetchMatters()
      .then(setMatters)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load matters");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (input: { name: string; clientRef?: string; dealType?: string }) => {
    const matter = await createMatter(input);
    load();
    navigate(`/matters/${matter.id}`);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">Matters</h1>
          <p className="page-subtitle">
            Your {BRAND_NAME} workspace — open a matter to access the data room, AI review, and
            diligence outputs.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full shrink-0 sm:w-auto max-lg:justify-center"
          onClick={() => setShowCreate(true)}
        >
          Create data room
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        {matters === null && !error ? (
          <p className="text-sm text-ink-muted">Loading matters…</p>
        ) : null}
        {matters?.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-muted">No matters yet.</p>
            <button type="button" className="btn-primary mt-5" onClick={() => setShowCreate(true)}>
              Create your first data room
            </button>
          </div>
        ) : null}
        {matters?.map((m) => (
          <Link
            key={m.id}
            to={`/matters/${m.id}`}
            className="card block p-5 transition hover:border-brand/25"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{m.name}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Opened {new Date(m.openedAt).toLocaleDateString()}
                </p>
              </div>
              {m.clientRef ? <span className="pill shrink-0">{m.clientRef}</span> : null}
            </div>
            <span className="mt-3 inline-block text-xs font-medium text-brand">Open matter →</span>
          </Link>
        ))}
      </div>

      <CreateRoomModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
