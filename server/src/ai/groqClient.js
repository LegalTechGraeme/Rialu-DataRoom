import { GROQ_API_KEY, GROQ_MODEL } from "../config.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_RETRIES = 6;

/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} errText */
function retryDelayMs(errText) {
  const match = errText.match(/try again in ([\d.]+)s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 1000;
  return 16_000;
}

/**
 * @param {{ system: string; user: string; json?: boolean; temperature?: number }} opts
 */
export async function groqChat({ system, user, json = true, temperature = 0.2 }) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set. Add it to server/.env");
  }

  const body = {
    model: GROQ_MODEL,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  if (json) {
    body.response_format = { type: "json_object" };
  }

  let lastErr = "";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq");

      if (json) {
        try {
          return JSON.parse(content);
        } catch {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) return JSON.parse(match[0]);
          throw new Error("Failed to parse JSON from Groq response");
        }
      }
      return content;
    }

    const errText = await res.text();
    lastErr = `Groq API error ${res.status}: ${errText.slice(0, 500)}`;

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const wait = retryDelayMs(errText);
      await sleep(wait);
      continue;
    }

    throw new Error(lastErr);
  }

  throw new Error(lastErr || "Groq request failed");
}
