import type { ReactNode } from "react";

export interface TextHighlight {
  start: number;
  end: number;
  label?: string;
  id?: string;
}

export type DocumentBlock = {
  type: "heading" | "paragraph";
  text: string;
  start: number;
  end: number;
};

/** Split document text into paragraphs while preserving character offsets. */
export function splitDocumentParagraphs(content: string): { text: string; start: number; end: number }[] {
  const result: { text: string; start: number; end: number }[] = [];
  let i = 0;

  while (i < content.length) {
    while (i < content.length && content[i] === "\n") i += 1;
    if (i >= content.length) break;

    const start = i;
    while (i < content.length) {
      if (content[i] === "\n" && (i + 1 >= content.length || content[i + 1] === "\n")) break;
      i += 1;
    }
    const end = i;
    const text = content.slice(start, end);
    if (text.trim()) result.push({ text, start, end });
    while (i < content.length && content[i] === "\n") i += 1;
  }

  return result;
}

function isHeadingParagraph(text: string, isFirst: boolean): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("## ")) return true;

  const line = trimmed.split("\n")[0]?.trim() ?? "";
  if (!line || line.length > 140) return false;
  if (trimmed.includes("\n")) return false;

  if (isFirst && line.length <= 90 && !line.endsWith(".")) return true;

  const letters = line.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 4 && line === line.toUpperCase() && /[A-Z]/.test(line)) return true;

  if (/^\d+(\.\d+)*[.)]\s+\S/.test(line) && line.length <= 100) return true;

  if (
    line.length <= 72 &&
    /^[A-Z]/.test(line) &&
    !line.endsWith(".") &&
    !line.includes(":") &&
    line.split(/\s+/).length <= 8
  ) {
    return true;
  }

  return false;
}

export function parseDocumentBlocks(content: string): DocumentBlock[] {
  return splitDocumentParagraphs(content).map((p, index) => {
    let text = p.text;
    let start = p.start;
    if (text.startsWith("## ")) {
      text = text.slice(3);
      start += 3;
    }
    return {
      type: isHeadingParagraph(text, index === 0) ? "heading" : "paragraph",
      text,
      start,
      end: p.end,
    };
  });
}

function renderHighlightedSlice(
  content: string,
  highlights: TextHighlight[],
  activeId?: string | null
): ReactNode {
  if (!highlights.length) return content;

  const sorted = [...highlights]
    .filter((h) => h.start >= 0 && h.end > h.start && h.end <= content.length)
    .sort((a, b) => a.start - b.start);

  if (!sorted.length) return content;

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const h of sorted) {
    if (h.start < cursor) continue;
    if (h.start > cursor) nodes.push(content.slice(cursor, h.start));
    const isActive = h.id === activeId;
    nodes.push(
      <mark
        key={h.id ?? `${h.start}-${h.end}`}
        data-highlight-id={h.id}
        className={[
          "rounded-sm px-0.5",
          isActive ? "bg-brand/45 ring-1 ring-brand/70" : "bg-brand/25",
        ].join(" ")}
        title={h.label}
      >
        {content.slice(h.start, h.end)}
      </mark>
    );
    cursor = h.end;
  }

  if (cursor < content.length) nodes.push(content.slice(cursor));
  return nodes;
}

export function renderFormattedDocument(
  content: string,
  highlights: TextHighlight[],
  activeId?: string | null
): ReactNode {
  const blocks = parseDocumentBlocks(content);

  return blocks.map((block, index) => {
    const blockHighlights = highlights
      .filter((h) => h.end > block.start && h.start < block.end)
      .map((h) => ({
        ...h,
        start: Math.max(0, h.start - block.start),
        end: Math.min(block.text.length, h.end - block.start),
      }));

    const inner = renderHighlightedSlice(block.text, blockHighlights, activeId);
    const separator = index > 0 ? "\n\n" : null;

    if (block.type === "heading") {
      const Tag = index === 0 ? "h1" : "h2";
      return (
        <span key={`${block.start}-${index}`} className="contents">
          {separator}
          <Tag
            className={
              index === 0
                ? "mb-4 block text-2xl font-bold tracking-tight text-ink"
                : "mb-3 mt-8 block text-lg font-semibold text-ink first:mt-0"
            }
          >
            {inner}
          </Tag>
        </span>
      );
    }

    return (
      <span key={`${block.start}-${index}`} className="contents">
        {separator}
        <p className="mb-4 block last:mb-0">{inner}</p>
      </span>
    );
  });
}
