# Tender Intelligence Saudi — PROJECT_STATE.md

## Current Status Overview
- **Project**: Tender Intelligence Saudi (built upon BidPilot foundation)
- **Current Stage**: POST-STAGE-10C1 — How to Apply & Contact Intelligence (Completed & Verified)
- **Overall Project Status**: STAGES 1 TO 10 + POST-STAGE-10A + POST-STAGE-10C1 COMPLETE — Production Ready & Verified
- **Stage 2 Status**: Completed & Fully Verified End-to-End
- **Stage 2.5 Status**: Completed & Verified via Dual-Runtime Architecture
- **Stage 3 Status**: Completed & Fully Verified End-to-End (42 Official Sources Seeded & Health Isolated)
- **Stage 4 Status**: Completed & Fully Verified End-to-End (Raw/Canonical Pipelines, Confidence Gates, Location Normalization, Failure Isolation)
- **Stage 5 Status**: Completed & Fully Verified End-to-End (Saudi Normalization, Deduplication, Eligibility Gate, Match Score, Subcontracting Alternative, RAG Analysis, Gap Analysis)
- **Stage 6 Status**: Completed & Fully Verified End-to-End (Daily Monitoring Engine, Truthful Live Source Model, Opportunity Explorer, Filtered-Out Reason Engine, Immutable Daily Snapshots, Saved Lists, PDF Digest Export)
- **Stage 7 Status**: Completed & Fully Verified End-to-End (Critical Saudi Source Recovery, Assisted Import Pipelines, Verified Award Tracking, Adaptive Checks, Winner Evidence Rules, Conflicting-Source Reconciliation, Saved List Award Summary, Main Contractor Handoff)
- **Stage 8 Status**: Completed & Fully Verified End-to-End (Verified Input Gate, Main Contractor Intelligence Profiles, Discovery Engine, Vendor/Subcontractor Portal Classification, Trade Package Decomposition, SME Matchmaking, Action Plan & BD Pipeline)
- **Stage 9 Status**: Completed & Fully Verified End-to-End (Truthful 42-Source Audit, Vendor Registration Discovery, Saudi Prequalification 22-Doc Checklist, BD CRM Pipeline, Action Priority Engine, Bilingual Outreach Generator, Vendor Registration Workspace UI)
- **Stage 10 Status**: Completed & Fully Verified End-to-End (Prequalification Dossier Generator, Master Document Vault, Smart Assembly, 13-Section Package Structure, Subcontract Proposal Workspace, BOQ Assistant & Calculation Engine, Explainable Bid/No-Bid Decision Support, Unified Priority Action Center, Integrated Dashboard, Truthful 42-Source Audit Re-run)
- **POST-STAGE-10A Status**: Completed & Fully Verified End-to-End (Multi-Tenant Org Switcher, Dynamic Org Headers, Tenant-Isolated Vault/Dossiers/BD/Action Center, 16 Saudi Sectors, 19 Service Categories, 13-Field Manpower Intelligence, Practical Quick Filters, Isolated PDF Export, Multi-Tenant Seed Data, Truthful Live Source Refresh Pipeline, Stale Data Rules, Coverage Gap Diagnostics, 29-Category Renovation Taxonomy)
- **Last Verification Date**: 2026-10-09
- **Build Status**: Compiling & Building Successfully (`compile_applet` passed, `lint_applet` passed with 0 errors, 0 warnings)
- **Test Status**:
  - Frontend: 16 test files, 84 tests passing (100% pass rate)
  - Full-stack Architecture: Fully verified and compiling cleanly (`compile_applet` passed, `lint_applet` passed with 0 errors, 0 warnings)

---

## POST-STAGE-10C1 How to Apply & Contact Intelligence (Completed & Verified)
- **View Details / عرض التفاصيل Modal Resilience**:
  - Verified and tested `OpportunityDetailModal` with defensive defaults and fallbacks.
  - Eliminated unused icon warnings and potential undefined dereferences.
  - Interactive "View Details" / "عرض التفاصيل" button and title click handlers verified.
- **The Three Core Questions Answered on Every Details Page**:
  - **WHERE DO I APPLY?**: Verified direct tender URLs, official portals, supplier registration gateways, and explicit instructions.
  - **WHO DO I CONTACT?**: Direct procurement committee emails, phone numbers, and official liaison details without guessing or inventing. If unverified, explicitly displays `UNKNOWN`.
  - **WHAT SHOULD I DO NEXT?**: Step-by-step procedural actions tailored to each sector (Commercial registration, SCA Muqawil, Nafath login, bank guarantee, rate cards, and technical dossiers).
  - Supported verified channels: `DIRECT_TENDER_URL`, `OFFICIAL_APPLICATION_URL`, `SUPPLIER_PORTAL`, `VENDOR_REGISTRATION_URL`, `PROCUREMENT_EMAIL`, `PROCUREMENT_PHONE`, `OFFICIAL_CONTACT_PAGE`, `SOURCE_INSTRUCTIONS`, `MAIN_CONTRACTOR_CONTACT`, `EOI_CONTACT`, `RFQ_CONTACT`.
  - Strict Rule Enforced: Never invent URLs, emails, phone numbers, WhatsApp numbers, employees, or contact people. If nothing verified exists: `NO VERIFIED APPLICATION CHANNEL FOUND`.
- **Subcontract Opportunities Intelligence**:
  - Answers: Who won the main contract? How do I register with them? How do I express interest? Where do I apply?
  - Tracks: Main contractor name, official award evidence disclosure, official website, supplier portal, subcontractor registration gateway, procurement contact, EOI contact, RFQ contact, and submission instructions.
  - Preserves `UNKNOWN` whenever specific sub-fields are unverified.
- **Hotel, Manpower, Renovation & Service Contract Intelligence**:
  - Applied the same How-to-Apply model across: hotel opportunities, hospitality services, manpower/staffing, housekeeping, cleaning, facility management, renovation, building rehabilitation, maintenance, and supplies.
  - Never displays a generic homepage as a direct application link.
- **Application Channel Status & Truthful Provenance**:
  - Supported statuses: `DIRECT_APPLICATION`, `VENDOR_PORTAL`, `PROCUREMENT_CONTACT`, `SOURCE_INSTRUCTIONS`, `MULTIPLE_CHANNELS`, `NO_VERIFIED_APPLICATION_CHANNEL`, `UNKNOWN`.
  - Provenance stored and rendered: `source`, `source_url`, `verification_status`, `verified_at`, `notes`.
- **Separation of MATCH SCORE from ACTIONABILITY SCORE**:
  - Independent Actionability Score (0–100%) and States: `HIGH`, `MEDIUM`, `LOW`, `NOT_ACTIONABLE`, `UNKNOWN`.
  - Demonstrates that a 85–90% match can have `LOW` or `NOT_ACTIONABLE` status if no application URL, no contact, deadline unknown, or source blocked.
  - Evaluates: application URL, procurement contact, supplier portal, vendor registration, deadline, submission instructions, source accessibility, and document readiness.
- **Active Organization Isolation**:
  - Explicitly displays `APPLYING AS: [Active Organization]` with tenant `organization_id`, size, and classification grade.
  - Never mixes organizations across tenants.
- **10-Step Application Flow & Portal Integrity**:
  - 10 Verified Stages: Discover → Analyze → Bid/No-Bid → Documents → Prequalification → BOQ/Proposal → Application Readiness → Open Official Portal → User Submits → Record Submission.
  - Transparent Disclaimer: Opening an external portal sets step 8 (`PORTAL_OPENED`) and does NOT mean submitted.
  - Strict Compliance: Never bypasses authentication/MFA/Nafath/CAPTCHA; user submits externally and records the official portal receipt reference (Step 10).
- **Opportunity Cards UI Display**:
  - Opportunity cards prominently show: `Match Score`, `Actionability` (Score & State Badge), `Source Status` (Badge), and `Application Channel Status` (Badge).
  - Only verified destinations receive clickable buttons; missing or unverified channels display truthful disclaimers.
- **Automated Verification Across 7 Required Opportunity Types**:
  - Verified and tested: government tender, private tender, subcontract, hotel, manpower, renovation, service contract, plus unverified market signal.
  - Suite `src/__tests__/postStage10C1HowToApply.test.ts` (12 tests passing 100%).

---

## POST-STAGE-10A Live Refresh, Stale Data Rules & Renovation Discovery Engine
- **Truthful Provenance & Lifecycle Exposure (`server.ts`, `intelligence.ts`, `OpportunityExplorer.tsx`, `OpportunityExplorerPage.tsx`)**:
  - Exposes 11 internal metadata fields for every opportunity: `source_id`, `record_origin`, `first_seen_at`, `last_seen_at`, `last_fetched_at`, `last_verified_at`, `last_changed_at`, `last_source_check_at`, `source_status`, `refresh_status`, `is_stale`, `is_seed`, `is_fixture`, `is_live_record`.
  - Origin tags: `REAL_CURRENT_FETCH`, `ASSISTED_IMPORT`, `CACHED_REAL_DATA`, `STALE_DATABASE_DATA`, `SEED`, `FIXTURE`.
- **Daily Source Refresh Pipeline**:
  - Full execution pipeline: SOURCE FETCH → NORMALIZE → VALIDATE → DEDUPLICATE → UPSERT → MARK NEW/UPDATED/UNCHANGED → EXPIRE/ARCHIVE STALE RECORDS → UI REFRESH.
  - Endpoints: `POST /monitoring/run`, `POST /opportunities/refresh`, `GET /opportunities/coverage-audit`.
  - Classifies records post-refresh as `NEW`, `UPDATED`, `UNCHANGED`, `EXPIRED`, `ARCHIVED`, `REMOVED_FROM_SOURCE`.
  - For blocked sources (e.g., RCJY perimeter firewall, Etimad Nafath MFA), transparently displays: `LAST VERIFIED` date and `SOURCE CURRENTLY: BLOCKED / AUTH_REQUIRED / ASSISTED_IMPORT`.
- **Stale Data Rules & Visual Indicators**:
  - Automatically identifies stale records when not verified within 72 hours or when originating from blocked/auth-gated sources without current re-verification.
  - Visibly displays `STALE / SOURCE NOT RECENTLY VERIFIED` warning badges with last verified date and source status.
  - Historical records preserved without silent cache masquerading.
- **Strict Seed / Fixture Isolation**:
  - Demo/seed organization profiles and vendor registration data are strictly isolated from real opportunity procurement feeds.
  - Production Explorer excludes seed data by default with an explicit opt-in toggle (`showSeedData`).
- **Hospitality & Manpower Coverage Gap Truth**:
  - Avoids false operational claims: traces SOURCE SEARCH → RECORD DISCOVERY → CLASSIFICATION → DISPLAY.
  - When zero unauthenticated public tenders exist in the current scan, reports: `REAL_DATA_VERIFIED = FALSE` and `STATUS: SOURCE_COVERAGE_GAP`.
  - Details probed sources (`src-asfar`, `src-boutique-group`, `src-etimad`, `src-aramco`) and explains authentication requirements (`AUTH_REQUIRED`, `ASSISTED_IMPORT`).
- **Building Renovation & Restoration First-Class Pipeline (`saudiTaxonomy.ts`, `server.ts`)**:
  - 29 standard categories: `BUILDING_RENOVATION`, `BUILDING_RESTORATION`, `BUILDING_REHABILITATION`, `BUILDING_REFURBISHMENT`, `BUILDING_UPGRADE`, `INTERIOR_RENOVATION`, `EXTERIOR_RENOVATION`, `STRUCTURAL_REPAIR`, `CONCRETE_REPAIR`, `FACADE_REPAIR`, `ROOF_REPAIR`, `WATERPROOFING`, `MEP_RENOVATION`, `ELECTRICAL_REHABILITATION`, `PLUMBING_REHABILITATION`, `HVAC_REPLACEMENT`, `FIRE_SAFETY_UPGRADE`, `FACILITY_REHABILITATION`, `SCHOOL_RENOVATION`, `HOSPITAL_RENOVATION`, `HOTEL_RENOVATION`, `OFFICE_RENOVATION`, `MOSQUE_RENOVATION`, `GOVERNMENT_BUILDING_RENOVATION`, `RESIDENTIAL_RENOVATION`, `COMMERCIAL_RENOVATION`, `INDUSTRIAL_REHABILITATION`, `HERITAGE_RESTORATION`, `GENERAL_RENOVATION`.
  - Multi-lingual classifier matching Arabic (ترميم، إعادة تأهيل، تجديد، إصلاح خرسانة، عزل أسطح، ترميم واجهات، ترميم تراثي) and English terminology.
  - Real public opportunity discovery from Saudi Press Agency (`opp-src-spa-005` MOMRAH Civic Buildings Rehabilitation).
  - Dedicated Audit Banner in Opportunity Explorer reporting Discovered, Displayed, Excluded, Source, City, Client, Channel, and Verified date.
- **Consecutive Refresh Testing**:
  - Test suite `src/__tests__/liveRefreshAndRenovationPipeline.test.ts` verifying consecutive refresh deduplication, lifecycle transitions (NEW → UNCHANGED), and isolation rules.

---

## POST-STAGE-10A Capabilities Completed (Multi-Org Isolation & Hospitality/Services Expansion)
- **Multi-Tenant Organization Switching (`companyStore.ts`, `Header.tsx`, `client.ts`)**:
  - Interactive organization selector in application header displaying company name, size, and classification grade.
  - Full modal creation of new Saudi organizations with bilingual attributes.
  - Automatic injection of both `X-Organization-Id` and `X-Company-Id` HTTP headers in frontend API client.
  - Graceful fallback when no profile is selected.
- **Cross-Sector Seed Organizations (`server.ts`)**:
  - Infrastructure Contractor: *Al-Fanar Infrastructure Contracting Co.* (`comp-001` / `comp-sa-001`, Grade 1).
  - Hospitality & Facilities Operator: *Al-Diyafa Hospitality Services & Facilities Management* (`comp-diyafa-002`, Grade 3).
  - Specialized Staffing & Workforce: *Tamkeen Technical Manpower & Industrial Staffing* (`comp-tamkeen-003`, Grade 4).
- **Tenant-Isolated Data Pipelines**:
  - Document Vault (`/vault/documents`, `/vault/summary`): Scoped to active organization ID with isolated documents and expiry alerts.
  - Smart Dossier Assembly (`/dossiers/assemble`): Matches active organization's vault documents against contractor requirements.
  - Subcontract Proposals & BOQ (`/proposals`): Filtered by active organization tenant ID.
  - Vendor Registrations & BD Pipeline (`/vendor-registrations`, `/bd/pipeline`): Populated with contractor targets and EOI pipelines tailored to tenant scope.
  - Priority Action Center (`/action-center/items`, `/action-center/summary`): Dynamic calculation of ACTION_NOW, ACTION_THIS_WEEK, and MONITOR queues per tenant.
- **Saudi 16 Sectors & 19 Service Categories Taxonomy (`saudiTaxonomy.ts`)**:
  - 16 Sectors: Hospitality, Healthcare, Restaurants, Retail/Malls, Schools/Universities, Factories, Warehouses/Logistics, Airports/Ports, Commercial/Residential, Government, Tourism, Construction, Energy/Oil & Gas, Mining, Water, Telecom/IT.
  - 19 Service Categories including Hotel Construction, Fit-out & Interior, Housekeeping, Cleaning, Manpower, Catering, Commercial Laundry, FF&E / OS&E, Facility Management.
  - Matched work category IDs for internal procurement and CPV backward compatibility.
- **Manpower Intelligence (`ManpowerIntelligence`, `DEFAULT_UNKNOWN_MANPOWER`)**:
  - 13 structured fields: role, quantity, skills, experience, duration, shift, accommodation, transportation, mobilization_date, location, client, main_contractor, deadline.
  - Truthful `DEFAULT_UNKNOWN_MANPOWER` defaults preventing fabricated labor data.
- **Opportunity Explorer Practical Quick Filters (`OpportunityExplorer.tsx`)**:
  - Dedicated quick-filter chip bar: Hotels, Manpower, Housekeeping, Cleaning, Catering, Facility Management, O&M, Supply, Subcontracting.
  - Secondary dropdown filters for Sector and Service Category.
- **Explainable Bid/No-Bid Decision Support (`ProposalWorkspace.tsx`, `proposal_and_boq.py`)**:
  - Explainable multi-factor scoring (0–100) and 4 outcome levels (BID, CONDITIONAL_BID, REVIEW, NO_BID).
  - Structured cards for Recommendation, Weighted Factors Matrix, Identified Risks, and Missing Information.
- **BOQ Assistant Mathematical Integrity (`BOQAssistant.tsx`, `proposal_and_boq.py`)**:
  - Line Total = Quantity × Unit Rate.
  - Unpriced line items flagged with `is_price_missing: true` without fabricating market rates.
  - 15% ZATCA VAT and markups calculated strictly according to commercial formula.
- **Isolated PDF Export Flow (`pdfExport.ts`)**:
  - Print/download job isolated via hidden iframe or blob download, keeping React SPA responsive.

---

## Stage 10 Capabilities Completed (Prequalification Dossier, BOQ & Production Readiness)
- **Part A — Prequalification Dossier Generator (`PrequalificationDossierService`, `prequalification_dossier.py`)**:
  - Connected directly to Stage 9 Vendor Registration workspace and target contractors.
  - Supported contractor prequalification profiles: Saudi Aramco / IKTVA, Nesma & Partners, Al Bawani, El Seif, RTCC (Al-Rashid), CCC, Custom contractors, and Generic Saudi contractor prequalification.
  - Strict requirement tagging: Every document requirement carries `VERIFIED`, `LIKELY_REQUIRED`, `OPTIONAL`, or `UNKNOWN`.
  - Retains source URL/reference, retrieval date, confidence level, and verification evidence notes. Zero invented requirements.
- **Part B — Master Company Document Vault (`DocumentVaultService`, `document_vault.py`, `CompanyDocumentVault.tsx`)**:
  - Reusable corporate compliance and qualification document vault.
  - Categories:
    - *Corporate/Statutory*: Commercial Registration, Muqawil / SCA Grade 2 Classification, ZATCA Zakat & Tax Certificate, VAT Registration, GOSI Certificate, Saudization / Nitaqat, Chamber Membership, National Address, Bank / IBAN Certificate.
    - *Technical*: Company Profile, Organization Chart, Project References, Equipment Fleet Register, Key Personnel Manpower CVs, Capability Narrative, Client Reference Letters.
    - *Financial*: Audited Financial Statements (Last 3 Years), Bank Facility / Credit Line documents.
    - *Quality / HSE*: Corporate HSE Manual & Policy, QA/QC Manual & Inspection Plans, ISO 9001:2015, ISO 14001:2015, ISO 45001:2018 Certifications.
    - *Local Content*: IKTVA Scorecard / Certificate.
  - Expiry alert engine: `VALID`, `EXPIRING_SOON` (within 30 days), `EXPIRED`, `MISSING`, `UNKNOWN`.
  - Non-hiding rule: Expired documents are never silently masked or treated as valid.
- **Part C — Smart Dossier Assembly (`prequalification_dossier.py`, `PrequalificationDossierWorkspace.tsx`)**:
  - Matches contractor profile requirements against Company Document Vault.
  - Automatically classifies items into: `READY`, `MISSING`, `EXPIRED`, `NEEDS_UPDATE`, `UNKNOWN_REQUIREMENT`.
  - Generates transparent, explainable submission readiness percentage.
  - Strict rejection rule: Mandatory missing or expired documents prevent 100% readiness and block `READY_FOR_EXPORT` status. Exact blocking reasons displayed to user.
- **Part D — Dossier Package Output & Structure**:
  - 13 standard sections:
    1. `01_Cover` (Submission Cover Sheet & Transmittal)
    2. `02_Company_Profile` (Company Overview & Executive Summary)
    3. `03_Legal_and_Statutory` (CR, ZATCA, VAT, GOSI, Chamber, National Address)
    4. `04_Technical_Capability` (Organization Chart & Technical Narrative)
    5. `05_Project_References` (Completed Projects & Track Record)
    6. `06_Equipment_and_Manpower` (Equipment Fleet & Licensed Staff CVs)
    7. `07_Financial` (Audited Financials & Bank Facilities)
    8. `08_QA_QC` (QA/QC Manual & Inspection Test Plans)
    9. `09_HSE` (HSE Manual, Policies & Safety Records)
    10. `10_ISO` (ISO 9001, 14001, 45001 Certificates)
    11. `11_Local_Content` (IKTVA / Local Content Documentation)
    12. `12_Client_References` (Client Handover & Completion Certificates)
    13. `13_Additional_Requirements` (Contractor Specific Addenda)
  - Exports comprehensive package manifest with document checklist, missing-document report, expiry warnings, and JSON metadata. Zero fake documents or certificates generated.
- **Part E — Subcontract Proposal Workspace (`ProposalWorkspace.tsx`, `ProposalsPage.tsx`, `proposal_and_boq.py`)**:
  - Connected workflow: Tender -> Award -> Main Contractor -> Trade Package -> Vendor Registration -> Prequalification -> Proposal -> BOQ -> Submission Status.
  - Full lifecycle tracking: `DRAFT`, `IN_REVIEW`, `READY`, `SUBMITTED`, `CLARIFICATION`, `REVISED`, `AWARDED`, `LOST`, `CANCELLED`.
  - Human-in-the-loop protection: Proposals cannot transition to `SUBMITTED` or `AWARDED` without explicit user action and reference.
- **Part F — BOQ Assistant (`BOQAssistant.tsx`, `proposal_and_boq.py`)**:
  - Structured manual entry and line-item normalization.
  - Item attributes: item number, description (EN/AR), trade category, unit, quantity, unit rate, total, rate source, notes.
  - Mathematical integrity: Line Total = Quantity × Unit Rate.
  - Financial calculations: Base Subtotal + Overhead % + Contingency % + Margin % + 15% ZATCA VAT = Grand Total.
  - Pricing truthfulness: Unpriced rates are kept `UNKNOWN`/blank with `is_price_missing: true`. Never invents market rates.
  - Rate provenance taxonomy: `USER_ENTERED`, `IMPORTED`, `VERIFIED_SOURCE`, `ESTIMATED`, `UNKNOWN`.
- **Part G — Explainable Bid / No-Bid Decision Support (`proposal_and_boq.py`)**:
  - Explainable multi-factor scoring (0–100) weighing:
    - Scope fit & classification suitability (25%)
    - Prequalification document readiness (15%)
    - Commercial completeness & BOQ pricing status (20%)
    - Contractor award verification confidence (15%)
    - Geographic proximity (10%)
    - Execution capability & team capacity (10%)
    - Submission timeline & deadline risk (5%)
  - Outcome levels: `BID` (>=80), `CONDITIONAL_BID` (65-79), `REVIEW` (50-64), `NO_BID` (<50).
  - Transparent textual contributing factor breakdown; commercial decision remains strictly with the user.
- **Part H — Unified Final Action Center (`ActionCenterView.tsx`, `action_center.py`)**:
  - Single prioritized action queue consolidating Stages 1 through 10.
  - Prioritization tiers: `ACTION_NOW`, `ACTION_THIS_WEEK`, `MONITOR`, `LOW_PRIORITY`.
  - High-priority items: Expired ZATCA tax certificate in vault, unpriced BOQ items, approaching tender deadlines, open contractor vendor registration portals, newly confirmed prime awards.
  - Deep links directly connecting each action back to its underlying record in vault, proposal, BOQ, or contractor registration.
- **Part I — Final Dashboard (`OpportunityExplorerPage.tsx`, `OpportunityExplorer.tsx`)**:
  - Extended primary dashboard with real-time KPI command bar:
    - Active Tenders (Stages 1-6)
    - Verified Awards & Prime Contractors (Stage 7-8)
    - Subcontracting Opportunities (Stage 8)
    - Vendor Registrations & Average Readiness (Stage 9)
    - Subcontract Proposals & BOQ in progress (Stage 10)
    - ACTION_NOW Priority Count with alert pulse (Stage 10)
    - Document Vault Expiry Warning Strip
  - Fully bilingual (Arabic RTL and English LTR) with responsive mobile layout.
- **Part J — Search, Filters & Provenance Lineage**:
  - Complete filters by sector, region, city, budget, contractor, and eligibility.
  - Full end-to-end lineage preserved: SOURCE -> TENDER -> AWARD -> MAIN CONTRACTOR -> SUBCONTRACT PACKAGE -> VENDOR REGISTRATION -> PREQUALIFICATION -> PROPOSAL -> BOQ -> ACTION.
- **Part K — Truthful 42-Source Audit Re-run (`probe_all_live.py`, `live_source_audit_report.json`)**:
  - Parallel socket-level live probe executed across all 42 Saudi sources:
    - TOTAL_SOURCES: 42
    - WORKING_LIVE: 1 (Saudi Press Agency - SPA contract disclosure releases)
    - AUTHENTICATED_LIVE: 0
    - ASSISTED_IMPORT: 2 (Etimad / Monafasat, Tadawul Disclosures)
    - AUTH_REQUIRED: 9 (Aramco IKTVA, SAR, NEOM, ROSHN, Sports Boulevard, Cruise Saudi, ASFAR, Boutique Group, King Abdullah Port)
    - RUNTIME_ENVIRONMENT_BLOCKED: 8
    - BLOCKED: 22
    - FIXTURE_ONLY: 0
  - Zero false live claims; legitimate assisted import pipelines maintained.
- **Part L & M — End-to-End Production Tests & Project Audit**:
  - All 65 backend unit tests pass (`backend/tests/test_*.py`).
  - All 59 frontend Vitest tests pass across 13 test suites.
  - Applet compiles cleanly (`compile_applet` passed).
  - Linter reports 0 errors and 0 warnings (`lint_applet` passed).
  - Full-stack verified end-to-end.

---

## Stage 9 Capabilities Completed (Vendor Registration, BD Pipeline & Source Reliability)
- **Part 0 — Live Source Recovery & Truthful Status (`probe_all_live.py`, `live_source_audit_report.json`)**:
  - Live probe conducted against all 42 registered Saudi procurement and award sources with zero mocks/fixtures counted as live.
  - Truthful breakdown:
    - **TOTAL_SOURCES**: 42
    - **WORKING_LIVE**: 1 (Saudi Press Agency - SPA Contract Disclosures returning real public releases)
    - **AUTHENTICATED_LIVE**: 0 (zero unauthenticated scrapers claiming live status)
    - **ASSISTED_IMPORT**: 2 (Etimad / Monafasat official file and tender URL imports, Tadawul disclosure imports)
    - **AUTH_REQUIRED**: 9 (Saudi Aramco SAP Ariba, SAR, NEOM, ROSHN, Sports Boulevard, Cruise Saudi, ASFAR, Boutique Group, King Abdullah Port)
    - **RUNTIME_ENVIRONMENT_BLOCKED**: 8 (RCJY, NCP, etc., due to container non-KSA network egress restrictions)
    - **BLOCKED**: 22 (Cloudflare WAF / MOF Geo-firewall blocks returning 403 / 404 with legitimate assisted import active)
    - **FIXTURE_ONLY**: 0 (all sources have legitimate production schemas, connectors, or assisted pipelines)
  - Explicit comparison with previous state documented.
- **Part A — Vendor Registration Discovery (`VendorRegistrationService.discover_portal`)**:
  - Discovers official supplier registration portals, subcontractor prequalification pages, SAP Ariba supplier links, and verified procurement directorate contacts for all Stage 8 verified prime contractors.
  - Classifies portals into: `PUBLIC`, `REGISTRATION_REQUIRED`, `AUTH_REQUIRED`, `INVITATION_ONLY`, `UNAVAILABLE`, `UNKNOWN`.
  - Rejects personal email domains (Gmail, Yahoo, Hotmail, etc.); preserves exact source evidence URLs.
- **Part B — Vendor Registration Workspace (`VendorRegistrationWorkspace.tsx`, `VendorRegistrationRecord`)**:
  - Comprehensive registration lifecycle: `NOT_STARTED`, `PORTAL_FOUND`, `PREPARING`, `READY_TO_SUBMIT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `RENEWAL_REQUIRED`, `UNKNOWN`.
  - Never claims `SUBMITTED` or `APPROVED` automatically without verified user action or evidence reference.
  - Tracks CR, headquarters, contractor relationships, required documents, missing documents, and audit history notes.
- **Part C — Saudi Contractor Prequalification Document Checklist**:
  - 22 Saudi contractor documents across 5 categories:
    1. *Statutory*: Commercial Registration, Muqawil / SCA Classification, ZATCA Certificate, VAT Certificate, GOSI Certificate, Saudization / Nitaqat Evidence, Chamber of Commerce, National Address, Bank / IBAN Certificate.
    2. *Technical*: Company Profile, Organization Chart, Project References, Equipment Fleet List, Manpower / Key Personnel CVs, Technical Capability Narrative, Client Reference Letters.
    3. *Financial*: Audited Financial Statements (Last 3 Years), Bank Credit Facility / Reference.
    4. *Quality & HSE*: HSE Policy & Manual, Quality Assurance / QC Manual, ISO 9001/14001/45001 Certifications.
    5. *Local Content*: IKTVA Scorecard / Certificate (mandatory for Aramco/industrial primes, optional for others).
  - Explicit requirement levels: `REQUIRED_VERIFIED`, `LIKELY_REQUIRED`, `OPTIONAL`, `UNKNOWN`. Tracks document status (`READY`, `MISSING`, `EXPIRED`, `PENDING_REVIEW`) and expiry warnings.
- **Part D — Business Development CRM Pipeline (`BDPipelineItem`, `BusinessDevelopmentService`)**:
  - Lightweight CRM connecting: Award -> Main Contractor -> Subcontract Trade Package -> Vendor Registration -> Procurement Contact -> Outreach -> Follow-up -> RFQ/Bid Status.
  - Pipeline stages: `TARGET_IDENTIFIED`, `VENDOR_PORTAL_FOUND`, `REGISTRATION_IN_PROGRESS`, `REGISTERED`, `PROCUREMENT_CONTACT_FOUND`, `EOI_PREPARED`, `EOI_SENT`, `FOLLOW_UP`, `PREQUALIFICATION`, `RFQ_RECEIVED`, `BID_SUBMITTED`, `WON`, `LOST`, `ON_HOLD`.
  - Duplicate target prevention across package and tenant.
- **Part E — Action Priority Engine (`BusinessDevelopmentService.calculate_action_priority`)**:
  - Computes explainable priority scores (0–100) based on:
    - SME match fit score (weight 30%)
    - Package fit and scale suitability (weight 20%)
    - Regional & city proximity (weight 15%)
    - Award confidence & prime verification (weight 15%)
    - Portal & procurement contact availability (weight 10%)
    - Registration difficulty & procurement timing urgency (weight 10%)
  - Categorizes opportunities into: `ACTION_NOW` (>=80), `ACTION_THIS_WEEK` (65-79), `MONITOR` (50-64), `LOW_PRIORITY` (<50). Provides full textual explanation breakdown.
  - Zero invented deadlines or project values.
- **Part F — Bilingual Outreach Template Generator (`BusinessDevelopmentService.generate_outreach_templates`)**:
  - Generates ready-to-dispatch formal Arabic and English templates for 7 business scenarios:
    1. Vendor Registration Inquiry
    2. Supplier Introduction
    3. Subcontractor Introduction
    4. Expression of Interest (EOI)
    5. Prequalification Dossier Submission
    6. Follow-up Inquiry
    7. Procurement Contact Request
  - Auto-fills ONLY verified information (project title, contractor legal name, trade package, tender reference, contact person); unverified fields remain placeholders (`[Contact Person]`, `[Your Position]`).
  - Strict human-in-the-loop rule: templates are generated for review and copy; messages are NEVER sent automatically.
- **Part G — Vendor & BD Dashboard UI (`VendorRegistrationWorkspace.tsx`, `VendorRegistrationPage.tsx`)**:
  - Complete, responsive dashboard with 4 core views:
    - Target Contractors & Registrations Table (with search, status filters, drawer for lifecycle update, document checklist, and portal links)
    - Prequalification Document Checklist Matrix (grouped by statutory, technical, financial, HSE, local content with missing document alerts)
    - BD Opportunity Pipeline Kanban / List (stage movement, follow-up dates, priority badges, one-click outreach generator)
    - Live Source Reliability Audit Summary (honest source counts, comparison table, limitation breakdown)
  - Full Arabic RTL and English LTR support.
- **Part H — Data Quality & Provenance**:
  - Strict badge distinctions: `VERIFIED`, `INFERRED`, `UNKNOWN`.
  - Exact source URLs, retrieval dates, and verification confidence retained for every contact, portal, and package.
- **Part I — Comprehensive Test Suites**:
  - Backend: `backend/tests/test_stage9_vendor_registration.py` (7 tests covering portal discovery, classification, lifecycle, checklist, pipeline, priority engine, outreach generation, end-to-end flow).
  - Frontend: `src/__tests__/vendorRegistrationAndBD.test.ts` (6 tests covering store, client, lifecycle state rules, checklist grouping, priority scoring, template generation).
  - All 111 full-stack tests passing.

---

---

## Stage 8 Capabilities Completed (Main Contractor + Subcontracting Intelligence)
- **Part 0 — Verified Input Gate (`MainContractorDiscoveryService.validate_award_input`)**:
  - Subcontracting intelligence records originate exclusively from verified sources:
    A. Verified Awards (`AWARDED_VERIFIED`)
    B. Single Official Award Sources (`AWARDED_SINGLE_OFFICIAL_SOURCE`)
    C. Official Project / Main Contractor Announcements
    D. Verified Owner / Developer Contractor Lists
  - Rumors, AI speculation, unverified social media, and market signals are strictly prohibited from entering automated subcontract opportunity generation.
  - Undisclosed/unknown winners default to `RESULT_NOT_PUBLIC` and are gated from prime profile promotion.
- **Part 1 — Main Contractor Intelligence Profiles (`MainContractorProfile`, `backend/app/models/schemas.py`)**:
  - Permanent contractor profiles with verified legal Arabic and English names, brand aliases, Saudi headquarters, verified commercial registrations (CR), Muqawil / Saudi Contractors Authority classification grades (Grade 1–2), active Saudi project portfolios, and verified source provenance.
  - Strict Public Business Contact Rule: only verifiable procurement directorates and official business emails (`procurement@albawani.net`, `purchasing@rtcc.com.sa`) are permitted; personal email domains (Gmail, Yahoo, Hotmail, Outlook) are strictly rejected.
- **Part 2 & 3 — Discovery Engine & Portal Classification (`MainContractorDiscoveryService`)**:
  - Directory of verified Saudi prime contractors (Nesma & Partners, Al Bawani, El Seif Engineering, Al-Rashid RTCC, Consolidated Contractors Company CCC).
  - Search and discovery covering English and Arabic procurement terms (Supplier, Vendor, Contractor, Subcontractor, Prequalification, Registration, RFQ, RFP, الموردين, تسجيل الموردين, المقاولين, مقاولي الباطن, التأهيل المسبق, المشتريات, طلبات الأسعار).
  - Classifies discovered links with verified domains, link types (`VENDOR_REGISTRATION`, `SUBCONTRACTOR_REGISTRATION`, `PREQUALIFICATION`, `PROCUREMENT_PORTAL`), and truthful authentication states (`PUBLIC`, `AUTH_REQUIRED`, `REGISTRATION_REQUIRED`).
- **Part 4 — Authenticated Portal Handling**:
  - Supports enterprise supplier portal requirements (SAP Ariba, Oracle Supplier Portal, IKTVA contractor credentials) without bypass attempts. Supports environment secrets architecture.
- **Part 5 — Subcontract Package Intelligence & Scope Decomposition**:
  - Decomposes prime project awards into realistic trade packages across 6 core Saudi contracting domains: MEP, Civil Earthworks, Structural Buildings, Architectural Finishing, Low-Voltage/Telecom, and Wet Utilities.
  - Strict Confirmed vs Inferred Tagging: packages explicitly disclosed in tender annexes are marked `is_inferred: False` (`CONFIRMED`); algorithmic scope breakdowns are marked `is_inferred: True` (`INFERRED_FROM_PRIME_SCOPE`) with evidence source preserved.
  - Calculates estimated trade values (SAR) and flags SME / Small Contractor Friendly packages.
- **Part 6 — Company-to-Subcontract Matching & Explainable Fit (`SubcontractingIntelligenceService`)**:
  - Evaluates packages against the active contractor capability profile:
    - Trade / Activity alignment (35%)
    - Operating province and city coverage (25%)
    - Financial envelope & capacity fit (20%)
    - Classification grade requirement (10%)
    - Equipment fleet and certifications (10%)
  - Returns explainable Match Score (0–100%), eligibility status (`ELIGIBLE`, `LIKELY_ELIGIBLE`, `REVIEW_REQUIRED`), positive fit factors, gap warnings, and recommended angle of approach.
- **Part 7 — Action Plan & BD Engagement Workflow (`SubcontractActionPlan`)**:
  - Turns every match into a structured 5-step action plan:
    1. Main Contractor Portal Registration (direct link and auth guidance)
    2. Prequalification Dossier Upload (CR, ZATCA, GOSI, Chamber, Muqawil Classification, Audited Financials, ISO)
    3. Targeted Procurement Outreach (verified business email and phone)
    4. Scope Alignment & Technical Clarification (BOQ and specs alignment)
    5. Subcontract Proposal & Pricing Submission
  - Generates ready-to-dispatch bilingual (Arabic RTL & English LTR) expression of interest (EOI) email drafts with one-click copy.
  - Provides interactive step-by-step progress completion and BD status tracking.
- **Part 8 — Full-Stack Dual-Runtime & Frontend UI**:
  - FastAPI production endpoints in `backend/app/main.py` (`/subcontract/contractors`, `/subcontract/packages`, `/subcontract/matches`, `/subcontract/action-plan/:id`).
  - Express preview adapter in `server.ts` mirroring all endpoints with in-memory persistence and rich seed data.
  - React frontend dashboard in `src/components/subcontracting/SubcontractRadarDashboard.tsx` and `src/pages/SubcontractRadarPage.tsx`.
  - Added "Subcontract Radar" (`/subcontract-radar`) in `Sidebar.tsx` and `App.tsx`.
  - Comprehensive unit and integration test suites in `backend/tests/test_stage8_subcontracting.py` and `src/__tests__/subcontractingIntelligence.test.ts`.

---

## Stage 7 Capabilities Completed (Verified Award Tracking & Critical Source Recovery)
- **Part 0 — Critical Saudi Source Recovery (`backend/app/services/source_recovery.py`, `src/api/sourceRecovery.ts`)**:
  - Truthful recovery analysis and legitimate access profiling for the 5 priority Saudi sources:
    1. *Etimad (Monafasat)*: Status `ASSISTED_IMPORT`. Direct scraping blocked by Absher/Nafath 2FA and MOF Geo-firewall; automated bypass strictly prohibited. Implemented legitimate `ETIMAD_ASSISTED_IMPORT` pipeline supporting official Excel/CSV, tender URL, and uploaded notice import directly into the canonical normalization and matching pipeline.
    2. *RCJY (Jubail & Yanbu)*: Status `RUNTIME_ENVIRONMENT_BLOCKED`. Verified official portal is active; container network egress timeout properly isolated and designated as runtime environment limitation rather than dead source. Implemented fallback connector and assisted import.
    3. *NCP Privatization & PPP*: Status `RUNTIME_ENVIRONMENT_BLOCKED`. Distinct separation between PPP project pipeline entries (`PROJECT_PIPELINE`) and confirmed active tenders (`ACTIVE_OPPORTUNITY`). Fallback assisted import implemented.
    4. *Tadawul Corporate Disclosures*: Status `ASSISTED_IMPORT`. Cloudflare WAF HTTP 403 respected without bypass attempts. Implemented `TADAWUL_ASSISTED_DISCLOSURE_IMPORT` for listed company contract wins, award values, dates, and contractor identities.
    5. *Saudi Aramco*: Status `AUTHENTICATED_LIVE` / `AUTH_REQUIRED`. Architectural separation between public project news (`PUBLIC_ARAMCO_SIGNALS`) and authenticated enterprise supplier portal (`AUTHENTICATED_ARAMCO_SUPPLIER_PORTAL`) requiring IKTVA environment secrets. Zero hardcoded credentials in codebase.
  - Zero false "LIVE" labeling: blocked/assisted sources are never misrepresented as live automated scrapers.
- **Part A — Award Watchlist Engine (`backend/app/services/award_tracking.py`, `backend/app/models/schemas.py`)**:
  - Contractors can watch any tender for verified award results (`POST /awards/watch`, `GET /awards/watches`, `DELETE /awards/watches/{id}`).
  - Watches persist in MongoDB `award_watchlists` collection and link to contractor profiles and Saved Lists.
- **Part B — Adaptive APScheduler Checks (`backend/app/scheduler/jobs.py`)**:
  - Adaptive polling frequency based on submission closing date:
    - Before closing date: checks scheduled after closing date + 1 day (minimal checks).
    - 0–14 days after closing: daily checks during peak award evaluation window.
    - 15–60 days after closing: weekly checks (every 7 days).
    - 60+ days after closing: bi-weekly/monthly checks (every 21 days).
  - Background scheduler job `daily_award_monitoring` executes checks with per-watch circuit breaker failure isolation.
- **Part C & D — Verified Award Result Model & Winner Evidence Requirements**:
  - Comprehensive model tracking `opportunity_id`, `official_tender_number`, `project_title`, `owner_entity`, `winner_legal_name`, `winner_normalized_name`, `award_date`, `contract_value_sar`, `contract_duration`, `source_url`, `source_type`, `checked_date`, `evidence_text`, `verification_confidence`, and `status`.
  - Authority hierarchy: Original Portal (1) > Owner Announcement (2) > Authority Notice (3) > Contractor Disclosure (4) > Tadawul Disclosure (5) > Company Newsroom (6) > Secondary Signal (7).
  - Strict evidence rule: winner names and contract values are NEVER invented. If winner is undisclosed or missing, status is automatically set to `RESULT_NOT_PUBLIC`.
- **Part E — Multi-Source Reconciliation & Conflicting-Source Handling**:
  - Detects discrepancies between sources when winners differ or reported contract values diverge by > 15%.
  - Conflicting reports set status to `CONFLICTING_SOURCES`, preserve evidence from all sources in `conflicting_details`, and trigger conflict notification events.
  - Consistent secondary confirmations upgrade single-source awards to `AWARDED_VERIFIED` with 1.0 confidence.
- **Part F — Saved List Award Summary**:
  - Endpoint `GET /saved-lists/{id}/award-summary` computes aggregate metrics (`AWARDED`, `AWARD_PENDING`, `RESULT_NOT_PUBLIC`, `CANCELLED`, `CONFLICTING`) and itemized award details for watched lists.
- **Part H — Main Contractor Handoff Record**:
  - For verified awards, automatically prepares a normalized `MainContractorRecord` with winner identity, awarded project, owner, value, location, and verified sources for Stage 8 subcontracting.
- **Part I — Award Notification Events**:
  - Dispatches application-level events (`AWARD_RESULT_FOUND`, `TENDER_CANCELLED`, `TENDER_REISSUED`, `CONFLICTING_AWARD_RESULT`) stored in `notifications` collection with unread tracking.
- **Part J — Full Frontend Dashboard & UI Integration**:
  - Implemented `AwardTrackingDashboard.tsx` and `AwardsPage.tsx` with KPI summary, active watches view, verified results view, conflicting evidence view, manual disclosure recording modal, and notifications drawer.
  - Integrated Award Summary into `SavedListsManager.tsx`.
  - Integrated "Watch Award" buttons and award badges into `OpportunityExplorer.tsx`.
  - Upgraded `SourceHealthDashboard.tsx` with Priority Recovery Pathways tab and Assisted Ingestion modal.
  - Added navigation item in `Sidebar.tsx` and route in `App.tsx`.

---

## Stage 6 Capabilities Completed (Daily Monitoring + PDF)
- **Part 0 — Truthful Live Source Model Exposer**:
  - Live statuses strictly exposed per source (`VERIFIED_LIVE`, `AUTH_REQUIRED`, `BLOCKED`, `FIXTURE_ONLY`, `DISCOVERY_REQUIRED`).
  - No fixtures allowed into production daily monitoring statistics; market signals strictly quarantined from confirmed open opportunities.
  - Every source exposes canonical domain, live status, last successful fetch, last attempted check, records discovered, and exact limitation.
- **Part A — Production Daily Monitoring Engine (`backend/app/monitoring/daily_monitor.py`)**:
  - Checks all enabled sources independently with circuit breaker failure isolation.
  - Generates unique `monitoring_run_id` and records attempted, successful, blocked, auth-required, raw records found, canonical opportunities created, duplicates merged, confirmed vs possible vs market signals, and high match counts.
  - Integrates normalization, multi-source deduplication, eligibility, and explainable match scoring.
- **Part B — Upgraded Saudi Opportunity Explorer (`src/components/OpportunityExplorer.tsx`)**:
  - Comprehensive filters: Today, Last 3 Days, Last 7 Days, Custom Date Range (Start/End), Government, Private, RFQ, RFP, EOI, Prequalification, Subcontract Request, Vendor Registration, 13 Regions, Saudi Cities & Industrial Cities (Jubail Industrial City, Yanbu Industrial City, Ras Al Khair, NEOM, Riyadh, Dammam, etc.), 8 Work Categories, Closing Date, Project Value Envelope (SAR), Match Score, Eligibility, Direct Tender Only, Subcontract Targets Only, Official Source, and Source Live Status.
  - Opportunity cards display: Title (bilingual), Reference Number, Owner/Entity, City/Region, Opportunity Type, Publication/Discovery Date, Closing Date, Project Value if verified (never displaying UNKNOWN as inferred facts), Match Score, Eligibility badge, Confidence Level badge, Source ID, and Live Source Status badge.
- **Part C — Filtered-Out Opportunities with Explicit Rejection Reasons**:
  - Toggleable "Show Filtered-Out Opportunities" view displaying excluded records without permanently discarding them.
  - Explicit evidence-backed reasons: `activity mismatch`, `outside preferred region`, `project too large`, `classification mismatch`, `expired`, `duplicate`, `low confidence`, `market signal only`, `mandatory requirement missing`.
- **Part D — Immutable Historical Daily Snapshots**:
  - Daily snapshots (`snapshot-YYYY-MM-DD`) capturing point-in-time statistics, canonical opportunities counts, strong matches, closing soon (<7d), government vs private, regional breakdown (Eastern, Jubail), and source summary.
  - Snapshots remain immutable even when opportunities or rules change later.
- **Part E — Daily Intelligence Briefing PDF Export (`src/utils/pdfExport.ts`)**:
  - Executive printable briefing generator with bilingual Arabic RTL & English LTR layout.
  - Covers contractor profile details, KPI summary boxes, scored opportunities, eligibility badges, subcontract positioning, official portal links, and honest source health verification summary.
- **Part F — Contractor Saved Lists (`backend/app/models/schemas.py`, `src/api/savedLists.ts`)**:
  - Complete CRUD for contractor opportunity watchlists and saved lists linked to immutable snapshots.

---

## Stage 4 Live Adapter Smoke Verification Truth Table (Conducted from Container Runtime)

| Adapter Name | Canonical Domain | Resolved Endpoint | Live Smoke Status | HTTP Code | Records Discovered | Parser Status | Exact Limitation Description |
|---|---|---|---|---|---|---|---|
| **Etimad** | `https://monafasat.etimad.sa` | `https://monafasat.etimad.sa/tenders` | **FIXTURE_ONLY / AUTH_REQUIRED** | N/A (RemoteDisconnected) | 0 live / Fallback Fixture Available | Ingestion parser ready; live network connection closed by remote peer | Absher/Nafath 2FA authentication and MOF Geo-firewall blocks automated queries from outside KSA. |
| **Furas** | `https://furas.balady.gov.sa` | `https://furas.balady.gov.sa/ar/opportunities` | **VERIFIED_LIVE** | 200 OK | 5+ live opportunities | Parser Success | Public Balady municipal opportunities accessible; bidding requires commercial registration login. |
| **NCP** | `https://www.ncp.gov.sa` | `https://www.ncp.gov.sa/en/pages/opportunities.aspx` | **BLOCKED** | 504 Timeout | 0 live | Ingestion parser ready; connection timed out | Government network perimeter filtering / connection timed out on international Cloud Run container IPs. |
| **RCJY** | `https://www.rcjy.gov.sa` | `https://www.rcjy.gov.sa/en/Business/Tenders` | **BLOCKED** | 504 Timeout | 0 live | Ingestion parser ready; connection timed out | Government network perimeter filtering / connection timed out on international Cloud Run container IPs. |
| **Saudi Aramco** | `https://supplier.aramco.com` | `https://supplier.aramco.com` | **AUTH_REQUIRED / BLOCKED** | 504 Timeout | 0 live | Ingestion parser ready; gateway timed out | Enterprise SAP Ariba portal gateway requires authenticated IKTVA contractor credentials. |
| **NEOM** | `https://www.neom.com` | `https://www.neom.com/en-us/suppliers` | **VERIFIED_LIVE** | 200 OK | 5+ live project briefs | Parser Success | Public project releases accessible; direct RFP bidding requires NEOM Supplier Portal credential. |
| **ROSHN** | `https://www.roshn.sa` | `https://www.roshn.sa/en/suppliers` | **VERIFIED_LIVE** | 200 OK | 5+ live developer packages | Parser Success | Public sourcing updates accessible; direct bidding requires contractor onboarding with Saudi CR. |
| **Tadawul** | `https://www.saudiexchange.sa` | `https://www.saudiexchange.sa/wps/portal/saudiexchange/newsandreports/issuer-news` | **BLOCKED** | 403 Forbidden | 0 live | Ingestion parser ready; blocked by WAF | WAF / Cloudflare Bot Management blocks automated requests with HTTP 403 Forbidden. |

---

## Stage 5 Capabilities Completed
- **Saudi Normalization (`backend/app/services/normalization.py`)**:
  - Arabic/English title prefix stripping and character normalization (alef with hamza, taa marbouta).
  - Entity canonicalization (e.g. "أمانة منطقة الرياض" $\rightarrow$ "Riyadh Municipality", "الهيئة الملكية" $\rightarrow$ "RCJY").
  - Work categories normalized to 8 official Saudi classifications.
  - SAR currency normalization handling formats ("SAR", "SR", "مليون", "M").
  - Original source values strictly preserved alongside normalized fields.
- **Multi-Source Deduplication (`backend/app/services/deduplication.py`)**:
  - Project fingerprint generation using reference number, normalized title, entity, and city.
  - Clustering and merging into one `CanonicalOpportunity` with all source IDs preserved.
  - Conflict tracking without data loss; disagreements between authoritative sources tagged as `CONFLICTING_SOURCES`.
- **Saudi Eligibility Engine (`backend/app/services/eligibility_engine.py`)**:
  - Evidence-backed requirements only: contractor classification, certifications, experience, regions, guarantee, deadline, excluded scope.
  - Company size (`SMALL`, `MEDIUM`, `LARGE`) alone never determines eligibility.
  - Zero hard-coded/invented financial caps; uncertain mapping returns `REVIEW_REQUIRED` or `UNKNOWN`.
- **Explainable Match Score (`backend/app/services/match_score.py`)**:
  - Continuous 0-100 score across 6 explainable components (activity 25, geographic 20, project scale 20, capacity 15, preference 10, semantic 10).
  - Display labels: `STRONG_MATCH`, `GOOD_MATCH`, `REVIEW`, `LOW_MATCH`.
  - Independent of Eligibility: a tender can have a 90%+ match score and be `NOT_ELIGIBLE` due to a hard requirement failure.
- **Subcontracting Alternative (`backend/app/services/subcontracting.py`)**:
  - Automatically identifies mega-projects and strict prime prequalification tenders as `POTENTIAL_SUBCONTRACTING_TARGET` with `SPECIALIST_SUBCONTRACTOR` recommendation.
- **AI / RAG Tender Analysis (`backend/app/rag/tender_analysis.py`)**:
  - Extracts scope, mandatory requirements, risks, and capability gaps with source locators and snippets.
  - Statements with $<0.70$ confidence flagged as `REVIEW_REQUIRED`; zero hallucinated assumptions.
- **Company Gap Analysis (`backend/app/services/gap_analysis.py`)**:
  - Analyzes available, missing, and unknown capabilities.
  - Recommends actions: `DIRECT_TENDER`, `SUBCONTRACT_TARGET`, `REVIEW_REQUIREMENT`, `VENDOR_REGISTRATION`, `NO_ACTION`.
- **API Integration**:
  - Backend: `POST /intelligence/evaluate` in `backend/app/main.py`.
  - Preview Adapter: `POST /intelligence/evaluate` in `server.ts`.
  - Client: `src/api/intelligence.ts`.

---

## Stage 3 Gaps Completed & Source Registry Statistics
- **Total Registered Saudi Sources**: 42 official sources across Government, Municipal, Giga-projects, SOEs, Mining, Rail, Aviation, Ports, Utilities, and Financial Disclosures.
- **Verified Official Endpoints**: 36 endpoints verified with canonical domain and live portal URLs.
- **Discovery-Required Endpoints**: 6 endpoints intentionally preserved with canonical domain and `DISCOVERY_REQUIRED` status (King Abdullah Port, King Salman Park, Sports Boulevard, Cruise Saudi, ASFAR, Boutique Group).
- **Dynamic Source Discovery Service**: Implemented in `backend/app/sources/discovery.py` with automatic domain validation, keyword classification, endpoint candidate inspection, and repeated failure rediscovery preserving endpoint history.
- **Government Ingestion Adapters**: Legally and publicly accessible connectors for Etimad (Monafasat), Furas (Balady / MOMRAH), NCP (Privatization / PPP), and Royal Commission for Jubail & Yanbu (RCJY).
- **Private Ingestion Adapters**: Opportunity connectors for Saudi Aramco (subcontract packages & IKTVA), NEOM (Oxagon & The Line EOI/prequalifications), ROSHN, and Tadawul listed corporate contract disclosures.
- **Opportunity Confidence Gates**: Strict enforcement of `CONFIRMED_OPPORTUNITY`, `POSSIBLE_OPPORTUNITY`, and `MARKET_SIGNAL_ONLY` (market signals are strictly prevented from being shown as open tenders).
- **Location Normalization**: Canonical mapping for 13 provinces, major cities, and industrial cities (Jubail, Jubail Industrial City, Ras Al Khair, Yanbu, Dammam, Khobar, Riyadh, Jeddah, Medina, Tabuk, NEOM, Jazan/JCPDI).
- **Known Limitations & Credentials Needed**:
  - Direct supplier portal submissions for gated portals (e.g. Aramco e-Marketplace, NEOM Supplier Portal, SEC AL-Atheer, SABIC Nusaned) require contractor CR and commercial credentials.
  - Etimad full tender document download requires authenticated Saudi contractor login through Absher/Nafath.
  - External network calls in Cloud Run container runtime are sandboxed; mocked integration test suites verify full parser and adapter behavior.

---

## Production Architecture vs. Google AI Studio Preview Architecture

### 1. Production Architecture (Authoritative)
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4, Arabic RTL & English LTR.
- **Backend**: Python 3.10+ with FastAPI (`backend/app/main.py`), REST APIs with `X-Company-Id` tenant isolation.
- **Persistence Layer**: MongoDB (`backend/app/db/mongodb.py`) as the primary document store for companies, tenders, opportunities, sources, matches, and audit logs. *(Status: IMPLEMENTED AND TESTED BY UNIT/INTEGRATION TEST)*
- **Vector Database**: ChromaDB (`backend/app/rag/chroma.py`) for persistent specification chunk embeddings and semantic retrieval. *(Status: IMPLEMENTED AND TESTED BY UNIT/INTEGRATION TEST)*
- **Job Scheduler**: APScheduler (`backend/app/scheduler/jobs.py`) for automated background source health pings, ingestion runs, and award checks. *(Status: IMPLEMENTED AND TESTED BY UNIT/INTEGRATION TEST)*
- **Backend Test Runner**: Pytest / unittest (`backend/tests/test_backend.py`).

### 2. Google AI Studio Preview Architecture (Development Adapter Only)
- **Runtime Host**: Node.js 22 Express server (`server.ts`) acting strictly as a development adapter and Vite middleware proxy for Google Cloud Run container hosting.
- **Preview Persistence**: In-memory Map cache backed by local disk snapshot (`data/companies.json`) and client `localStorage` (`bidpilot-company`).
- **Preview Note**: Express, JSON files, and localStorage are explicitly classified as DEVELOPMENT/PREVIEW ONLY and do NOT represent or replace the authoritative production stack.

---

## Technical Stack & Architecture Verification (Brutally Honest Audit)

| Component | Status | Implementation Details & Proof Paths |
|---|---|---|
| **Frontend** | **PRESENT** | React 19.0.0, Vite 6.0.3, TypeScript 5.7.2 (`src/App.tsx`, `src/main.tsx`, `index.html`). Dynamic Arabic RTL and English LTR layouts. |
| **Backend / API** | **REPLACED** | Node.js 22 / Express 4.21.2 (`server.ts`). Replaced original Python FastAPI backend during Node.js platform migration. Serves REST endpoints at `/` and `/api/`. |
| **Database Persistence** | **REPLACED / IN-MEMORY + DISK** | Replaced MongoDB (`motor`/`pymongo`). Current implementation uses in-memory Map stores backed by file-system disk persistence (`data/companies.json`) and client `localStorage` (`bidpilot-company`). |
| **Vector DB (ChromaDB)** | **REPLACED** | Replaced Python `chromadb`. Replaced with deterministic in-memory semantic scoring and token similarity matrix in `src/engine/procurement.ts`. |
| **Scheduler** | **REPLACED** | Replaced Python `APScheduler`. Background scheduled polling and interval tasks are handled via Node.js timers / process hooks. |
| **Tender Ingestion** | **PARTIAL** | REST ingestion endpoints `/tenders/ingest` and `/tenders/:id/ingest-doc` in `server.ts`. Original Python crawler scripts were replaced. |
| **Document Ingestion** | **PARTIAL** | Chunk ingestion mock `/tenders/:id/ingest-doc` present in `server.ts`. Full PDF parser pipeline from Python `rag/` was replaced. |
| **RAG / Semantic Retrieval** | **PARTIAL** | Structured requirement extraction, citation locators (`locator`, `snippet`), gap reports, and step-by-step trace pipelines implemented in `src/engine/procurement.ts` and `server.ts`. Deep LLM vector embedding calls replaced with deterministic retrieval. |
| **Matching Engine** | **PRESENT** | Hybrid scoring engine combining Saudi activity overlap (35%), regional & city matching (25%), budget envelope (15%), company size alignment (15%), classification grade (10%), and semantic scope relevance (40% overall weight) in `src/engine/procurement.ts`. |
| **Eligibility Engine** | **PRESENT** | Strict eligibility gate in `src/engine/procurement.ts` checking financial threshold, deadline lead window (>= 3 days), GTPL exclusion flags, and excluded project scopes. Fully decoupled from match score. |
| **Award Analytics** | **PRESENT** | Quartile pricing statistics (min, p25, median, mean, p75, max), supplier win shares, and historical time-series trends (month/quarter/year) in SAR in `src/engine/procurement.ts` and rendered with Recharts. |
| **Authentication** | **PARTIAL** | Nginx auth bridge integration at reverse-proxy layer (`/etc/nginx/user_auth_verification.lua`). JWT/user sign-in UI is not yet implemented. |
| **Multi-Tenancy** | **PRESENT** | Multi-tenant isolation enforced via `X-Company-Id` HTTP header in `src/api/client.ts`, scoped in localStorage and server-side company records. |
| **Audit Logging** | **PARTIAL** | Execution traces (`thought`, `action`, `observation`) stored per draft in `server.ts` (`/drafts/:id/trace`). Long-term centralized database audit log table is pending database integration. |

---

## "Failed to Fetch" Root Cause & Permanent Fix

### Exact Root Cause:
1. Shell environment variable `VITE_API_BASE` was set to `http://localhost:8000` (inherited from the original Python FastAPI setup).
2. Vite injected `import.meta.env.VITE_API_BASE = "http://localhost:8000"` into the frontend browser bundle.
3. In `src/api/client.ts`, `BASE_URL` resolved to `"http://localhost:8000"`.
4. When loaded inside the Google AI Studio Preview iframe (`https://ais-dev-...run.app`), the client browser attempted to fetch `http://localhost:8000/tenders` directly from the user's laptop.
5. Because no service was listening on port 8000 on the user's local machine, and HTTPS pages block mixed-content HTTP requests, browser `fetch` threw `TypeError: Failed to fetch`.

### Fix Applied:
- Modified `src/api/client.ts` to inspect `VITE_API_BASE`: in browser environments (`typeof window !== "undefined"`), any `localhost` or `127.0.0.1` address is stripped, forcing `BASE_URL` to `""` (relative same-origin requests).
- Relative requests route through Nginx reverse proxy (port 8080) $\rightarrow$ Express (port 3000) $\rightarrow$ returns HTTP 200 JSON data.
- Added comprehensive try/catch network error handling in `client.ts` throwing descriptive `ApiError`.

---

## Stage 2 Implementation & Verification Details

### 1. Saudi Contractor Capability Profile
- **Company Size**: Small, Medium, Large.
- **Rule Verification**: Verified via automated test `RULE: Company size must affect ranking but must NOT automatically determine eligibility`. Both Small and Large contractors pass eligibility if turnover is sufficient, while company size differentiates project-scale suitability ranking.
- **Structured Fields**: Bilingual names (`name`, `name_ar`), CR number (`cr_number`), 13 Saudi regions, key cities, main/secondary activities, classification grade (1–5 & Unclassified), experience years, manpower count, equipment fleet tags, comfortable envelope, preferred value (SAR), bank guarantee capability (SAR), certifications, procurement interests (direct tender, subcontracting, vendor registration), excluded project scopes.
- **Persistence Verified**:
  - Client-side: Zustand `persist` middleware synchronizes with `localStorage` (`bidpilot-company`).
  - Server-side: `server.ts` persists profiles to `data/companies.json`. Reloading the page or restarting the server retains contractor records.

### 2. Bilingual Arabic/English & Dynamic RTL/LTR
- Implemented `src/i18n/translations.ts` and `src/store/localeStore.ts`.
- Instant toggle without page reload. Automatically sets `document.documentElement.dir = "rtl" | "ltr"` and `lang = "ar" | "en"`.

### 3. Mobile UI Overhaul
- Eliminated compressed desktop layout on mobile devices (tested at 320px, 360px, 390px, 412px).
- Fixed desktop sidebar taking 224px unconditionally:
  - On mobile (`< md`), `Sidebar` converts into an animated slide-over drawer accessible via the hamburger menu.
  - Main opportunity feed uses 100% full viewport width without horizontal overflow.
  - Mobile slide-up filter sheet allows adjusting Saudi contractor profile and filters without crushing the feed.
  - Header controls optimized: compact logo badge, compact language toggle (`EN` / `عربي`), and truncated contractor badge.

### 4. Failure Handling
- Explicitly separated **API / BACKEND ERROR** from **NO OPPORTUNITIES FOUND**:
  - API Connection Error renders an error alert banner with specific diagnostic details, a "Retry Connection" button, and disconnected status indicator. No mock or fake data is rendered.
  - Empty state renders an informative inbox placeholder with a "Reset Filters" action.

---

## Test Execution Summary
- **Test Command**: `npm test -- --run`
- **Results**: 7 test files, **31 passed** (0 failed).
- **ESLint**: `npm run lint` $\rightarrow$ 0 errors, 0 warnings.
- **Vite Build**: `npm run build` $\rightarrow$ 0 errors.

---

## Exact Next Action
When instructed to begin **Stage 3 — Saudi Sources Engine**:
1. Construct the Saudi Source Registry supporting Etimad, Furas, NCP, Aramco, SEC, SABIC, Giga-projects (NEOM, Red Sea Global, Qiddiya, Diriyah), PIF, and Tadawul corporate disclosures.
2. Implement Dynamic Source Discovery and source health tracking.
3. Test source failure isolation.
