import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
/** Pause between batch document analyses to respect free-tier TPM limits */
export const GROQ_ANALYZE_DELAY_MS = Number(process.env.GROQ_ANALYZE_DELAY_MS) || 12_000;

export function isGroqConfigured() {
  return Boolean(GROQ_API_KEY);
}
