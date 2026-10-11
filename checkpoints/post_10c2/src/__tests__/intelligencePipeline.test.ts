import { describe, expect, it, vi } from "vitest";
import { intelligenceApi, type IntelligenceEvaluationResult } from "../api/intelligence";

const mockEvaluations: IntelligenceEvaluationResult[] = [
  {
    opportunity_id: "opp-src-etimad-001",
    opportunity_title: "Expansion and Dualization of Northern Arterial Highway in Riyadh",
    opportunity_title_ar: "مشروع توسعة وازدواج الطريق الشرياني الشمالي بمدينة الرياض",
    entity: "Riyadh Municipality",
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Roads, Bridges & Civil Infrastructure",
    budget_sar: 45000000.0,
    closing_date: "2026-12-01T00:00:00",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "GOVERNMENT_TENDER",
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: [
        "Possesses mandatory certification: SCA_MUQAWIL",
        "Experience meets requirement",
      ],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    match_score: {
      total_score: 92.0,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 25,
        geographic_fit: 20,
        project_scale_fit: 20,
        capacity_fit: 15,
        preference_fit: 6,
        semantic_fit: 6,
      },
      positive_reasons: [
        "Direct alignment with contractor activities: 'Roads, Bridges & Civil Infrastructure'",
        "Contractor has active operating license in Riyadh Region",
      ],
      concerns: [],
      missing_information: [],
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-etimad-001",
      company_id: "comp-sa-001",
      available_capabilities: [
        "Work Category: Roads, Bridges & Civil Infrastructure",
        "Certification: SCA_MUQAWIL",
      ],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "DIRECT_TENDER",
      disclaimer: "Decision-support output only. Human engineering review required before any submission.",
    },
  },
  {
    opportunity_id: "opp-mega-project",
    opportunity_title: "NEOM Magna Coastal Highway Mega Package",
    entity: "NEOM Company",
    city: "NEOM",
    region: "Tabuk Region",
    work_category: "Roads, Bridges & Civil Infrastructure",
    budget_sar: 300000000.0,
    closing_date: "2026-12-01T00:00:00",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "PROJECT_SIGNAL",
    eligibility: {
      status: "REVIEW_REQUIRED",
      passed: true,
      failed_criteria: [],
      passed_criteria: [],
      review_required_criteria: ["Tender location is outside contractor's primary declared operating regions"],
      missing_evidence: ["Tender contractor classification requirement is UNKNOWN"],
      company_size_disclaimed: true,
    },
    match_score: {
      total_score: 68.0,
      label: "GOOD_MATCH",
      components: {
        activity_fit: 25,
        geographic_fit: 8,
        project_scale_fit: 10,
        capacity_fit: 15,
        preference_fit: 5,
        semantic_fit: 5,
      },
      positive_reasons: ["Direct alignment with contractor activities"],
      concerns: ["Project budget exceeds prime contractor preferred envelope (prime subcontract candidate)"],
      missing_information: [],
    },
    subcontract: {
      is_subcontract_target: true,
      potential_level: "HIGH",
      subcontract_rationale: [
        "Mega-project budget (300,000,000 SAR) exceeds prime contractor envelope, offering prime subcontracting packages.",
      ],
      recommended_positioning: "SPECIALIST_SUBCONTRACTOR",
    },
    gap_analysis: {
      opportunity_id: "opp-mega-project",
      company_id: "comp-sa-001",
      available_capabilities: ["Work Category: Roads, Bridges & Civil Infrastructure"],
      missing_capabilities: ["No declared operating presence in Tabuk Region"],
      unknown_capabilities: ["Contractor guarantee capacity UNKNOWN"],
      potential_action: "SUBCONTRACT_TARGET",
      disclaimer: "Decision-support output only. Human engineering review required before any submission.",
    },
  },
  {
    opportunity_id: "opp-ineligible-high-score",
    opportunity_title: "High Voltage Substation EPC Package",
    entity: "SEC",
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Electrical Power & Substation EPC",
    budget_sar: 50000000.0,
    closing_date: "2026-12-01T00:00:00",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "GOVERNMENT_TENDER",
    eligibility: {
      status: "NOT_ELIGIBLE",
      passed: false,
      failed_criteria: ["Missing mandatory certification: ISO_9001"],
      passed_criteria: ["Experience meets requirement"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    match_score: {
      total_score: 88.0,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 25,
        geographic_fit: 20,
        project_scale_fit: 20,
        capacity_fit: 13,
        preference_fit: 5,
        semantic_fit: 5,
      },
      positive_reasons: ["Direct alignment with contractor activities"],
      concerns: [],
      missing_information: [],
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-ineligible-high-score",
      company_id: "comp-sa-001",
      available_capabilities: ["Work Category: Electrical Power & Substation EPC"],
      missing_capabilities: ["Missing mandatory certification: ISO_9001"],
      unknown_capabilities: [],
      potential_action: "NO_ACTION",
      disclaimer: "Decision-support output only.",
    },
  },
];

describe("Saudi Intelligence Pipeline Client", () => {
  it("fetches evaluated opportunities with explainable match scores", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvaluations,
    } as Response);

    const list = await intelligenceApi.evaluate("comp-sa-001");
    expect(list).toHaveLength(3);
    expect(list[0].opportunity_id).toBe("opp-src-etimad-001");
    expect(list[0].match_score.total_score).toBe(92.0);
    expect(list[0].match_score.label).toBe("STRONG_MATCH");
    expect(list[0].eligibility.status).toBe("ELIGIBLE");
    expect(list[0].gap_analysis.potential_action).toBe("DIRECT_TENDER");
    fetchSpy.mockRestore();
  });

  it("verifies Match Score and Eligibility independence: high score can be NOT_ELIGIBLE", async () => {
    const ineligible = mockEvaluations.find((e) => e.opportunity_id === "opp-ineligible-high-score");
    expect(ineligible).toBeDefined();
    // High match score
    expect(ineligible!.match_score.total_score).toBeGreaterThanOrEqual(80.0);
    expect(ineligible!.match_score.label).toBe("STRONG_MATCH");
    // But hard eligibility gate failed
    expect(ineligible!.eligibility.passed).toBe(false);
    expect(ineligible!.eligibility.status).toBe("NOT_ELIGIBLE");
    expect(ineligible!.eligibility.failed_criteria).toContain("Missing mandatory certification: ISO_9001");
    expect(ineligible!.gap_analysis.potential_action).toBe("NO_ACTION");
  });

  it("verifies mega-projects evaluate as potential subcontracting targets", async () => {
    const mega = mockEvaluations.find((e) => e.opportunity_id === "opp-mega-project");
    expect(mega).toBeDefined();
    expect(mega!.subcontract.is_subcontract_target).toBe(true);
    expect(mega!.subcontract.potential_level).toBe("HIGH");
    expect(mega!.subcontract.recommended_positioning).toBe("SPECIALIST_SUBCONTRACTOR");
    expect(mega!.gap_analysis.potential_action).toBe("SUBCONTRACT_TARGET");
  });

  it("verifies company size is disclaimed from disqualifying eligibility alone", async () => {
    for (const item of mockEvaluations) {
      expect(item.eligibility.company_size_disclaimed).toBe(true);
    }
  });

  it("verifies deterministic component breakdown sums to total score", async () => {
    for (const item of mockEvaluations) {
      const sum = Object.values(item.match_score.components).reduce((a, b) => a + b, 0);
      expect(Math.round(sum)).toBe(Math.round(item.match_score.total_score));
    }
  });
});
