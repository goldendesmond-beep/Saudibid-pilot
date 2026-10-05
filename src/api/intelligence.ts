import { api } from "./client";

export interface IntelligenceEvaluationResult {
  opportunity_id: string;
  opportunity_title: string;
  opportunity_title_ar?: string;
  entity: string;
  city: string;
  region: string;
  work_category: string;
  budget_sar?: number | null;
  closing_date?: string | null;
  publication_date?: string | null;
  discovered_at?: string | null;
  reference_number?: string;
  primary_source_id?: string;
  source_live_status?: string;
  original_url?: string;
  confidence_level: string;
  opportunity_type: string;
  eligibility: {
    status: "ELIGIBLE" | "LIKELY_ELIGIBLE" | "REVIEW_REQUIRED" | "NOT_ELIGIBLE" | "UNKNOWN";
    passed: boolean;
    failed_criteria: string[];
    passed_criteria: string[];
    review_required_criteria: string[];
    missing_evidence: string[];
    company_size_disclaimed: boolean;
  };
  match_score: {
    total_score: number;
    label: "STRONG_MATCH" | "GOOD_MATCH" | "REVIEW" | "LOW_MATCH";
    components: {
      activity_fit: number;
      geographic_fit: number;
      project_scale_fit: number;
      capacity_fit: number;
      preference_fit: number;
      semantic_fit: number;
    };
    positive_reasons: string[];
    concerns: string[];
    missing_information: string[];
  };
  subcontract: {
    is_subcontract_target: boolean;
    potential_level: "HIGH" | "MEDIUM" | "LOW";
    subcontract_rationale: string[];
    recommended_positioning: "SPECIALIST_SUBCONTRACTOR" | "PRIME_BIDDER";
  };
  gap_analysis: {
    opportunity_id: string;
    company_id: string;
    available_capabilities: string[];
    missing_capabilities: string[];
    unknown_capabilities: string[];
    potential_action: "DIRECT_TENDER" | "REVIEW_REQUIREMENT" | "SUBCONTRACT_TARGET" | "VENDOR_REGISTRATION" | "NO_ACTION";
    disclaimer: string;
  };
}

export const intelligenceApi = {
  evaluate: (companyId: string) =>
    api.post<IntelligenceEvaluationResult[]>(`/intelligence/evaluate?company_id=${companyId}`),
};
