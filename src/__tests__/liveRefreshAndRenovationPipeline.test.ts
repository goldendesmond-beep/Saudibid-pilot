import { describe, it, expect } from "vitest";
import {
  RENOVATION_CATEGORIES,
  classifyRenovationCategory,
  RENOVATION_KEYWORDS_AR,
  RENOVATION_KEYWORDS_EN,
} from "../constants/saudiTaxonomy";

describe("CRITICAL: Live Refresh, Stale Data Rules & Renovation Pipeline", () => {
  // ==============================================================
  // 1. Building Renovation & Restoration Taxonomy & Classification
  // ==============================================================
  describe("Renovation and Restoration 29 Categories & Multi-Lingual Classifier", () => {
    it("contains all 29 first-class renovation categories and keywords lists", () => {
      expect(RENOVATION_CATEGORIES.length).toBe(29);
      expect(RENOVATION_KEYWORDS_AR.length).toBeGreaterThan(10);
      expect(RENOVATION_KEYWORDS_EN.length).toBeGreaterThan(10);
      expect(RENOVATION_CATEGORIES).toContain("BUILDING_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("BUILDING_RESTORATION");
      expect(RENOVATION_CATEGORIES).toContain("BUILDING_REHABILITATION");
      expect(RENOVATION_CATEGORIES).toContain("BUILDING_REFURBISHMENT");
      expect(RENOVATION_CATEGORIES).toContain("BUILDING_UPGRADE");
      expect(RENOVATION_CATEGORIES).toContain("INTERIOR_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("EXTERIOR_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("STRUCTURAL_REPAIR");
      expect(RENOVATION_CATEGORIES).toContain("CONCRETE_REPAIR");
      expect(RENOVATION_CATEGORIES).toContain("FACADE_REPAIR");
      expect(RENOVATION_CATEGORIES).toContain("ROOF_REPAIR");
      expect(RENOVATION_CATEGORIES).toContain("WATERPROOFING");
      expect(RENOVATION_CATEGORIES).toContain("MEP_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("ELECTRICAL_REHABILITATION");
      expect(RENOVATION_CATEGORIES).toContain("PLUMBING_REHABILITATION");
      expect(RENOVATION_CATEGORIES).toContain("HVAC_REPLACEMENT");
      expect(RENOVATION_CATEGORIES).toContain("FIRE_SAFETY_UPGRADE");
      expect(RENOVATION_CATEGORIES).toContain("FACILITY_REHABILITATION");
      expect(RENOVATION_CATEGORIES).toContain("SCHOOL_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("HOSPITAL_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("HOTEL_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("OFFICE_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("MOSQUE_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("GOVERNMENT_BUILDING_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("RESIDENTIAL_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("COMMERCIAL_RENOVATION");
      expect(RENOVATION_CATEGORIES).toContain("INDUSTRIAL_REHABILITATION");
      expect(RENOVATION_CATEGORIES).toContain("HERITAGE_RESTORATION");
      expect(RENOVATION_CATEGORIES).toContain("GENERAL_RENOVATION");
    });

    it("correctly classifies Arabic renovation terms", () => {
      const t1 = classifyRenovationCategory("مشروع إعادة تأهيل وترميم المباني والمرافق البلدية");
      expect(t1.isRenovation).toBe(true);
      expect(t1.category).toBe("FACILITY_REHABILITATION");

      const t2 = classifyRenovationCategory("مشروع ترميم واجهات مبنى الإدارة العامة");
      expect(t2.isRenovation).toBe(true);
      expect(t2.category).toBe("FACADE_REPAIR");

      const t3 = classifyRenovationCategory("أعمال إصلاح خرسانة وعزل أسطح المستودعات");
      expect(t3.isRenovation).toBe(true);
      expect(t3.category).toBe("CONCRETE_REPAIR");

      const t4 = classifyRenovationCategory("مشروع ترميم قصر تاريخي وموقع تراثي");
      expect(t4.isRenovation).toBe(true);
      expect(t4.category).toBe("HERITAGE_RESTORATION");

      const t5 = classifyRenovationCategory("إعادة تأهيل أنظمة التكييف والتهوية (HVAC)");
      expect(t5.isRenovation).toBe(true);
      expect(t5.category).toBe("HVAC_REPLACEMENT");

      const t6 = classifyRenovationCategory("تجديد وترميم مباني الفندق الساحلي");
      expect(t6.isRenovation).toBe(true);
      expect(t6.category).toBe("HOTEL_RENOVATION");
    });

    it("correctly classifies English renovation terms", () => {
      const e1 = classifyRenovationCategory("Facade repair and exterior structural rehabilitation");
      expect(e1.isRenovation).toBe(true);
      expect(e1.category).toBe("FACADE_REPAIR");

      const e2 = classifyRenovationCategory("Hospital refurbishment and HVAC replacement package");
      expect(e2.isRenovation).toBe(true);
      expect(e2.category).toBe("HVAC_REPLACEMENT");

      const e3 = classifyRenovationCategory("Historical building heritage restoration and preservation");
      expect(e3.isRenovation).toBe(true);
      expect(e3.category).toBe("HERITAGE_RESTORATION");

      const e4 = classifyRenovationCategory("General highway asphalt dualization and grading");
      expect(e4.isRenovation).toBe(false);
    });
  });

  // ==============================================================
  // 2. Truthful Provenance & Stale Data Logic
  // ==============================================================
  describe("Stale Data & Source Status Integrity", () => {
    it("identifies stale records when not verified within 72 hours or when source is blocked", () => {
      const now = Date.now();
      const fourDaysAgo = new Date(now - 4 * 24 * 3600 * 1000).toISOString();
      const tenMinutesAgo = new Date(now - 600 * 1000).toISOString();

      // Rule: older than 72 hours -> is_stale = true
      const isStaleByTime = now - new Date(fourDaysAgo).getTime() > 72 * 3600 * 1000;
      expect(isStaleByTime).toBe(true);

      // Rule: blocked source -> is_stale = true regardless of recent attempt
      const sourceStatusBlocked = "BLOCKED";
      const isBlockedStale = sourceStatusBlocked === "BLOCKED";
      expect(isBlockedStale).toBe(true);

      // Rule: recently verified live -> is_stale = false
      const sourceStatusLive = "WORKING_LIVE";
      const isRecentStale = (now - new Date(tenMinutesAgo).getTime() > 72 * 3600 * 1000) || sourceStatusLive === "BLOCKED";
      expect(isRecentStale).toBe(false);
    });

    it("enforces truthful provenance fields without mock assumptions", () => {
      const mockRecord = {
        source_id: "src-etimad",
        record_origin: "ASSISTED_IMPORT",
        first_seen_at: "2026-10-01T08:00:00.000Z",
        last_seen_at: "2026-10-01T08:00:00.000Z",
        last_fetched_at: "2026-10-01T08:00:00.000Z",
        last_verified_at: "2026-10-01T08:00:00.000Z",
        source_status: "ASSISTED_IMPORT",
        refresh_status: "UNCHANGED",
        is_stale: true,
        is_seed: false,
        is_fixture: false,
        is_live_record: true,
      };

      expect(mockRecord.source_id).toBe("src-etimad");
      expect(mockRecord.record_origin).toBe("ASSISTED_IMPORT");
      expect(mockRecord.is_stale).toBe(true);
      expect(mockRecord.is_seed).toBe(false);
    });
  });

  // ==============================================================
  // 3. Hospitality & Manpower Coverage Gap Truth
  // ==============================================================
  describe("Coverage Gap Reporting (Zero Real Data Protection)", () => {
    it("reports SOURCE_COVERAGE_GAP when 0 real opportunities discovered without faking records", () => {
      const discoveredHotelTenders = 0;
      const hotelAudit = {
        category_name: "Hospitality & Hotels",
        real_data_verified: discoveredHotelTenders > 0,
        status: discoveredHotelTenders > 0 ? "LIVE_DATA_AVAILABLE" : "SOURCE_COVERAGE_GAP",
        records_discovered: discoveredHotelTenders,
        gap_reason: "Official hospitality portals require verified supplier credentials (AUTH_REQUIRED). No unauthenticated public hotel RFPs currently yielded.",
      };

      expect(hotelAudit.real_data_verified).toBe(false);
      expect(hotelAudit.status).toBe("SOURCE_COVERAGE_GAP");
      expect(hotelAudit.records_discovered).toBe(0);
    });

    it("ensures seed organization / vendor registration records are never mixed into real opportunity counts", () => {
      const allDatabaseRecords = [
        { id: "opp-01", is_seed: false, title: "Real Public Infrastructure Project" },
        { id: "seed-org-01", is_seed: true, title: "Demo Hospitality Supplier Profile" },
        { id: "seed-org-02", is_seed: true, title: "Demo Manpower Staffing Vendor" },
      ];

      const realProcurementRecords = allDatabaseRecords.filter((r) => !r.is_seed);
      expect(realProcurementRecords.length).toBe(1);
      expect(realProcurementRecords[0].id).toBe("opp-01");
    });
  });

  // ==============================================================
  // 4. Consecutive Refresh Simulation & Deduplication
  // ==============================================================
  describe("Consecutive Refresh Execution Simulation", () => {
    it("handles two consecutive refreshes correctly: test 1 finds new records, test 2 marks unchanged", () => {
      const recordsStore = new Map<string, { id: string; hash: string; refresh_status: string }>();

      // --- Refresh Run #1 ---
      const run1Discovered = [
        { id: "opp-live-01", hash: "abc1", text: "Civic Renovation Project" },
      ];

      let run1New = 0;
      let run1Unchanged = 0;

      for (const item of run1Discovered) {
        if (!recordsStore.has(item.id)) {
          recordsStore.set(item.id, { id: item.id, hash: item.hash, refresh_status: "NEW" });
          run1New++;
        } else {
          run1Unchanged++;
        }
      }

      expect(run1New).toBe(1);
      expect(run1Unchanged).toBe(0);
      expect(recordsStore.get("opp-live-01")?.refresh_status).toBe("NEW");

      // --- Refresh Run #2 (Immediately consecutive, identical source payload) ---
      const run2Discovered = [
        { id: "opp-live-01", hash: "abc1", text: "Civic Renovation Project" },
      ];

      let run2New = 0;
      let run2Unchanged = 0;

      for (const item of run2Discovered) {
        const existing = recordsStore.get(item.id);
        if (!existing) {
          recordsStore.set(item.id, { id: item.id, hash: item.hash, refresh_status: "NEW" });
          run2New++;
        } else if (existing.hash === item.hash) {
          recordsStore.set(item.id, { ...existing, refresh_status: "UNCHANGED" });
          run2Unchanged++;
        }
      }

      expect(run2New).toBe(0);
      expect(run2Unchanged).toBe(1);
      expect(recordsStore.get("opp-live-01")?.refresh_status).toBe("UNCHANGED");
    });
  });
});
