import { isSimulationMatter } from "../matterStore.js";

/** Demo simulation matter must never hit live Groq — use committed bundle only. */
export function useDemoAiOnly(matterId) {
  return isSimulationMatter(matterId);
}

/** @param {string} matterId @param {string} feature */
export function assertLiveGroqAllowed(matterId, feature) {
  if (useDemoAiOnly(matterId)) {
    throw new Error(
      `Live Groq ${feature} is disabled for the demo matter. Pre-generated diligence outputs are used instead.`
    );
  }
}
