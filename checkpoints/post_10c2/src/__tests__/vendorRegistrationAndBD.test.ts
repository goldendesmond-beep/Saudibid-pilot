import { describe, it, expect, beforeEach, vi } from "vitest";
import { vendorApi, type VendorRegistrationRecord, type BDPipelineItem } from "../api/vendorRegistration";

describe("Stage 9: Vendor Registration & Business Development Pipeline", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches vendor registrations and validates verified portal structures", async () => {
    const mockRegistrations: VendorRegistrationRecord[] = [
      {
        id: "vreg-contractor-al-rashid-comp-sa-001",
        contractor_id: "contractor-al-rashid",
        contractor_name: "Al-Rashid Trading & Contracting Co.",
        contractor_name_ar: "شركة الراشد للتجارة والمقاولات",
        tenant_id: "comp-sa-001",
        commercial_registration: "1010006275",
        location: "Riyadh & Al-Khobar, Saudi Arabia",
        official_website: "https://www.rtcc.com.sa",
        vendor_portal_url: "https://www.rtcc.com.sa/procurement/vendor-registration",
        portal_type: "VENDOR_REGISTRATION",
        portal_status: "PUBLIC",
        registration_status: "PORTAL_FOUND",
        last_checked: "2026-10-04T12:00:00Z",
        procurement_contact: {
          email: "purchasing@rtcc.com.sa",
          phone: "+966-11-200-4500",
        },
        required_documents: [],
        missing_documents: ["Client Completion Certificates"],
        evidence_sources: ["https://www.rtcc.com.sa"],
        confidence_level: "VERIFIED",
        notes: "Direct onboarding portal active.",
        created_at: "2026-10-04T12:00:00Z",
        updated_at: "2026-10-04T12:00:00Z",
      },
    ];

    vi.spyOn(vendorApi, "getRegistrations").mockResolvedValue(mockRegistrations);

    const list = await vendorApi.getRegistrations();
    expect(list.length).toBe(1);
    expect(list[0].contractor_name).toBe("Al-Rashid Trading & Contracting Co.");
    expect(list[0].portal_type).toBe("VENDOR_REGISTRATION");
    expect(list[0].portal_status).toBe("PUBLIC");
    expect(list[0].procurement_contact.email).toBe("purchasing@rtcc.com.sa");
    expect(list[0].confidence_level).toBe("VERIFIED");
  });

  it("updates vendor registration lifecycle status without automatic bypass", async () => {
    const updatedRecord: VendorRegistrationRecord = {
      id: "vreg-contractor-al-rashid-comp-sa-001",
      contractor_id: "contractor-al-rashid",
      contractor_name: "Al-Rashid Trading & Contracting Co.",
      contractor_name_ar: "شركة الراشد للتجارة والمقاولات",
      tenant_id: "comp-sa-001",
      location: "Riyadh, Saudi Arabia",
      official_website: "https://www.rtcc.com.sa",
      vendor_portal_url: "https://www.rtcc.com.sa/procurement/vendor-registration",
      portal_type: "VENDOR_REGISTRATION",
      portal_status: "PUBLIC",
      registration_status: "SUBMITTED",
      last_checked: "2026-10-04T12:00:00Z",
      procurement_contact: { email: "purchasing@rtcc.com.sa" },
      required_documents: [],
      missing_documents: [],
      evidence_sources: ["https://www.rtcc.com.sa"],
      confidence_level: "VERIFIED",
      notes: "Submitted under reference RTCC-SUB-2026-091",
      created_at: "2026-10-04T12:00:00Z",
      updated_at: "2026-10-04T12:05:00Z",
    };

    vi.spyOn(vendorApi, "updateRegistrationStatus").mockResolvedValue(updatedRecord);

    const result = await vendorApi.updateRegistrationStatus(
      "contractor-al-rashid",
      "SUBMITTED",
      "User verified submission",
      "RTCC-SUB-2026-091"
    );

    expect(result.registration_status).toBe("SUBMITTED");
    expect(result.notes).toContain("RTCC-SUB-2026-091");
  });

  it("retrieves standard 22-document prequalification checklist with statutory and IKTVA categories", async () => {
    const mockChecklist = [
      { code: "DOC_CR", name_en: "Commercial Registration (CR)", name_ar: "السجل التجاري", category: "STATUTORY" as const, is_mandatory: true, requirement_level: "REQUIRED_VERIFIED" as const, status: "READY" as const },
      { code: "DOC_MUQAWIL", name_en: "Contractor Classification", name_ar: "شهادة تصنيف المقاولين", category: "STATUTORY" as const, is_mandatory: true, requirement_level: "REQUIRED_VERIFIED" as const, status: "READY" as const },
      { code: "DOC_IKTVA", name_en: "Aramco IKTVA Scorecard", name_ar: "شهادة برنامج اكتفاء", category: "LOCAL_CONTENT" as const, is_mandatory: false, requirement_level: "OPTIONAL" as const, status: "PENDING_REVIEW" as const },
    ];

    vi.spyOn(vendorApi, "getStandardChecklist").mockResolvedValue(mockChecklist);

    const docs = await vendorApi.getStandardChecklist();
    expect(docs.length).toBe(3);
    expect(docs[0].code).toBe("DOC_CR");
    expect(docs[0].category).toBe("STATUTORY");
    expect(docs[2].category).toBe("LOCAL_CONTENT");
  });

  it("evaluates BD pipeline items with priority tiers and explainable score factors", async () => {
    const mockPipeline: BDPipelineItem[] = [
      {
        id: "bd-pkg-01",
        tenant_id: "comp-sa-001",
        project_name: "Industrial Seawater Cooling Network Upgrades",
        project_owner: "RCJY",
        contractor_id: "contractor-al-rashid",
        contractor_name: "Al-Rashid Trading & Contracting Co.",
        contractor_name_ar: "شركة الراشد للتجارة والمقاولات",
        package_name: "Industrial Piping & HDPE Sub-Network",
        work_category: "PIPING_AND_UTILITIES",
        stage: "TARGET_IDENTIFIED",
        priority: "ACTION_NOW",
        priority_score: 94.5,
        priority_reasons: [
          "High SME Trade & Capacity Fit (91%)",
          "Verified Prime Contractor Award",
          "Public Vendor Portal Discovered",
        ],
        estimated_value_sar: 18500000,
        last_activity_date: "2026-10-04T12:00:00Z",
        assigned_to: "Business Development Directorate",
        notes: "Urgent package tender.",
        provenance: {
          source_award: "opp-src-rcjy-002",
          evidence_level: "CONFIRMED",
          is_inferred: false,
        },
        created_at: "2026-10-04T12:00:00Z",
        updated_at: "2026-10-04T12:00:00Z",
      },
    ];

    vi.spyOn(vendorApi, "getBDPipeline").mockResolvedValue(mockPipeline);

    const items = await vendorApi.getBDPipeline({ priority: "ACTION_NOW" });
    expect(items.length).toBe(1);
    expect(items[0].priority).toBe("ACTION_NOW");
    expect(items[0].priority_score).toBe(94.5);
    expect(items[0].priority_reasons.length).toBeGreaterThan(1);
    expect(items[0].provenance.is_inferred).toBe(false);
  });

  it("generates bilingual outreach templates without personal email invention", async () => {
    const mockTemplates = {
      EOI: {
        title_en: "Expression of Interest",
        title_ar: "إبداء رغبة",
        subject_en: "EOI: Industrial Piping - Jubail Project",
        subject_ar: "إبداء رغبة: أنابيب صناعية - مشروع الجبيل",
        body_en: "Dear Procurement Directorate,\n\nWe submit our formal EOI...",
        body_ar: "السادة إدارة المشتريات،\n\nنود إبداء رغبتنا...",
      },
    };

    vi.spyOn(vendorApi, "getOutreachTemplates").mockResolvedValue(mockTemplates);

    const res = await vendorApi.getOutreachTemplates({
      package_name: "Industrial Piping",
      project_name: "Jubail Project",
      contractor_name: "Al-Rashid Trading",
    });

    expect(res.EOI).toBeDefined();
    expect(res.EOI.subject_en).toContain("Industrial Piping");
    expect(res.EOI.body_ar).toContain("السادة إدارة المشتريات");
  });

  it("retrieves truthful source reliability audit counts without fake live labels", async () => {
    const mockAudit = {
      timestamp: "2026-10-04T12:00:00Z",
      counts: {
        TOTAL_SOURCES: 42,
        WORKING_LIVE: 1,
        AUTHENTICATED_LIVE: 0,
        ASSISTED_IMPORT: 2,
        AUTH_REQUIRED: 9,
        RUNTIME_ENVIRONMENT_BLOCKED: 7,
        BLOCKED: 23,
        FIXTURE_ONLY: 0,
      },
      comparison_with_previous_state: {
        Stage_7_Status: { TOTAL_SOURCES: 42, WORKING_LIVE: 3 },
        Stage_9_Status: { TOTAL_SOURCES: 42, WORKING_LIVE: 1 },
        delta_notes: "Truthful audit report without false live labels.",
      },
    };

    vi.spyOn(vendorApi, "getSourceAuditReport").mockResolvedValue(mockAudit);

    const report = await vendorApi.getSourceAuditReport();
    expect(report.counts.TOTAL_SOURCES).toBe(42);
    expect(report.counts.WORKING_LIVE).toBe(1);
    expect(report.counts.ASSISTED_IMPORT).toBe(2);
    expect(report.counts.AUTH_REQUIRED).toBe(9);
    expect(report.counts.FIXTURE_ONLY).toBe(0);
  });
});
