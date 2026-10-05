import { describe, expect, it } from "vitest";
import {
  computeEligibility,
  computeMatch,
  computePricingStats,
  computeWinRates,
  computeTrends,
  generateBidDraft,
  type AwardRecord,
} from "../engine/procurement";
import type { CompanyProfile, Tender } from "../api/types";

describe("Tender Intelligence Saudi Procurement Engine", () => {
  const sampleSaudiContractor: CompanyProfile = {
    id: "comp-001",
    name: "Al-Fanar Infrastructure & Contracting Co.",
    name_ar: "شركة الفنار للمقاولات والبنية التحتية",
    cr_number: "1010234567",
    company_size: "Medium",
    saudi_regions: ["Riyadh Region", "Eastern Province"],
    saudi_cities: ["Riyadh", "Dammam", "Khobar"],
    main_activities: ["Roads, Bridges & Civil Infrastructure", "Building Construction"],
    secondary_activities: ["Electromechanical (MEP) Works"],
    contractor_classification: "Roads & Buildings",
    classification_grade: 2,
    experience_years: 14,
    manpower_count: 180,
    equipment_tags: ["Heavy Excavators", "Asphalt Pavers & Rollers", "Mobile & Tower Cranes"],
    comfortable_project_size: "20M - 100M SAR",
    preferred_project_value_sar: 45000000,
    guarantee_capability_sar: 25000000,
    certifications: ["SCA_MUQAWIL", "ARAMCO_APPROVED", "ISO_9001", "ZATCA_CLEARANCE"],
    direct_tender_interest: true,
    subcontracting_interest: true,
    vendor_registration_interest: true,
    excluded_project_types: ["Residential villas"],

    // Backwards compatibility
    cpv_codes: ["45000000", "45233000"],
    regions: ["EL30", "EL41"],
    annual_turnover: 50000000,
    capacity_tags: ["civil engineering", "infrastructure", "roads"],
    exclusion_flags: [],
  };

  const sampleTender: Tender = {
    id: "etimad-2026-094",
    source: "Etimad",
    title: "Expansion and Asphalting of Northern Ring Arterial Roads in Riyadh",
    title_ar: "مشروع توسعة وسفلتة الطرق الشريانية للدائري الشمالي بمدينة الرياض",
    work_category: "Roads, Bridges & Civil Infrastructure",
    city: "Riyadh",
    region: "Riyadh Region",
    entity: "Riyadh Municipality",
    budget_sar: 35000000,
    budget: 35000000,
    bid_bond_sar: 700000,
    cpv_codes: ["45233000", "45000000"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    nuts: ["EL30"],
    description: "Civil engineering, asphalt paving, road construction and stormwater networks.",
    raw_doc_uri: "https://monafasat.etimad.sa/tenders/tender-094",
    exclusion_flags: [],
    status: "open",
  };

  const sampleAwards: AwardRecord[] = [
    {
      id: "awd-1",
      source: "DIAVGEIA",
      cpv_codes: ["45233000"],
      contracting_authority: "Ministry of Transport",
      supplier_name: "Al-Fanar Infrastructure & Contracting Co.",
      supplier_vat: "300123456700003",
      award_value: 20000000,
      currency: "SAR",
      award_date: "2026-01-15T00:00:00Z",
      nuts: ["EL30"],
      tender_ref: "T-1",
      raw_doc_uri: null,
    },
    {
      id: "awd-2",
      source: "KIMDIS",
      cpv_codes: ["45233000"],
      contracting_authority: "Ministry of Transport",
      supplier_name: "Al-Fanar Infrastructure & Contracting Co.",
      supplier_vat: "300123456700003",
      award_value: 30000000,
      currency: "SAR",
      award_date: "2026-02-15T00:00:00Z",
      nuts: ["EL30"],
      tender_ref: "T-2",
      raw_doc_uri: null,
    },
    {
      id: "awd-3",
      source: "DIAVGEIA",
      cpv_codes: ["45000000"],
      contracting_authority: "Riyadh Municipality",
      supplier_name: "Al-Bawani Contracting",
      supplier_vat: "300987654300003",
      award_value: 10000000,
      currency: "SAR",
      award_date: "2026-03-20T00:00:00Z",
      nuts: ["EL30"],
      tender_ref: "T-3",
      raw_doc_uri: null,
    },
  ];

  it("checks eligibility passed when all criteria match", () => {
    const result = computeEligibility(sampleSaudiContractor, sampleTender);
    expect(result.passed).toBe(true);
    expect(result.failed_criteria.length).toBe(0);
  });

  it("fails eligibility when turnover/capacity is below budget requirement", () => {
    const poorContractor = {
      ...sampleSaudiContractor,
      annual_turnover: 1000000,
      preferred_project_value_sar: 1000000,
    };
    const result = computeEligibility(poorContractor, sampleTender);
    expect(result.passed).toBe(false);
    expect(result.failed_criteria.some((c) => c.includes("turnover"))).toBe(true);
  });

  it("fails eligibility when exclusion flags overlap", () => {
    const flaggedContractor = { ...sampleSaudiContractor, exclusion_flags: ["ARTICLE_57_GTPL"] };
    const flaggedTender = { ...sampleTender, exclusion_flags: ["ARTICLE_57_GTPL"] };
    const result = computeEligibility(flaggedContractor, flaggedTender);
    expect(result.passed).toBe(false);
    expect(result.failed_criteria.some((c) => c.includes("exclusion flag overlap"))).toBe(true);
  });

  it("fails eligibility when tender matches an excluded project scope", () => {
    const villaTender: Tender = {
      ...sampleTender,
      title: "Construction of Luxury Residential Villas in Riyadh",
      description: "Package includes residential villas compound development.",
    };
    const result = computeEligibility(sampleSaudiContractor, villaTender);
    expect(result.passed).toBe(false);
    expect(result.failed_criteria.some((c) => c.includes("excluded project scope"))).toBe(true);
  });

  it("RULE: Company size must affect ranking but must NOT automatically determine eligibility", () => {
    const smallContractor: CompanyProfile = {
      ...sampleSaudiContractor,
      company_size: "Small",
      annual_turnover: 60000000, // adequate financial turnover
    };
    const largeContractor: CompanyProfile = {
      ...sampleSaudiContractor,
      company_size: "Large",
      annual_turnover: 60000000,
    };

    // Both Small and Large companies must PASS eligibility
    const smallElig = computeEligibility(smallContractor, sampleTender);
    const largeElig = computeEligibility(largeContractor, sampleTender);
    expect(smallElig.passed).toBe(true);
    expect(largeElig.passed).toBe(true);

    // But company size affects the match ranking score:
    // On a 35M SAR project (mid-tier), Small vs Large get differentiated alignment
    const smallMatch = computeMatch(smallContractor, sampleTender);
    const largeMatch = computeMatch(largeContractor, sampleTender);
    expect(smallMatch.score).toBeDefined();
    expect(largeMatch.score).toBeDefined();

    // Verify on a mega project (e.g. 150M SAR)
    const megaTender: Tender = {
      ...sampleTender,
      budget_sar: 150000000,
      budget: 150000000,
    };
    const megaSmall = computeMatch({ ...smallContractor, annual_turnover: 200000000 }, megaTender);
    const megaLarge = computeMatch({ ...largeContractor, annual_turnover: 200000000 }, megaTender);
    // Large enterprise ranks higher on mega project
    expect(megaLarge.score).toBeGreaterThan(megaSmall.score);
  });

  it("computes matching score with positive work category and city match", () => {
    const match = computeMatch(sampleSaudiContractor, sampleTender);
    expect(match.score).toBeGreaterThan(0.5);
    expect(match.rule_score).toBeGreaterThan(0);
    expect(match.reasons.some((r) => r.includes("city") || r.includes("activities"))).toBe(true);
    expect(match.eligibility.passed).toBe(true);
  });

  it("computes pricing statistics accurately across award records", () => {
    const stats = computePricingStats(sampleAwards);
    expect(stats.count).toBe(3);
    expect(stats.min).toBe(10000000);
    expect(stats.max).toBe(30000000);
    expect(stats.mean).toBe(20000000);
    expect(stats.median).toBe(20000000);
  });

  it("returns zeroed pricing statistics for empty awards", () => {
    const stats = computePricingStats([]);
    expect(stats.count).toBe(0);
    expect(stats.min).toBeNull();
    expect(stats.max).toBeNull();
  });

  it("computes supplier win rates sorted by awards won", () => {
    const rates = computeWinRates(sampleAwards);
    expect(rates.length).toBe(2);
    expect(rates[0].supplier_name).toBe("Al-Fanar Infrastructure & Contracting Co.");
    expect(rates[0].awards_won).toBe(2);
    expect(rates[0].total_value).toBe(50000000);
    expect(rates[0].win_share).toBeCloseTo(0.667, 2);
  });

  it("computes monthly award trends correctly", () => {
    const trends = computeTrends(sampleAwards, "month");
    expect(trends.interval).toBe("month");
    expect(trends.points.length).toBe(3);
    expect(trends.points[0].period).toBe("2026-01");
    expect(trends.points[0].count).toBe(1);
    expect(trends.points[0].total_value).toBe(20000000);
  });

  it("generates structured bid draft with citations and trace", () => {
    const { draft, trace } = generateBidDraft(sampleSaudiContractor, sampleTender);
    expect(draft.id).toBeDefined();
    expect(draft.sections.length).toBeGreaterThan(0);
    expect(draft.sections[0].citations.length).toBeGreaterThan(0);
    expect(draft.checklist.items.length).toBe(3);
    expect(draft.gap_report.coverage_ratio).toBe(0.85);
    expect(draft.status).toBe("needs_review");
    expect(trace.length).toBeGreaterThan(0);
  });
});
