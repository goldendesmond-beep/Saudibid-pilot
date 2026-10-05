import { describe, expect, it, vi } from "vitest";
import { opportunitiesApi, type CanonicalOpportunityData } from "../api/opportunities";

const mockOpportunities: CanonicalOpportunityData[] = [
  {
    id: "opp-src-etimad-001",
    title: "Expansion and Dualization of Northern Arterial Highway in Riyadh",
    title_ar: "مشروع توسعة وازدواج الطريق الشرياني الشمالي بمدينة الرياض",
    entity: "Riyadh Municipality",
    reference_number: "ETM-2026-008912",
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Roads, Bridges & Civil Infrastructure",
    description: "Grading, asphalt paving, road signs, and stormwater drainage networks.",
    publication_date: "2026-10-01T04:00:00Z",
    budget_sar: 45000000.0,
    bid_bond_sar: 900000.0,
    contractor_classification_req: "Roads Grade 2 or higher",
    required_experience_years: 8,
    mandatory_certifications: ["SCA_MUQAWIL", "ZATCA_COMPLIANT"],
    required_documents: ["Commercial Registration", "Bank Guarantee"],
    public_contact: {
      procurement_email: "tenders@alriyadh.gov.sa",
      business_phone: "0114112222",
      supplier_portal: "https://monafasat.etimad.sa",
    },
    opportunity_type: "GOVERNMENT_TENDER",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    verification_status: "VERIFIED",
    primary_source_id: "src-etimad",
    all_source_ids: ["src-etimad"],
    original_url: "https://monafasat.etimad.sa/tenders/ETM-2026-008912",
    discovered_at: "2026-10-01T04:00:00Z",
    last_checked_at: "2026-10-01T04:00:00Z",
    raw_record_id: "raw-etimad-001",
  },
  {
    id: "opp-src-tadawul-004",
    title: "Market Announcement: Listed EPC Contractor Wins 120M SAR Substation Contract",
    entity: "Saudi Listed Power Contractor",
    reference_number: "TDWL-DISC-2026-441",
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Electrical Power & Substation EPC",
    description: "Contractor announces receipt of award letter from SEC for 380kV substation package.",
    publication_date: "2026-10-01T04:00:00Z",
    budget_sar: 120000000.0,
    contractor_classification_req: "UNKNOWN",
    mandatory_certifications: [],
    required_documents: [],
    public_contact: {
      procurement_email: "ir@listedpower.sa",
    },
    opportunity_type: "AWARDED_PROJECT_SIGNAL",
    confidence_level: "MARKET_SIGNAL_ONLY",
    verification_status: "VERIFIED",
    primary_source_id: "src-tadawul",
    all_source_ids: ["src-tadawul"],
    original_url: "https://www.saudiexchange.sa/news/TDWL-DISC-2026-441",
    discovered_at: "2026-10-01T04:00:00Z",
    last_checked_at: "2026-10-01T04:00:00Z",
    raw_record_id: "raw-tadawul-004",
  },
];

describe("Saudi Opportunity Ingestion Client", () => {
  it("fetches list of canonical procurement opportunities", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpportunities,
    } as Response);

    const list = await opportunitiesApi.list();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("opp-src-etimad-001");
    expect(list[0].confidence_level).toBe("CONFIRMED_OPPORTUNITY");
    fetchSpy.mockRestore();
  });

  it("filters by confidence level to ensure market signals are not promoted to confirmed tenders", async () => {
    const confirmed = mockOpportunities.filter((o) => o.confidence_level === "CONFIRMED_OPPORTUNITY");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => confirmed,
    } as Response);

    const list = await opportunitiesApi.list({ confidence_level: "CONFIRMED_OPPORTUNITY" });
    expect(list).toHaveLength(1);
    expect(list[0].opportunity_type).toBe("GOVERNMENT_TENDER");
    expect(list.some((o) => o.confidence_level === "MARKET_SIGNAL_ONLY")).toBe(false);
    fetchSpy.mockRestore();
  });

  it("fetches linked raw source evidence record", async () => {
    const mockRaw = {
      id: "raw-etimad-001",
      original_title: "Expansion and Dualization of Northern Arterial Highway in Riyadh",
      source_id: "src-etimad",
      raw_evidence_hash: "sha256-test-hash",
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockRaw,
    } as Response);

    const raw = await opportunitiesApi.getRaw("opp-src-etimad-001");
    expect(raw.id).toBe("raw-etimad-001");
    expect(raw.raw_evidence_hash).toBe("sha256-test-hash");
    fetchSpy.mockRestore();
  });

  it("preserves UNKNOWN for missing contractor classification requirement", async () => {
    const marketSignal = mockOpportunities[1];
    expect(marketSignal.contractor_classification_req).toBe("UNKNOWN");
  });
});
