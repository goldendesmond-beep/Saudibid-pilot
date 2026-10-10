import { api } from "./client";
import type { PricingStats, WinRates, TrendSeries, TrendPoint } from "./types";

export interface AnalyticsFilter {
  cpv?: string;
  authority?: string;
  from?: string;
  to?: string;
  interval?: "month" | "quarter" | "year";
}

function buildQuery(filter: AnalyticsFilter): string {
  const params = new URLSearchParams();
  if (filter.cpv) params.set("cpv", filter.cpv);
  if (filter.authority) params.set("authority", filter.authority);
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);
  if (filter.interval) params.set("interval", filter.interval);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export const analyticsApi = {
  pricing: (filter: AnalyticsFilter = {}) =>
    api.get<PricingStats>(`/analytics/pricing${buildQuery(filter)}`),
  winRates: (filter: AnalyticsFilter = {}) =>
    api.get<WinRates>(`/analytics/win-rates${buildQuery(filter)}`),
  trends: (filter: AnalyticsFilter = {}) =>
    api.get<TrendSeries | TrendPoint[]>(`/analytics/trends${buildQuery(filter)}`),
};
