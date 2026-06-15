/**
 * Single source of mock data for the data room.
 * Folder names resemble typical diligence indices but are data — not UI constants.
 */

/** @type {import('./types.js').Matter[]} */
export const matters = [
  {
    id: "matter-acme",
    name: "Project Northwind / Acme AI Ltd",
    clientRef: "2026-DD-0142",
    openedAt: "2026-03-01T09:00:00.000Z",
    explorerDefaultFolderId: "fld-corp-charter",
    dealType: "M&A",
    source: "simulation",
  },
];

/** Nested folder tree per matter (IDs unique across mock) */
/** @type {Record<string, import('./types.js').FolderNode>} */
export const folderTrees = {
  "matter-acme": {
    id: "root-matter-acme",
    name: "Data Room Index",
    matterId: "matter-acme",
    parentId: null,
    children: [
      {
        id: "fld-corp",
        name: "01 Corporate",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [
          { id: "fld-corp-charter", name: "Charter & Constitution", matterId: "matter-acme", parentId: "fld-corp", children: [] },
          { id: "fld-corp-minutes", name: "Board & Shareholder", matterId: "matter-acme", parentId: "fld-corp", children: [] },
          { id: "fld-corp-subs", name: "Subsidiaries", matterId: "matter-acme", parentId: "fld-corp", children: [] },
        ],
      },
      {
        id: "fld-sh",
        name: "02 Capitalisation",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [
          { id: "fld-sh-cap", name: "Equity & Shareholders", matterId: "matter-acme", parentId: "fld-sh", children: [] },
        ],
      },
      {
        id: "fld-fin",
        name: "03 Financials",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [
          { id: "fld-fin-facilities", name: "Accounts & Management", matterId: "matter-acme", parentId: "fld-fin", children: [] },
        ],
      },
      {
        id: "fld-comm",
        name: "04 Commercial Contracts",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [
          { id: "fld-comm-msa", name: "Customer & Supplier", matterId: "matter-acme", parentId: "fld-comm", children: [] },
        ],
      },
      {
        id: "fld-emp",
        name: "05 Employment",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [
          { id: "fld-emp-contracts", name: "Executive Agreements", matterId: "matter-acme", parentId: "fld-emp", children: [] },
          { id: "fld-emp-policies", name: "Policies & Handbooks", matterId: "matter-acme", parentId: "fld-emp", children: [] },
        ],
      },
      {
        id: "fld-ip",
        name: "06 Intellectual Property",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [
          { id: "fld-ip-licences", name: "IP Register & Licences", matterId: "matter-acme", parentId: "fld-ip", children: [] },
        ],
      },
      {
        id: "fld-lit",
        name: "07 Litigation",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [],
      },
      {
        id: "fld-gdpr",
        name: "08 Data Protection / GDPR",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [],
      },
      {
        id: "fld-tax",
        name: "09 Tax",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [],
      },
      {
        id: "fld-ins",
        name: "10 Insurance",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [],
      },
      {
        id: "fld-reg",
        name: "11 Regulatory / Compliance",
        matterId: "matter-acme",
        parentId: "root-matter-acme",
        children: [],
      },
    ],
  },
};

import { loadSimulation } from "./simulationLoader.js";

const simulation = loadSimulation();

/** @type {import('./types.js').DocumentRecord[]} */
export const documents = simulation.documents;

/** @type {import('./types.js').ActivityItem[]} */
export const activities = simulation.activities;
