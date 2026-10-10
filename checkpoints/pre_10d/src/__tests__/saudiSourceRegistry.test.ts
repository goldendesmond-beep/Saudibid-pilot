import { describe, expect, it, vi } from "vitest";
import { sourcesApi, type SaudiSourceData } from "../api/sources";

const mockSources: SaudiSourceData[] = [
  {
    id: "src-etimad",
    name: "Etimad (Monafasat)",
    name_ar: "منصة اعتماد (منافسات الحكومية)",
    authority_type: "GOVERNMENT_PORTAL",
    url: "https://monafasat.etimad.sa",
    health_status: "HEALTHY",
    is_active: true,
    requires_auth: false,
    auth_type: "PUBLIC",
    verification_level: "VERIFIED_OFFICIAL",
    rate_limit_per_minute: 120,
    failure_count: 0,
    consecutive_failures: 0,
    supported_opportunity_types: ["Government Tender", "Direct Purchase"],
    coverage_regions: ["All Regions"],
  },
  {
    id: "src-neom",
    name: "NEOM Supplier Portal",
    name_ar: "بوابة موردي نيوم",
    authority_type: "GIGA_PROJECT",
    url: "https://www.neom.com/en-us/suppliers",
    health_status: "HEALTHY",
    is_active: true,
    requires_auth: true,
    auth_type: "PORTAL_CREDENTIAL",
    verification_level: "VERIFIED_OFFICIAL",
    rate_limit_per_minute: 40,
    failure_count: 0,
    consecutive_failures: 0,
    supported_opportunity_types: ["Giga-project EPC"],
    coverage_regions: ["Tabuk Region"],
  },
  {
    id: "src-tadawul",
    name: "Tadawul Listed Company Award Disclosures",
    name_ar: "إفصاحات العقود والترسيات للشركات المدرجة (تداول)",
    authority_type: "FINANCIAL_MARKET_DISCLOSURES",
    url: "https://www.saudiexchange.sa",
    health_status: "HEALTHY",
    is_active: true,
    requires_auth: false,
    auth_type: "PUBLIC",
    verification_level: "OFFICIAL_DISCLOSURE",
    rate_limit_per_minute: 100,
    failure_count: 0,
    consecutive_failures: 0,
    supported_opportunity_types: ["Material Contract Disclosure"],
    coverage_regions: ["All Regions"],
  },
];

describe("Saudi Source Registry Client & Ingestion Framework", () => {
  it("fetches list of registered Saudi procurement sources", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockSources,
    } as Response);

    const sources = await sourcesApi.list();
    expect(sources).toHaveLength(3);
    expect(sources[0].id).toBe("src-etimad");
    expect(sources[0].verification_level).toBe("VERIFIED_OFFICIAL");
    fetchSpy.mockRestore();
  });

  it("filters sources by authority type (e.g. GIGA_PROJECT)", async () => {
    const gigaSources = mockSources.filter((s) => s.authority_type === "GIGA_PROJECT");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => gigaSources,
    } as Response);

    const result = await sourcesApi.list({ authority_type: "GIGA_PROJECT" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toContain("NEOM");
    fetchSpy.mockRestore();
  });

  it("handles source probe with isolated failure status", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        source_id: "src-neom",
        status: "FAILED",
        health_status: "DEGRADED",
        isolated: true,
        message: "Simulated gateway timeout",
      }),
    } as Response);

    const probeResult = await sourcesApi.probe("src-neom", true);
    expect(probeResult.status).toBe("FAILED");
    expect(probeResult.isolated).toBe(true);
    expect(probeResult.health_status).toBe("DEGRADED");
    fetchSpy.mockRestore();
  });

  it("supports dynamic source discovery and registration", async () => {
    const newSource: SaudiSourceData = {
      id: "src-roshn",
      name: "ROSHN Real Estate",
      name_ar: "شركة روشن العقارية",
      authority_type: "SOE_DEVELOPER",
      url: "https://www.roshn.sa/en/procurement",
      health_status: "HEALTHY",
      is_active: true,
      requires_auth: true,
      auth_type: "COMMERCIAL_REGISTRATION",
      verification_level: "VERIFIED_OFFICIAL",
      rate_limit_per_minute: 45,
      failure_count: 0,
      consecutive_failures: 0,
      supported_opportunity_types: ["Master Community EPC"],
      coverage_regions: ["Riyadh Region"],
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => newSource,
    } as Response);

    const registered = await sourcesApi.register({
      name: "ROSHN Real Estate",
      url: "https://www.roshn.sa/en/procurement",
      authority_type: "SOE_DEVELOPER",
    });

    expect(registered.id).toBe("src-roshn");
    expect(registered.name).toBe("ROSHN Real Estate");
    fetchSpy.mockRestore();
  });
});
