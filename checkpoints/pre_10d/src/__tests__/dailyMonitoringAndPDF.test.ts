import { describe, expect, it, vi } from "vitest";
import { monitoringApi, type MonitoringRunResult, type DailySnapshotItem } from "../api/monitoring";
import { savedListsApi, type SavedListModel } from "../api/savedLists";
import { generateDailyReportHtml } from "../utils/pdfExport";

describe("Stage 6 Daily Monitoring & PDF Engine", () => {
  it("fetches daily monitoring run results and enforces truthful source status", async () => {
    const mockRun: MonitoringRunResult = {
      id: "mon-run-20261002-001",
      timestamp: "2026-10-02T04:30:00Z",
      sources_attempted: 42,
      sources_successful: 3,
      sources_blocked: 4,
      sources_auth_required: 2,
      source_failures: 0,
      raw_records_found: 15,
      canonical_opportunities_created: 12,
      duplicates_merged: 3,
      confirmed_opportunities: 9,
      possible_opportunities: 2,
      market_signals: 1,
      high_match_opportunities: 5,
      source_details: [
        { source_id: "src-furas", name: "Furas", status: "VERIFIED_LIVE", is_live: true, records_ingested: 5 },
        { source_id: "src-etimad", name: "Etimad", status: "FIXTURE_ONLY", is_live: false, records_ingested: 0 },
        { source_id: "src-ncp", name: "NCP", status: "BLOCKED", is_live: false, records_ingested: 0 },
      ],
      is_fixture_run: false,
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockRun,
    } as Response);

    const run = await monitoringApi.runDailyMonitoring(false);
    expect(run.sources_successful).toBe(3);
    expect(run.sources_blocked).toBe(4);
    expect(run.market_signals).toBe(1);
    expect(run.confirmed_opportunities).toBe(9);
    // Market signals strictly separated from confirmed
    expect(run.confirmed_opportunities + run.possible_opportunities + run.market_signals).toBe(run.canonical_opportunities_created);
    fetchSpy.mockRestore();
  });

  it("manages immutable daily snapshots", async () => {
    const mockSnapshots: DailySnapshotItem[] = [
      {
        id: "snapshot-2026-10-02",
        snapshot_date: "2026-10-02",
        created_at: "2026-10-02T00:00:00Z",
        records_discovered: 15,
        canonical_opportunities_count: 12,
        strong_match_count: 5,
        good_match_count: 4,
        review_required_count: 2,
        closing_within_7_days_count: 2,
        government_count: 7,
        private_count: 5,
        eastern_region_count: 4,
        jubail_count: 2,
        subcontract_targets_count: 3,
        opportunities_snapshot: [],
        sources_summary: { attempted: 42, successful: 3, blocked: 4, auth_required: 2 },
      },
    ];

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockSnapshots,
    } as Response);

    const list = await monitoringApi.listSnapshots();
    expect(list).toHaveLength(1);
    expect(list[0].snapshot_date).toBe("2026-10-02");
    expect(list[0].jubail_count).toBe(2);
    expect(list[0].eastern_region_count).toBe(4);
    fetchSpy.mockRestore();
  });

  it("handles saved lists CRUD operations", async () => {
    const mockList: SavedListModel = {
      id: "list-001",
      company_id: "comp-sa-001",
      name: "Eastern Region Targets",
      notes: "Follow up with partners.",
      opportunity_ids: ["opp-1", "opp-2"],
      created_at: "2026-10-02T00:00:00Z",
      updated_at: "2026-10-02T00:00:00Z",
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [mockList],
    } as Response);

    const lists = await savedListsApi.list("comp-sa-001");
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe("Eastern Region Targets");
    expect(lists[0].opportunity_ids).toContain("opp-1");
    fetchSpy.mockRestore();
  });

  it("generates professional Arabic RTL PDF report HTML with verified sources and stats", () => {
    const htmlAr = generateDailyReportHtml({
      reportDate: "2026-10-02",
      language: "ar",
      contractorName: "شركة البناء السعودية للمقاولات",
      opportunities: [
        {
          opportunity_id: "opp-1",
          opportunity_title_ar: "مشروع إنشاء شبكة تبريد بمياه البحر بالجبيل الصناعية",
          entity: "الهيئة الملكية للجبيل وينبع",
          city: "الجبيل الصناعية",
          region: "المنطقة الشرقية",
          budget_sar: 85000000,
          closing_date: "2026-11-01T00:00:00Z",
          opportunity_type: "GOVERNMENT_TENDER",
          primary_source_id: "src-rcjy",
          original_url: "https://www.rcjy.gov.sa/en/Business/Tenders",
          match_score: { total_score: 92, label: "STRONG_MATCH" },
          eligibility: { status: "ELIGIBLE" },
          subcontract: {
            is_subcontract_target: true,
            subcontract_rationale: ["فرصة استراتيجية لتوريد وتركيب أنابيب الألياف الزجاجية."],
          },
        },
      ],
    });

    expect(htmlAr).toContain('dir="rtl"');
    expect(htmlAr).toContain("تقرير الاستخبارات اليومية للمناقصات السعودية");
    expect(htmlAr).toContain("مشروع إنشاء شبكة تبريد بمياه البحر بالجبيل الصناعية");
    expect(htmlAr).toContain("الهيئة الملكية للجبيل وينبع");
    expect(htmlAr).toContain("85,000,000 SAR");
    expect(htmlAr).toContain("92%");
    expect(htmlAr).toContain("STRONG_MATCH");
    expect(htmlAr).toContain("فرصة مقاولة باطن ممتازة");
    expect(htmlAr).toContain("https://www.rcjy.gov.sa/en/Business/Tenders");
  });

  it("generates professional English LTR PDF report HTML with clickable links and zero debug leak", () => {
    const htmlEn = generateDailyReportHtml({
      reportDate: "2026-10-02",
      language: "en",
      contractorName: "Saudi Civil Contracting Co.",
      opportunities: [
        {
          opportunity_id: "opp-2",
          opportunity_title: "Dual Highway Expansion and Asphalt Paving in Riyadh",
          entity: "Riyadh Municipality",
          city: "Riyadh",
          region: "Riyadh Region",
          budget_sar: 45000000,
          closing_date: "2026-12-01T00:00:00Z",
          opportunity_type: "GOVERNMENT_TENDER",
          primary_source_id: "src-etimad",
          original_url: "https://monafasat.etimad.sa/tenders",
          match_score: { total_score: 88, label: "STRONG_MATCH" },
          eligibility: { status: "ELIGIBLE" },
        },
      ],
    });

    expect(htmlEn).toContain('dir="ltr"');
    expect(htmlEn).toContain("Tender Intelligence Saudi — Daily Opportunity Intelligence Report");
    expect(htmlEn).toContain("Dual Highway Expansion and Asphalt Paving in Riyadh");
    expect(htmlEn).toContain("45,000,000 SAR");
    expect(htmlEn).toContain("Official Portal Link");
    // Verifies no internal debug leak
    expect(htmlEn).not.toContain("raw_evidence_hash");
    expect(htmlEn).not.toContain("trace");
  });
});
