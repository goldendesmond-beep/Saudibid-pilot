import { describe, it, expect } from "vitest";
import type {
  MainContractorProfile,
  SubcontractPackage,
  SubcontractActionPlan,
} from "../api/subcontracting";

describe("Stage 8: Main Contractor & Subcontracting Intelligence", () => {
  it("validates verified prime contractor profile structure and portal links", () => {
    const contractor: MainContractorProfile = {
      id: "contractor-al-rashid",
      contractor_name: "Al-Rashid Trading & Contracting Co.",
      contractor_name_ar: "شركة الراشد للتجارة والمقاولات",
      normalized_name: "Al-Rashid Trading & Contracting",
      commercial_brand_name: "RTCC",
      verification_status: "VERIFIED_MAIN_CONTRACTOR",
      official_website: "https://www.rtcc.com.sa",
      headquarters: "Riyadh & Al-Khobar",
      saudi_presence: true,
      cr_number: "1010006275",
      company_size: "LARGE",
      contractor_classification: "Grade 1 - Water & Sewage, Utilities, Heavy Civils",
      specialties: ["Seawater Cooling", "Pumping Stations", "Desalination Networks"],
      industries: ["Utilities", "Water Infrastructure"],
      geographic_coverage: ["Eastern Province", "Riyadh Region"],
      known_clients: ["RCJY", "SWCC", "NWC"],
      active_saudi_projects: [
        {
          project_id: "opp-src-rcjy-002",
          title: "Industrial Seawater Cooling Network Upgrades",
          owner: "Royal Commission for Jubail and Yanbu",
          contract_value_sar: 125000000,
        },
      ],
      verified_sources: ["https://www.rcjy.gov.sa/awards/2026-041"],
      portal_links: [
        {
          url: "https://www.rtcc.com.sa/suppliers-prequalification",
          link_type: "PREQUALIFICATION",
          evidence_source: "OFFICIAL_COMPANY_WEBSITE",
          verified_domain: "rtcc.com.sa",
          authentication_required: false,
          registration_status: "PUBLIC",
          notes: "Online subcontractor prequalification form.",
        },
      ],
      contacts: [
        {
          contact_type: "PROCUREMENT_OFFICE",
          email: "purchasing@rtcc.com.sa",
          phone: "+966-11-401-2550",
        },
      ],
    };

    expect(contractor.verification_status).toBe("VERIFIED_MAIN_CONTRACTOR");
    expect(contractor.saudi_presence).toBe(true);
    expect(contractor.portal_links.length).toBeGreaterThan(0);
    expect(contractor.portal_links[0].registration_status).toBe("PUBLIC");
    expect(contractor.contacts[0].email).toMatch(/@rtcc\.com\.sa$/);
    expect(contractor.contacts[0].email).not.toMatch(/@(gmail|yahoo|hotmail)\.com$/);
  });

  it("distinguishes confirmed work packages from inferred trade scopes", () => {
    const confirmedPackage: SubcontractPackage = {
      id: "pkg-mep-01",
      main_contractor_id: "contractor-al-rashid",
      main_contractor_name: "Al-Rashid Trading & Contracting Co.",
      project_id: "opp-rcjy-002",
      project_name: "Industrial Seawater Cooling Network Upgrades",
      project_owner: "Royal Commission for Jubail and Yanbu (RCJY)",
      project_location: "Jubail Industrial City, Eastern Province",
      package_name: "Seawater Pumping Station Valves & Instrumentation",
      package_category: "MEP",
      description: "Installation of specialized butterfly valves and telemetry.",
      evidence_level: "CONFIRMED",
      evidence_source: "RCJY Tender Appendix B",
      likely_timing: "45-60 Days",
      required_capabilities: ["Electromechanical Classification Grade 2"],
      likely_prequalification: "RCJY Vendor Clearance",
      known_requirements: ["Valid Saudi CR", "Zakat Clearance"],
      unknown_requirements: [],
      small_contractor_friendly: true,
      is_inferred: false,
      estimated_value_sar: 18500000,
      priority_label: "HIGH_PRIORITY_TARGET",
      priority_reasons: ["Confirmed in tender documentation"],
      bd_status: "DISCOVERED",
    };

    const inferredPackage: SubcontractPackage = {
      id: "pkg-civil-01",
      main_contractor_id: "contractor-al-rashid",
      main_contractor_name: "Al-Rashid Trading & Contracting Co.",
      project_id: "opp-rcjy-002",
      project_name: "Industrial Seawater Cooling Network Upgrades",
      project_owner: "Royal Commission for Jubail and Yanbu (RCJY)",
      project_location: "Jubail Industrial City, Eastern Province",
      package_name: "Deep Trenching & Shoring Package",
      package_category: "CIVIL",
      description: "Excavation and trench safety preparation for pipe laying.",
      evidence_level: "INFERRED_FROM_PRIME_SCOPE",
      evidence_source: "Decomposed from RCJY cooling prime contract value",
      likely_timing: "15-30 Days",
      required_capabilities: ["Civil Works Classification"],
      likely_prequalification: "Muqawil Civil Classification",
      known_requirements: ["Valid Saudi CR"],
      unknown_requirements: [],
      small_contractor_friendly: true,
      is_inferred: true,
      estimated_value_sar: 14000000,
      priority_label: "HIGH_PRIORITY_TARGET",
      priority_reasons: ["Mobilization trade requirement"],
      bd_status: "DISCOVERED",
    };

    expect(confirmedPackage.is_inferred).toBe(false);
    expect(confirmedPackage.evidence_level).toBe("CONFIRMED");

    expect(inferredPackage.is_inferred).toBe(true);
    expect(inferredPackage.evidence_level).toBe("INFERRED_FROM_PRIME_SCOPE");
  });

  it("verifies structured Action Plan with 5 steps and bilingual outreach draft", () => {
    const plan: SubcontractActionPlan = {
      id: "plan-test-01",
      package_id: "pkg-mep-01",
      main_contractor_id: "contractor-al-rashid",
      tenant_id: "comp-sa-001",
      portal_registration_url: "https://www.rtcc.com.sa/suppliers-prequalification",
      registration_portal_type: "PREQUALIFICATION",
      required_documents: [
        { document_name: "Commercial Registration (CR)", is_mandatory: true, status: "READY" },
        { document_name: "ZATCA Certificate", is_mandatory: true, status: "READY" },
        { document_name: "GOSI Compliance", is_mandatory: true, status: "READY" },
        { document_name: "Muqawil Classification", is_mandatory: true, status: "READY" },
      ],
      outreach_contact: {
        contact_type: "PROCUREMENT_OFFICE",
        email: "purchasing@rtcc.com.sa",
        phone: "+966-11-401-2550",
      },
      outreach_email_draft: {
        subject: "Subcontracting Prequalification & EOI — Seawater Pumping Station",
        body_en: "Dear Procurement Directorate at Al-Rashid...",
        body_ar: "السادة إدارة المشتريات والعقود بشركة الراشد المحترمين...",
      },
      steps: [
        { step: 1, title: "Portal Registration", description: "Register online", status: "COMPLETED" },
        { step: 2, title: "Prequalification Dossier", description: "Upload CR & docs", status: "IN_PROGRESS" },
        { step: 3, title: "Targeted Outreach", description: "Send EOI email", status: "NOT_STARTED" },
        { step: 4, title: "Scope Alignment", description: "Technical review", status: "NOT_STARTED" },
        { step: 5, title: "Quotation Submission", description: "Submit bid", status: "NOT_STARTED" },
      ],
      status: "PORTAL_REGISTERED",
    };

    expect(plan.steps).toHaveLength(5);
    expect(plan.steps[0].status).toBe("COMPLETED");
    expect(plan.required_documents.every((d) => d.status === "READY")).toBe(true);
    expect(plan.outreach_email_draft.body_ar).toContain("شركة الراشد");
    expect(plan.outreach_email_draft.body_en).toContain("Al-Rashid");
  });
});
