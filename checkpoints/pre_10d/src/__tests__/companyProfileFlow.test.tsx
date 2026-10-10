import { describe, expect, it, beforeEach } from "vitest";
import { useCompanyStore } from "../store/companyStore";
import { useLocaleStore } from "../store/localeStore";
import type { CompanyProfile } from "../api/types";

describe("Saudi Contractor Profile & i18n Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    useCompanyStore.getState().clearCompany();
    useLocaleStore.getState().setLocale("en");
  });

  it("creates, updates, and persists a Saudi contractor profile", () => {
    const contractor: CompanyProfile = {
      id: "contractor-riyadh-01",
      name: "Al-Yamama Infrastructure Co.",
      name_ar: "شركة اليمامة للبنية التحتية",
      cr_number: "1010998877",
      company_size: "Large",
      saudi_regions: ["Riyadh Region", "Eastern Province"],
      saudi_cities: ["Riyadh", "Dammam"],
      main_activities: ["Roads, Bridges & Civil Infrastructure"],
      secondary_activities: ["Electromechanical (MEP) Works"],
      contractor_classification: "Roads",
      classification_grade: 1,
      experience_years: 20,
      manpower_count: 500,
      equipment_tags: ["Heavy Excavators", "Asphalt Pavers & Rollers"],
      comfortable_project_size: "Over 100M SAR",
      preferred_project_value_sar: 120000000,
      guarantee_capability_sar: 60000000,
      certifications: ["SCA_MUQAWIL", "ARAMCO_APPROVED"],
      direct_tender_interest: true,
      subcontracting_interest: true,
      vendor_registration_interest: true,
      excluded_project_types: ["Residential villas"],

      annual_turnover: 200000000,
      cpv_codes: ["45233000"],
      regions: ["EL30"],
      capacity_tags: ["roads", "infrastructure"],
      exclusion_flags: [],
    };

    // 1. Create / Set company in store
    useCompanyStore.getState().setCompany(contractor);

    // 2. Read from state
    const current = useCompanyStore.getState().profile;
    expect(current).not.toBeNull();
    expect(current?.name).toBe("Al-Yamama Infrastructure Co.");
    expect(current?.name_ar).toBe("شركة اليمامة للبنية التحتية");
    expect(current?.company_size).toBe("Large");
    expect(current?.classification_grade).toBe(1);

    // 3. Verify persistence to localStorage
    const saved = localStorage.getItem("bidpilot-company");
    expect(saved).not.toBeNull();
    expect(saved).toContain("contractor-riyadh-01");
    expect(saved).toContain("Al-Yamama Infrastructure Co.");
  });

  it("handles Arabic and English switching with dynamic RTL and LTR direction", () => {
    const localeStore = useLocaleStore.getState();

    // Start English (LTR)
    localeStore.setLocale("en");
    expect(useLocaleStore.getState().locale).toBe("en");
    expect(useLocaleStore.getState().direction).toBe("ltr");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
    expect(useLocaleStore.getState().t("navFeed")).toBe("Opportunities Feed");

    // Toggle to Arabic (RTL)
    localeStore.toggleLocale();
    expect(useLocaleStore.getState().locale).toBe("ar");
    expect(useLocaleStore.getState().direction).toBe("rtl");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(useLocaleStore.getState().t("navFeed")).toBe("موجز الفرص والمنافسات");

    // Toggle back to English (LTR)
    localeStore.toggleLocale();
    expect(useLocaleStore.getState().locale).toBe("en");
    expect(useLocaleStore.getState().direction).toBe("ltr");
    expect(document.documentElement.dir).toBe("ltr");
  });
});
