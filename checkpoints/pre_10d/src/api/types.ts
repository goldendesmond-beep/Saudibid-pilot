// Mirrors backend Pydantic models. No `any` types.

export type CompanySize = "Small" | "Medium" | "Large";
export type ClassificationGrade = 1 | 2 | 3 | 4 | 5 | "Unclassified";

export interface CompanyProfile {
  id: string;
  name: string;
  name_ar?: string;
  cr_number?: string;
  company_size: CompanySize;
  saudi_regions: string[];
  saudi_cities: string[];
  main_activities: string[];
  secondary_activities: string[];
  contractor_classification: string;
  classification_grade: ClassificationGrade;
  experience_years: number;
  manpower_count: number;
  equipment_tags: string[];
  comfortable_project_size: string;
  preferred_project_value_sar: number;
  guarantee_capability_sar: number;
  certifications: string[];
  direct_tender_interest: boolean;
  subcontracting_interest: boolean;
  vendor_registration_interest: boolean;
  excluded_project_types: string[];

  // Legacy & internal compatibility fields
  cpv_codes: string[];
  regions: string[];
  annual_turnover: number;
  capacity_tags: string[];
  exclusion_flags: string[];
}

export interface Tender {
  id: string;
  source: "Etimad" | "Furas" | "Aramco" | "NEOM" | "TED" | "KIMDIS" | "ESIDIS";
  title: string;
  title_ar?: string;
  work_category?: string;
  city?: string;
  region?: string;
  budget_sar?: number | null;
  bid_bond_sar?: number | null;
  entity?: string;
  entity_ar?: string;
  reference_number?: string;
  opportunity_type?:
    | "Government Tender"
    | "Private Tender"
    | "RFQ"
    | "RFP"
    | "Subcontract Request"
    | "Vendor Registration"
    | "Project Signal";
  cpv_codes: string[];
  budget: number | null;
  deadline: string;
  nuts: string[];
  description: string;
  description_ar?: string;
  raw_doc_uri: string;
  exclusion_flags: string[];
  status: "open" | "closed" | "awarded";
}

export interface EligibilityCheck {
  passed: boolean;
  failed_criteria: string[];
  warnings: string[];
  rule_version: string;
}

export interface MatchResult {
  tender_id: string;
  company_id: string;
  score: number;
  semantic_score: number;
  rule_score: number;
  reasons: string[];
  eligibility: EligibilityCheck;
}

export interface ProposalCitation {
  tender_id: string;
  locator: string;
  snippet: string;
}

export interface RequirementItem {
  id: string;
  category: "technical" | "financial" | "legal" | "administrative" | "submission";
  text: string;
  mandatory: boolean;
  citation: ProposalCitation;
}

export interface RequirementChecklist {
  tender_id: string;
  items: RequirementItem[];
  extracted_at: string;
  prompt_version: string;
}

export interface GapItem {
  requirement_id: string;
  status: "met" | "partial" | "unmet";
  evidence: string | null;
  note: string | null;
}

export interface GapReport {
  company_id: string;
  tender_id: string;
  items: GapItem[];
  coverage_ratio: number;
}

export interface BidDraftSection {
  title: string;
  content: string;
  citations: ProposalCitation[];
  covers_requirements: string[];
  self_check_status: "ok" | "gaps";
}

export interface BidDraft {
  id: string;
  company_id: string;
  tender_id: string;
  sections: BidDraftSection[];
  checklist: RequirementChecklist;
  gap_report: GapReport;
  status: "needs_review";
  prompt_version: string;
  created_at: string;
  notice: string;
}

export interface TraceStep {
  thought: string;
  action: string;
  action_input: string;
  observation: string;
}

export interface PricingStats {
  cpv: string | null;
  count: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  p25: number | null;
  p75: number | null;
  currency: string;
  status?: "OK" | "INSUFFICIENT_VERIFIED_DATA" | string;
}

export interface SupplierWinRate {
  supplier_name: string;
  supplier_vat: string | null;
  awards_won: number;
  total_value: number;
  win_share: number;
  win_rate?: number;
  win_count?: number;
}

export interface WinRates {
  total_awards?: number;
  status?: "OK" | "INSUFFICIENT_VERIFIED_DATA" | string;
  suppliers: SupplierWinRate[];
}

export interface TrendPoint {
  period: string;
  count: number;
  award_count?: number;
  total_value: number;
  total_amount?: number;
  mean_value: number;
}

export interface TrendSeries {
  interval: "month" | "quarter" | "year";
  status?: "OK" | "INSUFFICIENT_VERIFIED_DATA" | string;
  points: TrendPoint[];
}

export interface ApiErrorBody {
  detail: string;
}
