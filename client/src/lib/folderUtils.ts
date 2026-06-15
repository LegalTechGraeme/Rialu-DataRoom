import type { FolderNode } from "../types";

export function findFolderById(root: FolderNode, id: string): FolderNode | null {
  if (root.id === id) return root;
  for (const c of root.children) {
    const f = findFolderById(c, id);
    if (f) return f;
  }
  return null;
}
