import { api } from "./client";

export interface MonitoringSourceDetail {
  source_id: string;
  name: string;
  status: "VERIFIED_LIVE" | "AUTH_REQUIRED" | "BLOCKED" | "FIXTURE_ONLY" | "DISCOVERY_REQUIRED" | "TEMPORARILY_UNAVAILABLE" | "FAILURE";
  limitation?: string;
  records_ingested: number;
  is_live: boolean;
}

export interface MonitoringRunResult {
  id: string;
  timestamp: string;
  sources_attempted: number;
  sources_successful: number;
  sources_blocked: number;
  sources_auth_required: number;
  source_failures: number;
  raw_records_found: number;
  canonical_opportunities_created: number;
  duplicates_merged: number;
  new_records: number;
  updated_records: number;
  unchanged_records: number;
  expired_records: number;
  seed_fixture_excluded: number;
  errors: string[];
  confirmed_opportunities: number;
  possible_opportunities: number;
  market_signals: number;
  high_match_opportunities: number;
  source_details: MonitoringSourceDetail[];
  is_fixture_run: boolean;
}

export interface DailySnapshotItem {
  id: string;
  snapshot_date: string;
  created_at: string;
  records_discovered: number;
  canonical_opportunities_count: number;
  strong_match_count: number;
  good_match_count: number;
  review_required_count: number;
  closing_within_7_days_count: number;
  government_count: number;
  private_count: number;
  eastern_region_count: number;
  jubail_count: number;
  subcontract_targets_count: number;
  opportunities_snapshot: Record<string, unknown>[];
  sources_summary: {
    attempted: number;
    successful: number;
    blocked: number;
    auth_required: number;
  };
}

export const monitoringApi = {
  runDailyMonitoring: (allowTestFixtures: boolean = false, companyId?: string) => {
    const params = new URLSearchParams();
    if (allowTestFixtures) params.append("allow_test_fixtures", "true");
    if (companyId) params.append("company_id", companyId);
    return api.post<MonitoringRunResult>(`/monitoring/run?${params.toString()}`);
  },
  listRuns: () => api.get<MonitoringRunResult[]>("/monitoring/runs"),
  listSnapshots: () => api.get<DailySnapshotItem[]>("/monitoring/snapshots"),
  getSnapshot: (id: string) => api.get<DailySnapshotItem>(`/monitoring/snapshots/${id}`),
};
