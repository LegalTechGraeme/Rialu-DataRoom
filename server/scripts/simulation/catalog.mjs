/** @typedef {'pdf'|'xlsx'} DocType */

/**
 * @typedef {Object} CatalogEntry
 * @property {string} id
 * @property {string} folderId
 * @property {string} fileName
 * @property {string} mimeType
 * @property {'pending'|'reviewed'|'flagged'} status
 * @property {string} categoryLabel
 * @property {string} uploadedAt
 * @property {DocType} type
 * @property {import('./pdf.mjs').PdfSpec} [pdf]
 * @property {import('./xlsx.mjs').XlsxSpec} [xlsx]
 * @property {string} [previewText]
 */

const CO = "Acme Corp., Inc.";
const DE = "Delaware";

function contractSections(parties, extras = []) {
  return [
    {
      heading: "1. Parties",
      body: parties,
    },
    {
      heading: "2. Term; Renewal",
      body: [
        `Initial term of three (3) years from the Effective Date, automatically renewing for successive one (1) year periods unless either party provides written notice of non-renewal at least ninety (90) days prior to the end of the then-current term.`,
      ],
    },
    {
      heading: "3. Fees; Payment",
      body: [
        `Fees as set forth in applicable Statements of Work. Invoices are due Net 30. Late amounts accrue interest at 1.0% per month or the maximum permitted by law.`,
      ],
    },
    {
      heading: "4. Confidentiality",
      body: [
        `Each party shall protect the other's Confidential Information using at least the same degree of care it uses for its own information, but no less than reasonable care. Confidential Information excludes information that is publicly available through no breach.`,
      ],
    },
    {
      heading: "5. Intellectual Property",
      body: [
        `${CO} retains all right, title, and interest in its pre-existing technology and platform. Customer receives a non-exclusive license to use deliverables solely for internal business purposes during the term.`,
      ],
    },
    {
      heading: "6. Warranties; Disclaimer",
      body: [
        `Each party warrants it has authority to enter this Agreement. EXCEPT AS EXPRESSLY SET FORTH HEREIN, SERVICES ARE PROVIDED "AS IS" AND ${CO.toUpperCase()} DISCLAIMS ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.`,
      ],
    },
    {
      heading: "7. Indemnification",
      body: [
        `Each party shall defend and indemnify the other against third-party claims arising from its gross negligence or willful misconduct. ${CO} shall indemnify Customer against claims that the platform infringes U.S. intellectual property rights, subject to customary exclusions.`,
      ],
    },
    {
      heading: "8. Limitation of Liability",
      body: [
        `NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. EXCEPT FOR BREACH OF CONFIDENTIALITY, INDEMNITY OBLIGATIONS, OR CUSTOMER'S PAYMENT OBLIGATIONS, EACH PARTY'S AGGREGATE LIABILITY SHALL NOT EXCEED THE FEES PAID OR PAYABLE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`,
      ],
    },
    {
      heading: "9. Termination",
      body: [
        `Either party may terminate for material breach not cured within thirty (30) days of notice. Customer may terminate for convenience upon sixty (60) days' written notice.`,
      ],
    },
    {
      heading: "10. Assignment; Change of Control",
      body: [
        `Neither party may assign without consent, except to an affiliate or in connection with a merger or sale of substantially all assets, provided the assignee assumes all obligations. A change of control of Customer shall not constitute an assignment if Customer remains the contracting party.`,
      ],
    },
    {
      heading: "11. Governing Law",
      body: [`This Agreement is governed by the laws of the State of ${DE}, without regard to conflicts principles.`],
    },
    ...extras,
  ];
}

/** @type {CatalogEntry[]} */
export const catalog = [
  // —— Corporate / Charter (10) ——
  {
    id: "doc-001",
    folderId: "fld-corp-charter",
    fileName: "2024-01-15_Certificate_of_Incorporation.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Charter",
    uploadedAt: "2026-03-02T14:22:00.000Z",
    type: "pdf",
    pdf: {
      title: "Certificate of Incorporation",
      subtitle: `${CO} · Filed with Secretary of State of ${DE}`,
      sections: [
        {
          body: [
            `FIRST: The name of the corporation is ${CO}`,
            `SECOND: The registered office is located at 1209 Orange Street, Wilmington, County of New Castle, ${DE} 19801.`,
            `THIRD: The name and address of the registered agent is Corporation Service Company, 1209 Orange Street, Wilmington, DE 19801.`,
            `FOURTH: The purpose is to engage in any lawful act or activity for which corporations may be organized under the General Corporation Law of ${DE}.`,
            `FIFTH: The corporation is authorized to issue 50,000,000 shares of Common Stock, par value $0.0001 per share, and 15,000,000 shares of Preferred Stock, par value $0.0001 per share.`,
            `Incorporator: Jordan Ellis. Filed January 15, 2019.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-002",
    folderId: "fld-corp-charter",
    fileName: "2025-11-01_Bylaws_Amended_and_Restated.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Charter",
    uploadedAt: "2026-03-02T15:01:00.000Z",
    type: "pdf",
    pdf: {
      title: "Amended and Restated Bylaws",
      subtitle: CO,
      sections: [
        {
          heading: "Article IV — Board of Directors",
          body: [
            `The business shall be managed by a Board of not fewer than three (3) nor more than nine (9) directors. Directors need not be stockholders.`,
            `Regular meetings may be held without notice. Special meetings require at least 48 hours' notice.`,
          ],
        },
        {
          heading: "Article VI — Officers",
          body: [
            `Officers include a Chief Executive Officer, Chief Financial Officer, and Secretary. The Board may appoint additional officers.`,
          ],
        },
        {
          heading: "Article VIII — Indemnification",
          body: [
            `The corporation shall indemnify directors and officers to the fullest extent permitted by Delaware law against expenses and liabilities incurred in connection with service to the corporation.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-003",
    folderId: "fld-corp-charter",
    fileName: "2025-12-10_Board_Resolutions_Annual_Approvals.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Governance",
    uploadedAt: "2026-03-02T16:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Unanimous Written Consent of the Board",
      subtitle: "Annual approvals — December 10, 2025",
      sections: [
        {
          body: [
            `RESOLVED, that the FY2026 operating budget presented by management is approved.`,
            `RESOLVED, that Jordan Ellis and Priya Nair are authorized as signatories on all operating accounts at First Republic Bank, subject to dual signatures above $250,000.`,
            `RESOLVED, that the 2026 equity incentive pool increase of 1,200,000 shares is approved, subject to stockholder consent.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-004",
    folderId: "fld-corp-charter",
    fileName: "2024-06-01_Stockholder_Consent_Series_A.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Financing",
    uploadedAt: "2026-03-03T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Stockholder Written Consent",
      subtitle: "Series A Preferred Stock financing",
      sections: [
        {
          body: [
            `The undersigned holders of a majority of outstanding capital stock approve the Series A Preferred Stock financing, the Amended and Restated Certificate of Incorporation, and related transaction documents.`,
            `Aggregate investment: $12,000,000 at $1.85 per share (pre-money valuation $38,000,000). Lead investor: Summit Ridge Ventures II, L.P.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-005",
    folderId: "fld-corp-charter",
    fileName: "2026-01-20_Officer_Director_Register.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "Corporate — Governance",
    uploadedAt: "2026-03-03T10:30:00.000Z",
    type: "xlsx",
    previewText:
      "Officer and director register: CEO Jordan Ellis, CFO Priya Nair, directors Ellis, Nair, and Summit Ridge designee Robert Chen.",
    xlsx: {
      sheets: [
        {
          name: "Officers",
          rows: [
            ["Name", "Title", "Appointed", "Email (redacted)"],
            ["Jordan Ellis", "CEO", "2019-03-01", "j***@acme.example"],
            ["Priya Nair", "CFO", "2021-07-15", "p***@acme.example"],
            ["Morgan Lee", "General Counsel", "2023-02-01", "m***@acme.example"],
          ],
        },
        {
          name: "Directors",
          rows: [
            ["Name", "Affiliation", "Since"],
            ["Jordan Ellis", "Management", "2019"],
            ["Priya Nair", "Management", "2024"],
            ["Robert Chen", "Summit Ridge Ventures", "2024"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-006",
    folderId: "fld-corp-charter",
    fileName: "2026-02-01_Organizational_Chart.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Corporate — Structure",
    uploadedAt: "2026-03-03T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Corporate Organizational Chart",
      subtitle: "As of February 1, 2026",
      sections: [
        {
          body: [
            `${CO} (Delaware) — 100% parent`,
            `├── Acme UK Ltd. (England & Wales) — 100% owned subsidiary`,
            `├── Acme Canada Inc. (Ontario) — 100% owned subsidiary`,
            `└── Acme Labs, LLC (Delaware) — 100% owned (dormant R&D entity)`,
            `Headcount: 85 FTE globally (62 US, 14 UK, 9 Canada).`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-007",
    folderId: "fld-corp-charter",
    fileName: "2026-01-15_DE_Good_Standing_Certificate.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Qualification",
    uploadedAt: "2026-03-03T12:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Certificate of Good Standing",
      subtitle: `State of ${DE}`,
      sections: [
        {
          body: [
            `I hereby certify that ${CO} is duly incorporated and in good standing as of January 15, 2026.`,
            `Annual report filed for tax year 2025. Franchise taxes paid through December 31, 2026.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-008",
    folderId: "fld-corp-charter",
    fileName: "2025-10-01_Director_Questionnaire_Ellis.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Corporate — Governance",
    uploadedAt: "2026-03-04T08:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Director & Officer Questionnaire",
      subtitle: "Jordan Ellis — completed October 2025",
      sections: [
        {
          body: [
            `No bankruptcy filings in the past ten years.`,
            `Outside interests: angel investor in two SaaS startups (<2% each), disclosed.`,
            `No pending litigation against director personally.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-009",
    folderId: "fld-corp-charter",
    fileName: "2024-03-01_Code_of_Ethics.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Compliance",
    uploadedAt: "2026-03-04T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Code of Business Conduct and Ethics",
      subtitle: CO,
      sections: [
        {
          body: [
            `Employees must report concerns via ethics@acme.example or the anonymous hotline.`,
            `Non-retaliation policy applies to good-faith reports.`,
            `Gifts over $150 to government officials or customers require pre-approval.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-010",
    folderId: "fld-corp-charter",
    fileName: "2026-02-15_Cap_Table_Summary_High_Level.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Corporate — Equity summary",
    uploadedAt: "2026-03-04T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Cap Table Summary (High Level)",
      subtitle: "See detailed workbook in Shareholder Documents",
      sections: [
        {
          body: [
            `Fully diluted shares: 18,420,000`,
            `Series A Preferred: 6,486,486 shares (35.2%)`,
            `Common (founders + employees): 11,933,514 shares (64.8%)`,
            `Option pool remaining: 8.4% of fully diluted (FLAG: near exhaustion threshold)`,
          ],
        },
      ],
    },
  },

  // —— Subsidiaries (5) ——
  {
    id: "doc-011",
    folderId: "fld-corp-subs",
    fileName: "2020-05-12_Acme_UK_Ltd_Certificate_of_Incorporation.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Subsidiary",
    uploadedAt: "2026-03-05T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Certificate of Incorporation",
      subtitle: "Acme UK Ltd. (Companies House)",
      sections: [{ body: [`Private company limited by shares. Registered office: London EC2. Sole shareholder: ${CO}.`] }],
    },
  },
  {
    id: "doc-012",
    folderId: "fld-corp-subs",
    fileName: "2021-09-01_Acme_Canada_Inc_Incorporation.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Subsidiary",
    uploadedAt: "2026-03-05T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Articles of Incorporation",
      subtitle: "Acme Canada Inc.",
      sections: [{ body: [`Ontario corporation. All issued shares held by ${CO}.`] }],
    },
  },
  {
    id: "doc-013",
    folderId: "fld-corp-subs",
    fileName: "2023-01-01_Intercompany_Services_Agreement.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Corporate — Intercompany",
    uploadedAt: "2026-03-05T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Intercompany Services Agreement",
      subtitle: `${CO} ↔ Acme UK Ltd.`,
      sections: contractSections(
        [`Provider: ${CO}. Recipient: Acme UK Ltd.`],
        [
          {
            heading: "Transfer pricing",
            body: [
              `Cost-plus markup of 8% on shared services (finance, HR, IT). Benchmarking study dated 2024 supports arm's length nature.`,
            ],
          },
        ]
      ),
    },
  },
  {
    id: "doc-014",
    folderId: "fld-corp-subs",
    fileName: "2025-06-30_UK_Subsidiary_Board_Minutes.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Corporate — Subsidiary",
    uploadedAt: "2026-03-05T12:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Board Minutes — Acme UK Ltd.",
      subtitle: "June 30, 2025",
      sections: [
        {
          body: [
            `Approved annual accounts. Reappointed local director. Authorized VAT filings.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-015",
    folderId: "fld-corp-subs",
    fileName: "2026-01-01_Foreign_Qualification_Register.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "Corporate — Qualification",
    uploadedAt: "2026-03-05T13:00:00.000Z",
    type: "xlsx",
    previewText: "Foreign qualifications in CA, NY, TX, WA, UK, and Canada — all current.",
    xlsx: {
      sheets: [
        {
          name: "US States",
          rows: [
            ["Jurisdiction", "Status", "Annual fee", "Next filing"],
            ["California", "Active", "$800", "2026-04-15"],
            ["New York", "Active", "$250", "2026-05-01"],
            ["Texas", "Active", "$0", "2026-05-15"],
            ["Washington", "Active", "$200", "2026-01-31"],
          ],
        },
      ],
    },
  },

  // —— Employment Policies (8) ——
  {
    id: "doc-016",
    folderId: "fld-emp-policies",
    fileName: "2024-01-01_Employee_Handbook_US.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Policy",
    uploadedAt: "2026-03-04T10:15:00.000Z",
    type: "pdf",
    pdf: {
      title: "Employee Handbook (United States)",
      subtitle: CO,
      sections: [
        {
          heading: "At-will employment",
          body: [`Employment is at-will and may be terminated by either party at any time, with or without cause.`],
        },
        {
          heading: "PTO",
          body: [`Exempt employees: flexible PTO with manager approval. Non-exempt: accrual of 15 days/year.`],
        },
        {
          heading: "IP assignment",
          body: [
            `Employees assign all inventions related to company business. Prior inventions must be disclosed on Exhibit A.`,
          ],
        },
        {
          heading: "Arbitration",
          body: [
            `Disputes shall be resolved by binding arbitration in San Francisco, CA under JAMS rules, except for injunctive relief.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-017",
    folderId: "fld-emp-policies",
    fileName: "2023-06-01_Remote_Work_Policy.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Policy",
    uploadedAt: "2026-03-06T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Remote Work Policy",
      subtitle: CO,
      sections: [
        {
          body: [
            `Hybrid default: 3 days in office for Bay Area employees. Security: MFA required, company-managed endpoint.`,
            `Home office stipend: $500 one-time; internet reimbursement up to $75/month.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-018",
    folderId: "fld-emp-policies",
    fileName: "2022-01-01_Anti_Harassment_Policy.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Policy",
    uploadedAt: "2026-03-06T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Anti-Harassment & EEO Policy",
      subtitle: CO,
      sections: [
        {
          body: [
            `Zero tolerance for harassment. Investigations completed within 30 business days where practicable.`,
            `Reporting: HR or anonymous hotline.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-019",
    folderId: "fld-emp-policies",
    fileName: "2025-01-01_Benefits_SPD_Excerpt.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Employment — Benefits",
    uploadedAt: "2026-03-06T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Summary Plan Description (Excerpt)",
      subtitle: "Medical & 401(k)",
      sections: [
        {
          body: [
            `Medical: Blue Shield PPO, employer pays 85% employee premium.`,
            `401(k): 4% safe harbor match, immediate vesting.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-020",
    folderId: "fld-emp-policies",
    fileName: "2024-01-01_Offer_Letter_Template.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Template",
    uploadedAt: "2026-03-06T12:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Offer Letter Template",
      subtitle: "Standard US hire",
      sections: [
        {
          body: [
            `Includes base salary, target bonus, equity grant subject to board approval, at-will statement, and confidentiality agreement incorporation by reference.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-021",
    folderId: "fld-emp-policies",
    fileName: "2026-02-01_Employee_Census_Redacted.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "Employment — HR data",
    uploadedAt: "2026-03-06T13:00:00.000Z",
    type: "xlsx",
    previewText: "85 FTE: Engineering 42, Sales 18, G&A 25. No unionized employees.",
    xlsx: {
      sheets: [
        {
          name: "Census",
          rows: [
            ["Dept", "US", "UK", "Canada", "FTE"],
            ["Engineering", "38", "3", "1", "42"],
            ["Sales", "14", "2", "2", "18"],
            ["G&A", "10", "9", "6", "25"],
            ["Total", "62", "14", "9", "85"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-022",
    folderId: "fld-emp-policies",
    fileName: "2023-01-01_I9_Compliance_Overview.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Employment — Compliance",
    uploadedAt: "2026-03-06T14:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Form I-9 Compliance Overview",
      subtitle: CO,
      sections: [{ body: [`E-Verify not enrolled. I-9 audits completed annually; 2 immaterial corrections in 2024.`] }],
    },
  },
  {
    id: "doc-023",
    folderId: "fld-emp-policies",
    fileName: "2024-06-01_Whistleblower_Policy.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Compliance",
    uploadedAt: "2026-03-06T15:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Whistleblower Policy",
      subtitle: CO,
      sections: [{ body: [`Reports to Audit Committee. Non-retaliation expressly stated.`] }],
    },
  },

  // —— Executive Agreements (6) ——
  {
    id: "doc-024",
    folderId: "fld-emp-contracts",
    fileName: "2021-03-01_CEO_Employment_Agreement_Ellis.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Executive",
    uploadedAt: "2026-03-07T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Employment Agreement",
      subtitle: "Jordan Ellis — Chief Executive Officer",
      sections: [
        {
          heading: "Compensation",
          body: [`Base salary $385,000, target bonus 40%, equity per separate grant agreements.`],
        },
        {
          heading: "Severance",
          body: [
            `Without cause: 12 months base + COBRA. Change of Control: 18 months base + 100% target bonus if terminated without cause within 12 months following COC.`,
          ],
        },
        {
          heading: "Restrictive covenants",
          body: [
            `12-month non-solicit of employees and customers. Non-compete limited to 6 months in North America for direct competitors (where enforceable).`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-025",
    folderId: "fld-emp-contracts",
    fileName: "2021-07-15_CFO_Employment_Agreement_Nair.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Executive",
    uploadedAt: "2026-03-07T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Employment Agreement",
      subtitle: "Priya Nair — Chief Financial Officer",
      sections: [
        {
          body: [
            `Base $310,000. COC severance: 12 months base. No non-compete; 12-month non-solicit.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-026",
    folderId: "fld-emp-contracts",
    fileName: "2019-03-01_CEO_Offer_Letter_Signed.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — Executive",
    uploadedAt: "2026-03-07T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Offer Letter",
      subtitle: "Jordan Ellis",
      sections: [{ body: [`Start date March 1, 2019. Initial option grant 2,400,000 shares (pre-split equivalent).`] }],
    },
  },
  {
    id: "doc-027",
    folderId: "fld-emp-contracts",
    fileName: "2021-03-01_CIIA_CEO.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Employment — IP",
    uploadedAt: "2026-03-07T12:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Confidential Information and Invention Assignment",
      subtitle: "Jordan Ellis",
      sections: [{ body: [`Prior inventions: none disclosed. All company-related IP assigned to ${CO}.`] }],
    },
  },
  {
    id: "doc-028",
    folderId: "fld-emp-contracts",
    fileName: "2024-01-01_Executive_Severance_Policy.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Employment — Executive",
    uploadedAt: "2026-03-07T13:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Executive Severance Policy",
      subtitle: "Tier 1 officers",
      sections: [{ body: [`Double-trigger COC benefits for Tier 1. Single-trigger acceleration limited to 25% of unvested equity.`] }],
    },
  },
  {
    id: "doc-029",
    folderId: "fld-emp-contracts",
    fileName: "2026-01-01_Executive_Equity_Summary.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "Employment — Equity",
    uploadedAt: "2026-03-07T14:00:00.000Z",
    type: "xlsx",
    previewText: "CEO: 1.8M options vested 70%. CFO: 600k options vested 55%.",
    xlsx: {
      sheets: [
        {
          name: "Grants",
          rows: [
            ["Executive", "Grant date", "Options", "Vested %", "Exercise"],
            ["Jordan Ellis", "2024-01-01", "400000", "70%", "$1.85"],
            ["Priya Nair", "2024-01-01", "200000", "55%", "$1.85"],
          ],
        },
      ],
    },
  },

  // —— Commercial / MSA (7) ——
  {
    id: "doc-030",
    folderId: "fld-comm-msa",
    fileName: "2023-04-01_MSA_Customer_Globex_Redacted.pdf",
    mimeType: "application/pdf",
    status: "flagged",
    categoryLabel: "Commercial — Customer",
    uploadedAt: "2026-03-05T09:40:00.000Z",
    type: "pdf",
    pdf: {
      title: "Master Services Agreement",
      subtitle: "Globex Industries, Inc. (redacted)",
      sections: contractSections(
        [`${CO} and Globex Industries, Inc. ("Customer")`],
        [
          {
            heading: "12. Super-cap indemnity (Customer paper)",
            body: [
              `NOTWITHSTANDING SECTION 8, CUSTOMER'S AGGREGATE LIABILITY SHALL NOT EXCEED TWO TIMES (2X) FEES PAID IN THE PRIOR TWELVE MONTHS FOR CLAIMS ARISING FROM DATA BREACH ATTRIBUTABLE TO PROVIDER'S GROSS NEGLIGENCE. [DILIGENCE FLAG: asymmetric cap]`,
            ],
          },
        ]
      ),
    },
  },
  {
    id: "doc-031",
    folderId: "fld-comm-msa",
    fileName: "2023-04-15_SOW_001_Globex_Implementation.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Commercial — SOW",
    uploadedAt: "2026-03-08T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Statement of Work #1",
      subtitle: "Globex — Implementation",
      sections: [
        {
          body: [
            `Fixed fee $185,000. Milestones: discovery (30 days), configuration (60 days), UAT (30 days). Acceptance: written sign-off within 10 business days of delivery.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-032",
    folderId: "fld-comm-msa",
    fileName: "2024-02-01_MSA_Customer_Initech.pdf",
    mimeType: "application/pdf",
    status: "flagged",
    categoryLabel: "Commercial — Customer",
    uploadedAt: "2026-03-08T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Master Services Agreement",
      subtitle: "Initech LLC",
      sections: contractSections(
        [`${CO} and Initech LLC`],
        [
          {
            heading: "Governing law",
            body: [`Governed by New York law. Jurisdiction: Southern District of New York.`],
          },
          {
            heading: "Auto-renewal",
            body: [
              `Automatic renewal for one-year terms unless 30 days' notice. [FLAG: short notice period vs. 90-day standard]`,
            ],
          },
        ]
      ),
    },
  },
  {
    id: "doc-033",
    folderId: "fld-comm-msa",
    fileName: "2026-01-01_Customer_Contract_Register.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "Commercial — Register",
    uploadedAt: "2026-03-08T11:00:00.000Z",
    type: "xlsx",
    previewText: "Top 3 customers = 41% ARR. Globex 18%, Initech 14%, Umbrella 9%.",
    xlsx: {
      sheets: [
        {
          name: "Customers",
          rows: [
            ["Customer", "ARR %", "Term end", "Auto-renew", "Governing law"],
            ["Globex Industries", "18%", "2027-03-31", "Yes", "Delaware"],
            ["Initech LLC", "14%", "2026-08-31", "Yes", "New York"],
            ["Umbrella Corp", "9%", "2026-12-31", "No", "California"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-034",
    folderId: "fld-comm-msa",
    fileName: "2022-01-01_Standard_Terms_Product.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Commercial — Terms",
    uploadedAt: "2026-03-08T12:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Standard Terms of Service (Product)",
      subtitle: "Online click-through",
      sections: [
        {
          body: [
            `SLA: 99.9% monthly uptime. Service credits capped at 10% monthly fees.`,
            `Warranty disclaimer and limitation of liability consistent with enterprise MSA.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-035",
    folderId: "fld-comm-msa",
    fileName: "2023-09-01_Channel_Partner_Agreement.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Commercial — Channel",
    uploadedAt: "2026-03-08T13:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Channel Partner Agreement",
      subtitle: "Nexus Partners LLC",
      sections: [
        {
          body: [
            `Revenue share 20% on referred ARR. Non-solicit of employees for 12 months. Termination without cause on 30 days' notice.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-036",
    folderId: "fld-comm-msa",
    fileName: "2024-01-01_Mutual_NDA_Template.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Commercial — NDA",
    uploadedAt: "2026-03-08T14:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Mutual Non-Disclosure Agreement (Template)",
      subtitle: CO,
      sections: [
        {
          body: [
            `Term 3 years. Residuals clause included. Injunctive relief available for breach.`,
          ],
        },
      ],
    },
  },

  // —— SaaS (6) ——
  {
    id: "doc-037",
    folderId: "fld-saas",
    fileName: "2025-01-01_Salesforce_Order_Form_DPA.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "SaaS — CRM",
    uploadedAt: "2026-03-06T11:05:00.000Z",
    type: "pdf",
    pdf: {
      title: "Salesforce Order Form & DPA",
      subtitle: "CRM subscription",
      sections: [
        {
          body: [
            `150 seats. Data processing: customer contact data. Subprocessors listed in Exhibit B. SOC 2 Type II required annually.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-038",
    folderId: "fld-saas",
    fileName: "2024-06-01_AWS_Customer_Agreement_Summary.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "SaaS — Infrastructure",
    uploadedAt: "2026-03-09T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "AWS Customer Agreement Summary",
      subtitle: "us-west-2 primary region",
      sections: [{ body: [`Compute and RDS spend ~$42k/month. BAA in place for limited PHI in staging only.`] }],
    },
  },
  {
    id: "doc-039",
    folderId: "fld-saas",
    fileName: "2025-03-01_Microsoft_365_Enterprise_Summary.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "SaaS — Productivity",
    uploadedAt: "2026-03-09T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Microsoft 365 Enterprise Agreement Summary",
      subtitle: CO,
      sections: [{ body: [`90 seats. Renewal March 2027. Price increase cap 5% annually.`] }],
    },
  },
  {
    id: "doc-040",
    folderId: "fld-saas",
    fileName: "2024-11-01_DocuSign_Subscription_Agreement.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "SaaS — Vendor",
    uploadedAt: "2026-03-09T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "DocuSign Subscription Agreement",
      subtitle: CO,
      sections: [
        {
          body: [
            `Auto-renews annually. Vendor may increase fees up to 7% on renewal. [Note: above internal 5% threshold]`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-041",
    folderId: "fld-saas",
    fileName: "2026-01-01_Vendor_SaaS_Register.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "SaaS — Register",
    uploadedAt: "2026-03-09T12:00:00.000Z",
    type: "xlsx",
    previewText: "42 active SaaS vendors; top 5 = 68% of spend.",
    xlsx: {
      sheets: [
        {
          name: "Vendors",
          rows: [
            ["Vendor", "Purpose", "Annual $", "Renewal", "Data types"],
            ["AWS", "Hosting", "$504000", "Evergreen", "All production data"],
            ["Salesforce", "CRM", "$180000", "2027-01-01", "Contacts"],
            ["DocuSign", "Signatures", "$36000", "2026-11-01", "Contracts"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-042",
    folderId: "fld-saas",
    fileName: "2023-01-01_Security_Addendum_Template.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "SaaS — Security",
    uploadedAt: "2026-03-09T13:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Vendor Security Addendum (Template)",
      subtitle: CO,
      sections: [{ body: [`Requires SOC 2 or ISO 27001. 24-hour breach notification. Right to audit annually.`] }],
    },
  },

  // —— Property / Leases (5) ——
  {
    id: "doc-043",
    folderId: "fld-prop-lease",
    fileName: "2020-06-01_HQ_Office_Lease_San_Francisco.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Property — Lease",
    uploadedAt: "2026-03-07T08:50:00.000Z",
    type: "pdf",
    pdf: {
      title: "Office Lease Agreement",
      subtitle: "455 Market Street, San Francisco, CA",
      sections: [
        {
          body: [
            `Premises: 12,500 rentable sq ft. Term: June 1, 2020 – May 31, 2031.`,
            `Base rent: $62.00/sq ft/year escalating 3% annually.`,
            `Assignment/subletting requires landlord consent not to be unreasonably withheld, except change of control of Tenant requires consent (may be withheld in sole discretion). [FLAG]`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-044",
    folderId: "fld-prop-lease",
    fileName: "2026-01-01_HQ_Lease_Abstract.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "Property — Lease abstract",
    uploadedAt: "2026-03-07T09:00:00.000Z",
    type: "xlsx",
    previewText: "SF HQ: expires 2031, renewal option 5 years, TI allowance fully used.",
    xlsx: {
      sheets: [
        {
          name: "Abstract",
          rows: [
            ["Field", "Value"],
            ["Landlord", "Market Street Holdings LLC"],
            ["Rentable SF", "12500"],
            ["Expiration", "2031-05-31"],
            ["Renewal option", "5 years at FMV"],
            ["Assignment/COC", "Landlord consent required for COC"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-045",
    folderId: "fld-prop-lease",
    fileName: "2022-03-01_Austin_Office_Lease.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Property — Lease",
    uploadedAt: "2026-03-10T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Office Lease — Austin Hub",
      subtitle: "3,200 sq ft",
      sections: [{ body: [`Co-tenancy clause if anchor tenant vacates. Term ends 2028-02-28.`] }],
    },
  },
  {
    id: "doc-046",
    folderId: "fld-prop-lease",
    fileName: "2025-01-01_Lease_Amendment_Rent_Step.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Property — Amendment",
    uploadedAt: "2026-03-10T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "First Amendment to Office Lease",
      subtitle: "SF HQ — rent adjustment",
      sections: [{ body: [`Effective January 1, 2025, base rent increased to $63.86/sq ft/year per original schedule.`] }],
    },
  },
  {
    id: "doc-047",
    folderId: "fld-prop-lease",
    fileName: "2026-02-01_Estoppel_Certificate_Template.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Property — Template",
    uploadedAt: "2026-03-10T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Estoppel Certificate Request Template",
      subtitle: "Lender diligence",
      sections: [{ body: [`Standard form sent to landlord counsel for Project Northwind financing.`] }],
    },
  },

  // —— Litigation (5) ——
  {
    id: "doc-048",
    folderId: "fld-lit",
    fileName: "2026-01-01_Litigation_Schedule.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "reviewed",
    categoryLabel: "Litigation — Schedule",
    uploadedAt: "2026-03-08T15:00:00.000Z",
    type: "xlsx",
    previewText: "2 active matters; largest exposure Globex dispute $400k–$750k reserved.",
    xlsx: {
      sheets: [
        {
          name: "Matters",
          rows: [
            ["Matter", "Status", "Exposure (range)", "Counsel"],
            ["Globex termination dispute", "Active", "$400k-$750k", "Morrison & Blake LLP"],
            ["Trademark cease & desist", "Open", "$50k-$100k", "In-house + outside IP"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-049",
    folderId: "fld-lit",
    fileName: "2025-11-15_Demand_Letter_Globex_Redacted.pdf",
    mimeType: "application/pdf",
    status: "flagged",
    categoryLabel: "Litigation — Correspondence",
    uploadedAt: "2026-03-08T16:30:00.000Z",
    type: "pdf",
    pdf: {
      title: "Demand Letter",
      subtitle: "Globex Industries — alleged service failures",
      sections: [
        {
          body: [
            `Alleges ${CO} failed to meet uptime commitments in Q3 2025. Demands refund of $240,000 fees and threatens termination for cause.`,
            `Response deadline: December 1, 2025. Matter unresolved — reserve established.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-050",
    folderId: "fld-lit",
    fileName: "2026-02-01_Outside_Counsel_Status_Letter.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Litigation — Status",
    uploadedAt: "2026-03-11T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Litigation Status Letter",
      subtitle: "Morrison & Blake LLP",
      sections: [
        {
          body: [
            `Globex: mediation scheduled April 2026. Former employee matter settled Q4 2025 for $85,000.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-051",
    folderId: "fld-lit",
    fileName: "2024-06-01_Settlement_Agreement_Closed_Matter.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Litigation — Settlement",
    uploadedAt: "2026-03-11T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Settlement Agreement",
      subtitle: "Confidential — closed",
      sections: [{ body: [`Mutual release. Payment $85,000. No admission of liability.`] }],
    },
  },
  {
    id: "doc-052",
    folderId: "fld-lit",
    fileName: "2025-12-01_Cease_Desist_Trademark.pdf",
    mimeType: "application/pdf",
    status: "pending",
    categoryLabel: "Litigation — IP",
    uploadedAt: "2026-03-11T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Cease and Desist Letter",
      subtitle: "Incoming — ACME ANALYTICS mark",
      sections: [{ body: [`Third party claims likelihood of confusion with their registered mark in EU.`] }],
    },
  },

  // —— Shareholder / Cap (8) ——
  {
    id: "doc-053",
    folderId: "fld-sh-cap",
    fileName: "2026-03-01_Cap_Table_Fully_Diluted.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "pending",
    categoryLabel: "Shareholders — Cap table",
    uploadedAt: "2026-03-09T12:00:00.000Z",
    type: "xlsx",
    previewText: "FD 18.42M shares; option pool 8.4% remaining.",
    xlsx: {
      sheets: [
        {
          name: "Cap Table",
          rows: [
            ["Class", "Shares", "% FD"],
            ["Series A Preferred", "6486486", "35.2%"],
            ["Common - Founders", "7200000", "39.1%"],
            ["Common - Other", "4733514", "25.7%"],
            ["Options (unissued pool)", "1548000", "8.4%"],
            ["Total FD", "18420000", "100%"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-054",
    folderId: "fld-sh-cap",
    fileName: "2019-01-01_2019_Equity_Incentive_Plan.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Shareholders — Plan",
    uploadedAt: "2026-03-12T09:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "2019 Equity Incentive Plan",
      subtitle: CO,
      sections: [
        {
          body: [
            `Initial pool 3,000,000 shares, increased to 4,800,000 in 2024. Change of control: board may provide acceleration.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-055",
    folderId: "fld-sh-cap",
    fileName: "2025-12-10_Board_Consent_Option_Pool_Increase.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Shareholders — Board",
    uploadedAt: "2026-03-12T10:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Board Consent — Option Pool Increase",
      subtitle: "1,200,000 additional shares",
      sections: [{ body: [`Subject to stockholder approval at next financing or annual meeting.`] }],
    },
  },
  {
    id: "doc-056",
    folderId: "fld-sh-cap",
    fileName: "2024-06-01_Series_A_Stock_Purchase_Agreement_Redacted.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Shareholders — Financing",
    uploadedAt: "2026-03-12T11:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Series A Preferred Stock Purchase Agreement",
      subtitle: "Redacted",
      sections: [
        {
          body: [
            `1x non-participating liquidation preference. Broad-based weighted average anti-dilution.`,
            `Board composition: 2 founders, 1 investor, 1 independent (vacant).`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-057",
    folderId: "fld-sh-cap",
    fileName: "2024-06-01_Investors_Rights_Agreement_Excerpt.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Shareholders — Rights",
    uploadedAt: "2026-03-12T12:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Investors' Rights Agreement (Excerpt)",
      subtitle: "Series A",
      sections: [
        {
          body: [
            `Information rights: quarterly financials within 45 days. Pro rata rights in future financings.`,
          ],
        },
      ],
    },
  },
  {
    id: "doc-058",
    folderId: "fld-sh-cap",
    fileName: "2025-10-01_409A_Valuation_Report_Summary.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Shareholders — Valuation",
    uploadedAt: "2026-03-12T13:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "409A Valuation Report Summary",
      subtitle: "October 2025",
      sections: [{ body: [`Common stock FMV: $1.42 per share. Methodology: OPM backsolve from Series A price.`] }],
    },
  },
  {
    id: "doc-059",
    folderId: "fld-sh-cap",
    fileName: "2026-01-01_Stock_Certificate_Ledger.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "pending",
    categoryLabel: "Shareholders — Ledger",
    uploadedAt: "2026-03-12T14:00:00.000Z",
    type: "xlsx",
    previewText: "Certificates CS-1 through CS-45 issued; preferred cert PS-1 to PS-3.",
    xlsx: {
      sheets: [
        {
          name: "Ledger",
          rows: [
            ["Cert #", "Holder", "Class", "Shares"],
            ["CS-1", "Jordan Ellis", "Common", "3600000"],
            ["CS-2", "Alex Rivera", "Common", "3600000"],
            ["PS-1", "Summit Ridge Ventures II", "Series A", "5200000"],
          ],
        },
      ],
    },
  },
  {
    id: "doc-060",
    folderId: "fld-sh-cap",
    fileName: "2024-06-01_Voting_Agreement_ROFR_Redacted.pdf",
    mimeType: "application/pdf",
    status: "reviewed",
    categoryLabel: "Shareholders — Transfer restrictions",
    uploadedAt: "2026-03-12T15:00:00.000Z",
    type: "pdf",
    pdf: {
      title: "Voting Agreement & Right of First Refusal",
      subtitle: "Redacted",
      sections: [
        {
          body: [
            `Drag-along at 66% preferred + common vote. ROFR on founder transfers. Co-sale rights for investors.`,
          ],
        },
      ],
    },
  },
];
