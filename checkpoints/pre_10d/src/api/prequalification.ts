/**
 * Prequalification Dossier & Company Document Vault API Client (Stage 10).
 */

import { api } from "./client";

export interface CompanyVaultItem {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  category: "STATUTORY" | "TECHNICAL" | "FINANCIAL" | "QUALITY_HSE" | "LOCAL_CONTENT";
  tenant_id: string;
  filename: string;
  file_url?: string;
  version: string;
  issue_date?: string;
  expiry_date?: string | null;
  issuing_authority?: string;
  issuing_authority_ar?: string;
  document_status: "VALID" | "EXPIRING_SOON" | "EXPIRED" | "MISSING" | "UNKNOWN";
  verification_status: "VERIFIED" | "INFERRED" | "UNKNOWN";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VaultSummary {
  total_documents: number;
  valid_count: number;
  expiring_soon_count: number;
  expired_count: number;
  missing_count: number;
  alerts: Array<{
    code: string;
    name_en: string;
    name_ar: string;
    status: string;
    expiry_date?: string;
    message: string;
  }>;
  last_audited: string;
}

export interface DossierProfile {
  profile_key: string;
  profile_name_en: string;
  profile_name_ar: string;
  contractor_id: string;
  contractor_name: string;
  contractor_name_ar: string;
  required_count: number;
  notes: string;
}

export interface DossierSection {
  index: string;
  name_en: string;
  name_ar: string;
  folder_name: string;
  documents: CompanyVaultItem[];
  missing_documents: CompanyVaultItem[];
  expired_documents: CompanyVaultItem[];
  total_items: number;
}

export interface PrequalificationDossierRecord {
  id: string;
  contractor_id: string;
  contractor_name: string;
  contractor_name_ar: string;
  profile_type: string;
  tenant_id: string;
  status: "DRAFT" | "READY_FOR_EXPORT" | "SUBMITTED" | "ARCHIVED";
  readiness_percentage: number;
  readiness_breakdown: {
    ready_count: number;
    missing_count: number;
    expired_count: number;
    total_required: number;
    unresolved_mandatory_reasons?: string[];
  };
  sections: DossierSection[];
  documents: CompanyVaultItem[];
  missing_documents: CompanyVaultItem[];
  expired_documents: CompanyVaultItem[];
  package_manifest: {
    dossier_id: string;
    generated_at: string;
    target_contractor: string;
    target_contractor_ar: string;
    profile_type: string;
    package_structure: string[];
    total_documents_included: number;
    total_documents_missing: number;
    total_documents_expired: number;
    readiness_percentage: number;
    can_export_zip: boolean;
    unresolved_mandatory_reasons: string[];
    submission_cover_sheet: {
      contractor_legal_name: string;
      contractor_legal_name_ar: string;
      cr_number: string;
      national_address: string;
      contact_person: string;
      contact_email: string;
      contact_phone: string;
      transmittal_date: string;
      intended_client: string;
      intended_scope: string;
    };
  };
  notes: string;
  created_at: string;
  updated_at: string;
}

export const prequalApi = {
  getVaultDocuments: async (category?: string): Promise<CompanyVaultItem[]> => {
    const q = category && category !== "ALL" ? `?category=${category}` : "";
    return api.get<CompanyVaultItem[]>(`/vault/documents${q}`);
  },

  getVaultSummary: async (): Promise<VaultSummary> => {
    return api.get<VaultSummary>("/vault/summary");
  },

  updateVaultDocument: async (
    docId: string,
    payload: {
      filename?: string;
      expiry_date?: string;
      version?: string;
      notes?: string;
    }
  ): Promise<CompanyVaultItem> => {
    return api.patch<CompanyVaultItem>(`/vault/documents/${docId}`, payload);
  },

  getProfiles: async (): Promise<DossierProfile[]> => {
    return api.get<DossierProfile[]>("/dossiers/profiles");
  },

  assembleDossier: async (params: {
    profile_key: string;
    opportunity_id?: string;
    subcontract_package_id?: string;
    registration_id?: string;
    notes?: string;
  }): Promise<PrequalificationDossierRecord> => {
    return api.post<PrequalificationDossierRecord>("/dossiers/assemble", params);
  },
};
