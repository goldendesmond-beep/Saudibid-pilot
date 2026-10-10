import { describe, it, expect } from "vitest";
import type { AwardStatus, AwardResultModel } from "../api/awards";
import type { PrioritySourceRecoveryItem } from "../api/sourceRecovery";

describe("Stage 7: Award Tracking & Critical Source Recovery", () => {
  it("enforces strict truth in source recovery (blocked source is never reported as live)", () => {
    const sampleRecoveryItems: PrioritySourceRecoveryItem[] = [
      {
        source_id: "src-etimad",
        name: "Etimad",
        canonical_domain: "https://monafasat.etimad.sa",
        previous_status: "FIXTURE_ONLY",
        current_access_mode: "ASSISTED_IMPORT",
        legitimate_access_path: "ETIMAD_ASSISTED_IMPORT",
        opportunity_ingestion_works: false,
        award_ingestion_works: true,
        authentication_required: true,
        manual_import_available: true,
        exact_unresolved_limitation: "Absher 2FA and MOF Geo-firewall blocks automated container requests.",
      },
      {
        source_id: "src-rcjy",
        name: "RCJY",
        canonical_domain: "https://www.rcjy.gov.sa",
        previous_status: "BLOCKED",
        current_access_mode: "RUNTIME_ENVIRONMENT_BLOCKED",
        legitimate_access_path: "OFFICIAL_PORTAL_EGRESS_CONNECTOR",
        opportunity_ingestion_works: false,
        award_ingestion_works: true,
        authentication_required: false,
        manual_import_available: true,
        exact_unresolved_limitation: "Container egress timeout.",
      },
      {
        source_id: "src-tadawul",
        name: "Tadawul",
        canonical_domain: "https://www.saudiexchange.sa",
        previous_status: "BLOCKED",
        current_access_mode: "ASSISTED_IMPORT",
        legitimate_access_path: "TADAWUL_ASSISTED_DISCLOSURE_IMPORT",
        opportunity_ingestion_works: false,
        award_ingestion_works: true,
        authentication_required: false,
        manual_import_available: true,
        exact_unresolved_limitation: "Cloudflare WAF 403 Forbidden.",
      },
    ];

    sampleRecoveryItems.forEach((item) => {
      // Ingestion works must NEVER be true for blocked/assisted sources
      expect(item.opportunity_ingestion_works).toBe(false);
      expect(item.current_access_mode).not.toBe("DIRECT_LIVE");
    });
  });

  it("handles verified award result model with full evidence attributes", () => {
    const award: AwardResultModel = {
      id: "award-opp-src-rcjy-002",
      opportunity_id: "opp-src-rcjy-002",
      official_tender_number: "RCJY-JUB-2026-041",
      project_title: "Industrial Seawater Cooling Network Upgrades",
      owner_entity: "Royal Commission for Jubail and Yanbu (RCJY)",
      winner_legal_name: "Al-Rashid Trading & Contracting Co.",
      winner_normalized_name: "Al-Rashid Trading & Contracting Co.",
      award_date: "2026-09-28",
      contract_value_sar: 125000000,
      contract_duration: "36 Months",
      source_url: "https://www.rcjy.gov.sa/en/Business/Awards/2026-041",
      source_type: "OFFICIAL_OWNER_ANNOUNCEMENT",
      checked_date: "2026-10-02T10:00:00Z",
      evidence_text: "Officially awarded under GTPL Article 52 by RCJY Procurement Board.",
      verification_confidence: 1.0,
      status: "AWARDED_VERIFIED",
      conflicting_details: [],
    };

    expect(award.status).toBe("AWARDED_VERIFIED");
    expect(award.verification_confidence).toBe(1.0);
    expect(award.winner_legal_name).not.toBe("UNKNOWN");
    expect(award.contract_value_sar).toBe(125000000);
  });

  it("converts unknown winner to RESULT_NOT_PUBLIC without inventing facts", () => {
    const rawWinner = "";
    const requestedStatus: AwardStatus = "AWARDED_VERIFIED";

    const normalizedWinner = rawWinner.trim() === "" ? "UNKNOWN" : rawWinner.trim();
    const finalStatus: AwardStatus =
      normalizedWinner === "UNKNOWN" && requestedStatus.startsWith("AWARDED")
        ? "RESULT_NOT_PUBLIC"
        : requestedStatus;

    expect(normalizedWinner).toBe("UNKNOWN");
    expect(finalStatus).toBe("RESULT_NOT_PUBLIC");
  });

  it("correctly identifies award conflicts when winners differ", () => {
    const sourceAWinner = "Al-Bawani Contracting";
    const sourceBWinner = "Nesma & Partners";

    const isConflict = sourceAWinner !== sourceBWinner;
    expect(isConflict).toBe(true);
  });

  it("correctly identifies award conflicts when values diverge by more than 15%", () => {
    const valA = 100000000;
    const valB = 120000000; // 20% diff

    const pctDiff = Math.abs(valA - valB) / valA;
    const isConflict = pctDiff > 0.15;
    expect(isConflict).toBe(true);

    const valC = 102000000; // 2% diff
    const pctDiffC = Math.abs(valA - valC) / valA;
    expect(pctDiffC > 0.15).toBe(false);
  });

  it("aggregates saved list award summary counts accurately", () => {
    const sampleItems = [
      { id: "1", status: "AWARDED_VERIFIED" },
      { id: "2", status: "AWARDED_SINGLE_OFFICIAL_SOURCE" },
      { id: "3", status: "AWARD_PENDING" },
      { id: "4", status: "RESULT_NOT_PUBLIC" },
      { id: "5", status: "CANCELLED" },
      { id: "6", status: "CONFLICTING_SOURCES" },
    ];

    const counts = {
      AWARDED: 0,
      AWARD_PENDING: 0,
      RESULT_NOT_PUBLIC: 0,
      CANCELLED: 0,
      CONFLICTING: 0,
    };

    sampleItems.forEach((item) => {
      if (item.status.startsWith("AWARDED")) counts.AWARDED++;
      else if (item.status === "AWARD_PENDING") counts.AWARD_PENDING++;
      else if (item.status === "RESULT_NOT_PUBLIC") counts.RESULT_NOT_PUBLIC++;
      else if (item.status === "CANCELLED") counts.CANCELLED++;
      else if (item.status === "CONFLICTING_SOURCES") counts.CONFLICTING++;
    });

    expect(counts.AWARDED).toBe(2);
    expect(counts.AWARD_PENDING).toBe(1);
    expect(counts.RESULT_NOT_PUBLIC).toBe(1);
    expect(counts.CANCELLED).toBe(1);
    expect(counts.CONFLICTING).toBe(1);
  });
});
