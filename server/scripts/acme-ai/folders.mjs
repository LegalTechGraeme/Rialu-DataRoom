/**
 * VDR folder layout (numbered, realistic index) mapped to Rialu simulation folder IDs.
 * ChatGPT prompt used 01–11 numbering; Rialu uses fld-* IDs in mockData.
 */
export const VDR_FOLDERS = [
  {
    vdr: "01_Corporate",
    label: "Corporate",
    rialuId: "fld-corp",
    subfolders: [
      { vdr: "Charter_and_Constitution", rialuId: "fld-corp-charter" },
      { vdr: "Board_and_Shareholder", rialuId: "fld-corp-minutes" },
      { vdr: "Subsidiaries", rialuId: "fld-corp-subs" },
    ],
  },
  {
    vdr: "02_Capitalisation",
    label: "Capitalisation",
    rialuId: "fld-sh",
    subfolders: [{ vdr: "Equity_and_Shareholders", rialuId: "fld-sh-cap" }],
  },
  {
    vdr: "03_Financials",
    label: "Financials",
    rialuId: "fld-fin",
    subfolders: [{ vdr: "Accounts_and_Management", rialuId: "fld-fin-facilities" }],
  },
  {
    vdr: "04_Commercial_Contracts",
    label: "Commercial Contracts",
    rialuId: "fld-comm",
    subfolders: [{ vdr: "Customer_and_Supplier", rialuId: "fld-comm-msa" }],
  },
  {
    vdr: "05_Employment",
    label: "Employment",
    rialuId: "fld-emp",
    subfolders: [
      { vdr: "Executive_Agreements", rialuId: "fld-emp-contracts" },
      { vdr: "Policies_and_Handbooks", rialuId: "fld-emp-policies" },
    ],
  },
  {
    vdr: "06_Intellectual_Property",
    label: "Intellectual Property",
    rialuId: "fld-ip",
    subfolders: [{ vdr: "IP_Register_and_Licences", rialuId: "fld-ip-licences" }],
  },
  {
    vdr: "07_Litigation",
    label: "Litigation",
    rialuId: "fld-lit",
    subfolders: [],
  },
  {
    vdr: "08_Data_Protection_GDPR",
    label: "Data Protection / GDPR",
    rialuId: "fld-reg",
    subfolders: [],
  },
  {
    vdr: "09_Tax",
    label: "Tax",
    rialuId: "fld-tax",
    subfolders: [],
  },
  {
    vdr: "10_Insurance",
    label: "Insurance",
    rialuId: "fld-ins",
    subfolders: [],
  },
  {
    vdr: "11_Regulatory_Compliance",
    label: "Regulatory / Compliance",
    rialuId: "fld-reg",
    subfolders: [],
  },
];

/** @param {string} rialuFolderId */
export function vdrPathForRialuFolder(rialuFolderId) {
  for (const f of VDR_FOLDERS) {
    if (f.rialuId === rialuFolderId) return f.vdr;
    for (const s of f.subfolders) {
      if (s.rialuId === rialuFolderId) return `${f.vdr}/${s.vdr}`;
    }
  }
  return "99_Miscellaneous";
}
