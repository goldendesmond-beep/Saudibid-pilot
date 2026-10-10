/**
 * Vendor Registration & Business Development API Client (Stage 9).
 */

import { api } from "./client";

export interface PrequalificationDocument {
  code: string;
  name_en: string;
  name_ar: string;
  category: "STATUTORY" | "TECHNICAL" | "FINANCIAL" | "QUALITY_HSE" | "LOCAL_CONTENT";
  is_mandatory: boolean;
  requirement_level: "REQUIRED_VERIFIED" | "LIKELY_REQUIRED" | "OPTIONAL" | "UNKNOWN";
  status: "READY" | "MISSING" | "EXPIRED" | "PENDING_REVIEW";
  file_url?: string;
  expiry_date?: string;
  is_expired?: boolean;
  issuing_authority?: string;
  notes?: string;
}

export interface VendorRegistrationRecord {
  id: string;
  contractor_id: string;
  contractor_name: string;
  contractor_name_ar: string;
  tenant_id: string;
  commercial_registration?: string;
  location: string;
  official_website: string;
  vendor_portal_url: string;
  portal_type: string;
  portal_status: "PUBLIC" | "REGISTRATION_REQUIRED" | "AUTH_REQUIRED" | "INVITATION_ONLY" | "UNAVAILABLE" | "UNKNOWN";
  registration_status:
    | "NOT_STARTED"
    | "PORTAL_FOUND"
    | "PREPARING"
    | "READY_TO_SUBMIT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "RENEWAL_REQUIRED"
    | "UNKNOWN";
  last_checked: string;
  procurement_contact: {
    email?: string;
    phone?: string;
    department?: string;
    address?: string;
  };
  registration_deadline?: string | null;
  required_documents: PrequalificationDocument[];
  missing_documents: string[];
  evidence_sources: string[];
  confidence_level: "VERIFIED" | "INFERRED" | "UNKNOWN";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BDPipelineItem {
  id: string;
  tenant_id: string;
  project_name: string;
  project_owner: string;
  contractor_id: string;
  contractor_name: string;
  contractor_name_ar: string;
  package_name: string;
  work_category: string;
  stage:
    | "TARGET_IDENTIFIED"
    | "VENDOR_PORTAL_FOUND"
    | "REGISTRATION_IN_PROGRESS"
    | "REGISTERED"
    | "PROCUREMENT_CONTACT_FOUND"
    | "EOI_PREPARED"
    | "EOI_SENT"
    | "FOLLOW_UP"
    | "PREQUALIFICATION"
    | "RFQ_RECEIVED"
    | "BID_SUBMITTED"
    | "WON"
    | "LOST"
    | "ON_HOLD";
  priority: "ACTION_NOW" | "ACTION_THIS_WEEK" | "MONITOR" | "LOW_PRIORITY";
  priority_score: number;
  priority_reasons: string[];
  opportunity_id?: string;
  award_reference?: string;
  package_id?: string;
  estimated_value_sar?: number;
  registration_id?: string;
  portal_url?: string;
  procurement_contact?: {
    email?: string;
    phone?: string;
    department?: string;
  };
  eoi_template_ar?: string;
  eoi_template_en?: string;
  last_activity_date: string;
  next_follow_up_date?: string;
  assigned_to: string;
  notes: string;
  provenance: {
    source_award?: string;
    evidence_level?: string;
    is_inferred?: boolean;
    evidence_source?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OutreachTemplateItem {
  title_en: string;
  title_ar: string;
  subject_en: string;
  subject_ar: string;
  body_en: string;
  body_ar: string;
}

export interface SourceAuditSummary {
  timestamp: string;
  counts: {
    TOTAL_SOURCES: number;
    WORKING_LIVE: number;
    AUTHENTICATED_LIVE: number;
    ASSISTED_IMPORT: number;
    AUTH_REQUIRED: number;
    RUNTIME_ENVIRONMENT_BLOCKED: number;
    BLOCKED: number;
    FIXTURE_ONLY: number;
  };
  comparison_with_previous_state: {
    Stage_7_Status: Record<string, number>;
    Stage_9_Status: Record<string, number>;
    delta_notes: string;
  };
  sources?: Array<{
    source_id: string;
    source_name: string;
    official_domain: string;
    access_method: string;
    http_status: number;
    status: string;
    exact_limitation_reason: string;
    last_attempted_check: string;
  }>;
}

export const vendorApi = {
  getRegistrations: async (tenantId: string = "comp-sa-001"): Promise<VendorRegistrationRecord[]> => {
    return api.get<VendorRegistrationRecord[]>(`/vendor-registrations?tenant_id=${tenantId}`);
  },

  getRegistration: async (contractorId: string, tenantId: string = "comp-sa-001"): Promise<VendorRegistrationRecord> => {
    return api.get<VendorRegistrationRecord>(`/vendor-registrations/${contractorId}?tenant_id=${tenantId}`);
  },

  discoverRegistration: async (contractorId: string, tenantId: string = "comp-sa-001"): Promise<VendorRegistrationRecord> => {
    return api.post<VendorRegistrationRecord>(`/vendor-registrations/${contractorId}/discover`, { tenant_id: tenantId });
  },

  updateRegistrationStatus: async (
    contractorId: string,
    status: string,
    notes?: string,
    reference?: string,
    tenantId: string = "comp-sa-001"
  ): Promise<VendorRegistrationRecord> => {
    return api.patch<VendorRegistrationRecord>(`/vendor-registrations/${contractorId}/status`, {
      status,
      notes,
      reference,
      tenant_id: tenantId,
    });
  },

  getStandardChecklist: async (category?: string): Promise<PrequalificationDocument[]> => {
    const q = category ? `?category=${category}` : "";
    return api.get<PrequalificationDocument[]>(`/vendor-registrations/checklist/standard${q}`);
  },

  getBDPipeline: async (params?: {
    stage?: string;
    priority?: string;
    contractor_id?: string;
    tenant_id?: string;
  }): Promise<BDPipelineItem[]> => {
    const q = new URLSearchParams();
    if (params?.stage) q.append("stage", params.stage);
    if (params?.priority) q.append("priority", params.priority);
    if (params?.contractor_id) q.append("contractor_id", params.contractor_id);
    if (params?.tenant_id) q.append("tenant_id", params.tenant_id);
    return api.get<BDPipelineItem[]>(`/bd/pipeline?${q.toString()}`);
  },

  getBDPipelineItem: async (id: string, tenantId: string = "comp-sa-001"): Promise<BDPipelineItem> => {
    return api.get<BDPipelineItem>(`/bd/pipeline/${id}?tenant_id=${tenantId}`);
  },

  generateFromPackage: async (packageId: string, tenantId: string = "comp-sa-001"): Promise<BDPipelineItem> => {
    return api.post<BDPipelineItem>(`/bd/pipeline/generate-from-package/${packageId}`, { tenant_id: tenantId });
  },

  updateBDPipelineStage: async (
    id: string,
    stage: string,
    notes?: string,
    nextFollowUpDate?: string,
    tenantId: string = "comp-sa-001"
  ): Promise<BDPipelineItem> => {
    return api.patch<BDPipelineItem>(`/bd/pipeline/${id}/stage`, {
      stage,
      notes,
      next_follow_up_date: nextFollowUpDate,
      tenant_id: tenantId,
    });
  },

  getOutreachTemplates: async (params: {
    package_name?: string;
    project_name?: string;
    contractor_name?: string;
  }): Promise<Record<string, OutreachTemplateItem>> => {
    const q = new URLSearchParams();
    if (params.package_name) q.append("package_name", params.package_name);
    if (params.project_name) q.append("project_name", params.project_name);
    if (params.contractor_name) q.append("contractor_name", params.contractor_name);
    return api.get<Record<string, OutreachTemplateItem>>(`/bd/outreach-templates?${q.toString()}`);
  },

  getSourceAuditReport: async (): Promise<SourceAuditSummary> => {
    return api.get<SourceAuditSummary>("/sources/audit-report");
  },
};
