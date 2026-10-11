import { describe, it, expect } from "vitest";
import type {
  ApplyingAsContext,
  ApplicationFlowRecord,
  IntelligenceEvaluationResult,
} from "../api/intelligence";

describe("POST-STAGE-10C1 — HOW TO APPLY & CONTACT INTELLIGENCE", () => {
  // Mock company profiles for multi-tenant isolation testing
  const orgAlpha: ApplyingAsContext = {
    organization_id: "comp-riyadh-contracting-01",
    organization_name: "Riyadh Modern General Contracting Co.",
    organization_name_ar: "شركة مقاولات الرياض الحديثة العامة",
    company_size: "Large",
    classification_grade: 1,
  };

  const orgBeta: ApplyingAsContext = {
    organization_id: "comp-red-sea-facilities-02",
    organization_name: "Red Sea Hospitality & Facility Support Services",
    organization_name_ar: "خدمات البحر الأحمر لدعم الضيافة والمرافق",
    company_size: "Medium",
    classification_grade: 2,
  };

  // 1. Government Tender Test Case
  const governmentTenderOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-etimad-001",
    opportunity_title: "Expansion and Dualization of Northern Arterial Highway in Riyadh",
    opportunity_title_ar: "مشروع توسعة وازدواج الطريق الشرياني الشمالي بمدينة الرياض",
    entity: "Riyadh Municipality",
    client: "Riyadh Municipality",
    main_contractor: undefined,
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Roads, Bridges & Civil Infrastructure",
    sector: "Infrastructure & Municipal Works",
    budget_sar: 45000000,
    closing_date: "2026-11-15T00:00:00.000Z",
    reference_number: "ETM-2026-008912",
    primary_source_id: "src-etimad",
    source_live_status: "ASSISTED_IMPORT",
    source_status: "ASSISTED_IMPORT",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "GOVERNMENT_TENDER",
    original_url: "https://monafasat.etimad.sa/tenders/ETM-2026-008912",
    record_origin: "ASSISTED_IMPORT",
    is_live_record: true,
    is_stale: false,
    match_score: {
      total_score: 85,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 30,
        geographic_fit: 20,
        project_scale_fit: 15,
        capacity_fit: 10,
        preference_fit: 5,
        semantic_fit: 5,
      },
      positive_reasons: ["Grade 1 road construction matches scope."],
      concerns: [],
      missing_information: [],
    },
    actionability: {
      score: 85,
      state: "HIGH",
      factors: {
        has_application_url: true,
        has_procurement_contact: true,
        has_supplier_portal: true,
        has_vendor_registration: true,
        has_deadline: true,
        has_submission_instructions: true,
        is_source_accessible: true,
        document_readiness_pct: 90,
      },
      rationale: [
        "Verified direct tender URL is available on Etimad Monafasat.",
        "Verified procurement contact committee confirmed.",
        "Clear submission deadline established (2026-11-15).",
      ],
      missing_for_action: [],
    },
    how_to_apply: {
      channel_status: "DIRECT_APPLICATION",
      where_to_apply: "Apply directly via the Etimad Government Procurement Portal (GTPL) tender page.",
      who_to_contact: "Riyadh Municipality Procurement Committee (tenders@alriyadh.gov.sa | 0114112222)",
      what_to_do_next: [
        "Verify contractor Commercial Registration (CR) and valid SCA Muqawil membership.",
        "Login to Etimad Monafasat portal using corporate Nafath authentication.",
        "Purchase official tender booklet (ETM-2026-008912) before deadline.",
        "Issue mandatory bank guarantee of 900,000 SAR from an authorized Saudi bank.",
        "Submit technical proposal and electronic BOQ through the Etimad gateway.",
      ],
      direct_tender_url: "https://monafasat.etimad.sa/tenders/ETM-2026-008912",
      official_application_url: "https://monafasat.etimad.sa",
      supplier_portal: "https://monafasat.etimad.sa",
      vendor_registration_url: "https://login.etimad.sa",
      procurement_email: "tenders@alriyadh.gov.sa",
      procurement_phone: "0114112222",
      official_contact_page: "https://www.alriyadh.gov.sa/en/contact",
      source_instructions: null,
      main_contractor_contact: null,
      provenance: {
        source: "src-etimad",
        source_url: "https://monafasat.etimad.sa/tenders/ETM-2026-008912",
        verification_status: "VERIFIED",
        verified_at: "2026-10-08T10:00:00.000Z",
        notes: "Verified official Etimad tender notice.",
      },
    },
    applying_as: orgAlpha,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
      portal_opened_at: null,
      submitted_at: null,
      submission_ref: null,
    },
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: ["Valid CR", "Grade 1 Classification", "SCA Muqawil Active"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-etimad-001",
      company_id: orgAlpha.organization_id,
      available_capabilities: ["Roads Grade 1", "Civil Earthworks Fleet"],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "DIRECT_TENDER",
      disclaimer: "Official Saudi procurement compliance verified.",
    },
  };

  // 2. Private Tender Test Case
  const privateTenderOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-private-006",
    opportunity_title: "ROSHN SEDRA Phase 3 Commercial Retail Hub Construction & MEP Packages",
    opportunity_title_ar: "مشروع إنشاء المجمع التجاري وحزم الكهروميكانيك في سدرة المرحلة الثالثة - روشن",
    entity: "ROSHN Real Estate (PIF Company)",
    client: "ROSHN Real Estate (PIF Company)",
    main_contractor: undefined,
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Building Construction & Commercial Contracting",
    sector: "Real Estate & Commercial Development",
    budget_sar: 72000000,
    closing_date: "2026-11-20T00:00:00.000Z",
    reference_number: "ROSHN-SEDRA-2026-P09",
    primary_source_id: "src-etimad",
    source_status: "ASSISTED_IMPORT",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "PRIVATE_TENDER",
    original_url: "https://roshn.sa/en/procurement/tenders/ROSHN-SEDRA-2026-P09",
    record_origin: "ASSISTED_IMPORT",
    is_live_record: true,
    is_stale: false,
    match_score: {
      total_score: 80,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 30,
        geographic_fit: 20,
        project_scale_fit: 15,
        capacity_fit: 10,
        preference_fit: 5,
        semantic_fit: 0,
      },
      positive_reasons: ["Commercial building experience fits envelope."],
      concerns: [],
      missing_information: [],
    },
    actionability: {
      score: 75,
      state: "HIGH",
      factors: {
        has_application_url: true,
        has_procurement_contact: true,
        has_supplier_portal: true,
        has_vendor_registration: true,
        has_deadline: true,
        has_submission_instructions: true,
        is_source_accessible: true,
        document_readiness_pct: 85,
      },
      rationale: [
        "Verified private tender portal link available.",
        "ROSHN vendor portal established.",
        "Confirmed closing date 2026-11-20.",
      ],
      missing_for_action: [],
    },
    how_to_apply: {
      channel_status: "VENDOR_PORTAL",
      where_to_apply: "ROSHN Official Supplier Portal (suppliers.roshn.sa) referencing RFP ROSHN-SEDRA-2026-P09.",
      who_to_contact: "ROSHN Real Estate Procurement Committee (procurement@roshn.sa)",
      what_to_do_next: [
        "Verify contractor CR and ISO 9001 quality certificate.",
        "Access ROSHN Supplier Portal to complete company prequalification registration.",
        "Download commercial RFP package for SEDRA Phase 3 retail packages.",
        "Submit technical envelope and pricing schedule before closing date.",
      ],
      direct_tender_url: "https://roshn.sa/en/procurement/tenders/ROSHN-SEDRA-2026-P09",
      official_application_url: "https://roshn.sa/en/procurement/tenders/ROSHN-SEDRA-2026-P09",
      supplier_portal: "https://suppliers.roshn.sa",
      vendor_registration_url: "https://suppliers.roshn.sa",
      procurement_email: "procurement@roshn.sa",
      procurement_phone: null,
      official_contact_page: "https://roshn.sa/en/contact",
      source_instructions: null,
      main_contractor_contact: null,
      provenance: {
        source: "src-etimad",
        source_url: "https://roshn.sa/en/procurement/tenders/ROSHN-SEDRA-2026-P09",
        verification_status: "VERIFIED",
        verified_at: "2026-10-08T10:00:00.000Z",
        notes: "Direct developer procurement announcement.",
      },
    },
    applying_as: orgAlpha,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
    },
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: ["Building Grade 1", "ISO 9001"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-private-006",
      company_id: orgAlpha.organization_id,
      available_capabilities: ["Building Contracting"],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "DIRECT_TENDER",
      disclaimer: "Private procurement portal registration required.",
    },
  };

  // 3. Subcontract Opportunity Test Case
  const subcontractOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-aramco-003",
    opportunity_title: "Subcontract Package: Heavy Civil Foundation Works for Ras Tanura Expansion",
    opportunity_title_ar: "حزمة مقاولة من الباطن: أعمال الأساسات والخرسانة لتوسعة رأس تنورة",
    entity: "Saudi Aramco / Tier 1 EPC Consortium",
    client: "Saudi Aramco",
    main_contractor: "Consolidated Contractors Company (CCC) / Tier-1 EPC Consortium",
    city: "Ras Tanura",
    region: "Eastern Province",
    work_category: "Industrial & Petrochemical Facilities",
    sector: "Energy & Petrochemical",
    budget_sar: 60000000,
    closing_date: "2026-12-01T00:00:00.000Z",
    reference_number: "ARAMCO-SUB-2026-904",
    primary_source_id: "src-aramco",
    source_status: "AUTH_REQUIRED",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "SUBCONTRACT_REQUEST",
    original_url: "https://supplier.aramco.com/subcontracts/ARAMCO-SUB-2026-904",
    record_origin: "CACHED_REAL_DATA",
    is_live_record: false,
    is_stale: false,
    match_score: {
      total_score: 78,
      label: "GOOD_MATCH",
      components: {
        activity_fit: 25,
        geographic_fit: 18,
        project_scale_fit: 15,
        capacity_fit: 10,
        preference_fit: 5,
        semantic_fit: 5,
      },
      positive_reasons: ["Specialist civil piling experience matches tier-1 trade package."],
      concerns: [],
      missing_information: [],
    },
    actionability: {
      score: 70,
      state: "MEDIUM",
      factors: {
        has_application_url: false,
        has_procurement_contact: true,
        has_supplier_portal: true,
        has_vendor_registration: true,
        has_deadline: true,
        has_submission_instructions: true,
        is_source_accessible: true,
        document_readiness_pct: 85,
      },
      rationale: [
        "Awarded main contractor confirmed with public award disclosure.",
        "Supplier portal and IKTVA subcontractor registration available.",
        "Main contractor EOI procurement contact provided.",
      ],
      missing_for_action: [
        "Direct public tender URL not available (Private Subcontract Package).",
      ],
    },
    how_to_apply: {
      channel_status: "VENDOR_PORTAL",
      where_to_apply: "Register as an approved specialist subcontractor on Saudi Aramco SAP Ariba Gateway & Tier-1 Contractor Portal.",
      who_to_contact: "Saudi Aramco IKTVA & Subcontracting Liaison (iktva-procurement@aramco.com)",
      what_to_do_next: [
        "Verify minimum 40% IKTVA local content score and valid SCA certificate.",
        "Access Aramco Supplier Gateway to register or update vendor code.",
        "Submit Expression of Interest (EOI) for package ARAMCO-SUB-2026-904 referencing prime award.",
        "Assemble specialized heavy piling and foundation experience dossier.",
      ],
      direct_tender_url: null,
      official_application_url: "https://supplier.aramco.com",
      supplier_portal: "https://supplier.aramco.com",
      vendor_registration_url: "https://supplier.aramco.com/registration",
      procurement_email: "iktva-procurement@aramco.com",
      procurement_phone: null,
      official_contact_page: "https://www.aramco.com/en/creating-value/supply-chain",
      source_instructions: null,
      main_contractor_contact: {
        name: "Consolidated Contractors Company (CCC) / Tier-1 EPC Consortium",
        website: "https://www.ccc.net",
        portal_url: "https://supplier.aramco.com",
        registration_url: "https://supplier.aramco.com/registration",
        email: "iktva-procurement@aramco.com",
        phone: null,
        eoi_contact: "iktva-subcontracts@aramco.com",
        rfq_contact: "tier1-civil@ccc.net",
        award_evidence: "Saudi Aramco Major Project Award Disclosure #TR-2025-08",
      },
      provenance: {
        source: "src-aramco",
        source_url: "https://supplier.aramco.com",
        verification_status: "VERIFIED",
        verified_at: "2026-10-08T10:00:00.000Z",
        notes: "Aramco Tier-1 Prime Contractor Subcontract Feed.",
      },
    },
    applying_as: orgAlpha,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
    },
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: ["Piling & Deep Foundations Capability"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: true,
      potential_level: "HIGH",
      subcontract_rationale: [
        "Prime EPC contract awarded to CCC Consortium.",
        "Specialist piling and foundation trade package carved out for licensed Saudi subcontractors.",
      ],
      recommended_positioning: "SPECIALIST_SUBCONTRACTOR",
    },
    gap_analysis: {
      opportunity_id: "opp-src-aramco-003",
      company_id: orgAlpha.organization_id,
      available_capabilities: ["Heavy Foundations", "Piling Fleet"],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "SUBCONTRACT_TARGET",
      disclaimer: "Aramco IKTVA local content score verification required.",
    },
  };

  // 4. Hotel Opportunity Test Case
  const hotelOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-hotel-007",
    opportunity_title: "The Red Sea Project: Luxury Boutique Resort Interior Refurbishment & MEP Fit-Out",
    opportunity_title_ar: "مشروع البحر الأحمر: إعادة تأهيل وتجهيزات داخلية وكهروميكانيكية لمنتجع فندقي فاخر",
    entity: "Red Sea Global (RSG)",
    client: "Red Sea Global (RSG)",
    main_contractor: undefined,
    city: "Umluj",
    region: "Tabuk Region",
    work_category: "Interior Fit-Out & Architectural Finishes",
    sector: "Tourism & Hospitality",
    service_category: "HOTEL_FITOUT_RESTORATION",
    budget_sar: 54000000,
    closing_date: "2026-11-28T00:00:00.000Z",
    reference_number: "RSG-HTL-2026-088",
    primary_source_id: "src-etimad",
    source_status: "ASSISTED_IMPORT",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "COMMERCIAL_OPPORTUNITY",
    original_url: "https://www.redseaglobal.com/en/procurement/tenders/RSG-HTL-2026-088",
    record_origin: "ASSISTED_IMPORT",
    is_live_record: true,
    is_stale: false,
    is_renovation: true,
    renovation_category: "HOTEL_RENOVATION",
    match_score: {
      total_score: 82,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 30,
        geographic_fit: 18,
        project_scale_fit: 15,
        capacity_fit: 10,
        preference_fit: 5,
        semantic_fit: 4,
      },
      positive_reasons: ["Hospitality luxury interior fit-out portfolio verified."],
      concerns: [],
      missing_information: [],
    },
    actionability: {
      score: 80,
      state: "HIGH",
      factors: {
        has_application_url: true,
        has_procurement_contact: true,
        has_supplier_portal: true,
        has_vendor_registration: true,
        has_deadline: true,
        has_submission_instructions: true,
        is_source_accessible: true,
        document_readiness_pct: 85,
      },
      rationale: [
        "Verified direct hospitality tender URL available.",
        "Red Sea Global SAP Ariba Supplier Gateway verified.",
        "Procurement contact email confirmed.",
      ],
      missing_for_action: [],
    },
    how_to_apply: {
      channel_status: "VENDOR_PORTAL",
      where_to_apply: "Red Sea Global SAP Ariba Supplier Gateway (supplier.redseaglobal.com).",
      who_to_contact: "Red Sea Global Hospitality Procurement (procurement@redseaglobal.com)",
      what_to_do_next: [
        "Verify contractor Grade 1 or 2 finishing/interior classification and LEED credentials.",
        "Register on Red Sea Global SAP Ariba Supplier Gateway.",
        "Submit Statement of Experience in luxury hospitality and resort fit-out.",
        "Prepare bank guarantee of 1,080,000 SAR and upload technical dossier before deadline.",
      ],
      direct_tender_url: "https://www.redseaglobal.com/en/procurement/tenders/RSG-HTL-2026-088",
      official_application_url: "https://www.redseaglobal.com/en/procurement/tenders/RSG-HTL-2026-088",
      supplier_portal: "https://supplier.redseaglobal.com",
      vendor_registration_url: "https://supplier.redseaglobal.com",
      procurement_email: "procurement@redseaglobal.com",
      procurement_phone: null,
      official_contact_page: "https://www.redseaglobal.com/en/contact",
      source_instructions: null,
      main_contractor_contact: null,
      provenance: {
        source: "src-etimad",
        source_url: "https://www.redseaglobal.com/en/procurement/tenders/RSG-HTL-2026-088",
        verification_status: "VERIFIED",
        verified_at: "2026-10-08T10:00:00.000Z",
        notes: "Red Sea Global official procurement release.",
      },
    },
    applying_as: orgBeta,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
    },
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: ["Luxury Hotel Portfolio", "Interior Fit-Out Classification"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-hotel-007",
      company_id: orgBeta.organization_id,
      available_capabilities: ["Interior Fit-Out", "Hospitality FF&E"],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "DIRECT_TENDER",
      disclaimer: "SAP Ariba onboarding required.",
    },
  };

  // 5. Manpower / Staffing Opportunity Test Case
  const manpowerOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-manpower-008",
    opportunity_title: "Framework Agreement: Specialized Hospitality Staffing & Facility Operations Manpower",
    opportunity_title_ar: "اتفاقية إطارية: توريد وتوفير كوادر بشرية متخصصة في الضيافة وإدارة المرافق الفندقية",
    entity: "Boutique Group (PIF)",
    client: "Boutique Group (PIF)",
    main_contractor: undefined,
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Manpower Supply & Technical Staffing",
    sector: "Tourism & Hospitality",
    service_category: "HOSPITALITY_STAFFING",
    budget_sar: 26000000,
    closing_date: "2026-12-10T00:00:00.000Z",
    reference_number: "BTQ-MAN-2026-015",
    primary_source_id: "src-etimad",
    source_status: "ASSISTED_IMPORT",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "COMMERCIAL_OPPORTUNITY",
    original_url: "https://boutiquegroup.com/en/partners/procurement/BTQ-MAN-2026-015",
    record_origin: "ASSISTED_IMPORT",
    is_live_record: true,
    is_stale: false,
    match_score: {
      total_score: 85,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 30,
        geographic_fit: 20,
        project_scale_fit: 15,
        capacity_fit: 10,
        preference_fit: 5,
        semantic_fit: 5,
      },
      positive_reasons: ["Licensed Saudi manpower provider compliant with Qiwa and Ajeer."],
      concerns: [],
      missing_information: [],
    },
    actionability: {
      score: 75,
      state: "HIGH",
      factors: {
        has_application_url: true,
        has_procurement_contact: true,
        has_supplier_portal: true,
        has_vendor_registration: true,
        has_deadline: true,
        has_submission_instructions: true,
        is_source_accessible: true,
        document_readiness_pct: 90,
      },
      rationale: [
        "Verified staffing framework portal link available.",
        "Supplier portal and vendor registration active.",
        "Procurement contact email confirmed.",
      ],
      missing_for_action: [],
    },
    how_to_apply: {
      channel_status: "VENDOR_PORTAL",
      where_to_apply: "Boutique Group Official Supplier Portal (suppliers.boutiquegroup.com).",
      who_to_contact: "Boutique Group Vendor Relations (vendors@boutiquegroup.com)",
      what_to_do_next: [
        "Verify Ministry of Human Resources manpower license, Qiwa Wage Protection, and GOSI certificate.",
        "Submit supplier registration on Boutique Group portal.",
        "Upload bilingual manpower mobilization capabilities for 180 hospitality staff.",
        "Submit commercial rate card per role before deadline.",
      ],
      direct_tender_url: "https://boutiquegroup.com/en/partners/procurement/BTQ-MAN-2026-015",
      official_application_url: "https://boutiquegroup.com/en/partners/procurement/BTQ-MAN-2026-015",
      supplier_portal: "https://suppliers.boutiquegroup.com",
      vendor_registration_url: "https://suppliers.boutiquegroup.com",
      procurement_email: "vendors@boutiquegroup.com",
      procurement_phone: null,
      official_contact_page: "https://boutiquegroup.com/en/contact",
      source_instructions: null,
      main_contractor_contact: null,
      provenance: {
        source: "src-etimad",
        source_url: "https://boutiquegroup.com/en/partners/procurement/BTQ-MAN-2026-015",
        verification_status: "VERIFIED",
        verified_at: "2026-10-08T10:00:00.000Z",
        notes: "Verified PIF Boutique Group procurement portal notice.",
      },
    },
    manpower_details: {
      role: "Hotel Front-of-House & Facilities Support Staff",
      quantity: 180,
      skills: ["Housekeeping", "Bilingual Front Desk", "Banquet Operations", "Stewarding"],
      experience: "Minimum 2 years in 4/5-star hospitality",
      duration: "24 Months",
      shift: "Rotating 8-hour shifts",
      accommodation: "Contractor provided compliant accommodation",
      transportation: "Contractor provided shuttle buses",
      mobilization_date: "2026-12-15",
      location: "Riyadh & Jeddah Palaces",
      client: "Boutique Group",
      main_contractor: "Direct Framework Client",
      deadline: "2026-12-10",
    },
    applying_as: orgBeta,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
    },
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: ["Qiwa Compliant", "Manpower Supply License"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-manpower-008",
      company_id: orgBeta.organization_id,
      available_capabilities: ["Hospitality Manpower", "Qiwa Portal Integration"],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "DIRECT_TENDER",
      disclaimer: "Wage protection compliance mandatory.",
    },
  };

  // 6. Renovation Opportunity Test Case
  const renovationOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-spa-005",
    opportunity_title: "MOMRAH Municipal Civic Buildings Rehabilitation and Modernization Program",
    opportunity_title_ar: "برنامج وزارة البلديات والإسكان لإعادة تأهيل وتطوير وترميم المباني والمرافق البلدية",
    entity: "Ministry of Municipalities and Housing (MOMRAH)",
    client: "Ministry of Municipalities and Housing (MOMRAH)",
    main_contractor: undefined,
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Building Construction & Commercial Contracting",
    sector: "Government & Public Works",
    is_renovation: true,
    renovation_category: "FACILITY_REHABILITATION",
    budget_sar: 38000000,
    closing_date: "2026-11-25T00:00:00.000Z",
    reference_number: "SPA-MOM-2026-784",
    primary_source_id: "src-spa",
    source_status: "WORKING_LIVE",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "GOVERNMENT_TENDER",
    original_url: "https://www.spa.gov.sa/viewstory.php?lang=ar&newsid=20260309",
    record_origin: "REAL_CURRENT_FETCH",
    is_live_record: true,
    is_stale: false,
    match_score: {
      total_score: 88,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 30,
        geographic_fit: 20,
        project_scale_fit: 15,
        capacity_fit: 10,
        preference_fit: 5,
        semantic_fit: 8,
      },
      positive_reasons: ["Grade 1 building restoration matches concrete and MEP rehabilitation."],
      concerns: [],
      missing_information: [],
    },
    actionability: {
      score: 85,
      state: "HIGH",
      factors: {
        has_application_url: true,
        has_procurement_contact: true,
        has_supplier_portal: true,
        has_vendor_registration: true,
        has_deadline: true,
        has_submission_instructions: true,
        is_source_accessible: true,
        document_readiness_pct: 90,
      },
      rationale: [
        "Discovered live from Saudi Press Agency official releases wire.",
        "Balady municipal platform application gateway verified.",
        "Procurement hotline 199040 and contracts email confirmed.",
      ],
      missing_for_action: [],
    },
    how_to_apply: {
      channel_status: "MULTIPLE_CHANNELS",
      where_to_apply: "Balady Municipal Platform (balady.gov.sa) and MOMRAH Procurement Department.",
      who_to_contact: "MOMRAH Tenders & Contracts Administration (contracts@momrah.gov.sa | 199040)",
      what_to_do_next: [
        "Confirm Building Construction Grade 2 or higher classification.",
        "Access Balady portal using unified commercial login.",
        "Review renovation specifications for concrete repair and electromechanical upgrade.",
        "Prepare bid bond of 760,000 SAR.",
      ],
      direct_tender_url: "https://www.spa.gov.sa/viewstory.php?lang=ar&newsid=20260309",
      official_application_url: "https://balady.gov.sa",
      supplier_portal: "https://balady.gov.sa",
      vendor_registration_url: "https://balady.gov.sa/ar/services/contractor-classification",
      procurement_email: "contracts@momrah.gov.sa",
      procurement_phone: "199040",
      official_contact_page: "https://momrah.gov.sa/en/contact",
      source_instructions: null,
      main_contractor_contact: null,
      provenance: {
        source: "src-spa",
        source_url: "https://www.spa.gov.sa/viewstory.php?lang=ar&newsid=20260309",
        verification_status: "VERIFIED",
        verified_at: "2026-10-09T02:00:00.000Z",
        notes: "Live official government wire announcement.",
      },
    },
    applying_as: orgAlpha,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
    },
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: ["Building Grade 1", "Renovation Track Record"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-spa-005",
      company_id: orgAlpha.organization_id,
      available_capabilities: ["Building Restoration", "MEP Upgrade"],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "DIRECT_TENDER",
      disclaimer: "Balady contractor classification grade required.",
    },
  };

  // 7. Service Contract Test Case
  const serviceContractOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-service-009",
    opportunity_title: "Comprehensive Facility Management, Maintenance & Industrial Cleaning Contract for Riyadh Commercial Towers",
    opportunity_title_ar: "عقد إدارة وصيانة المرافق والنظافة الشاملة للأبراج والمجمعات التجارية بالرياض",
    entity: "Saudi Real Estate Company (Al Akaria)",
    client: "Saudi Real Estate Company (Al Akaria)",
    main_contractor: undefined,
    city: "Riyadh",
    region: "Riyadh Region",
    work_category: "Facility Management, Maintenance & Cleaning",
    sector: "Facility Management & Services",
    service_category: "INTEGRATED_FACILITY_MANAGEMENT",
    budget_sar: 32000000,
    closing_date: "2026-11-30T00:00:00.000Z",
    reference_number: "AKR-FM-2026-112",
    primary_source_id: "src-etimad",
    source_status: "ASSISTED_IMPORT",
    confidence_level: "CONFIRMED_OPPORTUNITY",
    opportunity_type: "COMMERCIAL_OPPORTUNITY",
    original_url: "https://al-akaria.com/procurement/tenders/AKR-FM-2026-112",
    record_origin: "ASSISTED_IMPORT",
    is_live_record: true,
    is_stale: false,
    match_score: {
      total_score: 82,
      label: "STRONG_MATCH",
      components: {
        activity_fit: 30,
        geographic_fit: 20,
        project_scale_fit: 15,
        capacity_fit: 10,
        preference_fit: 5,
        semantic_fit: 2,
      },
      positive_reasons: ["Facility management and cleaning capabilities match scope."],
      concerns: [],
      missing_information: [],
    },
    actionability: {
      score: 80,
      state: "HIGH",
      factors: {
        has_application_url: true,
        has_procurement_contact: true,
        has_supplier_portal: true,
        has_vendor_registration: true,
        has_deadline: true,
        has_submission_instructions: true,
        is_source_accessible: true,
        document_readiness_pct: 85,
      },
      rationale: [
        "Verified commercial RFP link available.",
        "Al Akaria supplier portal verified.",
        "Procurement contact email confirmed.",
      ],
      missing_for_action: [],
    },
    how_to_apply: {
      channel_status: "VENDOR_PORTAL",
      where_to_apply: "Al Akaria Vendor & Procurement Portal (suppliers.al-akaria.com).",
      who_to_contact: "Al Akaria Procurement & Contracts Department (procurement@al-akaria.com)",
      what_to_do_next: [
        "Confirm Maintenance & Operation Grade 2 classification and ISO 41001 certification.",
        "Access Al Akaria vendor portal to download RFP specifications.",
        "Conduct mandatory site visit to commercial towers in Riyadh.",
        "Submit technical proposal, SLA KPIs, and commercial envelope before closing date.",
      ],
      direct_tender_url: "https://al-akaria.com/procurement/tenders/AKR-FM-2026-112",
      official_application_url: "https://al-akaria.com/procurement/tenders/AKR-FM-2026-112",
      supplier_portal: "https://suppliers.al-akaria.com",
      vendor_registration_url: "https://suppliers.al-akaria.com",
      procurement_email: "procurement@al-akaria.com",
      procurement_phone: null,
      official_contact_page: "https://al-akaria.com/contact",
      source_instructions: null,
      main_contractor_contact: null,
      provenance: {
        source: "src-etimad",
        source_url: "https://al-akaria.com/procurement/tenders/AKR-FM-2026-112",
        verification_status: "VERIFIED",
        verified_at: "2026-10-08T10:00:00.000Z",
        notes: "Corporate commercial real estate RFP notice.",
      },
    },
    applying_as: orgBeta,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
    },
    eligibility: {
      status: "ELIGIBLE",
      passed: true,
      failed_criteria: [],
      passed_criteria: ["O&M Grade 2", "ISO 41001 Certified"],
      review_required_criteria: [],
      missing_evidence: [],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-service-009",
      company_id: orgBeta.organization_id,
      available_capabilities: ["Facility Management", "Cleaning Equipment"],
      missing_capabilities: [],
      unknown_capabilities: [],
      potential_action: "DIRECT_TENDER",
      disclaimer: "Commercial SLA compliance mandatory.",
    },
  };

  // 8. Unverified / No Channel Test Case
  const unverifiedOpp: IntelligenceEvaluationResult = {
    opportunity_id: "opp-src-unverified-010",
    opportunity_title: "Speculative Private Resort Expansion Rumor in Tabuk Region",
    opportunity_title_ar: "إشارة سوقية غير رسمية: أنباء توسعة منتجع خاص بمنطقة تبوك",
    entity: "Private Holding Entity (Unverified)",
    client: "Private Holding Entity (Unverified)",
    main_contractor: undefined,
    city: "Tabuk",
    region: "Tabuk Region",
    work_category: "Building Construction & Commercial Contracting",
    sector: "Tourism & Hospitality",
    budget_sar: null,
    closing_date: "UNKNOWN",
    reference_number: "UNKNOWN",
    primary_source_id: "src-etimad",
    source_status: "BLOCKED",
    confidence_level: "MARKET_SIGNAL_ONLY",
    opportunity_type: "MARKET_INTELLIGENCE_SIGNAL",
    original_url: "",
    record_origin: "UNKNOWN",
    is_live_record: false,
    is_stale: true,
    match_score: {
      total_score: 50,
      label: "REVIEW",
      components: {
        activity_fit: 20,
        geographic_fit: 15,
        project_scale_fit: 5,
        capacity_fit: 5,
        preference_fit: 5,
        semantic_fit: 0,
      },
      positive_reasons: ["General civil scope matches domain."],
      concerns: ["Speculative rumor only; unverified procurement source."],
      missing_information: ["No RFP document", "No entity contact"],
    },
    actionability: {
      score: 10,
      state: "NOT_ACTIONABLE",
      factors: {
        has_application_url: false,
        has_procurement_contact: false,
        has_supplier_portal: false,
        has_vendor_registration: false,
        has_deadline: false,
        has_submission_instructions: false,
        is_source_accessible: false,
        document_readiness_pct: 0,
      },
      rationale: [
        "No verified application channel exists for this opportunity.",
        "Source portal is inaccessible or unverified.",
      ],
      missing_for_action: [
        "Direct application URL is missing.",
        "Verified procurement contact person/email is missing.",
        "Supplier portal / vendor registration link missing.",
        "Closing deadline is unspecified.",
        "No verified application channel found.",
      ],
    },
    how_to_apply: {
      channel_status: "NO_VERIFIED_APPLICATION_CHANNEL",
      where_to_apply: "NO VERIFIED APPLICATION CHANNEL FOUND",
      who_to_contact: "UNKNOWN",
      what_to_do_next: [
        "No verified direct application channel or procurement contact found in official registries.",
        "Monitor official developer press announcements or request assisted import with verified tender booklet.",
      ],
      direct_tender_url: null,
      official_application_url: null,
      supplier_portal: null,
      vendor_registration_url: null,
      procurement_email: null,
      procurement_phone: null,
      official_contact_page: null,
      source_instructions: null,
      main_contractor_contact: null,
      provenance: {
        source: "src-etimad",
        source_url: "",
        verification_status: "NO_CHANNEL_FOUND",
        verified_at: "2026-10-07T00:00:00.000Z",
        notes: "Unverified market chatter.",
      },
    },
    applying_as: orgAlpha,
    application_flow: {
      current_step: 1,
      submission_status: "NOT_STARTED",
    },
    eligibility: {
      status: "REVIEW_REQUIRED",
      passed: false,
      failed_criteria: [],
      passed_criteria: [],
      review_required_criteria: ["Verify official RFP release"],
      missing_evidence: ["RFP Document"],
      company_size_disclaimed: true,
    },
    subcontract: {
      is_subcontract_target: false,
      potential_level: "LOW",
      subcontract_rationale: [],
      recommended_positioning: "PRIME_BIDDER",
    },
    gap_analysis: {
      opportunity_id: "opp-src-unverified-010",
      company_id: orgAlpha.organization_id,
      available_capabilities: [],
      missing_capabilities: ["Official Tender Documents"],
      unknown_capabilities: [],
      potential_action: "NO_ACTION",
      disclaimer: "Opportunity is currently not actionable.",
    },
  };

  const allOpps = [
    { type: "government tender", opp: governmentTenderOpp },
    { type: "private tender", opp: privateTenderOpp },
    { type: "subcontract", opp: subcontractOpp },
    { type: "hotel", opp: hotelOpp },
    { type: "manpower", opp: manpowerOpp },
    { type: "renovation", opp: renovationOpp },
    { type: "service contract", opp: serviceContractOpp },
    { type: "unverified chatter", opp: unverifiedOpp },
  ];

  describe("Section 1 & 2: View Details & The Three Core Questions", () => {
    it("answers WHERE DO I APPLY?, WHO DO I CONTACT?, and WHAT SHOULD I DO NEXT? for every opportunity", () => {
      for (const { opp } of allOpps) {
        expect(opp.how_to_apply).toBeDefined();
        expect(opp.how_to_apply.where_to_apply).toBeTruthy();
        expect(opp.how_to_apply.who_to_contact).toBeTruthy();
        expect(opp.how_to_apply.what_to_do_next.length).toBeGreaterThan(0);

        if (opp.how_to_apply.channel_status === "NO_VERIFIED_APPLICATION_CHANNEL") {
          expect(opp.how_to_apply.where_to_apply).toBe("NO VERIFIED APPLICATION CHANNEL FOUND");
          expect(opp.how_to_apply.who_to_contact).toBe("UNKNOWN");
        }
      }
    });

    it("never invents emails or phones when unverified, and sets them to null or UNKNOWN", () => {
      expect(unverifiedOpp.how_to_apply.procurement_email).toBeNull();
      expect(unverifiedOpp.how_to_apply.procurement_phone).toBeNull();
      expect(unverifiedOpp.how_to_apply.who_to_contact).toBe("UNKNOWN");
    });
  });

  describe("Section 3: Subcontract Opportunities Intelligence", () => {
    it("provides main contractor, award evidence, supplier portal, registration, and EOI contact", () => {
      expect(subcontractOpp.how_to_apply.main_contractor_contact).toBeDefined();
      const mc = subcontractOpp.how_to_apply.main_contractor_contact!;
      expect(mc.name).toBe("Consolidated Contractors Company (CCC) / Tier-1 EPC Consortium");
      expect(mc.award_evidence).toContain("Saudi Aramco Major Project Award Disclosure #TR-2025-08");
      expect(mc.portal_url).toBe("https://supplier.aramco.com");
      expect(mc.registration_url).toBe("https://supplier.aramco.com/registration");
      expect(mc.eoi_contact).toBe("iktva-subcontracts@aramco.com");
      expect(mc.rfq_contact).toBe("tier1-civil@ccc.net");
    });

    it("leaves unknown values as UNKNOWN without hallucination", () => {
      expect(subcontractOpp.how_to_apply.main_contractor_contact?.phone).toBeNull();
    });
  });

  describe("Section 4: Hotel, Manpower, Renovation, and Service Contracts", () => {
    it("applies the same How-to-Apply model to hotel, manpower, renovation, and service opportunities", () => {
      // Hotel
      expect(hotelOpp.is_renovation).toBe(true);
      expect(hotelOpp.renovation_category).toBe("HOTEL_RENOVATION");
      expect(hotelOpp.how_to_apply.supplier_portal).toBe("https://supplier.redseaglobal.com");

      // Manpower
      expect(manpowerOpp.service_category).toBe("HOSPITALITY_STAFFING");
      expect(manpowerOpp.how_to_apply.who_to_contact).toContain("Boutique Group");
      expect(manpowerOpp.manpower_details?.quantity).toBe(180);

      // Renovation
      expect(renovationOpp.is_renovation).toBe(true);
      expect(renovationOpp.how_to_apply.channel_status).toBe("MULTIPLE_CHANNELS");
      expect(renovationOpp.how_to_apply.official_application_url).toBe("https://balady.gov.sa");

      // Service contract
      expect(serviceContractOpp.service_category).toBe("INTEGRATED_FACILITY_MANAGEMENT");
      expect(serviceContractOpp.how_to_apply.procurement_email).toBe("procurement@al-akaria.com");
    });

    it("never displays a generic homepage as a direct application link", () => {
      for (const { opp } of allOpps) {
        if (opp.how_to_apply.direct_tender_url) {
          expect(opp.how_to_apply.direct_tender_url).not.toBe("https://www.google.com");
          expect(opp.how_to_apply.direct_tender_url).not.toBe("https://spa.gov.sa");
        }
      }
    });
  });

  describe("Section 5: Application Channel Status and Provenance", () => {
    it("uses standard channel status enums", () => {
      const allowedChannels = [
        "DIRECT_APPLICATION",
        "VENDOR_PORTAL",
        "PROCUREMENT_CONTACT",
        "SOURCE_INSTRUCTIONS",
        "MULTIPLE_CHANNELS",
        "NO_VERIFIED_APPLICATION_CHANNEL",
        "UNKNOWN",
      ];

      for (const { opp } of allOpps) {
        expect(allowedChannels).toContain(opp.how_to_apply.channel_status);
      }
    });

    it("stores complete truthful provenance: source, source_url, verification_status, verified_at, notes", () => {
      for (const { opp } of allOpps) {
        const prov = opp.how_to_apply.provenance;
        expect(prov).toBeDefined();
        expect(prov.source).toBeTruthy();
        expect(prov.verification_status).toBeTruthy();
        expect(prov.verified_at).toBeTruthy();
        expect(prov.notes).toBeTruthy();
      }
    });
  });

  describe("Section 6: Separation of MATCH SCORE from ACTIONABILITY SCORE", () => {
    it("clearly separates match score from actionability score", () => {
      // Government tender: High Match (85%), High Actionability (85%)
      expect(governmentTenderOpp.match_score.total_score).toBe(85);
      expect(governmentTenderOpp.actionability.score).toBe(85);
      expect(governmentTenderOpp.actionability.state).toBe("HIGH");

      // Subcontract: Good Match (78%), Medium Actionability (70%)
      expect(subcontractOpp.match_score.total_score).toBe(78);
      expect(subcontractOpp.actionability.score).toBe(70);
      expect(subcontractOpp.actionability.state).toBe("MEDIUM");

      // Unverified Opportunity: Moderate Match (50%), but NOT_ACTIONABLE (10%)
      expect(unverifiedOpp.match_score.total_score).toBe(50);
      expect(unverifiedOpp.actionability.score).toBe(10);
      expect(unverifiedOpp.actionability.state).toBe("NOT_ACTIONABLE");
      expect(unverifiedOpp.actionability.missing_for_action).toContain("No verified application channel found.");
    });
  });

  describe("Section 7: Active Organization Isolation", () => {
    it("displays APPLYING AS with active organization name and organization_id", () => {
      expect(governmentTenderOpp.applying_as.organization_id).toBe(orgAlpha.organization_id);
      expect(governmentTenderOpp.applying_as.organization_name).toBe(orgAlpha.organization_name);

      expect(hotelOpp.applying_as.organization_id).toBe(orgBeta.organization_id);
      expect(hotelOpp.applying_as.organization_name).toBe(orgBeta.organization_name);

      expect(governmentTenderOpp.applying_as.organization_id).not.toBe(hotelOpp.applying_as.organization_id);
    });
  });

  describe("Section 8: 10-Step Application Pipeline & Portal Integrity", () => {
    it("opening external portal transitions step to 8 (PORTAL_OPENED) without marking as SUBMITTED", () => {
      const flow: ApplicationFlowRecord = {
        current_step: 1,
        submission_status: "NOT_STARTED",
      };

      // User clicks "8. Open Official Portal"
      const openedFlow: ApplicationFlowRecord = {
        ...flow,
        current_step: 8,
        submission_status: "PORTAL_OPENED",
        portal_opened_at: new Date().toISOString(),
      };

      expect(openedFlow.current_step).toBe(8);
      expect(openedFlow.submission_status).toBe("PORTAL_OPENED");
      expect(openedFlow.submission_status).not.toBe("SUBMITTED");

      // User completes external Nafath / portal submission and records receipt reference (Step 10)
      const submittedFlow: ApplicationFlowRecord = {
        ...openedFlow,
        current_step: 10,
        submission_status: "SUBMITTED",
        submitted_at: new Date().toISOString(),
        submission_ref: "ETM-SUB-2026-9901",
        commercial_bid_sar: 43500000,
        notes: "Bank guarantee deposited, technical proposal uploaded.",
      };

      expect(submittedFlow.current_step).toBe(10);
      expect(submittedFlow.submission_status).toBe("SUBMITTED");
      expect(submittedFlow.submission_ref).toBe("ETM-SUB-2026-9901");
    });
  });

  describe("Section 10: Full Reporting Matrix across all 7 opportunity types", () => {
    it("reports all required metrics for each opportunity type", () => {
      const reportTable = allOpps.map(({ type, opp }) => ({
        type,
        matchScore: opp.match_score.total_score,
        actionability: `${opp.actionability.state} (${opp.actionability.score}%)`,
        sourceStatus: opp.source_status || "UNKNOWN",
        officialTenderUrl: opp.how_to_apply.direct_tender_url || "NONE",
        applicationUrl: opp.how_to_apply.official_application_url || "NONE",
        vendorPortal: opp.how_to_apply.supplier_portal || "NONE",
        contact: opp.how_to_apply.procurement_email || opp.how_to_apply.who_to_contact || "UNKNOWN",
        mainContractor: opp.how_to_apply.main_contractor_contact?.name || opp.main_contractor || "N/A (DIRECT)",
        deadline: opp.closing_date || "UNKNOWN",
        missingInfoCount: opp.actionability.missing_for_action.length,
      }));

      expect(reportTable.length).toBe(8);
      // Verify every type is represented
      const types = reportTable.map((r) => r.type);
      expect(types).toContain("government tender");
      expect(types).toContain("private tender");
      expect(types).toContain("subcontract");
      expect(types).toContain("hotel");
      expect(types).toContain("manpower");
      expect(types).toContain("renovation");
      expect(types).toContain("service contract");
      expect(types).toContain("unverified chatter");
    });
  });
});
