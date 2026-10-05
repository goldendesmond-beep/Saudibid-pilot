import { api } from "./client";

export interface PrioritySourceRecoveryItem {
  source_id: string;
  name: string;
  canonical_domain: string;
  resolved_endpoint?: string | null;
  previous_status: string;
  current_access_mode: string;
  legitimate_access_path: string;
  opportunity_ingestion_works: boolean;
  award_ingestion_works: boolean;
  authentication_required: boolean;
  manual_import_available: boolean;
  exact_unresolved_limitation: string;
}

export interface AssistedImportPayload {
  title: string;
  title_ar?: string;
  entity: string;
  reference_number?: string;
  city?: string;
  region?: string;
  work_category?: string;
  budget_sar?: number | null;
  bid_bond_sar?: number | null;
  closing_date?: string;
  publication_date?: string;
  opportunity_type?: string;
  description?: string;
  original_url?: string;
  file_name?: string;
  notes?: string;
}

export interface AssistedImportResponse {
  success: boolean;
  opportunity: Record<string, unknown>;
  raw_record_id: string;
  provenance: string;
}

export const sourceRecoveryApi = {
  getReport: () => api.get<PrioritySourceRecoveryItem[]>("/sources/recovery/report"),

  importAssisted: (
    sourceId: string,
    importType: string,
    payload: AssistedImportPayload,
  ) =>
    api.post<AssistedImportResponse>("/sources/assisted-import", {
      source_id: sourceId,
      import_type: importType,
      payload,
    }),
};
