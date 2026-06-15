export type RiskSeverity = "low" | "medium" | "high";

export interface KeyClause {
  name: string;
  text: string;
  source_reference: string;
}

export interface Obligation {
  party: string;
  obligation: string;
  timing: string | null;
  source_reference: string;
}

export interface AiRisk {
  risk: string;
  severity: RiskSeverity;
  explanation: string;
  source_reference: string;
}

export interface AiEntity {
  name: string;
  role: string;
  jurisdiction: string | null;
}

export interface DocumentAnalysis {
  documentId: string;
  matterId: string;
  analyzedAt: string;
  fileName?: string;
  document_type: string;
  summary: string;
  key_clauses: KeyClause[];
  obligations: Obligation[];
  risks: AiRisk[];
  entities: AiEntity[];
  suggested_diligence_flag?: "green" | "amber" | "red";
  suggested_summary?: string;
  suggested_pertinent_notes?: string;
}

export interface MatterSynthesis {
  matterId: string;
  synthesizedAt: string;
  executive_summary: string;
  top_risks: {
    risk: string;
    severity: RiskSeverity;
    explanation: string;
    document_ids?: string[];
    document_names?: string[];
    source_references?: string[];
  }[];
  conflicts: {
    description: string;
    documents: string[];
    severity: RiskSeverity;
  }[];
  entities_map: { name: string; relationship: string; documents: string[] }[];
  themes: string[];
}

export interface ChatCitation {
  document_id: string;
  document_name: string;
  source_reference: string;
  excerpt: string;
}

export interface ChatResponse {
  answer: string;
  structured_points: string[];
  citations: ChatCitation[];
  confidence: "high" | "medium" | "low";
}

export interface AiRiskIssue {
  id: string;
  issue: string;
  severity: RiskSeverity;
  documentId: string | null;
  documentName: string;
  status: string;
  assignedTo: string | null;
  source: string;
  explanation: string;
  sourceReference: string;
}

export interface GeneratedReport {
  matterId: string;
  matterName: string;
  generatedAt: string;
  report: {
    title: string;
    executive_summary: string;
    sections: { heading: string; body: string }[];
    red_flags: { item: string; severity: string; recommendation: string }[];
    conclusion: string;
  };
  riskCount: number;
}
