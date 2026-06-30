import analyses from "../../../simulation/ai/matter-acme/analyses.json" with { type: "json" };
import synthesis from "../../../simulation/ai/matter-acme/synthesis.json" with { type: "json" };
import report from "../../../simulation/ai/matter-acme/report.json" with { type: "json" };
import chat from "../../../simulation/ai/matter-acme/chat.json" with { type: "json" };

/** Committed demo AI outputs — imported at startup so Render always has them. */
export const MATTER_ACME_DEMO_BUNDLE = {
  analyses,
  synthesis,
  report,
  chat,
};
