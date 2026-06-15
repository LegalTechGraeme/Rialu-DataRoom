/**
 * Standard legal due diligence folder tree template.
 * @param {string} matterId
 * @returns {import('./types.js').FolderNode}
 */
export function createStandardFolderTree(matterId) {
  const rootId = `root-${matterId}`;
  const mk = (id, name, parentId, children = []) => ({
    id: `${id}-${matterId}`,
    name,
    matterId,
    parentId: parentId === null ? null : `${parentId}-${matterId}`,
    children: children.map((c) =>
      typeof c === "string"
        ? { id: `${c}-${matterId}`, name: c, matterId, parentId: `${id}-${matterId}`, children: [] }
        : mk(c.id, c.name, id, c.children ?? [])
    ),
  });

  return {
    id: rootId,
    name: "Data Room Index",
    matterId,
    parentId: null,
    children: [
      mk("fld-corp", "Corporate", "root", [
        { id: "fld-corp-charter", name: "Charter & Governance" },
        { id: "fld-corp-subs", name: "Subsidiaries" },
        { id: "fld-corp-minutes", name: "Board & Shareholder Minutes" },
      ]),
      mk("fld-emp", "Employment", "root", [
        { id: "fld-emp-policies", name: "Policies & Handbooks" },
        { id: "fld-emp-contracts", name: "Executive Agreements" },
        { id: "fld-emp-pensions", name: "Pensions & Benefits" },
      ]),
      mk("fld-comm", "Commercial Contracts", "root", [
        { id: "fld-comm-msa", name: "Master Services" },
        { id: "fld-comm-customer", name: "Customer Agreements" },
        { id: "fld-comm-supplier", name: "Supplier Agreements" },
      ]),
      mk("fld-ip", "Intellectual Property", "root", [
        { id: "fld-ip-patents", name: "Patents & Trademarks" },
        { id: "fld-ip-licences", name: "Licences" },
      ]),
      mk("fld-saas", "SaaS & Technology", "root", []),
      mk("fld-prop", "Property", "root", [
        { id: "fld-prop-lease", name: "Leases" },
        { id: "fld-prop-title", name: "Title & Searches" },
      ]),
      mk("fld-lit", "Litigation & Disputes", "root", []),
      mk("fld-reg", "Regulatory & Compliance", "root", []),
      mk("fld-tax", "Tax", "root", []),
      mk("fld-fin", "Finance & Banking", "root", [
        { id: "fld-fin-facilities", name: "Facilities & Security" },
      ]),
      mk("fld-sh", "Shareholder Documents", "root", [
        { id: "fld-sh-cap", name: "Cap Table & Equity" },
        { id: "fld-sh-agreements", name: "Shareholder Agreements" },
      ]),
      mk("fld-ins", "Insurance", "root", []),
      mk("fld-misc", "Uncategorised", "root", []),
    ],
  };
}

/** @param {import('./types.js').FolderNode} node */
export function flattenFolders(node, acc = []) {
  if (!node) return acc;
  acc.push({ id: node.id, name: node.name, parentId: node.parentId });
  for (const c of node.children ?? []) flattenFolders(c, acc);
  return acc;
}

/** @param {import('./types.js').FolderNode} node @param {string} id */
export function findFolderInTree(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const c of node.children ?? []) {
    const f = findFolderInTree(c, id);
    if (f) return f;
  }
  return null;
}

/** Default folder for explorer on new matters */
export function defaultExplorerFolderId(matterId) {
  return `fld-corp-charter-${matterId}`;
}
