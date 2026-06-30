import { useState } from "react";
import { BRAND_NAME } from "../../brand";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; clientRef?: string; dealType?: string }) => Promise<void>;
}

export function CreateRoomModal({ open, onClose, onSubmit }: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [clientRef, setClientRef] = useState("");
  const [dealType, setDealType] = useState("M&A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        clientRef: clientRef.trim() || undefined,
        dealType: dealType.trim() || undefined,
      });
      setName("");
      setClientRef("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm max-lg:items-end max-lg:p-0">
      <div className="card w-full max-w-md p-6 shadow-lg max-lg:max-h-[92vh] max-lg:overflow-y-auto max-lg:rounded-b-none max-lg:rounded-t-2xl" role="dialog" aria-labelledby="create-room-title">
        <h2 id="create-room-title" className="text-lg font-semibold text-ink">
          Create data room
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Set up a new {BRAND_NAME} diligence workspace with a standard folder index.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">Matter name</span>
            <input
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Atlas / Target Co."
              required
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">Client reference (optional)</span>
            <input
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              value={clientRef}
              onChange={(e) => setClientRef(e.target.value)}
              placeholder="e.g. 2026-DD-0201"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">Deal type</span>
            <select
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
            >
              <option value="M&A">M&A</option>
              <option value="VC / Growth">VC / Growth</option>
              <option value="Real estate">Real estate</option>
              <option value="Refinancing">Refinancing</option>
              <option value="Other">Other</option>
            </select>
          </label>
          {error ? (
            <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2 max-lg:flex-col-reverse max-lg:[&>button]:w-full">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? "Creating…" : "Create room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
