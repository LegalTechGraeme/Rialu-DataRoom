import { useCallback, useEffect, useRef } from "react";
import { renderFormattedDocument } from "../../lib/documentTextFormat";
import type { TextHighlight } from "../../lib/documentTextFormat";
import type { DocumentRecord } from "../../types";
import { documentFileUrl } from "../../services/apiClient";

export interface TextSelection {
  text: string;
  start: number;
  end: number;
}

export type { TextHighlight };

interface InteractiveDocumentPreviewProps {
  matterId: string;
  document: DocumentRecord;
  text: string | null;
  loading?: boolean;
  error?: string | null;
  highlights?: TextHighlight[];
  scrollToHighlightId?: string | null;
  onSelection?: (selection: TextSelection | null) => void;
  onTextLoaded?: (text: string) => void;
}

export function InteractiveDocumentPreview({
  matterId,
  document: doc,
  text,
  loading = false,
  error = null,
  highlights = [],
  scrollToHighlightId,
  onSelection,
  onTextLoaded,
}: InteractiveDocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTextLoadedRef = useRef(onTextLoaded);
  onTextLoadedRef.current = onTextLoaded;

  useEffect(() => {
    if (text) onTextLoadedRef.current?.(text);
  }, [text]);

  useEffect(() => {
    if (!scrollToHighlightId || !text) return;
    const timer = window.setTimeout(() => {
      containerRef.current
        ?.querySelector(`[data-highlight-id="${scrollToHighlightId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [scrollToHighlightId, text, highlights]);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) {
      onSelection?.(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      onSelection?.(null);
      return;
    }
    const selectedText = sel.toString().trim();
    if (selectedText.length < 8) {
      onSelection?.(null);
      return;
    }
    const offsets = getOffsetsFromSelection(containerRef.current, range);
    if (offsets) onSelection?.({ text: selectedText, ...offsets });
  }, [onSelection]);

  if (loading && !text) {
    return (
      <div className="flex h-full min-h-[280px] flex-1 items-center justify-center text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  if (error || !text) {
    return (
      <div className="flex h-full min-h-[280px] flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm text-ink-muted">{error ?? "Preview unavailable"}</p>
        <a
          href={documentFileUrl(matterId, doc.id, null)}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-brand hover:underline"
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="min-h-0 flex-1 overflow-auto bg-surface px-8 py-8 dark:bg-surface"
    >
      <div className="mx-auto max-w-[42rem] font-serif text-[15px] leading-[1.85] text-ink selection:bg-black/10 dark:selection:bg-white/15">
        {renderFormattedDocument(text, highlights, scrollToHighlightId)}
      </div>
    </div>
  );
}

function getOffsetsFromSelection(
  container: HTMLElement,
  range: Range
): { start: number; end: number } | null {
  const pre = range.cloneRange();
  pre.selectNodeContents(container);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  return { start, end: start + range.toString().length };
}

export { findTextInDocument as findClauseOffsets } from "../../lib/textMatch";
