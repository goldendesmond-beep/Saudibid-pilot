import { api } from "./client";

export type AwardStatus =
  | "AWARD_PENDING"
  | "AWARDED_VERIFIED"
  | "AWARDED_SINGLE_OFFICIAL_SOURCE"
  | "CANCELLED"
  | "RE_TENDERED"
  | "RESULT_NOT_PUBLIC"
  | "NO_RESULT_FOUND_YET"
  | "CONFLICTING_SOURCES";

export interface AwardWatchModel {
  id: string;
  watch_id: string;
  opportunity_id: string;
  company_id: string;
  saved_list_id?: string | null;
  watch_start_date: string;
  closing_date?: string | null;
  source_ids: string[];
  last_checked_at?: string | null;
  next_check_at?: string | null;
  checks_count: number;
  current_award_status: AwardStatus;
  result_confidence: number;
  evidence_references: string[];
  is_active: boolean;
}

export interface AwardResultModel {
  id: string;
  opportunity_id: string;
  official_tender_number: string;
  project_title: string;
  owner_entity: string;
  winner_legal_name: string;
  winner_normalized_name: string;
  award_date?: string | null;
  contract_value_sar?: number | null;
  contract_duration?: string | null;
  source_url: string;
  source_type: string;
  checked_date: string;
  evidence_text: string;
  verification_confidence: number;
  status: AwardStatus;
  conflicting_details?: Array<{
    source: string;
    winner: string;
    value?: number | null;
    award_date?: string | null;
    reasons?: string[];
  }>;
}

export interface SavedListAwardSummary {
  saved_list_id: string;
  list_name: string;
  total_watched: number;
  counts: {
    AWARDED: number;
    AWARD_PENDING: number;
    RESULT_NOT_PUBLIC: number;
    CANCELLED: number;
    CONFLICTING: number;
  };
  items: Array<{
    opportunity_id: string;
    title: string;
    entity: string;
    reference_number: string;
    award_status: AwardStatus;
    winner: string;
    contract_value_sar?: number | null;
    award_date?: string | null;
    is_public: boolean;
  }>;
}

export interface MainContractorRecordModel {
  id: string;
  contractor_name: string;
  contractor_name_ar?: string;
  awarded_project_id: string;
  awarded_project_title: string;
  owner: string;
  project_location: string;
  contract_value_sar?: number | null;
  award_date?: string | null;
  verified_sources: string[];
  created_at: string;
}

export interface AwardNotificationModel {
  id: string;
  tenant_id: string;
  opportunity_id: string;
  event_type: "AWARD_RESULT_FOUND" | "TENDER_CANCELLED" | "TENDER_REISSUED" | "CONFLICTING_AWARD_RESULT";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const awardsApi = {
  watch: (opportunityId: string, companyId: string = "comp-sa-001", savedListId?: string) =>
    api.post<AwardWatchModel>("/awards/watch", {
      opportunity_id: opportunityId,
      company_id: companyId,
      saved_list_id: savedListId,
    }),

  listWatches: (params?: { company_id?: string; opportunity_id?: string; saved_list_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.company_id) q.set("company_id", params.company_id);
    if (params?.opportunity_id) q.set("opportunity_id", params.opportunity_id);
    if (params?.saved_list_id) q.set("saved_list_id", params.saved_list_id);
    const qs = q.toString();
    return api.get<AwardWatchModel[]>(`/awards/watches${qs ? `?${qs}` : ""}`);
  },

  deleteWatch: (watchId: string) => api.delete<{ success: boolean; deleted_id: string }>(`/awards/watches/${watchId}`),

  getResult: (opportunityId: string) => api.get<AwardResultModel>(`/awards/results/${opportunityId}`),

  recordResult: (data: Partial<AwardResultModel>) => api.post<AwardResultModel>("/awards/results", data),

  listResults: (status?: string) => api.get<AwardResultModel[]>(`/awards/results${status ? `?status=${status}` : ""}`),

  getSavedListAwardSummary: (listId: string) =>
    api.get<SavedListAwardSummary>(`/saved-lists/${listId}/award-summary`),

  listMainContractors: () => api.get<MainContractorRecordModel[]>("/main-contractors"),

  listNotifications: (tenantId: string = "comp-sa-001") =>
    api.get<AwardNotificationModel[]>(`/notifications?tenant_id=${tenantId}`),

  markNotificationRead: (notifId: string) =>
    api.post<{ success: boolean; notification_id: string }>(`/notifications/${notifId}/read`),

  triggerCheckRun: () => api.post<{ checks_attempted: number; successful_updates: number }>("/awards/check-run"),
};
