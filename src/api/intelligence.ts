import { api } from "./client";

export type ApplicationChannelStatus =
  | "DIRECT_APPLICATION"
  | "VENDOR_PORTAL"
  | "PROCUREMENT_CONTACT"
  | "SOURCE_INSTRUCTIONS"
  | "MULTIPLE_CHANNELS"
  | "NO_VERIFIED_APPLICATION_CHANNEL"
  | "UNKNOWN";

export type ActionabilityState = "HIGH" | "MEDIUM" | "LOW" | "NOT_ACTIONABLE" | "UNKNOWN";

export interface HowToApplyIntelligence {
  channel_status: ApplicationChannelStatus;
  where_to_apply: string;
  who_to_contact: string;
  what_to_do_next: string[];
  direct_tender_url?: string | null;
  official_application_url?: string | null;
  supplier_portal?: string | null;
  vendor_registration_url?: string | null;
  procurement_email?: string | null;
  procurement_phone?: string | null;
  official_contact_page?: string | null;
  source_instructions?: string | null;
  main_contractor_contact?: {
    name?: string | null;
    website?: string | null;
    portal_url?: string | null;
    registration_url?: string | null;
    email?: string | null;
    phone?: string | null;
    eoi_contact?: string | null;
    rfq_contact?: string | null;
    award_evidence?: string | null;
  } | null;
  provenance: {
    source: string;
    source_url: string;
    verification_status: "VERIFIED" | "UNVERIFIED" | "NO_CHANNEL_FOUND";
    verified_at: string;
    notes: string;
  };
}

export interface ActionabilityIntelligence {
  score: number;
  state: ActionabilityState;
  factors: {
    has_application_url: boolean;
    has_procurement_contact: boolean;
    has_supplier_portal: boolean;
    has_vendor_registration: boolean;
    has_deadline: boolean;
    has_submission_instructions: boolean;
    is_source_accessible: boolean;
    document_readiness_pct: number;
  };
  rationale: string[];
  missing_for_action: string[];
}

export interface ApplyingAsContext {
  organization_id: string;
  organization_name: string;
  organization_name_ar?: string;
  company_size?: string;
  classification_grade?: number | string;
}

export interface ApplicationFlowRecord {
  current_step: number;
  submission_status: "NOT_STARTED" | "IN_PREPARATION" | "PORTAL_OPENED" | "SUBMITTED";
  portal_opened_at?: string | null;
  submitted_at?: string | null;
  submission_ref?: string | null;
  commercial_bid_sar?: number | null;
  notes?: string | null;
}

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
  sector?: string;
  service_category?: string;
  client?: string;
  main_contractor?: string;
  // Provenance & Truthful Verification
  record_origin?: "REAL_CURRENT_FETCH" | "CACHED_REAL_DATA" | "STALE_DATABASE_DATA" | "ASSISTED_IMPORT" | "SEED" | "FIXTURE" | "MOCK" | "STATIC_SAMPLE" | "UNKNOWN";
  first_seen_at?: string;
  last_seen_at?: string;
  last_fetched_at?: string;
  last_verified_at?: string;
  last_changed_at?: string;
  last_source_check_at?: string;
  source_status?: "WORKING_LIVE" | "BLOCKED" | "AUTH_REQUIRED" | "ASSISTED_IMPORT" | "RUNTIME_ENVIRONMENT_BLOCKED" | "FIXTURE_ONLY";
  refresh_status?: "NEW" | "UPDATED" | "UNCHANGED" | "EXPIRED" | "ARCHIVED" | "REMOVED_FROM_SOURCE" | "UNKNOWN";
  is_stale?: boolean;
  is_seed?: boolean;
  is_fixture?: boolean;
  is_live_record?: boolean;
  // Renovation & Restoration
  is_renovation?: boolean;
  renovation_category?: string;
  application_channel?: string;
  // POST-STAGE-10C1: How-to-Apply & Contact Intelligence
  how_to_apply: HowToApplyIntelligence;
  actionability: ActionabilityIntelligence;
  applying_as: ApplyingAsContext;
  application_flow: ApplicationFlowRecord;
  manpower_details?: {
    role: string;
    quantity: number | "UNKNOWN";
    skills: string[] | "UNKNOWN";
    experience: string;
    duration: string;
    shift: string;
    accommodation: string;
    transportation: string;
    mobilization_date: string;
    location: string;
    client: string;
    main_contractor: string;
    deadline: string;
  };
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
  recordSubmission: (
    opportunityId: string,
    submissionData: {
      organization_id: string;
      submission_ref?: string;
      commercial_bid_sar?: number;
      notes?: string;
    }
  ) =>
    api.post<ApplicationFlowRecord>(`/opportunities/${opportunityId}/submission`, submissionData),
  openPortalEvent: (opportunityId: string) =>
    api.post<{ status: string; portal_opened_at: string }>(`/opportunities/${opportunityId}/open-portal`),
};
