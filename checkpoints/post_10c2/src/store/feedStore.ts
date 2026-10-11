import { create } from "zustand";
import { matchesApi } from "../api/matches";
import { tendersApi } from "../api/tenders";
import type { MatchResult, Tender } from "../api/types";

interface FeedState {
  tenders: Tender[];
  matches: MatchResult[];
  isLoadingTenders: boolean;
  isRunningMatch: boolean;
  error: string | null;
  statusFilter: string;
  cpvFilter: string;
  workCategoryFilter: string;
  regionFilter: string;
  setStatusFilter: (v: string) => void;
  setCpvFilter: (v: string) => void;
  setWorkCategoryFilter: (v: string) => void;
  setRegionFilter: (v: string) => void;
  fetchTenders: () => Promise<void>;
  runMatch: (companyId: string) => Promise<void>;
  fetchMatches: (companyId: string) => Promise<void>;
  getTender: (tenderId: string) => Tender | undefined;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  tenders: [],
  matches: [],
  isLoadingTenders: false,
  isRunningMatch: false,
  error: null,
  statusFilter: "",
  cpvFilter: "",
  workCategoryFilter: "",
  regionFilter: "",
  setStatusFilter: (v) => set({ statusFilter: v }),
  setCpvFilter: (v) => set({ cpvFilter: v }),
  setWorkCategoryFilter: (v) => set({ workCategoryFilter: v }),
  setRegionFilter: (v) => set({ regionFilter: v }),

  fetchTenders: async () => {
    set({ isLoadingTenders: true, error: null });
    try {
      const { statusFilter, cpvFilter, workCategoryFilter, regionFilter } = get();
      const tenders = await tendersApi.list({
        status: statusFilter || undefined,
        cpv: cpvFilter || undefined,
        work_category: workCategoryFilter || undefined,
        region: regionFilter || undefined,
      });
      set({ tenders });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch tenders" });
    } finally {
      set({ isLoadingTenders: false });
    }
  },

  runMatch: async (companyId) => {
    set({ isRunningMatch: true, error: null });
    try {
      const matches = await matchesApi.run(companyId);
      set({ matches });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to run match" });
    } finally {
      set({ isRunningMatch: false });
    }
  },

  fetchMatches: async (companyId) => {
    set({ isRunningMatch: true, error: null });
    try {
      const matches = await matchesApi.list(companyId);
      set({ matches });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to fetch matches" });
    } finally {
      set({ isRunningMatch: false });
    }
  },

  getTender: (tenderId) => get().tenders.find((t) => t.id === tenderId),
}));
