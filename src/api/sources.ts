import { api } from "./client";

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
};
