import { create } from "zustand";
import { draftsApi } from "../api/drafts";
import type { BidDraft, Tender, TraceStep } from "../api/types";

interface DraftState {
  selectedTender: Tender | null;
  draft: BidDraft | null;
  trace: TraceStep[];
  isDrafting: boolean;
  draftError: string | null;
  setSelectedTender: (tender: Tender | null) => void;
  runDraft: (companyId: string, tenderId: string) => Promise<void>;
  fetchDraft: (id: string) => Promise<void>;
}

export const useDraftStore = create<DraftState>((set) => ({
  selectedTender: null,
  draft: null,
  trace: [],
  isDrafting: false,
  draftError: null,

  setSelectedTender: (selectedTender) =>
    set({ selectedTender, draft: null, trace: [], draftError: null }),

  runDraft: async (companyId, tenderId) => {
    set({ isDrafting: true, draftError: null });
    try {
      const draft = await draftsApi.run(companyId, tenderId);
      const trace = await draftsApi.getTrace(draft.id).catch(() => []);
      set({ draft, trace, isDrafting: false });
    } catch (e) {
      set({
        draftError: e instanceof Error ? e.message : "Draft generation failed",
        isDrafting: false,
      });
    }
  },

  fetchDraft: async (id) => {
    try {
      const draft = await draftsApi.get(id);
      const trace = await draftsApi.getTrace(id).catch(() => []);
      set({ draft, trace });
    } catch {
      // ignore
    }
  },
}));
