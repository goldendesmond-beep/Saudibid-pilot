import { create } from "zustand";
import { persist } from "zustand/middleware";
import { companiesApi } from "../api/companies";
import type { CompanyProfile } from "../api/types";

interface CompanyState {
  companyId: string | null;
  profile: CompanyProfile | null;
  isLoading: boolean;
  setCompany: (profile: CompanyProfile) => void;
  clearCompany: () => void;
  fetchCurrentCompany: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companyId: null,
      profile: null,
      isLoading: false,

      setCompany: (profile) => {
        set({ companyId: profile.id, profile });
      },

      clearCompany: () => {
        set({ companyId: null, profile: null });
      },

      fetchCurrentCompany: async () => {
        const { companyId, profile } = get();
        const targetId = companyId || profile?.id || "comp-001";
        set({ isLoading: true });
        try {
          const fetched = await companiesApi.get(targetId);
          if (fetched) {
            set({ companyId: fetched.id, profile: fetched, isLoading: false });
            return;
          }
        } catch {
          // In case of transient network failure, retain rehydrated profile
        }
        set({ isLoading: false });
      },
    }),
    {
      name: "bidpilot-company",
    },
  ),
);
