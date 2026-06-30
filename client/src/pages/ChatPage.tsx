import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAiStatus, sendChat, synthesizeMatter } from "../services/aiApi";
import type { ChatResponse } from "../types";

interface Message {
  role: "user" | "assistant";
  content: string;
  structured?: ChatResponse;
}

const STARTERS = [
  "What are the top risks in this data room?",
  "Summarise employment liabilities",
  "Which contracts have change of control restrictions?",
  "What could impact deal valuation?",
];

export function ChatPage() {
  const { matterId = "" } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAiStatus()
      .then((s) => setAiReady(s.configured))
      .catch(() => setAiReady(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg].map((x) => ({
        role: x.role,
        content: x.role === "assistant" && x.structured ? x.structured.answer : x.content,
      }));
      const response = await sendChat(matterId, trimmed, history);
      setMessages((m) => [...m, { role: "assistant", content: response.answer, structured: response }]);
    } catch (e: unknown) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "Chat failed",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col">
      <div className="mb-4 flex flex-col gap-3 max-lg:gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          Natural language assistant over analyzed documents. Answers cite source files.
        </p>
        <button
          type="button"
          className="btn-secondary text-xs max-lg:w-full max-lg:justify-center"
          onClick={() => void synthesizeMatter(matterId, false).catch(() => {})}
        >
          Refresh matter intelligence
        </button>
      </div>

      {aiReady === false && matterId !== "matter-acme" ? (
        <p className="mb-4 rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
          Groq API not configured. Add GROQ_API_KEY to server/.env and restart the API.
        </p>
      ) : null}

      <div className="card flex min-h-[420px] flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-auto p-4">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-muted">Try a question:</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-xs text-ink-muted hover:border-brand/30 hover:text-brand"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {messages.map((m, i) => (
            <div
              key={i}
              className={[
                "max-w-[90%] rounded-xl px-4 py-3 text-sm",
                m.role === "user"
                  ? "ml-auto bg-brand text-white"
                  : "bg-surface-muted text-ink",
              ].join(" ")}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              {m.structured?.structured_points?.length ? (
                <ul className="mt-2 list-inside list-disc text-xs opacity-90">
                  {m.structured.structured_points.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
              ) : null}
              {m.structured?.citations?.length ? (
                <div className="mt-3 space-y-1 border-t border-line/50 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    Citations
                  </p>
                  {m.structured.citations.map((c, j) => (
                    <p key={j} className="text-xs">
                      <Link
                        to={`/matters/${matterId}/documents/${c.document_id}`}
                        className="font-medium underline"
                      >
                        {c.document_name}
                      </Link>
                      {c.source_reference ? ` · ${c.source_reference}` : ""}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {loading ? (
            <p className="text-sm text-ink-faint">Analyzing data room…</p>
          ) : null}
          <div ref={bottomRef} />
        </div>
        <form
          className="flex gap-2 border-t border-line/70 p-3 max-lg:flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about risks, clauses, employment, valuation…"
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button type="submit" disabled={loading} className="btn-primary shrink-0 max-lg:w-full">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
