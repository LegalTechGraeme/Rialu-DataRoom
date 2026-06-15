import {
  CO,
  CO_ADDRESS,
  CO_REG,
  CO_SHORT,
  CO_VAT,
  BUYER,
  DIRECTORS,
  EMPLOYEES,
  INVESTORS,
  SERIES_B_DATE,
  SERIES_B_AMOUNT,
  PRE_MONEY,
  POST_MONEY,
} from "./company.mjs";
import {
  msaSections,
  employmentContractSections,
  shareholdersAgreementSections,
  boardMinutesSections,
  gdprPrivacyPolicySections,
  genericLongPolicySections,
  recitalsSection,
  definitionsSection,
  interpretationSection,
} from "./legal-prose.mjs";

let docCounter = 0;
function nextId() {
  docCounter += 1;
  return `doc-ai-${String(docCounter).padStart(3, "0")}`;
}

/** @param {object} p */
function pdfEntry(p) {
  return { id: nextId(), type: "pdf", mimeType: "application/pdf", status: "pending", ...p };
}

/** @param {object} p */
function xlsxEntry(p) {
  return { id: nextId(), type: "xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", status: "pending", ...p };
}

/** @param {object} p */
function txtEntry(p) {
  return { id: nextId(), type: "txt", mimeType: "text/plain", status: "pending", ...p };
}

const COMMERCIAL_PARTIES = [
  "Amazon Web Services EMEA SARL",
  "Microsoft Ireland Operations Limited",
  "Stripe Payments Europe, Limited",
  "Salesforce UK Limited",
  "HubSpot Ireland Ltd",
  "Snowflake Computing UK Ltd",
  "Globex Financial Services plc",
  "Continental Reinsurance AG",
];

const LITIGATION_DOCS = [
  {
    file: "Letter_Before_Action_DataForge_Ltd_2025.pdf",
    title: "Letter Before Action — DataForge Ltd",
    body: `We act for DataForge Ltd which alleges misappropriation of trade secrets relating to vector embedding pipelines. Demands cessation and €450,000 damages. Response due 28 days.`,
  },
  {
    file: "Settlement_Agreement_Former_CTO_NDA_Breach_SIGNED.pdf",
    title: "Settlement Agreement — Former Contractor",
    body: `Settled for €85,000 plus undertakings. Mutual release except fraud. Confidentiality and 18-month non-compete in Ireland/UK.`,
  },
  {
    file: "Arbitration_Notice_Hosting_Services_Dispute.pdf",
    title: "Notice of Arbitration — Hosting Services",
    body: `ICC arbitration seated in London regarding SLA credits dispute with legacy hosting vendor. Claim €120,000.`,
  },
];

/** @returns {import('./generate-demo-dataroom.mjs').CatalogEntry[]} */
export function buildCatalog() {
  docCounter = 0;
  /** @type {import('./generate-demo-dataroom.mjs').CatalogEntry[]} */
  const catalog = [];

  // —— 01 Corporate ——
  catalog.push(
    pdfEntry({
      vdrPath: "01_Corporate/Charter_and_Constitution",
      rialuFolderId: "fld-corp-charter",
      fileName: "Certificate_of_Incorporation_Acme_AI_Ltd_2019_FINAL.pdf",
      categoryLabel: "Corporate — Constitution",
      uploadedAt: "2025-11-01T09:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Certificate of Incorporation",
        subtitle: `${CO} · ${CO_REG}`,
        docType: "Companies Act 2014",
        sections: [
          {
            body: [
              `Company name: ${CO}`,
              `Registered office: ${CO_ADDRESS}`,
              `Type: Private company limited by shares`,
              `Authorised share capital: €50,000 divided into 50,000,000 ordinary shares of €0.001 each and 15,000,000 preferred shares of €0.001 each.`,
              `Incorporated on 14 March 2019. Filed with the Companies Registration Office.`,
            ],
          },
        ],
      },
    }),
    pdfEntry({
      vdrPath: "01_Corporate/Charter_and_Constitution",
      rialuFolderId: "fld-corp-charter",
      fileName: "Constitution_Acme_AI_Ltd_Amended_2024_v3_SIGNED.pdf",
      categoryLabel: "Corporate — Constitution",
      uploadedAt: "2025-11-02T10:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Amended and Restated Constitution",
        subtitle: CO,
        sections: [
          recitalsSection("The Company adopted this Constitution following the Series B funding round."),
          definitionsSection([
            ["Company", CO],
            ["Directors", "the directors of the Company from time to time"],
            ["Share", "a share in the capital of the Company"],
          ]),
          interpretationSection(),
          {
            heading: "3. Share Capital",
            body: [
              "The share capital is divided into Ordinary Shares and Preferred Shares with rights as set out in this Constitution.",
              "Preferred Shares carry liquidation preference, anti-dilution, and conversion rights as approved by special resolution on 15 September 2024.",
            ],
          },
          {
            heading: "4. Directors",
            body: [
              "Minimum two, maximum nine directors. Directors may be removed by ordinary resolution.",
              "The Board may delegate day-to-day management to the CEO and executive team.",
            ],
          },
        ],
      },
    }),
    pdfEntry({
      vdrPath: "01_Corporate/Charter_and_Constitution",
      rialuFolderId: "fld-corp-charter",
      fileName: "Register_of_Directors_and_Secretaries_2025.pdf",
      categoryLabel: "Corporate — Registers",
      uploadedAt: "2025-12-01T11:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Register of Directors and Secretaries",
        sections: [
          {
            body: DIRECTORS.map(
              (d) => `${d.name} — ${d.role} — appointed ${d.since} — address on file`
            ),
          },
        ],
      },
    })
  );

  const boardDates = [
    ["2024-09-15", ["the Series B funding round be approved", "the Constitution be amended", "option pool increase of 4% be approved"]],
    ["2024-12-10", ["FY2025 budget be approved", "appointment of Arthur Cox as Irish counsel be ratified"]],
    ["2025-03-20", ["audited FY2024 accounts be approved", "CEO authorised to negotiate strategic partnership with Northwind"]],
    ["2025-06-18", ["interim dividend be declared prohibited", "cyber incident response retainer with Mandiant be approved"]],
    ["2025-09-30", ["management accounts Q3 be noted", "preparation for M&A due diligence be authorised"]],
  ];
  for (const [date, resolutions] of boardDates) {
    catalog.push(
      pdfEntry({
        vdrPath: "01_Corporate/Board_and_Shareholder",
        rialuFolderId: "fld-corp-minutes",
        fileName: `Board_Minutes_${date.replace(/-/g, "_")}_FINAL.pdf`,
        categoryLabel: "Corporate — Board Minutes",
        uploadedAt: `${date}T16:00:00.000Z`,
        status: date === "2025-09-30" ? "flagged" : "reviewed",
        pdf: {
          title: "Minutes of Board Meeting",
          subtitle: `${CO} · ${date}`,
          sections: boardMinutesSections(date, resolutions),
        },
      })
    );
  }

  catalog.push(
    pdfEntry({
      vdrPath: "01_Corporate/Board_and_Shareholder",
      rialuFolderId: "fld-corp-minutes",
      fileName: "Written_Resolution_Shareholders_Series_B_2024_SIGNED.pdf",
      categoryLabel: "Corporate — Shareholder Resolutions",
      uploadedAt: "2024-09-14T17:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Written Shareholder Resolution",
        sections: [
          {
            body: [
              `WE, the undersigned shareholders of ${CO}, hereby pass the following resolutions as special and ordinary resolutions:`,
              `RESOLVED as a special resolution that the Constitution be amended in the form circulated.`,
              `RESOLVED as an ordinary resolution that the Series B share issuance of ${SERIES_B_AMOUNT} at a pre-money valuation of ${PRE_MONEY} be approved.`,
            ],
          },
        ],
      },
    }),
    pdfEntry({
      vdrPath: "01_Corporate/Subsidiaries",
      rialuFolderId: "fld-corp-subs",
      fileName: "Acme_AI_UK_Ltd_Certificate_of_Incorporation.pdf",
      categoryLabel: "Corporate — Subsidiaries",
      uploadedAt: "2025-10-01T09:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Certificate of Incorporation — Acme AI UK Ltd",
        sections: [{ body: ["Company No. 12847563. Registered office London, England. Wholly owned subsidiary."] }],
      },
    }),
    pdfEntry({
      vdrPath: "01_Corporate/Subsidiaries",
      rialuFolderId: "fld-corp-subs",
      fileName: "Acme_AI_GmbH_Commercial_Register_Extract.pdf",
      categoryLabel: "Corporate — Subsidiaries",
      uploadedAt: "2025-10-01T09:30:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Handelsregisterauszug — Acme AI GmbH",
        sections: [{ body: ["HRB 284719 B, Berlin. Branch office for DACH sales."] }],
      },
    })
  );

  // —— 02 Capitalisation ——
  catalog.push(
    pdfEntry({
      vdrPath: "02_Capitalisation/Equity_and_Shareholders",
      rialuFolderId: "fld-sh-cap",
      fileName: "Shareholders_Agreement_Acme_AI_Ltd_v4_SIGNED.pdf",
      categoryLabel: "Capitalisation — Shareholders Agreement",
      uploadedAt: "2024-09-15T18:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Shareholders' Agreement",
        subtitle: `${CO} · Series B`,
        docType: "Transaction Agreement",
        parties: `Parties: Founders, ${INVESTORS.slice(0, 3).join(", ")}, and the Company`,
        sections: shareholdersAgreementSections(),
      },
    }),
    pdfEntry({
      vdrPath: "02_Capitalisation/Equity_and_Shareholders",
      rialuFolderId: "fld-sh-cap",
      fileName: "Series_B_Term_Sheet_Executed_2024.pdf",
      categoryLabel: "Capitalisation — Term Sheet",
      uploadedAt: "2024-07-01T12:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Series B Term Sheet",
        sections: [
          {
            body: [
              `Investment: ${SERIES_B_AMOUNT}`,
              `Pre-money: ${PRE_MONEY}`,
              `Post-money: ${POST_MONEY}`,
              `Lead: Atlantic Bridge Growth Fund III LP`,
              `Liquidation preference: 1x non-participating`,
              `Board: 2 founder, 2 investor, 1 independent`,
            ],
          },
        ],
      },
    }),
    pdfEntry({
      vdrPath: "02_Capitalisation/Equity_and_Shareholders",
      rialuFolderId: "fld-sh-cap",
      fileName: "Investors_Rights_Agreement_2024_SIGNED.pdf",
      categoryLabel: "Capitalisation — Investor Rights",
      uploadedAt: "2024-09-15T18:30:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Investors' Rights Agreement",
        sections: shareholdersAgreementSections().slice(0, 8),
      },
    }),
    pdfEntry({
      vdrPath: "02_Capitalisation/Equity_and_Shareholders",
      rialuFolderId: "fld-sh-cap",
      fileName: "ESOP_Plan_2024_Rules_FINAL.pdf",
      categoryLabel: "Capitalisation — ESOP",
      uploadedAt: "2024-09-01T10:00:00.000Z",
      status: "reviewed",
      pdf: {
        title: "Employee Share Option Plan 2024",
        sections: [
          recitalsSection("The Company wishes to incentivise employees through share options."),
          {
            heading: "3. Pool",
            body: ["Option pool of 12% of fully diluted share capital post-Series B."],
          },
        ],
      },
    }),
    xlsxEntry({
      vdrPath: "02_Capitalisation/Equity_and_Shareholders",
      rialuFolderId: "fld-sh-cap",
      fileName: "Cap_Table_Acme_AI_Ltd_Post_Series_B_2025.xlsx",
      categoryLabel: "Capitalisation — Cap Table",
      uploadedAt: "2025-10-15T14:00:00.000Z",
      status: "reviewed",
      xlsx: {
        sheets: [
          {
            name: "Summary",
            rows: [
              ["Acme AI Limited — Cap Table", ""],
              ["As at 30 September 2025", ""],
              ["Shareholder", "Class", "Shares", "% FD"],
              ["Siobhán O'Connell", "Ordinary", "8,200,000", "18.2%"],
              ["Elena Vasquez", "Ordinary", "6,100,000", "13.5%"],
              ["Atlantic Bridge Growth Fund III", "Series B Preferred", "5,800,000", "12.9%"],
              ["Sequoia Capital Global Growth", "Series B Preferred", "4,200,000", "9.3%"],
              ["Founders Fund VII", "Series A Preferred", "3,900,000", "8.7%"],
              ["Enterprise Ireland", "Series A Preferred", "1,100,000", "2.4%"],
              ["ESOP (unallocated)", "Options", "5,400,000", "12.0%"],
              ["Other investors", "Various", "11,300,000", "25.0%"],
              ["Total", "", "45,000,000", "100%"],
            ],
          },
          {
            name: "Options",
            rows: [
              ["Grantee", "Options", "Strike €", "Vesting"],
              ["Niamh Kelly", "450,000", "0.85", "4yr/1yr cliff"],
              ["David Chen", "320,000", "0.85", "4yr/1yr cliff"],
            ],
          },
        ],
      },
    })
  );

  for (let i = 0; i < 4; i++) {
    catalog.push(
      pdfEntry({
        vdrPath: "02_Capitalisation/Equity_and_Shareholders",
        rialuFolderId: "fld-sh-cap",
        fileName: `Convertible_Note_Side_Letter_Investor_${i + 1}_2023.pdf`,
        categoryLabel: "Capitalisation — Convertibles",
        uploadedAt: `2023-0${i + 6}-01T10:00:00.000Z`,
        status: "reviewed",
        pdf: {
          title: `Convertible Note Side Letter — Investor ${i + 1}`,
          sections: [{ body: ["MFN provisions, information rights, pro-rata for next round. Principal €500,000."] }],
        },
      })
    );
  }

  // —— 03 Financials ——
  const financialFiles = [
    ["Audited_Financial_Statements_FY2024_FINAL.pdf", "Audited Accounts FY2024", "Deloitte Ireland LLP unqualified opinion. Revenue €14.8m."],
    ["Management_Accounts_Q3_2025.pdf", "Management Accounts Q3 2025", "ARR €18.2m, gross margin 78%, burn €620k/month."],
    ["Annual_Budget_FY2026_Approved.pdf", "Budget FY2026", "Board-approved 10 September 2025."],
    ["Cash_Flow_Forecast_24_Months.xlsx", "xlsx", "Cash forecast"],
    ["Debt_Schedule_2025.pdf", "Debt Schedule", "SVB Ireland term loan €2m, security over IP."],
    ["Intercompany_Balances_2025.pdf", "Intercompany", "UK subsidiary recharge €1.2m annually."],
    ["Auditor_Management_Letter_FY2024.pdf", "Management Letter", "Two control recommendations on revenue recognition."],
    ["Bank_Reconciliation_Summary_Sep_2025.xlsx", "xlsx", "Bank rec"],
  ];
  for (const [file, title, desc] of financialFiles) {
    if (file.endsWith(".xlsx")) {
      catalog.push(
        xlsxEntry({
          vdrPath: "03_Financials/Accounts_and_Management",
          rialuFolderId: "fld-fin-facilities",
          fileName: file,
          categoryLabel: "Financials",
          uploadedAt: "2025-10-01T09:00:00.000Z",
          status: "reviewed",
          xlsx: {
            sheets: [
              {
                name: "Forecast",
                rows: [
                  [title, ""],
                  ["Month", "Cash In", "Cash Out", "Balance"],
                  ["Oct-25", "1,420,000", "1,890,000", "8,200,000"],
                  ["Nov-25", "1,380,000", "1,920,000", "7,660,000"],
                ],
              },
            ],
          },
        })
      );
    } else {
      catalog.push(
        pdfEntry({
          vdrPath: "03_Financials/Accounts_and_Management",
          rialuFolderId: "fld-fin-facilities",
          fileName: file,
          categoryLabel: "Financials",
          uploadedAt: "2025-10-01T09:00:00.000Z",
          status: file.includes("Debt") ? "flagged" : "reviewed",
          pdf: { title, sections: [{ body: [desc, "Detailed schedules available in data room annex."] }] },
        })
      );
    }
  }

  // —— 04 Commercial ——
  for (const party of COMMERCIAL_PARTIES) {
    const slug = party.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 30);
    catalog.push(
      pdfEntry({
        vdrPath: "04_Commercial_Contracts/Customer_and_Supplier",
        rialuFolderId: "fld-comm-msa",
        fileName: `Master_SaaS_Agreement_${slug}_Executed.pdf`,
        categoryLabel: "Commercial — MSA",
        uploadedAt: "2025-06-01T10:00:00.000Z",
        status: party.includes("Globex") ? "flagged" : "reviewed",
        pdf: {
          title: "Master Services Agreement",
          subtitle: `${CO} and ${party}`,
          docType: "Commercial Agreement",
          parties: `Between ${CO} and ${party}`,
          sections: msaSections(party),
        },
      })
    );
  }

  // —— 05 Employment ——
  for (const emp of EMPLOYEES) {
    const slug = emp.name.replace(/[^a-zA-Z]/g, "_");
    catalog.push(
      pdfEntry({
        vdrPath: "05_Employment/Executive_Agreements",
        rialuFolderId: "fld-emp-contracts",
        fileName: `Employment_Contract_${slug}_SIGNED.pdf`,
        categoryLabel: "Employment — Executive",
        uploadedAt: "2025-05-01T09:00:00.000Z",
        status: "reviewed",
        pdf: {
          title: "Contract of Employment",
          subtitle: `${emp.name} — ${emp.title}`,
          sections: employmentContractSections(emp),
        },
      })
    );
  }

  const empPolicies = [
    ["Employee_Handbook_2025_FINAL.pdf", "Employee Handbook", gdprPrivacyPolicySections().slice(0, 4)],
    ["Remote_Working_Policy_2024.pdf", "Remote Working Policy", [{ body: ["Hybrid policy up to 3 days remote."] }]],
    ["Anti_Bribery_and_Corruption_Policy.pdf", "ABC Policy", [{ body: ["Zero tolerance. Gifts over €50 require approval."] }]],
    ["Whistleblowing_Protected_Disclosures.pdf", "Whistleblowing", [{ body: ["Protected Disclosures Act 2014 procedures."] }]],
    ["Pension_Scheme_Summary_2025.pdf", "Pension", [{ body: ["6% employer contribution."] }]],
    ["Bonus_Plan_Executives_2025.pdf", "Bonus Plan", [{ body: ["Discretionary up to 30% base."] }]],
  ];
  for (const [file, title, sections] of empPolicies) {
    catalog.push(
      pdfEntry({
        vdrPath: "05_Employment/Policies_and_Handbooks",
        rialuFolderId: "fld-emp-policies",
        fileName: file,
        categoryLabel: "Employment — Policies",
        uploadedAt: "2025-04-01T09:00:00.000Z",
        status: "reviewed",
        pdf: { title, sections },
      })
    );
  }

  // —— 06 IP ——
  const ipDocs = [
    "IP_Assignment_Deed_Founders_SIGNED.pdf",
    "Trademark_Registration_ACME_AI_EUIPO.pdf",
    "Patent_Application_Document_Embeddings_EP2024.pdf",
    "Open_Source_Software_Policy_2024.pdf",
    "IP_Licence_In_University_Collab_2022.pdf",
    "IP_Licence_Out_Partner_OEM_2023.pdf",
    "Contractor_IP_Assignment_Template.pdf",
    "Trade_Secrets_Protection_Protocol.pdf",
  ];
  for (const file of ipDocs) {
    const title = file.replace(/_/g, " ").replace(".pdf", "");
    catalog.push(
      pdfEntry({
        vdrPath: "06_Intellectual_Property/IP_Register_and_Licences",
        rialuFolderId: "fld-ip-licences",
        fileName: file,
        categoryLabel: "Intellectual Property",
        uploadedAt: "2025-08-01T09:00:00.000Z",
        status: "reviewed",
        pdf: {
          title,
          sections: genericLongPolicySections(title, "intellectual property protection and licensing"),
        },
      })
    );
  }

  // —— 07 Litigation ——
  for (const lit of LITIGATION_DOCS) {
    catalog.push(
      pdfEntry({
        vdrPath: "07_Litigation",
        rialuFolderId: "fld-lit",
        fileName: lit.file,
        categoryLabel: "Litigation",
        uploadedAt: "2025-07-01T09:00:00.000Z",
        status: "flagged",
        pdf: {
          title: lit.title,
          sections: [{ body: [lit.body, "Prepared by Company counsel. Privileged material excluded."] }],
        },
      })
    );
  }
  for (let i = 0; i < 5; i++) {
    catalog.push(
      pdfEntry({
        vdrPath: "07_Litigation",
        rialuFolderId: "fld-lit",
        fileName: `Litigation_Memo_Matter_${2023 + i}_CLOSED.pdf`,
        categoryLabel: "Litigation — Memo",
        uploadedAt: `202${i + 3}-01-01T09:00:00.000Z`,
        status: "reviewed",
        pdf: { title: `Litigation Memo ${2023 + i}`, sections: [{ body: ["Closed matter. No material exposure."] }] },
      })
    );
  }

  // —— 08 GDPR ——
  const gdprDocs = [
    ["Privacy_Policy_Customers_2025_FINAL.pdf", gdprPrivacyPolicySections()],
    ["Data_Processing_Agreement_Template_2025.pdf", msaSections("Customer Template").slice(6, 8)],
    ["DPIA_Document_Intelligence_v3.pdf", [{ body: ["High-risk processing assessed. Mitigations implemented."] }]],
    ["Record_of_Processing_Activities_2025.pdf", [{ body: ["ROPA maintained per Article 30."] }]],
    ["Cookie_Policy_Website_2025.pdf", [{ body: ["ePrivacy compliant banner."] }]],
    ["Subprocessor_Register_2025.pdf", [{ body: ["AWS, Azure, Stripe, Intercom listed."] }]],
    ["Data_Breach_Register.pdf", [{ body: ["Two minor incidents 2024, no DPC notification required."] }]],
    ["SCCs_Module_Two_2021_Executed.pdf", [{ body: ["Standard Contractual Clauses with US parent vendors."] }]],
  ];
  for (const [file, sections] of gdprDocs) {
    catalog.push(
      pdfEntry({
        vdrPath: "08_Data_Protection_GDPR",
        rialuFolderId: "fld-gdpr",
        fileName: file,
        categoryLabel: "Data Protection / GDPR",
        uploadedAt: "2025-09-01T09:00:00.000Z",
        status: "reviewed",
        pdf: { title: file.replace(/_/g, " ").replace(".pdf", ""), sections },
      })
    );
  }

  // —— 09 Tax ——
  for (const [file, desc] of [
    ["Tax_Clearance_Certificate_2025.pdf", "Revenue confirmation no arrears."],
    ["Corporation_Tax_Returns_FY2024.pdf", "CT1 filed. R&D credit claimed €420k."],
    ["VAT_Registration_Details.pdf", `${CO_VAT} registered.`],
    ["Transfer_Pricing_Memo_2024.pdf", "Arm's length intercompany services."],
    ["PAYE_Summary_2025.pdf", "142 employees on payroll."],
    ["R_and_D_Tax_Credit_Claim_2024.pdf", "Qualifying R&D expenditure €2.1m."],
    ["Withholding_Tax_Summary.pdf", "US royalty withholding 0% under treaty."],
    ["Tax_Due_Diligence_Memo_Arthur_Cox.pdf", "No material exposures identified."],
  ]) {
    catalog.push(
      pdfEntry({
        vdrPath: "09_Tax",
        rialuFolderId: "fld-tax",
        fileName: file,
        categoryLabel: "Tax",
        uploadedAt: "2025-10-01T09:00:00.000Z",
        status: "reviewed",
        pdf: {
          title: file.replace(/_/g, " ").replace(".pdf", ""),
          sections: genericLongPolicySections(file.replace(/_/g, " ").replace(".pdf", ""), "tax compliance"),
        },
      })
    );
  }

  // —— 10 Insurance ——
  for (const [file, desc] of [
    ["D_and_O_Policy_2025_Certificate.pdf", "€5m limit, AIG Europe."],
    ["Cyber_Insurance_Policy_2025.pdf", "€10m limit, Coalition."],
    ["Professional_Indemnity_2025.pdf", "€3m limit."],
    ["Employers_Liability_2025.pdf", "Statutory compliant."],
    ["Property_Insurance_Dublin_Office.pdf", "Contents and business interruption."],
    ["Insurance_Claims_History_5_Years.pdf", "One minor PI claim 2022, settled."],
  ]) {
    catalog.push(
      pdfEntry({
        vdrPath: "10_Insurance",
        rialuFolderId: "fld-ins",
        fileName: file,
        categoryLabel: "Insurance",
        uploadedAt: "2025-09-15T09:00:00.000Z",
        status: "reviewed",
        pdf: {
          title: file.replace(/_/g, " ").replace(".pdf", ""),
          sections: genericLongPolicySections(file.replace(/_/g, " ").replace(".pdf", ""), "insurance coverage"),
        },
      })
    );
  }

  // —— 11 Regulatory ——
  for (const [file, desc] of [
    ["AML_KYC_Policy_2024_FINAL.pdf", "Central Bank AML requirements."],
    ["Export_Control_Memo_US_EAR.pdf", "Encryption self-classification."],
    ["Regulatory_Compliance_Certificate_2025.pdf", "No licences required for SaaS."],
    ["AI_Act_Readiness_Assessment_2025.pdf", "High-risk classification assessment for enterprise module."],
    ["Competition_Law_Compliance_Guidelines.pdf", "Information sharing protocols."],
    ["Sanctions_Screening_Procedure.pdf", "OFAC/EU lists screened."],
  ]) {
    catalog.push(
      pdfEntry({
        vdrPath: "11_Regulatory_Compliance",
        rialuFolderId: "fld-reg",
        fileName: file,
        categoryLabel: "Regulatory / Compliance",
        uploadedAt: "2025-08-15T09:00:00.000Z",
        status: file.includes("AI_Act") ? "flagged" : "reviewed",
        pdf: {
          title: file.replace(/_/g, " ").replace(".pdf", ""),
          sections: genericLongPolicySections(file.replace(/_/g, " ").replace(".pdf", ""), "regulatory compliance"),
        },
      })
    );
  }

  // Internal memos as .txt
  catalog.push(
    txtEntry({
      vdrPath: "01_Corporate/Board_and_Shareholder",
      rialuFolderId: "fld-corp-minutes",
      fileName: "Board_Pack_M_and_A_Readiness_Notes_Oct_2025.txt",
      categoryLabel: "Corporate — Internal Memo",
      uploadedAt: "2025-10-01T08:00:00.000Z",
      status: "reviewed",
      txt: `CONFIDENTIAL — ${CO_SHORT} Board Pack Notes\n\nM&A readiness: ${BUYER} preliminary approach received. Counsel to prepare clean team. Data room index aligned with Arthur Cox checklist.\n\nKey risks flagged: DataForge litigation, Globex change-of-control clause, SVB covenant.\n`,
    }),
    txtEntry({
      vdrPath: "04_Commercial_Contracts/Customer_and_Supplier",
      rialuFolderId: "fld-comm-msa",
      fileName: "Commercial_Contracts_Summary_Memo_REDLINE.txt",
      categoryLabel: "Commercial — Summary Memo",
      uploadedAt: "2025-10-05T09:00:00.000Z",
      status: "flagged",
      txt: `Top 10 customer contracts represent 38% ARR. Globex MSA includes termination for change of control without consent. Recommend waiver or renegotiation pre-signing.\n`,
    })
  );

  return catalog;
}
