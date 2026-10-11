import { create } from "zustand";
import { analyticsApi, type AnalyticsFilter } from "../api/analytics";
import type { PricingStats, WinRates, TrendPoint } from "../api/types";

interface AnalyticsState {
  cpv: string;
  authority: string;
  from: string;
  to: string;
  interval: "month" | "quarter" | "year";
  pricing: PricingStats | null;
  winRates: WinRates | null;
  trends: TrendPoint[];
  isLoading: boolean;
  error: string | null;
  setFilter: (key: keyof AnalyticsFilter, value: string) => void;
  fetchAll: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  cpv: "",
  authority: "",
  from: "",
  to: "",
  interval: "month",
  pricing: null,
  winRates: null,
  trends: [],
  isLoading: false,
  error: null,

  setFilter: (key, value) => {
    set({ [key]: value } as unknown as Partial<AnalyticsState>);
  },

  fetchAll: async () => {
    const { cpv, authority, from, to, interval } = get();
    const filter: AnalyticsFilter = {
      cpv: cpv || undefined,
      authority: authority || undefined,
      from: from || undefined,
      to: to || undefined,
      interval,
    };

    set({ isLoading: true, error: null });
    try {
      const [pricing, winRatesRes, trendsRes] = await Promise.all([
        analyticsApi.pricing(filter),
        analyticsApi.winRates(filter),
        analyticsApi.trends(filter),
      ]);

      const normalizedWinRates: WinRates = Array.isArray(winRatesRes)
        ? { total_awards: winRatesRes.length, suppliers: winRatesRes }
        : winRatesRes || { suppliers: [] };

      const rawPoints: TrendPoint[] = Array.isArray(trendsRes)
        ? (trendsRes as TrendPoint[])
        : (trendsRes && typeof trendsRes === "object" && "points" in trendsRes && Array.isArray((trendsRes as { points: TrendPoint[] }).points)
            ? (trendsRes as { points: TrendPoint[] }).points
            : []);

      const normalizedTrends: TrendPoint[] = rawPoints.map((p) => ({
        ...p,
        award_count: p.award_count ?? p.count,
        total_amount: p.total_amount ?? p.total_value,
      }));

      set({
        pricing,
        winRates: normalizedWinRates,
        trends: normalizedTrends,
        isLoading: false,
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load analytics data",
        isLoading: false,
      });
    }
  },
}));
