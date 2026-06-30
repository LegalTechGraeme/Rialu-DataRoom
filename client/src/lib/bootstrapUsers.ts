import { apiUrl } from "../services/apiClient";
import type { DemoUser } from "../types/users";

const BOOTSTRAP_TIMEOUT_MS = 50_000;
const MAX_ATTEMPTS = 6;
const RETRY_DELAY_MS = 4_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUsersOnce(): Promise<DemoUser[]> {
  const res = await fetch(apiUrl("/api/users"), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(BOOTSTRAP_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { users: DemoUser[] };
  return data.users;
}

/** Retry user fetch while Render free tier cold-starts. */
export async function bootstrapDemoUsers(signal?: AbortSignal): Promise<DemoUser[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    try {
      return await fetchUsersOnce();
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error("Connection failed");
      const isLast = attempt === MAX_ATTEMPTS - 1;
      if (isLast || signal?.aborted) break;
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw (
    lastError ??
    new Error("The server is taking longer than expected. Please try again in a moment.")
  );
}
