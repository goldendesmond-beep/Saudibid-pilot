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
      const [pricing, winRates, trends] = await Promise.all([
        analyticsApi.pricing(filter),
        analyticsApi.winRates(filter),
        analyticsApi.trends(filter),
      ]);
      set({ pricing, winRates, trends, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load analytics data",
        isLoading: false,
      });
    }
  },
}));
