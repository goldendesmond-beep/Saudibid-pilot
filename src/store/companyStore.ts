import { create } from "zustand";
import { persist } from "zustand/middleware";
import { companiesApi } from "../api/companies";
import type { CompanyProfile } from "../api/types";

interface CompanyState {
  companyId: string | null;
  profile: CompanyProfile | null;
  organizations: CompanyProfile[];
  isLoading: boolean;
  setCompany: (profile: CompanyProfile) => void;
  clearCompany: () => void;
  fetchOrganizations: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  fetchCurrentCompany: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companyId: null,
      profile: null,
      organizations: [],
      isLoading: false,

      setCompany: (profile) => {
        set((state) => {
          const exists = state.organizations.some((o) => o.id === profile.id);
          const updatedOrgs = exists
            ? state.organizations.map((o) => (o.id === profile.id ? profile : o))
            : [...state.organizations, profile];
          return { companyId: profile.id, profile, organizations: updatedOrgs };
        });
      },

      clearCompany: () => {
        set({ companyId: null, profile: null });
      },

      fetchOrganizations: async () => {
        try {
          const orgs = await companiesApi.list();
          if (Array.isArray(orgs) && orgs.length > 0) {
            set((state) => {
              const active = state.profile || (state.companyId ? orgs.find((o) => o.id === state.companyId) : orgs[0]);
              return {
                organizations: orgs,
                profile: active || orgs[0],
                companyId: active ? active.id : orgs[0].id,
              };
            });
          }
        } catch {
          // Keep existing state on transient error
        }
      },

      switchOrganization: async (orgId: string) => {
        set({ isLoading: true });
        try {
          const fetched = await companiesApi.get(orgId);
          if (fetched) {
            set({ companyId: fetched.id, profile: fetched, isLoading: false });
            return;
          }
        } catch {
          const found = get().organizations.find((o) => o.id === orgId);
          if (found) {
            set({ companyId: found.id, profile: found, isLoading: false });
            return;
          }
        }
        set({ isLoading: false });
      },

      fetchCurrentCompany: async () => {
        const { companyId, profile } = get();
        set({ isLoading: true });
        try {
          // First fetch organization list to know all available organizations
          const orgs = await companiesApi.list().catch(() => [] as CompanyProfile[]);
          if (Array.isArray(orgs) && orgs.length > 0) {
            const targetId = companyId || profile?.id || orgs[0].id;
            const target = orgs.find((o) => o.id === targetId) || orgs[0];
            set({
              organizations: orgs,
              companyId: target.id,
              profile: target,
              isLoading: false,
            });
            return;
          }
          if (companyId || profile?.id) {
            const fetched = await companiesApi.get(companyId || profile!.id);
            if (fetched) {
              set({ companyId: fetched.id, profile: fetched, organizations: [fetched], isLoading: false });
              return;
            }
          }
        } catch {
          // Retain rehydrated profile
        }
        set({ isLoading: false });
      },
    }),
    {
      name: "bidpilot-company",
    },
  ),
);
