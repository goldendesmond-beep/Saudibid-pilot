import { describe, it, expect, beforeEach, vi } from "vitest";
import { prequalApi, type PrequalificationDossierRecord, type VaultSummary } from "../api/prequalification";
import { proposalApi, type ProposalModel, type BOQSheetModel } from "../api/proposals";
import { actionCenterApi, type ActionCenterSummary } from "../api/actionCenter";

describe("Stage 10: Automated Prequalification Dossier, BOQ & Unified Action Center", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("assembles contractor-specific dossier and rejects 100% when mandatory items are expired or missing", async () => {
    const mockDossier: PrequalificationDossierRecord = {
      id: "dossier-contractor-nesma-comp-sa-001",
      contractor_id: "contractor-nesma",
      contractor_name: "Nesma & Partners Contracting Co.",
      contractor_name_ar: "شركة نسما وشركاهم للمقاولات",
      profile_type: "NESMA",
      tenant_id: "comp-sa-001",
      status: "DRAFT",
      readiness_percentage: 85.0,
      readiness_breakdown: {
        ready_count: 17,
        missing_count: 1,
        expired_count: 1,
        total_required: 20,
        unresolved_mandatory_reasons: [
          "Mandatory document ZATCA_TAX (ZATCA Tax Clearance Certificate) is EXPIRED.",
          "Mandatory document ISO_45001 is missing or unverified.",
        ],
      },
      sections: [
        { index: "01", name_en: "Submission Cover Sheet", name_ar: "خطاب التقديم", folder_name: "01_Cover", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "02", name_en: "Company Profile & Overview", name_ar: "الملف التعريفي للشركة", folder_name: "02_Company_Profile", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "03", name_en: "Legal & Statutory Registrations", name_ar: "التسجيلات النظامية والقانونية", folder_name: "03_Legal_and_Statutory", documents: [], missing_documents: [], expired_documents: [], total_items: 6 },
        { index: "04", name_en: "Technical Capability & Org Chart", name_ar: "القدرات الفنية والهيكل التنظيمي", folder_name: "04_Technical_Capability", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "05", name_en: "Project References & Track Record", name_ar: "سجل المشروعات المرجعية", folder_name: "05_Project_References", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "06", name_en: "Equipment Fleet & Manpower", name_ar: "أسطول المعدات والكوادر البشرية", folder_name: "06_Equipment_and_Manpower", documents: [], missing_documents: [], expired_documents: [], total_items: 2 },
        { index: "07", name_en: "Financial Capability & Audits", name_ar: "القدرات المالية والقوائم المدققة", folder_name: "07_Financial", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "08", name_en: "Quality Assurance & QC Plan", name_ar: "ضمان ومراقبة الجودة", folder_name: "08_QA_QC", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "09", name_en: "HSE Policy & Safety Manual", name_ar: "دليل وسياسة السلامة والصحة المهنية", folder_name: "09_HSE", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "10", name_en: "ISO Certifications", name_ar: "شهادات الآيزو العالمية", folder_name: "10_ISO", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "11", name_en: "Local Content & IKTVA", name_ar: "المحتوى المحلي واكتفاء", folder_name: "11_Local_Content", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "12", name_en: "Client References & Testimonials", name_ar: "شهادات الإنجاز وحسن الأداء", folder_name: "12_Client_References", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
        { index: "13", name_en: "Contractor Specific Addenda", name_ar: "متطلبات إضافية خاصة بالمقاول", folder_name: "13_Additional_Requirements", documents: [], missing_documents: [], expired_documents: [], total_items: 1 },
      ],
      documents: [],
      missing_documents: [],
      expired_documents: [],
      package_manifest: {
        dossier_id: "dossier-contractor-nesma-comp-sa-001",
        generated_at: "2026-10-05T08:00:00Z",
        target_contractor: "Nesma & Partners Contracting Co.",
        target_contractor_ar: "شركة نسما وشركاهم للمقاولات",
        profile_type: "NESMA",
        package_structure: [
          "01_Cover", "02_Company_Profile", "03_Legal_and_Statutory", "04_Technical_Capability",
          "05_Project_References", "06_Equipment_and_Manpower", "07_Financial", "08_QA_QC",
          "09_HSE", "10_ISO", "11_Local_Content", "12_Client_References", "13_Additional_Requirements"
        ],
        total_documents_included: 17,
        total_documents_missing: 1,
        total_documents_expired: 1,
        submission_readiness: "85.0%",
        ready_for_export: false,
        reasons_preventing_export: [
          "Mandatory document ZATCA_TAX (ZATCA Tax Clearance Certificate) is EXPIRED.",
        ],
      },
      created_at: "2026-10-05T08:00:00Z",
      updated_at: "2026-10-05T08:00:00Z",
    };

    vi.spyOn(prequalApi, "assembleDossier").mockResolvedValue(mockDossier);

    const dossier = await prequalApi.assembleDossier({ profile_key: "NESMA" });
    expect(dossier.sections.length).toBe(13);
    expect(dossier.readiness_percentage).toBe(85.0);
    expect(dossier.status).toBe("DRAFT");
    expect(dossier.package_manifest.ready_for_export).toBe(false);
    expect(dossier.readiness_breakdown.unresolved_mandatory_reasons?.length).toBeGreaterThan(0);
    expect(dossier.package_manifest.reasons_preventing_export).toContain(
      "Mandatory document ZATCA_TAX (ZATCA Tax Clearance Certificate) is EXPIRED."
    );
  });

  it("tracks Document Vault expiry alerts and prevents hidden expired documents", async () => {
    const mockSummary: VaultSummary = {
      total_documents: 20,
      valid_count: 17,
      expiring_soon_count: 2,
      expired_count: 1,
      missing_count: 0,
      alerts: [
        {
          code: "ZATCA_TAX",
          name_en: "ZATCA Tax & Zakat Certificate",
          name_ar: "شهادة الزكاة والضريبة والجمارك",
          status: "EXPIRED",
          expiry_date: "2026-04-30T00:00:00Z",
          message: "Certificate expired 158 days ago. Renewal required via ZATCA portal.",
        },
        {
          code: "GOSI_CERT",
          name_en: "GOSI Compliance Certificate",
          name_ar: "شهادة التأمينات الاجتماعية (GOSI)",
          status: "EXPIRING_SOON",
          expiry_date: "2026-10-25T00:00:00Z",
          message: "Certificate expires in 20 days.",
        },
      ],
      last_audited: "2026-10-05T08:00:00Z",
    };

    vi.spyOn(prequalApi, "getVaultSummary").mockResolvedValue(mockSummary);

    const summary = await prequalApi.getVaultSummary();
    expect(summary.total_documents).toBe(20);
    expect(summary.expired_count).toBe(1);
    expect(summary.expiring_soon_count).toBe(2);
    expect(summary.alerts[0].status).toBe("EXPIRED");
    expect(summary.alerts[0].code).toBe("ZATCA_TAX");
  });

  it("handles BOQ line totals, unpriced items flagging, and 15% ZATCA VAT calculation", async () => {
    const mockBOQ: BOQSheetModel = {
      id: "boq-nesma-dgda-comp-sa-001",
      tenant_id: "comp-sa-001",
      proposal_id: "prop-nesma-dgda-comp-sa-001",
      package_id: "pkg-nesma-dgda-001",
      title: "BOQ - Structural & Civil Subcontract Package (Diriyah Gate Phase 2)",
      title_ar: "جدول الكميات - حزمة الأعمال الإنشائية والمدنية (مشروع بوابة الدرعية)",
      items: [
        {
          item_number: "1.1",
          description: "Mobilization and site offices",
          description_ar: "التجهيزات الموقعية والمكاتب المؤقتة",
          unit: "lump_sum",
          quantity: 1.0,
          unit_rate: 250000.0,
          total: 250000.0,
          rate_source: "USER_ENTERED",
          trade_category: "Preliminaries",
          notes: "Includes perimeter.",
          is_price_missing: false,
        },
        {
          item_number: "4.1",
          description: "Distribution panels (MDBs)",
          description_ar: "لوحات التوزيع الكهربائية",
          unit: "set",
          quantity: 6.0,
          unit_rate: null,
          total: null,
          rate_source: "UNKNOWN",
          trade_category: "Electrical MEP",
          notes: "Pending quotation.",
          is_price_missing: true,
        },
      ],
      subtotal: 250000.0,
      overhead_percent: 10.0,
      overhead_amount: 25000.0,
      contingency_percent: 5.0,
      contingency_amount: 12500.0,
      margin_percent: 12.0,
      margin_amount: 34500.0,
      vat_percent: 15.0,
      vat_amount: 48300.0,
      grand_total: 370300.0,
      unpriced_items_count: 1,
      pricing_completeness_percentage: 50.0,
      currency: "SAR",
      notes: "Prepared for Nesma procurement.",
      created_at: "2026-10-05T08:00:00Z",
      updated_at: "2026-10-05T08:00:00Z",
    };

    vi.spyOn(proposalApi, "getBOQ").mockResolvedValue(mockBOQ);

    const boq = await proposalApi.getBOQ("boq-nesma-dgda-comp-sa-001");
    expect(boq.unpriced_items_count).toBe(1);
    expect(boq.pricing_completeness_percentage).toBe(50.0);
    expect(boq.vat_percent).toBe(15.0);
    expect(boq.items[1].is_price_missing).toBe(true);
    expect(boq.items[1].rate_source).toBe("UNKNOWN");
    expect(boq.items[0].total).toBe(250000.0);
  });

  it("verifies explainable Bid/No-Bid decision support scoring", async () => {
    const mockProposal: ProposalModel = {
      id: "prop-nesma-dgda-comp-sa-001",
      title: "Subcontract Proposal — Diriyah Gate Infrastructure & Civil Package",
      title_ar: "عرض سعر مقاولة باطن — أعمال البنية التحتية والإنشائية بمشروع بوابة الدرعية",
      main_contractor_id: "contractor-nesma",
      main_contractor_name: "Nesma & Partners Contracting Co.",
      main_contractor_name_ar: "شركة نسما وشركاهم للمقاولات",
      project_name: "Diriyah Gate Mixed-Use Development Phase 2",
      trade_package_name: "Civil Earthworks & Substructure Package",
      tenant_id: "comp-sa-001",
      tender_id: "tnd-dgda-2026-081",
      award_id: "awd-nesma-dgda-2026",
      trade_package_id: "pkg-nesma-dgda-001",
      registration_id: "vreg-contractor-nesma-comp-sa-001",
      dossier_id: "dossier-contractor-nesma-comp-sa-001",
      boq_id: "boq-nesma-dgda-comp-sa-001",
      status: "READY",
      submission_reference: null,
      decision_outcome: "CONDITIONAL_BID",
      decision_score: 78.5,
      decision_factors: [
        { factor_name: "Scope & Technical Fit", weight_percent: 25, score: 92.0, status: "STRONG", explanation: "Matches Grade 2 classification." },
        { factor_name: "Prequalification Readiness", weight_percent: 15, score: 85.0, status: "STRONG", explanation: "Dossier 85% ready." },
        { factor_name: "Commercial BOQ Completeness", weight_percent: 20, score: 83.3, status: "MODERATE", explanation: "1 item unpriced." },
        { factor_name: "Contractor Award Confidence", weight_percent: 15, score: 95.0, status: "STRONG", explanation: "Verified award record." },
      ],
      commercial_summary: {
        base_subtotal_sar: 3946500.0,
        overhead_sar: 394650.0,
        contingency_sar: 197325.0,
        margin_sar: 544617.0,
        vat_15_sar: 762463.8,
        total_tender_price_sar: 5845555.8,
      },
      boq_grand_total_sar: 5845555.8,
      currency: "SAR",
      deadline: "2026-10-18T14:00:00Z",
      created_at: "2026-10-05T08:00:00Z",
      updated_at: "2026-10-05T08:00:00Z",
      notes: "Explainable multi-factor evaluation.",
      provenance: {
        source_tender_id: "tnd-dgda-2026-081",
        award_id: "awd-nesma-dgda-2026",
        main_contractor: "Nesma & Partners",
      },
    };

    vi.spyOn(proposalApi, "getProposals").mockResolvedValue([mockProposal]);

    const list = await proposalApi.getProposals();
    expect(list.length).toBe(1);
    expect(list[0].decision_outcome).toBe("CONDITIONAL_BID");
    expect(list[0].decision_score).toBe(78.5);
    expect(list[0].decision_factors.length).toBe(4);
    expect(list[0].provenance.award_id).toBe("awd-nesma-dgda-2026");
  });

  it("prioritizes Unified Action Center into ACTION_NOW and preserves deep links", async () => {
    const mockActionSummary: ActionCenterSummary = {
      total_actions: 8,
      action_now_count: 2,
      action_this_week_count: 3,
      monitor_count: 2,
      low_priority_count: 1,
      last_evaluated: "2026-10-05T08:00:00Z",
    };

    vi.spyOn(actionCenterApi, "getActionSummary").mockResolvedValue(mockActionSummary);

    const summary = await actionCenterApi.getActionSummary();
    expect(summary.total_actions).toBe(8);
    expect(summary.action_now_count).toBe(2);
    expect(summary.action_this_week_count).toBe(3);
  });
});
