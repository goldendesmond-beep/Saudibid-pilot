import { api } from "./client";
import type { SourceNavigationRecord } from "../services/sourceNavigationService";

export interface SaudiSourceData {
  id: string;
  name: string;
  name_ar: string;
  authority_type: string;
  url: string;
  health_status: "HEALTHY" | "DEGRADED" | "UNREACHABLE" | "MAINTENANCE";
  is_active: boolean;
  requires_auth: boolean;
  auth_type: string;
  verification_level: string;
  rate_limit_per_minute: number;
  last_health_check?: string;
  last_successful_sync?: string;
  last_error_message?: string | null;
  failure_count: number;
  consecutive_failures: number;
  supported_opportunity_types: string[];
  coverage_regions: string[];
  metadata?: Record<string, unknown>;
}

export interface SourceAuditSummaryCounts {
  TOTAL_SOURCES: number;
  WORKING_LIVE: number;
  AUTHENTICATED_LIVE: number;
  ASSISTED_IMPORT: number;
  AUTH_REQUIRED: number;
  RUNTIME_ENVIRONMENT_BLOCKED: number;
  BLOCKED: number;
  FIXTURE_ONLY: number;
  UNAVAILABLE?: number;
  UNKNOWN?: number;
}

export interface DetailedSourceAuditItem {
  source_id: string;
  source_name: string;
  source_name_ar?: string;
  official_domain: string;
  resolved_endpoint?: string | null;
  access_method: string;
  status: string;
  requires_auth: boolean;
  authentication_requirement?: string;
  real_records_count: number;
  response_time_ms?: number;
  http_status_code?: number | null;
  exact_limitation_reason: string;
  failure_reason?: string | null;
  last_audited: string;
  last_attempt?: string;
  last_successful_live_fetch?: string | null;
  fallback?: string;
  legitimate_fallback?: string;
  provenance?: string;
  provenance_status?: string;
  confidence?: string;
  notes?: string;
  pipeline?: {
    fetch: string;
    normalization: string;
    validation: string;
    deduplication: string;
    provenance: string;
    storage: string;
    opportunity_output: string;
  };
}

export interface SourceAuditReportResponse {
  timestamp: string;
  audit_summary?: SourceAuditSummaryCounts;
  counts?: SourceAuditSummaryCounts;
  comparison_with_previous_state?: Record<string, unknown>;
  sources: DetailedSourceAuditItem[];
}

export const sourcesApi = {
  list: (params?: { authority_type?: string; is_active?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.authority_type) q.set("authority_type", params.authority_type);
    if (params?.is_active !== undefined) q.set("is_active", String(params.is_active));
    const qs = q.toString();
    return api.get<SaudiSourceData[]>(`/sources${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => api.get<SaudiSourceData>(`/sources/${id}`),
  probe: (id: string, simulateFailure = false) =>
    api.post<{ status: string; health_status: string; isolated: boolean }>(
      `/sources/${id}/probe?simulate_failure=${simulateFailure}`,
    ),
  register: (source: Partial<SaudiSourceData> & { name: string; url: string }) =>
    api.post<SaudiSourceData>("/sources/register", source),
  getAuditReport: () => api.get<SourceAuditReportResponse>("/sources/audit-report"),
  getNavigationList: () =>
    api.get<{ timestamp: string; total_sources: number; sources: SourceNavigationRecord[] }>("/sources/navigation"),
  getNavigation: (id: string) => api.get<SourceNavigationRecord>(`/sources/navigation/${id}`),
};
