import { useCallback, useMemo, useState } from "react";
import type { FolderNode } from "../../types";

interface FolderTreeProps {
  root: FolderNode;
  selectedFolderId: string | null;
  onSelectFolder: (folder: FolderNode) => void;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className="inline-block w-4 shrink-0 text-center text-ink-faint transition-transform"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
      aria-hidden
    >
      ▸
    </span>
  );
}

interface NodeRowProps {
  node: FolderNode;
  depth: number;
  selectedFolderId: string | null;
  onSelectFolder: (folder: FolderNode) => void;
  expanded: Set<string>;
  toggle: (id: string) => void;
}

function NodeRow({
  node,
  depth,
  selectedFolderId,
  onSelectFolder,
  expanded,
  toggle,
}: NodeRowProps) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const isSelected = selectedFolderId === node.id;

  return (
    <div>
      <div
        className="flex min-w-0 items-center"
        style={{ paddingLeft: depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex h-8 w-6 shrink-0 items-center justify-center rounded hover:bg-surface-muted"
            onClick={(e) => {
              e.stopPropagation();
              toggle(node.id);
            }}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Collapse folder" : "Expand folder"}
          >
            <Chevron open={isOpen} />
          </button>
        ) : (
          <span className="inline-flex w-6 shrink-0 justify-center text-ink-faint">·</span>
        )}
        <button
          type="button"
          onClick={() => onSelectFolder(node)}
          className={[
            "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
            isSelected
              ? "bg-accent/10 font-medium text-accent dark:bg-accent/15"
              : "text-ink hover:bg-surface-muted",
          ].join(" ")}
        >
          <span className="truncate">{node.name}</span>
        </button>
      </div>
      {hasChildren && isOpen ? (
        <div>
          {node.children.map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function collectIds(node: FolderNode, acc: string[] = []) {
  acc.push(node.id);
  for (const c of node.children) collectIds(c, acc);
  return acc;
}

export function FolderTree({ root, selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const allIds = useMemo(() => collectIds(root), [root]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allIds));

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => setExpanded(new Set([root.id])), [root.id]);
  const expandAll = useCallback(() => setExpanded(new Set(allIds)), [allIds]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Folders
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={expandAll}
            className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:bg-surface-muted"
          >
            Expand
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:bg-surface-muted"
          >
            Collapse
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto py-2 pr-1">
        <NodeRow
          node={root}
          depth={0}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          expanded={expanded}
          toggle={toggle}
        />
      </div>
    </div>
  );
}
