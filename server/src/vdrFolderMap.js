/**
 * Map VDR zip folder paths (e.g. 01_Corporate/...) to Rialu folder IDs.
 * @param {string} relativePath zip entry path
 * @param {string} matterId
 */
export function resolveFolderFromVdrPath(relativePath, matterId) {
  if (!relativePath) return null;
  const parts = relativePath
    .replace(/\\/g, "/")
    .split("/")
    .map((p) => p.toLowerCase())
    .filter((p) => p && !p.endsWith(".pdf") && !p.endsWith(".xlsx") && !p.endsWith(".txt") && !p.endsWith(".docx"));

  // Drop zip root wrapper (acme_ai_ltd, demo-data-rooms, etc.)
  while (parts.length > 1 && !parts[0].match(/^\d{2}_/)) {
    parts.shift();
  }
  if (!parts.length) return null;

  const top = parts[0];
  const sub = parts[1] ?? "";

  const id = (base) => `${base}-${matterId}`;

  if (top.includes("01_") || top.includes("corporate")) {
    if (sub.includes("board") || sub.includes("shareholder")) return id("fld-corp-minutes");
    if (sub.includes("subsid")) return id("fld-corp-subs");
    return id("fld-corp-charter");
  }
  if (top.includes("02_") || top.includes("capital")) return id("fld-sh-cap");
  if (top.includes("03_") || top.includes("financial")) return id("fld-fin-facilities");
  if (top.includes("04_") || top.includes("commercial")) return id("fld-comm-msa");
  if (top.includes("05_") || top.includes("employment")) {
    if (sub.includes("executive") || sub.includes("contract")) return id("fld-emp-contracts");
    return id("fld-emp-policies");
  }
  if (top.includes("06_") || top.includes("intellectual") || top.includes("_ip")) return id("fld-ip-licences");
  if (top.includes("07_") || top.includes("litigation")) return id("fld-lit");
  if (top.includes("08_") || top.includes("gdpr") || top.includes("data_protection")) return id("fld-reg");
  if (top.includes("09_") || top.includes("tax")) return id("fld-tax");
  if (top.includes("10_") || top.includes("insurance")) return id("fld-ins");
  if (top.includes("11_") || top.includes("regulatory") || top.includes("compliance")) return id("fld-reg");

  return null;
}

/** Refile existing uploads when zip paths were not preserved (filename heuristics). */
export function guessFolderFromFilename(fileName, matterId) {
  const n = fileName.toLowerCase();
  const id = (base) => `${base}-${matterId}`;

  if (n.includes("shareholder") || n.includes("cap_table") || n.includes("series_b") || n.includes("esop") || n.includes("convertible"))
    return id("fld-sh-cap");
  if (n.includes("board_minute") || n.includes("written_resolution") || n.includes("board_pack"))
    return id("fld-corp-minutes");
  if (n.includes("certificate") || n.includes("constitution") || n.includes("bylaw") || n.includes("register_of_director"))
    return id("fld-corp-charter");
  if (n.includes("subsidiary") || n.includes("_gmbh") || n.includes("_uk_ltd"))
    return id("fld-corp-subs");
  if (n.includes("employment_contract") || n.includes("executive"))
    return id("fld-emp-contracts");
  if (n.includes("handbook") || n.includes("pension") || n.includes("bonus_plan") || n.includes("whistleblow") || n.includes("remote_work"))
    return id("fld-emp-policies");
  if (n.includes("master_saas") || n.includes("msa") || n.includes("commercial_contract"))
    return id("fld-comm-msa");
  if (n.includes("financial") || n.includes("audit") || n.includes("budget") || n.includes("cash_flow") || n.includes("debt_schedule") || n.includes("management_account"))
    return id("fld-fin-facilities");
  if (n.includes("trademark") || n.includes("patent") || n.includes("ip_") || n.includes("open_source"))
    return id("fld-ip-licences");
  if (n.includes("litigation") || n.includes("arbitration") || n.includes("settlement") || n.includes("letter_before_action"))
    return id("fld-lit");
  if (n.includes("privacy") || n.includes("gdpr") || n.includes("dpa") || n.includes("dpia") || n.includes("cookie") || n.includes("subprocessor") || n.includes("scc"))
    return id("fld-reg");
  if (n.includes("tax_") || n.includes("vat_") || n.includes("paye") || n.includes("corporation_tax"))
    return id("fld-tax");
  if (n.includes("insurance") || n.includes("indemnity") || n.includes("_policy_"))
    return id("fld-ins");
  if (n.includes("aml") || n.includes("regulatory") || n.includes("compliance") || n.includes("export_control") || n.includes("ai_act"))
    return id("fld-reg");

  return null;
}
