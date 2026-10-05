/**
 * Subcontracting & Main Contractor Intelligence API Client (Stage 8).
 */

import { api } from "./client";

export interface ContractorPortalLink {
  url: string;
  link_type:
    | "VENDOR_REGISTRATION"
    | "SUPPLIER_REGISTRATION"
    | "SUBCONTRACTOR_REGISTRATION"
    | "PREQUALIFICATION"
    | "PROCUREMENT_PORTAL"
    | "RFQ_PORTAL"
    | "GENERAL_CONTACT"
    | "PROJECT_CONTACT";
  evidence_source: string;
  verified_domain: string;
  last_checked?: string;
  authentication_required: boolean;
  registration_status:
    | "PUBLIC"
    | "AUTH_REQUIRED"
    | "REGISTRATION_REQUIRED"
    | "RUNTIME_ENVIRONMENT_BLOCKED"
    | "MANUAL_ASSISTED"
    | "UNAVAILABLE";
  notes?: string;
}

export interface ContractorPublicContact {
  contact_type: string;
  email?: string;
  phone?: string;
  address?: string;
  verified_source?: string;
}

export interface MainContractorProfile {
  id: string;
  contractor_name: string;
  contractor_name_ar?: string;
  normalized_name?: string;
  commercial_brand_name?: string;
  verification_status:
    | "VERIFIED_MAIN_CONTRACTOR"
    | "OFFICIAL_SINGLE_SOURCE"
    | "POSSIBLE_MAIN_CONTRACTOR"
    | "UNKNOWN";
  official_website?: string;
  headquarters?: string;
  saudi_presence: boolean;
  cr_number?: string;
  company_size?: string;
  contractor_classification?: string;
  specialties: string[];
  industries: string[];
  geographic_coverage: string[];
  known_clients: string[];
  active_saudi_projects: Array<{
    project_id?: string;
    title?: string;
    owner?: string;
    contract_value_sar?: number;
    award_date?: string;
    location?: string;
  }>;
  awarded_project_id?: string;
  awarded_project_title?: string;
  owner?: string;
  project_location?: string;
  contract_value_sar?: number;
  award_date?: string;
  verified_sources: string[];
  portal_links: ContractorPortalLink[];
  contacts: ContractorPublicContact[];
  evidence_level?: string;
  created_at?: string;
  last_verified_date?: string;
}

export interface SubcontractPackage {
  id: string;
  main_contractor_id: string;
  main_contractor_name: string;
  main_contractor_name_ar?: string;
  project_id: string;
  project_name: string;
  project_name_ar?: string;
  project_owner: string;
  project_location: string;
  package_name: string;
  package_name_ar?: string;
  package_category: string;
  description: string;
  evidence_level: "CONFIRMED" | "INFERRED_FROM_PRIME_SCOPE" | "ESTIMATED";
  evidence_source: string;
  likely_timing: string;
  estimated_scope?: string;
  required_capabilities: string[];
  likely_prequalification: string;
  known_requirements: string[];
  unknown_requirements: string[];
  small_contractor_friendly: boolean;
  is_inferred: boolean;
  estimated_value_sar?: number;
  match_score?: number;
  eligibility_status?: string;
  bd_status:
    | "DISCOVERED"
    | "PORTAL_REGISTERED"
    | "PREQUAL_SUBMITTED"
    | "CONTACTED"
    | "IN_DISCUSSIONS"
    | "AWARDED"
    | "PASSED";
  bd_notes?: string;
  bd_follow_up_date?: string;
  bd_responsible_user?: string;
  priority_label: string;
  priority_reasons: string[];
  created_at?: string;
}

export interface SubcontractMatch {
  package_id: string;
  company_id: string;
  match_score: number;
  eligibility_status: "ELIGIBLE" | "LIKELY_ELIGIBLE" | "REVIEW_REQUIRED" | "NOT_ELIGIBLE";
  fit_reasons: string[];
  gap_warnings: string[];
  recommended_approach: string;
  estimated_competitiveness: "HIGH" | "MEDIUM" | "LOW";
  calculated_at?: string;
}

export interface SubcontractMatchItem {
  package: SubcontractPackage;
  match: SubcontractMatch;
}

export interface SubcontractActionPlan {
  id: string;
  package_id: string;
  main_contractor_id: string;
  tenant_id: string;
  portal_registration_url: string;
  registration_portal_type: string;
  required_documents: Array<{
    document_name: string;
    is_mandatory: boolean;
    status: "READY" | "PENDING_REVIEW" | "MISSING";
  }>;
  outreach_contact: ContractorPublicContact;
  outreach_email_draft: {
    subject: string;
    body_en: string;
    body_ar: string;
  };
  steps: Array<{
    step: number;
    title: string;
    description: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  }>;
  status:
    | "NOT_STARTED"
    | "PORTAL_REGISTERED"
    | "PREQUAL_SUBMITTED"
    | "CONTACTED"
    | "IN_DISCUSSIONS"
    | "AWARDED"
    | "ARCHIVED";
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const subcontractApi = {
  async listMainContractors(): Promise<MainContractorProfile[]> {
    return api.get<MainContractorProfile[]>("/subcontract/contractors");
  },

  async getMainContractor(id: string): Promise<MainContractorProfile> {
    return api.get<MainContractorProfile>(`/subcontract/contractors/${id}`);
  },

  async discoverContractor(opportunityId: string): Promise<{
    contractor: MainContractorProfile;
    packages_generated: number;
    packages: SubcontractPackage[];
  }> {
    return api.post("/subcontract/contractors/discover", {
      opportunity_id: opportunityId,
    });
  },

  async listSubcontractPackages(params?: {
    main_contractor_id?: string;
    category?: string;
    small_contractor_friendly?: boolean;
    is_inferred?: boolean;
    search?: string;
  }): Promise<SubcontractPackage[]> {
    const q = new URLSearchParams();
    if (params?.main_contractor_id) q.set("main_contractor_id", params.main_contractor_id);
    if (params?.category) q.set("category", params.category);
    if (params?.small_contractor_friendly !== undefined) {
      q.set("small_contractor_friendly", String(params.small_contractor_friendly));
    }
    if (params?.is_inferred !== undefined) {
      q.set("is_inferred", String(params.is_inferred));
    }
    if (params?.search) q.set("search", params.search);

    const queryStr = q.toString() ? `?${q.toString()}` : "";
    return api.get<SubcontractPackage[]>(`/subcontract/packages${queryStr}`);
  },

  async getSubcontractPackage(id: string): Promise<SubcontractPackage> {
    return api.get<SubcontractPackage>(`/subcontract/packages/${id}`);
  },

  async getSubcontractMatches(companyId: string = "comp-sa-001"): Promise<SubcontractMatchItem[]> {
    return api.get<SubcontractMatchItem[]>(`/subcontract/matches?company_id=${companyId}`);
  },

  async createActionPlan(
    packageId: string,
    companyId: string = "comp-sa-001"
  ): Promise<SubcontractActionPlan> {
    return api.post<SubcontractActionPlan>(`/subcontract/action-plan/${packageId}`, {
      company_id: companyId,
    });
  },

  async listActionPlans(tenantId: string = "comp-sa-001"): Promise<SubcontractActionPlan[]> {
    return api.get<SubcontractActionPlan[]>(`/subcontract/action-plans?tenant_id=${tenantId}`);
  },

  async updateActionPlanStatus(
    id: string,
    status: string,
    notes?: string,
    stepCompleted?: number
  ): Promise<SubcontractActionPlan> {
    return api.patch<SubcontractActionPlan>(`/subcontract/action-plan/${id}/status`, {
      status,
      notes,
      step_completed: stepCompleted,
    });
  },
};
