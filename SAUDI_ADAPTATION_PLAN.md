# Tender Intelligence Saudi — SAUDI_ADAPTATION_PLAN.md

## 1. Executive Summary & Objective

Tender Intelligence Saudi adapts the production-grade **BidPilot** procurement intelligence foundation into an end-to-end intelligence and decision-support platform for contractors operating in the Kingdom of Saudi Arabia (KSA).

The platform maintains BidPilot's proven strengths:
- Multi-tenancy & audit logging
- Hybrid scoring (rule-based eligibility + semantic similarity)
- Transparent eligibility engine with separate match scores
- Document ingestion & RAG extraction with verifiable citation locators
- Gap analysis and structured proposal drafting
- Historical award analytics (pricing quartiles, contractor win rates, trend forecasting)
- Fast, responsive React / Vite frontend

All European and Greek procurement constraints (TED, CPV codes, NUTS regions, Diavgeia, ESIDIS/KIMDIS, EUR currency) are methodically replaced or adapted with authentic Saudi procurement mechanisms (Etimad, Monafasat, Furas, Saudi Contractors Authority Muqawil classification grades, Saudi administrative regions, 13 provinces, Saudi cities, SAR currency, and Hijri/Gregorian date systems).

---

## 2. Complete Repository Audit & Component Classification

Every module across BidPilot has been audited and classified according to the Master Rules:

| Module / File Path | Purpose in BidPilot | Classification | Target Saudi Role / Adaptation Strategy |
|---|---|---|---|
| `src/api/types.ts` | Data models (CompanyProfile, Tender, MatchResult, BidDraft, Award, etc.) | **ADAPT** | Extend `CompanyProfile` to Saudi contractor capability profile (small/med/large size, classification grade, SAR capacity, Saudi regions/cities). Extend `Tender` with Saudi work categories, Etimad reference, bid bond (SAR), ministry/giga-project authority. |
| `src/api/client.ts` | HTTP client with tenant header `X-Company-Id` | **KEEP GENERIC** | Reusable generic API client for authenticated tenant routing. |
| `src/api/companies.ts` | Company profile CRUD operations | **ADAPT** | Add Saudi contractor attributes, classification grade, equipment, manpower, subcontractor preference. |
| `src/api/tenders.ts` | Tender querying and document ingestion triggers | **ADAPT** | Add Saudi filters (Etimad, private RFP/RFQ, project signals, Saudi regions & cities). |
| `src/api/matches.ts` | Match generation and querying | **KEEP GENERIC** | Core REST endpoint retained; underlying matching algorithm adapted. |
| `src/api/drafts.ts` | Proposal drafting & trace step retrieval | **KEEP GENERIC** | Retain API interface; prompt generation adapted for Saudi tender dossiers. |
| `src/api/analytics.ts` | Pricing, win-rates, and trends API | **ADAPT** | Replace CPV filters with Saudi Work Categories; switch currency to SAR; filter by Saudi contracting authorities. |
| `src/engine/procurement.ts` | Core mathematical & business logic for matching, eligibility, and analytics | **ADAPT** | Adapt eligibility engine with Saudi classification grades, local content requirements, and SAR turnover. Separate Match Score from Eligibility. |
| `src/store/companyStore.ts` | Client state for active company | **ADAPT** | Store Saudi contractor profile, language preference (`ar`/`en`), and direction (`rtl`/`ltr`). |
| `src/store/feedStore.ts` | State management for tenders and matches | **ADAPT** | Integrate Saudi filters (Government vs Private, Saudi Work Categories, Region, City, Match vs Eligibility). |
| `src/store/draftStore.ts` | State management for RAG workspace and drafting agent | **KEEP GENERIC** | Fully reusable client state for section drafts, checklist, gap report, and trace steps. |
| `src/store/analyticsStore.ts` | State management for charts and metrics | **ADAPT** | Adapt filter parameters to Saudi authorities and Work Categories. |
| `src/components/layout/AppShell.tsx` | Root layout shell | **ADAPT** | Add RTL/LTR dynamic direction handling, Arabic typography, and language switcher. |
| `src/components/layout/Header.tsx` | Top bar with logo and tenant company selector | **ADAPT** | Support Arabic/English label toggles and Saudi branding. |
| `src/components/layout/Sidebar.tsx` | Navigation sidebar | **ADAPT** | Add links for Saudi Opportunities Explorer, Saved Lists, Daily Monitoring, Award Watch, Main Contractor Radar, and Vendor Registration. |
| `src/components/feed/CompanyPanel.tsx` | Contractor profile editor | **ADAPT** | Expand into full Saudi Contractor Profile editor with classification grades, company size, and equipment. |
| `src/components/feed/EligibilityBadge.tsx` | Visual indicator for eligibility pass/fail/warnings | **ADAPT** | Support Saudi statuses: *Eligible*, *Likely Eligible*, *Review Required*, *Not Eligible*, *Unknown*. |
| `src/components/feed/ScoreBreakdown.tsx` | Match score breakdown (rule vs semantic) | **KEEP GENERIC** | Preserved; displays transparent breakdown between capacity match and semantic relevance. |
| `src/components/feed/MatchCard.tsx` | Feed card for opportunities | **ADAPT** | Display Saudi entity (Ministry/Giga-project), city/region, SAR budget, bid bond, and opportunity type. |
| `src/components/workspace/BidDraftView.tsx` | Proposal view with notice & review status | **KEEP GENERIC** | Reusable for viewing generated Saudi bid sections. |
| `src/components/workspace/CitationChip.tsx` | Interactive locator button showing source snippets | **KEEP GENERIC** | Reusable for grounding AI extractions in tender source text. |
| `src/components/workspace/DraftSection.tsx` | Render markdown draft sections with self-check status | **KEEP GENERIC** | Reusable for Arabic and English draft content. |
| `src/components/workspace/GapReportView.tsx` | Coverage ratio and requirement status | **KEEP GENERIC** | Reusable for Saudi compliance gap audits. |
| `src/components/workspace/RequirementChecklist.tsx` | Interactive checklist of extracted clauses | **KEEP GENERIC** | Reusable for Saudi tender compliance matrices. |
| `src/components/workspace/TracePanel.tsx` | AI thought/action/observation inspection panel | **KEEP GENERIC** | Reusable for transparency into the agent reasoning process. |
| `src/components/analytics/PricingChart.tsx` | Boxplot/quartile pricing distributions | **ADAPT** | Switch currency formatting to SAR and labels to Saudi categories. |
| `src/components/analytics/WinRatesChart.tsx` | Bar chart of top winning suppliers | **ADAPT** | Display Saudi contractors, commercial registration numbers, and SAR contract sums. |
| `src/components/analytics/TrendsChart.tsx` | Historical timeline of procurement volume | **ADAPT** | Support Hijri/Gregorian timelines and SAR volume aggregation. |
| `server.ts` | Backend Express runtime providing API endpoints and Vite dev middleware | **ADAPT** | Add Saudi Source Registry, Saudi Daily Monitoring runs, Saudi Award Watch, Main Contractor Intelligence, and Vendor Registration Radar. |

---

## 3. EU-Specific Dependencies Identification & Saudi Replacements

| Component | European / Greek Assumption | Saudi Replacement |
|---|---|---|
| **Procurement Source** | TED (Tenders Electronic Daily), KIMDIS, ESIDIS | **Etimad (Monafasat)**, Furas, NCP, Aramco, SABIC, SEC, NEOM, Red Sea Global, Qiddiya, Diriyah, PIF, MODON, NWC, NHC, Tadawul disclosures |
| **Award Tracking** | Diavgeia (Greek transparency portal) | **Etimad Award Announcements**, Tadawul corporate contract disclosures, Saudi Gazette/SPA, official owner newsrooms |
| **Classification Standard** | CPV (Common Procurement Vocabulary) codes (e.g., `45000000`, `72000000`) | **Saudi Work Categories** (Building Construction, Roads & Infrastructure, Electrical & Power, Water & Sewage, Telecommunications & IT, Electromechanical MEP, Industrial & Marine, Facility Management & O&M) |
| **Geographic Partitioning** | NUTS codes (e.g., `EL30` Attica, `EL41`, `EL52`) | **Saudi Administrative Regions & Cities** (Riyadh, Makkah/Jeddah, Eastern Province/Dammam/Khobar, Medina, Tabuk/NEOM, Asir, Qassim, Hail, Jazan, Najran, Northern Borders, Al-Jouf, Al-Baha) |
| **Financial Standard** | Euro (`EUR`, `€`) | **Saudi Riyal (`SAR`, `ر.س`)** |
| **Regulatory Framework** | EU Directive 2014/24/EU (Article 57 Exclusion Grounds) | **Saudi Government Tender & Procurement Law (GTPL)**, Saudi Contractors Authority (SCA/Muqawil) Classification & Grading (Grades 1 to 5), Zakat, Tax and Customs Authority (ZATCA), GOSI, Chamber of Commerce |
| **Linguistic Profile** | English only, LTR layout | **Dual Arabic & English**, Dynamic **RTL & LTR**, Saudi localized procurement terminology |
| **Tender Typology** | Public Open/Restricted tenders | **Government Tenders, Private Tenders, RFQs, RFPs, Subcontract Requests, Vendor/Contractor Registrations, Giga-project Market Signals** |

---

## 4. Reusable Core Architecture Preserved

The following foundational systems from BidPilot are explicitly preserved and leveraged:

1. **Hybrid Scoring Engine**:
   - Decoupled two-tier evaluation: Strict **Eligibility Gate** (passed/failed/review required) separated from continuous **Match Score** (0-100%).
   - Transparent rationale breakdown: Rule Score (capacity, geography, classification) + Semantic Score (scope of work relevance).

2. **RAG Extraction & Grounding**:
   - Every requirement extracted contains a precise source citation (`locator` and `snippet`).
   - Zero hallucinated tender clauses; missing data stays strictly `UNKNOWN`.

3. **Gap Analysis Framework**:
   - Compares contractor capacity against mandatory requirements.
   - Evaluates coverage ratio and highlights specific remediations.

4. **Self-Check Decision Support Pipeline**:
   - Review notice: *"This is decision-support output. Mandatory human review is required before any submission."*
   - Step-by-step trace logging (thought, action, observation) for explainable AI.

5. **Statistical Procurement Analytics**:
   - Quartile pricing distributions (min, p25, median, mean, p75, max).
   - Supplier/contractor win share calculations.
   - Historical time-series trends by month, quarter, and year.

6. **Multi-Tenancy & Tenant Isolation**:
   - Client-side and server-side tenant headers (`X-Company-Id`).
   - Isolated contractor workspaces, saved lists, and watchlists.

---

## 5. Master 10-Stage Execution Roadmap

- [x] **Stage 1 — Import & Audit BidPilot**
  - Establish verified baseline test suite (25 tests passing).
  - Produce comprehensive system audit and EU dependency mapping.
  - Formulate adaptation plan, state tracking, and progress checkpoints.
- [x] **Stage 2 — Saudi Company Profile + Arabic**
  - Implement Saudi contractor capability profile (Small/Medium/Large size, classification grade 1-5, Saudi regions/cities, guarantee capability, subcontract interest).
  - Implement Arabic + English bilingual support with full dynamic RTL/LTR UI.
  - Diagnose and resolve "Failed to fetch" iframe preview error.
  - Overhaul mobile responsive UI with slide-over drawer and full-width main view.
  - End-to-end verified.
- [x] **Stage 2.5 — Architecture Restoration (BidPilot Production Backend)**
  - Reconstruct production FastAPI backend in `/backend/app`.
  - MongoDB persistent document collection schemas & repository abstraction in `/backend/app/db/mongodb.py`.
  - ChromaDB persistent vector-store abstraction & semantic chunk retrieval in `/backend/app/rag/chroma.py`.
  - APScheduler background procurement monitoring jobs in `/backend/app/scheduler/jobs.py`.
  - Pytest / unittest backend test suite in `/backend/tests/test_backend.py`.
  - Designate Node.js / Express (`server.ts`) as Preview / Development compatibility adapter only.
- [ ] **Stage 3 — Saudi Sources Engine**

---

## 6. Dual-Runtime Architectural Specifications

### A. PRODUCTION ARCHITECTURE
```
React / Vite Frontend (Arabic RTL + English LTR)
        │  (HTTP / JSON with X-Company-Id Header)
        ▼
FastAPI Production Application (/backend/app)
        ├── REST Routing & Multi-Tenancy Enforcement
        ├── Hybrid Matching & Transparent Eligibility Services
        └── Audit Log Pipeline
        │
        ├──► MongoDB (Authoritative Persistent Document Collections)
        │     ├── companies & contractor_profiles
        │     ├── tenders & opportunities
        │     ├── sources & source_runs
        │     ├── documents & document_chunks
        │     └── audit_logs & awards
        │
        ├──► ChromaDB (Vector Store & Semantic Retrieval Engine)
        │     └── Tender specification chunk embeddings & RAG evidence
        │
        └──► APScheduler (Automated Background Procurement Engine)
              ├── Source health check runs (every 15 min)
              ├── Daily tender ingestion jobs (every 60 min)
              └── Award monitoring & Tadawul disclosure audits (every 120 min)
```

### B. GOOGLE AI STUDIO PREVIEW ARCHITECTURE
```
React / Vite Frontend (Browser in Iframe at cloud preview origin)
        │  (Relative same-origin HTTP requests "")
        ▼
Nginx Reverse Proxy (:8080)
        │
        ▼
Development Compatibility Adapter (`server.ts` Node/Express on :3000)
        ├── Serves Vite Middleware in SPA development mode
        ├── Backed by in-memory data caches & local disk persistence (`data/companies.json`)
        └── Preserves interactive UI, contractor profile CRUD, and live preview functionality
```
  - Construct Saudi Source Registry (Etimad, Furas, Giga-projects, SOEs, Tadawul disclosures).
  - Implement source health tracking, dynamic discovery, and fail-safe source isolation.
- [ ] **Stage 4 — Saudi Government + Private Opportunities**
  - Build ingestion pipelines for Government and Private tenders.
  - Enforce opportunity classification (Confirmed, Possible, Signal) and strict `UNKNOWN` handling.
- [ ] **Stage 5 — Matching + Eligibility + AI Analysis**
  - Saudi contractor classification eligibility rules.
  - Multi-source deduplication and canonical project merging with evidence preservation.
  - RAG Scope of Work and capability gap analysis.
- [ ] **Stage 6 — Daily Monitoring + PDF**
  - Opportunities Explorer with comprehensive filtering and transparent "why filtered" explanations.
  - Immutable Daily History snapshots, Saved Lists, and bilingual PDF export.
- [ ] **Stage 7 — Verified Award Tracking**
  - Award Watch system with automated multi-source verification and conflict detection.
  - Historical award conversion analytics adapted to Saudi work categories.
- [ ] **Stage 8 — Main Contractor + Subcontracting**
  - Main Contractor profiles and "Who Just Won?" intelligence views.
  - "Find Subcontracting Path" with strict AI INFERENCE labeling.
- [ ] **Stage 9 — Vendor Registration + Business Development**
  - Vendor Registration Radar with document readiness checklists (CR, ZATCA, GOSI, Chamber).
  - 10-stage contractor CRM pipeline and weekly outreach targeting.
- [ ] **Stage 10 — Testing & Launch**
  - Comprehensive end-to-end regression, performance, and security hardening.
  - Deployment guides, source guides, and final production certification.
