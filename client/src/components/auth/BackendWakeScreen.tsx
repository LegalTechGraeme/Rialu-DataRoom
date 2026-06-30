import { useEffect, useState } from "react";
import { BRAND_NAME, BRAND_TAGLINE } from "../../brand";

const HINTS = [
  "Connecting to the deal room servers…",
  "Waking the API — free-tier hosting can take up to a minute on first visit.",
  "Almost there. The backend is spinning up after a period of inactivity.",
  "Still connecting — thanks for your patience.",
];

interface BackendWakeScreenProps {
  booting: boolean;
  error: string | null;
  onRetry: () => void;
}

export function BackendWakeScreen({ booting, error, onRetry }: BackendWakeScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    if (!booting) return;
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [booting]);

  useEffect(() => {
    if (!booting) return;
    setHintIndex(Math.min(Math.floor(elapsed / 8), HINTS.length - 1));
  }, [booting, elapsed]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">{BRAND_NAME}</h1>
        <p className="mt-1 text-sm text-ink-muted">{BRAND_TAGLINE}</p>

        <div className="card mx-auto mt-10 px-6 py-8">
          {error ? (
            <>
              <p className="text-sm font-medium text-ink">Could not reach the server</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
              >
                Try again
              </button>
            </>
          ) : (
            <>
              <div
                className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-line border-t-brand"
                aria-hidden
              />
              <p className="mt-5 text-sm font-medium text-ink">{HINTS[hintIndex]}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                Your role picker will appear as soon as the connection is ready.
              </p>
              {elapsed >= 5 ? (
                <p className="mt-3 font-mono text-[11px] text-ink-faint">
                  {elapsed}s elapsed
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
