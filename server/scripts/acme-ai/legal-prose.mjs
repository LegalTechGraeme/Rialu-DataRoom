import {
  CO,
  CO_ADDRESS,
  CO_REG,
  CO_SHORT,
  BUYER,
  GOVERNING_LAW,
  EW_LAW,
  JURISDICTION,
  SERIES_B_DATE,
  SERIES_B_AMOUNT,
  DISCLAIMER,
} from "./company.mjs";

/** Pad sections with additional schedules/appendices for multi-page realism */
export function expandSections(sections, extraScheduleCount = 3) {
  const out = [...sections];
  for (let s = 1; s <= extraScheduleCount; s++) {
    out.push({
      heading: `Schedule ${s} — Supplemental Provisions`,
      body: standardScheduleParagraphs(s),
    });
  }
  out.push({
    heading: "Appendix A — Defined Terms Cross-Reference",
    body: Array.from({ length: 12 }, (_, i) =>
      `A.${i + 1} Cross-reference table entry ${i + 1}: terms used in Sections 1–12 shall have meanings set out in clause ${i + 1} of the Definitions unless expressly varied in this Appendix.`
    ),
  });
  return out;
}

/** @param {number} scheduleNum */
function standardScheduleParagraphs(scheduleNum) {
  const topics = [
    "service credits and SLA measurement methodology",
    "escalation matrix and severity classifications",
    "data retention and deletion timelines",
    "audit rights and penetration testing",
    "business continuity and disaster recovery RTO/RPO",
    "insurance minimums and evidence of coverage",
    "most favoured customer pricing protections",
    "subcontractor flow-down obligations",
    "export control and sanctions compliance",
    "publicity and announcement restrictions",
  ];
  const topic = topics[scheduleNum % topics.length];
  return Array.from({ length: 8 }, (_, i) =>
    `${scheduleNum}.${i + 1} The parties agree supplemental terms regarding ${topic}. Party A shall comply with industry-standard practices and provide written evidence upon reasonable request. Party B shall cooperate in good faith and not unreasonably withhold approval. Breach of this Schedule ${scheduleNum} provision constitutes material breach if not remedied within twenty (20) Business Days of notice.`
  );
}

/** Expand a base clause with numbered sub-clauses for realism */
function subClauses(intro, items) {
  const body = [intro];
  items.forEach((item, i) => {
    body.push(`(${i + 1}) ${item}`);
  });
  return body.join(" ");
}

/** @param {[string, string][]} terms */
export function definitionsSection(terms) {
  const body = terms.map(
    ([term, def], idx) =>
      `${idx + 1}.1 "${term}" means ${def} References to "${term}" include, where the context permits, any successor or assignee thereof.`
  );
  return { heading: "1. Definitions and Interpretation", body };
}

export function interpretationSection() {
  return {
    heading: "2. Interpretation",
    body: [
      subClauses("In this Agreement, unless the context otherwise requires:", [
        "headings are for convenience only and do not affect interpretation;",
        "words importing the singular include the plural and vice versa;",
        "references to a person include bodies corporate, unincorporated associations and partnerships;",
        `"Company" means ${CO} (${CO_REG});`,
        "references to statutes or statutory provisions include any subordinate legislation and any modification, consolidation or re-enactment thereof;",
        "references to writing include email where acknowledged by the recipient;",
        "references to days are to calendar days unless stated as Business Days;",
        "Business Day means a day on which banks are open for business in Dublin, Ireland and London, England;",
        "any obligation on a party not to do something includes an obligation not to allow it to be done;",
        "the words include and including are without limitation.",
      ]),
      `The Schedules form part of this Agreement and shall have the same force and effect as if set out in the body of this Agreement. In the event of conflict between the body and a Schedule, the body shall prevail unless the Schedule expressly states otherwise.`,
      `This Agreement has been negotiated at arm's length. Each party acknowledges that it has had the opportunity to obtain independent legal advice and that the doctrine of contra proferentem shall not apply in the construction or interpretation of this Agreement.`,
    ],
  };
}

export function recitalsSection(purpose) {
  return {
    heading: "Background",
    body: [
      `(A) ${CO} is a private company limited by shares incorporated in ${JURISDICTION} (${CO_REG}) whose registered office is at ${CO_ADDRESS}.`,
      `(B) The Company carries on the business of developing and licensing artificial intelligence software-as-a-service solutions for enterprise customers in the European Union, United Kingdom and North America.`,
      `(C) ${purpose}`,
      `(D) The parties have agreed to enter into this Agreement on the terms set out below.`,
      `NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration (the receipt and sufficiency of which are hereby acknowledged), the parties agree as follows:`,
    ],
  };
}

/** @param {string} counterparty */
export function msaSections(counterparty) {
  const sections = [
    recitalsSection(
      `${counterparty} wishes to procure certain cloud infrastructure and platform services from the Company, and the Company agrees to provide such services subject to the terms of this Master Services Agreement.`
    ),
    definitionsSection([
      ["Agreement", `this Master Services Agreement including all Statements of Work, Service Schedules and Order Forms`],
      ["Confidential Information", `all information disclosed by either party in connection with this Agreement that is marked confidential or would reasonably be understood to be confidential`],
      ["Customer Data", `all data, content and materials submitted by ${counterparty} to the Services`],
      ["Effective Date", `the date of last signature below`],
      ["Fees", `the amounts payable as set out in the applicable Order Form`],
      ["Force Majeure Event", `any event beyond a party's reasonable control including acts of God, war, terrorism, pandemic, governmental action, failure of utilities or internet backbone`],
      ["Intellectual Property Rights", `patents, rights to inventions, copyright, database rights, trade marks, trade names, domain names, rights in get-up, rights in goodwill, rights in confidential information and all other intellectual property rights`],
      ["Services", `the software-as-a-service platform, APIs, support and professional services described in an Order Form`],
      ["SLA", `the service level agreement in Schedule 2`],
      ["Statement of Work" , `a document executed by the parties describing specific Services, deliverables, milestones and Fees`],
    ]),
    interpretationSection(),
    {
      heading: "3. Provision of Services",
      body: [
        subClauses(`The Company shall provide the Services to ${counterparty} in accordance with this Agreement, the applicable SLA and each Statement of Work. The Company shall:`, [
          "use commercially reasonable efforts to make the Services available 99.9% of each calendar month, excluding scheduled maintenance notified at least 48 hours in advance;",
          "provide the Services in compliance with applicable law, including the General Data Protection Regulation (EU) 2016/679 and the Data Protection Act 2018;",
          "maintain ISO 27001 certification or equivalent security controls during the term;",
          "assign qualified personnel with appropriate skills and experience;",
          "not materially degrade the overall functionality of the Services during the term.",
        ]),
        `${counterparty} shall: (i) provide timely access to personnel, systems and information reasonably required; (ii) ensure authorised users comply with acceptable use policies; (iii) not use the Services to store or transmit unlawful content; (iv) maintain appropriate backups of Customer Data where required by law or internal policy.`,
        `Unless otherwise agreed in writing, the Company may engage subcontractors provided it remains responsible for their acts and omissions. A current list of material subprocessors is maintained at https://trust.acmeai.example/subprocessors and updated with 30 days' notice for new subprocessors handling personal data.`,
      ],
    },
    {
      heading: "4. Fees; Invoicing; Payment",
      body: [
        `${counterparty} shall pay the Fees in accordance with the applicable Order Form. Unless stated otherwise, Fees are exclusive of VAT and similar taxes, which shall be added where applicable.`,
        `Invoices are issued monthly in arrears and are payable within thirty (30) days of the invoice date. Late payments accrue interest at 1.5% per month or the maximum rate permitted by law, whichever is lower.`,
        `If ${counterparty} disputes an invoice in good faith, it shall pay the undisputed portion and notify the Company in writing of the dispute within fifteen (15) days, providing reasonable detail.`,
        `The Company may suspend Services for non-payment after thirty (30) days' written notice, provided suspension shall not relieve ${counterparty} of payment obligations for Services already rendered.`,
      ],
    },
    {
      heading: "5. Intellectual Property",
      body: [
        `The Company retains all Intellectual Property Rights in the Services, platform, documentation and pre-existing materials. No rights are granted except as expressly set out herein.`,
        `${counterparty} receives a non-exclusive, non-transferable licence to use the Services during the term for its internal business purposes, subject to user limits in the Order Form.`,
        `Customer Data remains the property of ${counterparty}. ${counterparty} grants the Company a licence to process Customer Data solely to provide the Services and as described in the Data Processing Agreement.`,
        `Feedback provided by ${counterparty} may be used by the Company without restriction or obligation. ${counterparty} waives any moral rights in Feedback to the extent permitted by law.`,
      ],
    },
    {
      heading: "6. Confidentiality",
      body: [
        `Each party shall keep Confidential Information secret and use it only for purposes of this Agreement. Confidential Information may be disclosed to employees, advisers and contractors on a need-to-know basis subject to equivalent confidentiality obligations.`,
        `Confidentiality obligations do not apply to information that: (a) is public through no breach; (b) was lawfully known before disclosure; (c) is independently developed; or (d) is required to be disclosed by law, regulation or court order (with notice where permitted).`,
        `On termination, each party shall return or destroy Confidential Information within thirty (30) days, except one archival copy may be retained for compliance purposes subject to ongoing confidentiality.`,
      ],
    },
    {
      heading: "7. Data Protection",
      body: [
        `To the extent the Company processes personal data on behalf of ${counterparty}, the parties shall execute the Data Processing Agreement at Schedule 3, which incorporates Standard Contractual Clauses where required for international transfers.`,
        `The Company shall implement appropriate technical and organisational measures as described in its security whitepaper and notify ${counterparty} without undue delay upon becoming aware of a personal data breach affecting Customer Data.`,
      ],
    },
    {
      heading: "8. Warranties and Disclaimers",
      body: [
        `Each party warrants it has authority to enter this Agreement. The Company warrants the Services will perform materially in accordance with the documentation during the term.`,
        `EXCEPT AS EXPRESSLY SET OUT, THE SERVICES ARE PROVIDED "AS IS". THE COMPANY DISCLAIMS ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.`,
      ],
    },
    {
      heading: "9. Indemnification",
      body: [
        `${counterparty} shall indemnify the Company against claims arising from Customer Data, unauthorised use, or breach of this Agreement by ${counterparty}.`,
        `The Company shall indemnify ${counterparty} against third-party claims that the Services infringe UK or EU intellectual property rights, subject to exclusions for combinations, modifications, or use outside documentation.`,
        `Indemnified party must promptly notify, permit control of defence, and cooperate. No settlement admitting liability without consent.`,
      ],
    },
    {
      heading: "10. Limitation of Liability",
      body: [
        `NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, REVENUE, GOODWILL OR DATA.`,
        `EXCEPT FOR BREACH OF CONFIDENTIALITY, INDEMNITY OBLIGATIONS, FRAUD OR LIABILITY THAT CANNOT BE LIMITED BY LAW, EACH PARTY'S AGGREGATE LIABILITY SHALL NOT EXCEED THE FEES PAID OR PAYABLE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`,
      ],
    },
    {
      heading: "11. Term; Termination; Change of Control",
      body: [
        `This Agreement commences on the Effective Date and continues until terminated. Each Order Form states its initial term and renewal mechanics.`,
        `Either party may terminate for material breach not cured within thirty (30) days of written notice. ${counterparty} may terminate for convenience on ninety (90) days' notice after the initial term of each Order Form.`,
        `Upon termination, access to Services ceases and Fees for committed periods remain payable. The Company shall provide export of Customer Data for thirty (30) days.`,
        `Change of Control of ${counterparty} does not constitute assignment if the contracting entity remains liable. Change of Control of the Company shall not terminate this Agreement but ${counterparty} may negotiate in good faith regarding continuity if the acquirer is a direct competitor.`,
      ],
    },
    {
      heading: "12. Governing Law; Dispute Resolution",
      body: [
        `This Agreement is governed by ${EW_LAW}. The courts of England and Wales have exclusive jurisdiction, without prejudice to either party's right to seek injunctive relief in any jurisdiction.`,
        `Before commencing proceedings, senior representatives shall meet within fifteen (15) days to attempt good-faith resolution. If unresolved within thirty (30) days, either party may proceed to litigation.`,
      ],
    },
    {
      heading: "Execution",
      body: [
        `IN WITNESS WHEREOF the parties have executed this Agreement as of the Effective Date.`,
        `SIGNED for and on behalf of ${CO}`,
        `……………………………………`,
        `Name: Dr. Siobhán O'Connell`,
        `Title: Chief Executive Officer`,
        `Date: _______________`,
        ``,
        `SIGNED for and on behalf of ${counterparty}`,
        `……………………………………`,
        `Name: Authorised Signatory`,
        `Title: _______________`,
        `Date: _______________`,
      ],
    },
  ];
  return expandSections(sections, 4);
}

/** @param {{ name: string; title: string; salary: string }} employee */
export function employmentContractSections(employee) {
  const sections = [
    recitalsSection(
      `The Company wishes to employ ${employee.name} as ${employee.title} on the terms set out in this contract of employment.`
    ),
    definitionsSection([
      ["Company", `${CO} (${CO_REG})`],
      ["Employee", employee.name],
      ["Commencement Date", `the date specified in clause 2`],
      ["Confidential Information", `information relating to the business, customers, technology, finances and affairs of the Company`],
      ["Garden Leave", `a period during which the Employee remains employed but is not required to attend work`],
      ["Intellectual Property", `all inventions, works, software, data models, algorithms and materials created in connection with employment`],
    ]),
    interpretationSection(),
    {
      heading: "3. Appointment; Duties",
      body: [
        `The Company employs the Employee as ${employee.title} commencing on 1 March 2022 (or such other date agreed in writing).`,
        `The Employee shall devote full professional time and attention to duties, comply with all lawful directions, and act in the best interests of the Company.`,
        `The Employee shall not engage in any other business without prior written consent, such consent not to be unreasonably withheld for non-competing advisory roles occupying less than four hours per month.`,
        `Place of work is primarily ${CO_ADDRESS}, with hybrid working up to three days remote subject to business needs.`,
      ],
    },
    {
      heading: "4. Remuneration; Benefits",
      body: [
        `Base salary of ${employee.salary} per annum, paid monthly in arrears by credit transfer, subject to deduction of income tax, USC and PRSI.`,
        `Eligibility for annual discretionary bonus up to 30% of base salary based on Company and individual performance, not contractual unless expressly stated in a bonus plan.`,
        `Participation in the Company pension scheme with employer contribution of 6% of pensionable salary, subject to scheme rules.`,
        `Twenty-five (25) days' paid annual leave plus public holidays, pro-rated in leave year of commencement.`,
        `Private medical insurance through VHI Corporate Plan or equivalent, subject to insurer terms.`,
      ],
    },
    {
      heading: "5. Confidentiality; Company Property",
      body: [
        `The Employee shall not use or disclose Confidential Information except in the proper performance of duties or as required by law.`,
        `All documents, devices, access credentials and materials remain Company property and shall be returned on demand and on termination.`,
      ],
    },
    {
      heading: "6. Intellectual Property",
      body: [
        `The Employee assigns to the Company all Intellectual Property created during employment relating to the business or using Company resources.`,
        `The Employee shall execute documents and provide assistance reasonably required to perfect such assignment at the Company's expense.`,
        `Moral rights are waived to the fullest extent permitted by the Copyright and Related Rights Act 2000.`,
      ],
    },
    {
      heading: "7. Restrictive Covenants",
      body: [
        `For twelve (12) months after termination, the Employee shall not directly compete with the core AI document intelligence product line in the EEA and UK.`,
        `For twelve (12) months, the Employee shall not solicit or entice away key employees or customers with whom they had material contact in the twelve months preceding termination.`,
        `The Employee acknowledges these restrictions are reasonable and necessary to protect legitimate interests.`,
      ],
    },
    {
      heading: "8. Termination",
      body: [
        `During probation (first six months), either party may terminate on one week's notice. Thereafter, three months' written notice is required from either party.`,
        `The Company may terminate without notice for gross misconduct including fraud, serious breach of confidentiality, or material dishonesty.`,
        `On termination, the Company may place the Employee on Garden Leave for all or part of the notice period.`,
      ],
    },
    {
      heading: "9. Governing Law",
      body: [
        `This contract is governed by ${GOVERNING_LAW} and the parties submit to the exclusive jurisdiction of the Irish courts.`,
        `The Terms of Employment (Information) Acts 1994–2014 and Organisation of Working Time Act 1997 apply.`,
      ],
    },
    {
      heading: "Execution",
      body: [
        `Signed by the Employee: ${employee.name}`,
        `Signed for the Company: Dr. Siobhán O'Connell, CEO`,
      ],
    },
  ];
  return expandSections(sections, 3);
}

export function shareholdersAgreementSections() {
  const sections = [
    recitalsSection(
      `The Shareholders wish to regulate their relationship and the management of the Company following the Series B funding round completed on ${SERIES_B_DATE} in the aggregate amount of ${SERIES_B_AMOUNT}.`
    ),
    definitionsSection([
      ["Affiliate", `any entity controlling, controlled by or under common control with a party`],
      ["Board", `the board of directors of the Company`],
      ["Business Day", `a day when banks are open in Dublin`],
      ["Completion", `completion of the Series B investment`],
      ["Drag-Along Notice", `a notice requiring minority shareholders to sell on the same terms as a majority sale`],
      ["Fair Market Value", `value determined by an independent valuer appointed by the Institute of Chartered Accountants in Ireland`],
      ["Founders", `Siobhán O'Connell and Elena Vasquez`],
      ["Investor Majority", `Investors holding more than 60% of Investor Shares`],
      ["Investor Shares", `Series A Preferred, Series B Preferred and other shares issued to Investors`],
      ["Ordinary Shares", `the ordinary shares in the capital of the Company`],
      ["Reserved Matters", `matters requiring Investor Majority consent as set out in Schedule 3`],
      ["Tag-Along Notice", `a notice allowing minority shareholders to participate in a majority sale`],
      ["Transfer", `any sale, assignment, charge or other disposition`],
    ]),
    interpretationSection(),
    {
      heading: "3. Share Capital; Classes",
      body: [
        `The authorised share capital comprises Ordinary Shares, Series A Preferred Shares and Series B Preferred Shares with the rights set out in the Constitution and this Agreement.`,
        `Series B Preferred Shares carry a 1x non-participating liquidation preference, anti-dilution protection on a broad-based weighted average basis, and conversion rights into Ordinary Shares on a 1:1 basis subject to adjustments.`,
        `A summary cap table as at Completion is set out in Schedule 1.`,
      ],
    },
    {
      heading: "4. Board Composition; Reserved Matters",
      body: [
        subClauses("The Board shall comprise up to seven (7) directors:", [
          "two (2) Founder directors appointed by the Founders;",
          "two (2) Investor directors appointed by the Investor Majority;",
          "up to three (3) independent directors appointed by mutual agreement.",
        ]),
        `Board meetings require quorum of three directors including at least one Investor director. Board materials shall be circulated at least five Business Days before meetings except in emergencies.`,
        `The following Reserved Matters require Investor Majority consent: amendment of constitutional documents adversely affecting Investor Shares; declaration of dividends; incurrence of indebtedness above €500,000; approval of annual budget variances greater than 15%; appointment/removal of CEO or CFO; any material litigation settlement above €250,000; any sale of all or substantially all assets; any IPO or trade sale process.`,
      ],
    },
    {
      heading: "5. Transfer Restrictions; Pre-emption",
      body: [
        `No Shareholder may Transfer shares except as permitted under this Agreement. Permitted Transfers include transfers to Affiliates subject to undertaking to be bound by this Agreement.`,
        `A Shareholder wishing to Transfer must first offer shares to existing Shareholders pro rata at Fair Market Value (right of first refusal), with 30 days to accept.`,
        `Transfers not complying with this clause are void and shall not be registered.`,
      ],
    },
    {
      heading: "6. Drag-Along; Tag-Along",
      body: [
        `If holders of 75% of all shares approve a bona fide sale to a third party, they may deliver a Drag-Along Notice requiring all Shareholders to sell on the same terms, subject to customary limitations for dissenting founders regarding representations.`,
        `If founders propose a sale of more than 50% of their shares, other Shareholders may deliver a Tag-Along Notice to participate pro rata.`,
      ],
    },
    {
      heading: "7. Information Rights; Inspection",
      body: [
        `Investors shall receive quarterly management accounts within 30 days of quarter end, annual audited accounts within 120 days, annual budget, cap table updates, and material litigation notices.`,
        `Investors may inspect books and records on reasonable notice during business hours with confidentiality obligations.`,
      ],
    },
    {
      heading: "8. Non-Compete; Confidentiality",
      body: [
        `Founders and key employees bound by this Agreement shall not compete with the core business in the EEA for twelve months after ceasing to hold 5% or more of shares, subject to Irish enforceability principles.`,
        `All Shareholders shall keep terms and confidential information secret.`,
      ],
    },
    {
      heading: "9. Termination; Governing Law",
      body: [
        `This Agreement terminates on IPO or when no Investor holds shares, save for surviving provisions.`,
        `Governed by ${GOVERNING_LAW}. Irish courts have exclusive jurisdiction.`,
      ],
    },
    {
      heading: "Schedules and Execution",
      body: [
        `Schedule 1: Cap Table`,
        `Schedule 2: Constitution summary`,
        `Schedule 3: Reserved Matters`,
        `Schedule 4: Deed of adherence template`,
        `Executed as a deed by the parties on ${SERIES_B_DATE}.`,
      ],
    },
  ];
  return expandSections(sections, 5);
}

/** @param {string} meetingDate @param {string[]} resolutions */
export function boardMinutesSections(meetingDate, resolutions) {
  const resBody = resolutions.flatMap((r, i) => [
    `RESOLUTION ${i + 1}: ${r}`,
    `Upon motion duly made and seconded, IT WAS RESOLVED that ${r.toLowerCase()}`,
  ]);
  const sections = [
  {
    heading: "MINUTES OF MEETING OF THE BOARD OF DIRECTORS",
    body: [
      `COMPANY: ${CO} (${CO_REG})`,
      `DATE: ${meetingDate}`,
      `TIME: 10:00 a.m. GMT`,
      `PLACE: ${CO_ADDRESS} (hybrid via Microsoft Teams)`,
      `PRESENT: Dr. Siobhán O'Connell (Chair), James Murphy, Elena Vasquez, Patrick Byrne, Fiona Walsh`,
      `IN ATTENDANCE: Aoife Ryan (General Counsel), Arthur Cox (External Counsel — for item 4 only)`,
      `QUORUM: Present throughout.`,
    ],
  },
  {
    heading: "1. Chair; Conflicts",
    body: [
      `Dr. Siobhán O'Connell was appointed Chair. No conflicts of interest were declared except that Patrick Byrne declared his affiliation with Sequoia Capital and abstained from voting on item 5.`,
    ],
  },
  {
    heading: "2. Minutes of Previous Meeting",
    body: [`The minutes of the meeting held on the prior month were approved without amendment.`],
  },
  {
    heading: "3. Management Update",
    body: [
      `The CEO presented ARR of €18.2m (up 42% YoY), net revenue retention of 118%, and pipeline coverage of 3.1x for Q3. Discussion noted lengthening enterprise sales cycles in DACH region.`,
      `CFO reported cash runway of 22 months at current burn and confirmed audit fieldwork on track for April sign-off.`,
      `CTO reported successful launch of document intelligence v3.2 and migration of 94% of tenants to new inference cluster.`,
    ],
  },
  {
    heading: "4. Resolutions",
    body: resBody,
  },
  {
    heading: "5. Any Other Business; Close",
    body: [
      `There being no further business, the Chair declared the meeting closed at 12:14 p.m.`,
      `These minutes were approved by the Board on _______________.`,
      `……………………………………`,
      `Dr. Siobhán O'Connell, Chair`,
    ],
  },
];
  return expandSections(sections, 2);
}

export function gdprPrivacyPolicySections() {
  const sections = [
    {
      heading: "Acme AI Limited — Privacy Policy (EU/UK)",
      body: [
        `Last updated: 1 January 2025. Controller: ${CO}, ${CO_ADDRESS}. Data Protection Officer: privacy@acmeai.example.`,
        `This policy explains how we collect, use, share and protect personal data when you use our SaaS platform, website and related services.`,
      ],
    },
    definitionsSection([
      ["Personal Data", `information relating to an identified or identifiable natural person`],
      ["Processing", `any operation performed on personal data`],
      ["Controller", `entity determining purposes and means of processing`],
      ["Processor", `entity processing on behalf of controller`],
      ["Special Categories", `data revealing racial origin, health, biometric data for identification, etc.`],
    ]),
    {
      heading: "3. Data We Collect",
      body: [
        subClauses("We may collect:", [
          "account registration data (name, email, employer, role);",
          "usage and telemetry data (IP address, device identifiers, feature usage, logs);",
          "customer content uploaded to the platform for document analysis;",
          "billing and payment records;",
          "support communications;",
          "marketing preferences where consent obtained.",
        ]),
      ],
    },
    {
      heading: "4. Legal Bases (GDPR Article 6)",
      body: [
        `Contract performance for providing the Services; legitimate interests for security, product improvement and fraud prevention balanced against rights; consent for non-essential cookies and marketing; legal obligation for tax and regulatory records.`,
      ],
    },
    {
      heading: "5. International Transfers",
      body: [
        `Where data is transferred outside the EEA/UK, we implement Standard Contractual Clauses (2021/914) and supplementary measures including encryption and access controls.`,
      ],
    },
    {
      heading: "6. Retention; Rights",
      body: [
        `Data retained for the subscription term plus up to seven years for legal claims and tax. Data subjects may access, rectify, erase, restrict, port data, and object. Complaints may be lodged with the Irish Data Protection Commission.`,
      ],
    },
    {
      heading: "7. Security; Breach Notification",
      body: [
        `We maintain ISO 27001-aligned controls, annual penetration testing, and staff training. Personal data breaches are notified to supervisory authorities within 72 hours where required and to customers without undue delay.`,
      ],
    },
  ];
  return expandSections(sections, 4);
}

/** Generic long-form policy / memo sections for shorter diligence documents */
export function genericLongPolicySections(title, topic) {
  const sections = [
    recitalsSection(
      `The Company has adopted this ${title} in connection with its Series B financing and ongoing M&A due diligence process.`
    ),
    definitionsSection([
      ["Company", `${CO} (${CO_REG})`],
      ["Policy", `this ${title}`],
      ["Compliance Officer", `the person appointed by the Board to oversee ${topic}`],
      ["Effective Date", `the date of Board approval of this Policy`],
      ["Group", `the Company and its subsidiaries from time to time`],
    ]),
    interpretationSection(),
    {
      heading: "3. Scope and Application",
      body: Array.from(
        { length: 10 },
        (_, i) =>
          `3.${i + 1} This Policy applies to all directors, officers, employees, contractors and agents of the Group engaged in activities relating to ${topic}. Material exceptions require written approval of the Compliance Officer and General Counsel.`
      ),
    },
    {
      heading: "4. Operational Requirements",
      body: Array.from(
        { length: 12 },
        (_, i) =>
          `4.${i + 1} The Group shall maintain documented procedures, training programmes and periodic audits sufficient to demonstrate compliance with applicable laws and regulations concerning ${topic}. Metrics shall be reported to the Board Audit & Risk Committee quarterly.`
      ),
    },
    {
      heading: "5. Breach; Escalation; Review",
      body: [
        `Material breaches shall be escalated to the Board within five (5) Business Days. This Policy is reviewed annually and updated following material regulatory developments.`,
      ],
    },
  ];
  return expandSections(sections, 3);
}

export { DISCLAIMER };
