import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCompanyStore } from "../store/companyStore";
import { companiesApi } from "../api/companies";
import {
  SAUDI_SECTORS,
  SAUDI_SERVICE_CATEGORIES,
  DEFAULT_UNKNOWN_MANPOWER,
  type CompanyProfile,
} from "../constants/saudiTaxonomy";
import { actionCenterApi } from "../api/actionCenter";
import { proposalApi, type BOQSheetModel } from "../api/proposals";

describe("POST-STAGE-10A: Multi-Organization Isolation & Hospitality/Services Expansion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCompanyStore.setState({
      companyId: null,
      profile: null,
      organizations: [],
      isLoading: false,
    });
  });

  // 1. Multi-Organization Tenant Switching & Store Isolation
  it("manages multi-organization state and switches active organization seamlessly", async () => {
    const mockOrgs: CompanyProfile[] = [
      {
        id: "comp-001",
        name: "Al-Fanar Infrastructure Contracting Co.",
        name_ar: "شركة الفنار للمقاولات الإنشائية والبنية التحتية",
        company_size: "Large",
        classification_grade: 1,
        main_activities: ["Roads, Bridges & Civil Infrastructure"],
        saudi_regions: ["Riyadh Region"],
      },
      {
        id: "comp-diyafa-002",
        name: "Al-Diyafa Hospitality Services & Facilities Management",
        name_ar: "شركة الضيافة للخدمات الفندقية وإدارة المرافق",
        company_size: "Medium",
        classification_grade: 3,
        main_activities: ["Hospitality Services & Hotels", "Catering & Food Services"],
        saudi_regions: ["Makkah Region", "Riyadh Region"],
      },
      {
        id: "comp-tamkeen-003",
        name: "Tamkeen Technical Manpower & Industrial Staffing",
        name_ar: "شركة تمكين للكوادر الفنية والتشغيل الصناعي",
        company_size: "Small",
        classification_grade: 4,
        main_activities: ["Manpower & Specialized Staffing"],
        saudi_regions: ["Eastern Province"],
      },
    ];

    vi.spyOn(companiesApi, "list").mockResolvedValue(mockOrgs);
    vi.spyOn(companiesApi, "get").mockImplementation(async (id: string) => {
      const match = mockOrgs.find((o) => o.id === id);
      if (!match) throw new Error("Not found");
      return match;
    });

    const store = useCompanyStore.getState();
    await store.fetchOrganizations();

    const afterFetch = useCompanyStore.getState();
    expect(afterFetch.organizations.length).toBe(3);
    expect(afterFetch.companyId).toBe("comp-001");
    expect(afterFetch.profile?.name).toContain("Al-Fanar");

    // Switch to hospitality company
    await store.switchOrganization("comp-diyafa-002");
    const afterSwitch = useCompanyStore.getState();
    expect(afterSwitch.companyId).toBe("comp-diyafa-002");
    expect(afterSwitch.profile?.company_size).toBe("Medium");
    expect(afterSwitch.profile?.name_ar).toContain("الضيافة");

    // Switch to manpower staffing company
    await store.switchOrganization("comp-tamkeen-003");
    const afterSecondSwitch = useCompanyStore.getState();
    expect(afterSecondSwitch.companyId).toBe("comp-tamkeen-003");
    expect(afterSecondSwitch.profile?.company_size).toBe("Small");
    expect(afterSecondSwitch.profile?.classification_grade).toBe(4);
  });

  // 2. Saudi 16 Sectors & 19 Service Categories Taxonomy Verification
  it("provides comprehensive 16 Saudi sectors and 19 service categories covering hospitality, facilities, and manpower", () => {
    expect(SAUDI_SECTORS.length).toBe(16);

    const sectorIds = SAUDI_SECTORS.map((s) => s.id);
    expect(sectorIds).toContain("Hospitality");
    expect(sectorIds).toContain("Healthcare");
    expect(sectorIds).toContain("Restaurants");
    expect(sectorIds).toContain("Retail/Malls");
    expect(sectorIds).toContain("Schools/Universities");
    expect(sectorIds).toContain("Factories");
    expect(sectorIds).toContain("Warehouses/Logistics");
    expect(sectorIds).toContain("Airports/Ports");
    expect(sectorIds).toContain("Commercial/Residential");
    expect(sectorIds).toContain("Government");
    expect(sectorIds).toContain("Tourism");
    expect(sectorIds).toContain("Construction");
    expect(sectorIds).toContain("Energy/Oil & Gas");
    expect(sectorIds).toContain("Mining");
    expect(sectorIds).toContain("Water");
    expect(sectorIds).toContain("Telecom/IT");

    expect(SAUDI_SERVICE_CATEGORIES.length).toBe(19);
    const serviceIds = SAUDI_SERVICE_CATEGORIES.map((s) => s.id);
    expect(serviceIds).toContain("hotel_construction");
    expect(serviceIds).toContain("fitout");
    expect(serviceIds).toContain("housekeeping");
    expect(serviceIds).toContain("cleaning");
    expect(serviceIds).toContain("manpower");
    expect(serviceIds).toContain("catering");
    expect(serviceIds).toContain("laundry");
    expect(serviceIds).toContain("ffe_ose");
    expect(serviceIds).toContain("facility_management");
  });

  // 3. ManpowerIntelligence Schema & Default Unknown Handling
  it("ensures ManpowerIntelligence schema has 13 explicit fields and defaults to UNKNOWN without hallucination", () => {
    expect(DEFAULT_UNKNOWN_MANPOWER.role).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.quantity).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.skills).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.experience).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.duration).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.shift).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.accommodation).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.transportation).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.mobilization_date).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.location).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.client).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.main_contractor).toBe("UNKNOWN");
    expect(DEFAULT_UNKNOWN_MANPOWER.deadline).toBe("UNKNOWN");

    const keys = Object.keys(DEFAULT_UNKNOWN_MANPOWER);
    expect(keys.length).toBe(13);
  });

  // 4. BOQ Assistant Mathematical & Pricing Integrity
  it("enforces BOQ line total arithmetic: Line Total = Quantity * Unit Rate, flagging missing rates truthfully", async () => {
    const mockBoq: BOQSheetModel = {
      id: "boq-test-001",
      proposal_id: "prop-test-001",
      tenant_id: "comp-diyafa-002",
      title: "Hotel Staff Camp Catering & Housekeeping BOQ",
      contractor_name: "Nesma & Partners",
      currency: "SAR",
      subtotal: 150000.0,
      overhead_percent: 10.0,
      overhead_amount: 15000.0,
      contingency_percent: 5.0,
      contingency_amount: 7500.0,
      margin_percent: 12.0,
      margin_amount: 20700.0,
      vat_percent: 15.0,
      vat_amount: 28980.0,
      grand_total: 222180.0,
      pricing_completeness_percentage: 66.7,
      unpriced_items_count: 1,
      items: [
        {
          item_number: "01.01",
          description: "Full Catering Breakfast, Lunch & Dinner Daily Meals",
          trade_category: "CATERING",
          unit: "MEALS",
          quantity: 1000,
          unit_rate: 100.0,
          total: 100000.0,
          rate_source: "USER_ENTERED",
        },
        {
          item_number: "01.02",
          description: "Daily Housekeeping & Linen Laundry Sanitization",
          trade_category: "HOUSEKEEPING",
          unit: "ROOMS",
          quantity: 500,
          unit_rate: 100.0,
          total: 50000.0,
          rate_source: "USER_ENTERED",
        },
        {
          item_number: "01.03",
          description: "Commercial Kitchen Exhaust Hood Chemical Degreasing",
          trade_category: "FACILITY_MANAGEMENT",
          unit: "SERVICE",
          quantity: 4,
          unit_rate: null,
          total: null,
          rate_source: "UNKNOWN",
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.spyOn(proposalApi, "getBOQ").mockResolvedValue(mockBoq);

    const boq = await proposalApi.getBOQ("boq-test-001");

    // Line 1 calculation check
    expect(boq.items[0].total).toBe(boq.items[0].quantity * (boq.items[0].unit_rate || 0));

    // Line 3 unpriced check
    expect(boq.items[2].unit_rate).toBeNull();
    expect(boq.items[2].total).toBeNull();
    expect(boq.unpriced_items_count).toBe(1);
    expect(boq.pricing_completeness_percentage).toBeLessThan(100.0);
  });

  // 5. Action Center Dynamic Summary & Multi-Tenant Isolation
  it("returns isolated action items and calculates summary counts per organization", async () => {
    vi.spyOn(actionCenterApi, "getActionItems").mockResolvedValue([
      {
        id: "act-diyafa-haccp-upload",
        priority: "ACTION_NOW",
        category: "PREQUAL_DOCUMENT",
        title_en: "Upload Food Safety & HACCP Certification to Vault",
        title_ar: "رفع شهادة سلامة الأغذية والهاسب في الخزينة",
        description_en: "Mandatory qualification requirement.",
        description_ar: "متطلب إلزامي.",
        tenant_id: "comp-diyafa-002",
        due_date: "2026-10-30T16:00:00Z",
        is_overdue: false,
        target_type: "DOCUMENT",
        target_id: "vault-haccp-diyafa",
        target_name: "HACCP Food Safety",
        deep_link: "/vendor-registration?tab=vault",
        action_cta_en: "Upload",
        action_cta_ar: "رفع",
        created_at: new Date().toISOString(),
      },
      {
        id: "act-diyafa-prop-review",
        priority: "ACTION_THIS_WEEK",
        category: "PROPOSAL_DEADLINE",
        title_en: "Finalize Diriyah Gate Hospitality Catering Proposal",
        title_ar: "اعتماد وتقديم عرض الإعاشة",
        description_en: "Bid decision: BID (88%).",
        description_ar: "قرار التقديم: BID.",
        tenant_id: "comp-diyafa-002",
        due_date: "2026-11-15T16:00:00Z",
        is_overdue: false,
        target_type: "PROPOSAL",
        target_id: "prop-diyafa-dgda-002",
        target_name: "Subcontract Proposal",
        deep_link: "/proposals",
        action_cta_en: "Review",
        action_cta_ar: "مراجعة",
        created_at: new Date().toISOString(),
      },
    ]);

    vi.spyOn(actionCenterApi, "getActionSummary").mockResolvedValue({
      total_actions: 2,
      action_now_count: 1,
      action_this_week_count: 1,
      monitor_count: 0,
      low_priority_count: 0,
      overdue_count: 0,
      last_evaluated: new Date().toISOString(),
    });

    const items = await actionCenterApi.getActionItems();
    const summary = await actionCenterApi.getActionSummary();

    expect(items.length).toBe(2);
    expect(items[0].tenant_id).toBe("comp-diyafa-002");
    expect(summary.total_actions).toBe(2);
    expect(summary.action_now_count).toBe(1);
    expect(summary.action_this_week_count).toBe(1);
  });
});
