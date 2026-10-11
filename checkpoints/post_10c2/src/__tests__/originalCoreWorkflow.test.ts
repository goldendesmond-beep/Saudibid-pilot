import { describe, it, expect } from "vitest";
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

describe("ORIGINAL CORE OPERATIONAL WORKFLOW TEST", () => {
  const sampleProfile: CompanyProfile = {
    id: "comp-orig-001",
    name: "Apex Telemetry & Civil Solutions",
    company_size: "Medium",
    saudi_regions: ["Riyadh", "Eastern"],
    saudi_cities: ["Riyadh", "Dammam"],
    main_activities: ["Telecommunications & IT", "Building Construction"],
    secondary_activities: ["Electromechanical Works"],
    contractor_classification: "Grade 2",
    classification_grade: 2,
    experience_years: 12,
    manpower_count: 140,
    equipment_tags: ["IoT gateways", "Sensors", "Heavy Cranes"],
    comfortable_project_size: "10M - 30M SAR",
    preferred_project_value_sar: 20000000,
    guarantee_capability_sar: 5000000,
    certifications: ["ISO 9001", "ISO 27001"],
    direct_tender_interest: true,
    subcontracting_interest: true,
    vendor_registration_interest: true,
    excluded_project_types: ["Demolition"],

    // Legacy fields
    cpv_codes: ["72000000", "45000000"],
    regions: ["EL30", "Riyadh"],
    annual_turnover: 25000000,
    capacity_tags: ["distributed architecture", "telemetry protocols", "real-time processing"],
    exclusion_flags: [],
  };

  const sampleTender: Tender = {
    id: "tender-orig-101",
    source: "TED",
    title: "Smart Municipal Sensor Telemetry & Traffic Management Network",
    work_category: "Telecommunications & IT",
    city: "Riyadh",
    region: "Riyadh",
    budget: 15000000,
    budget_sar: 15000000,
    bid_bond_sar: 300000,
    entity: "Riyadh Smart City Authority",
    reference_number: "RSCA-2026-IT-099",
    opportunity_type: "Government Tender",
    cpv_codes: ["72000000"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    nuts: ["EL30"],
    description: "Deployment of IoT gateways, distributed architecture and real-time telemetry protocols for municipal traffic monitoring.",
    raw_doc_uri: "/docs/tender-101.pdf",
    exclusion_flags: [],
    status: "open",
  };

  it("Step 1: Original Ingestion Normalization & Data Contracts", () => {
    expect(sampleTender.id).toBe("tender-orig-101");
    expect(sampleTender.status).toBe("open");
    expect(sampleTender.cpv_codes).toContain("72000000");
    expect(sampleProfile.annual_turnover).toBe(25000000);
  });

  it("Step 2: Original Declarative Eligibility Engine", () => {
    const eligibility = computeEligibility(sampleProfile, sampleTender);
    expect(eligibility.passed).toBe(true);
    expect(eligibility.failed_criteria.length).toBe(0);
    expect(eligibility.rule_version).toMatch(/2\.0\.0/);

    // Hard exclusion test
    const blockedProfile: CompanyProfile = {
      ...sampleProfile,
      exclusion_flags: ["bankruptcy_proceeding"],
    };
    const blockedTender: Tender = {
      ...sampleTender,
      exclusion_flags: ["bankruptcy_proceeding"],
    };
    const blockedResult = computeEligibility(blockedProfile, blockedTender);
    expect(blockedResult.passed).toBe(false);
    expect(blockedResult.failed_criteria[0]).toContain("exclusion flag overlap");
  });

  it("Step 3: Original Two-Stage Hybrid Matching Engine", () => {
    const match = computeMatch(sampleProfile, sampleTender);
    expect(match.tender_id).toBe(sampleTender.id);
    expect(match.company_id).toBe(sampleProfile.id);
    expect(match.score).toBeGreaterThan(0.6);
    expect(match.semantic_score).toBeGreaterThan(0.4);
    expect(match.rule_score).toBeGreaterThan(0.5);
    expect(match.reasons.length).toBeGreaterThan(0);
    expect(match.eligibility.passed).toBe(true);
  });

  it("Step 4: Original RAG Requirement Extraction, Gap Analysis & Proposal Drafting", () => {
    const { draft, trace } = generateBidDraft(sampleProfile, sampleTender);
    expect(draft.id).toBeDefined();
    expect(draft.status).toBe("needs_review");
    expect(draft.checklist.items.length).toBeGreaterThanOrEqual(3);
    
    // Check citation grounding
    for (const item of draft.checklist.items) {
      expect(item.citation.locator).toBeDefined();
      expect(item.citation.snippet).toBeDefined();
    }

    // Gap analysis check
    expect(draft.gap_report.coverage_ratio).toBeGreaterThan(0.7);
    expect(draft.gap_report.items.length).toBeGreaterThan(0);

    // Section generation with locator citations
    expect(draft.sections.length).toBeGreaterThan(0);
    expect(draft.sections[0].citations.length).toBeGreaterThan(0);

    // Trace steps verification
    expect(trace.length).toBeGreaterThanOrEqual(2);
    expect(trace[0].thought).toBeDefined();
    expect(trace[0].action).toBe("extract_requirements");
  });

  it("Step 5: Original Historical Award Analytics (Pricing, Win Rates, Trends)", () => {
    const awards: AwardRecord[] = [
      {
        id: "award-1",
        source: "DIAVGEIA",
        cpv_codes: ["72000000"],
        contracting_authority: "Ministry of Municipalities",
        supplier_name: "Apex Telemetry & Civil Solutions",
        supplier_vat: "1002345678",
        award_value: 5000000,
        currency: "SAR",
        award_date: "2026-01-15T00:00:00Z",
        nuts: ["EL30"],
        tender_ref: "REF-001",
        raw_doc_uri: null,
      },
      {
        id: "award-2",
        source: "KIMDIS",
        cpv_codes: ["72000000"],
        contracting_authority: "Ministry of Municipalities",
        supplier_name: "Al-Fanar Technologies",
        supplier_vat: "1009876543",
        award_value: 12000000,
        currency: "SAR",
        award_date: "2026-02-10T00:00:00Z",
        nuts: ["EL30"],
        tender_ref: "REF-002",
        raw_doc_uri: null,
      },
      {
        id: "award-3",
        source: "DIAVGEIA",
        cpv_codes: ["72000000"],
        contracting_authority: "Ministry of Municipalities",
        supplier_name: "Apex Telemetry & Civil Solutions",
        supplier_vat: "1002345678",
        award_value: 8000000,
        currency: "SAR",
        award_date: "2026-03-01T00:00:00Z",
        nuts: ["EL30"],
        tender_ref: "REF-003",
        raw_doc_uri: null,
      },
    ];

    // Pricing stats
    const pricing = computePricingStats(awards, "72000000");
    expect(pricing.count).toBe(3);
    expect(pricing.min).toBe(5000000);
    expect(pricing.max).toBe(12000000);
    expect(pricing.median).toBe(8000000);

    // Win rates
    const winRates = computeWinRates(awards);
    expect(winRates.length).toBe(2);
    expect(winRates[0].supplier_name).toBe("Apex Telemetry & Civil Solutions");
    expect(winRates[0].awards_won).toBe(2);
    expect(winRates[0].win_share).toBeCloseTo(0.667, 2);

    // Trends
    const trends = computeTrends(awards, "month");
    expect(trends.interval).toBe("month");
    expect(trends.points.length).toBe(3);
    expect(trends.points[0].total_value).toBe(5000000);
  });
});
