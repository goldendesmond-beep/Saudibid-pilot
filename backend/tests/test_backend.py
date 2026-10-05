import unittest
from datetime import datetime, timedelta
from backend.app.core.config import settings
from backend.app.models.schemas import CompanyProfile, Tender, AuditLog, DocumentChunk
from backend.app.db.mongodb import MongoRepository
from backend.app.rag.chroma import ChromaVectorStore
from backend.app.scheduler.jobs import BackgroundSchedulerManager
from backend.app.services.matching_service import compute_eligibility, compute_match
from backend.app.sources.registry import SourceRegistryService, OFFICIAL_SAUDI_SOURCES

class TestBackendArchitecture(unittest.TestCase):
    def setUp(self):
        self.repo = MongoRepository(database_name="test_db")
        self.chroma = ChromaVectorStore()
        self.scheduler = BackgroundSchedulerManager()

        self.sample_company = CompanyProfile(
            id="comp-test-01",
            name="Al-Bawani Contracting",
            name_ar="شركة البواني للمقاولات",
            cr_number="1010123456",
            company_size="Medium",
            saudi_regions=["Riyadh Region", "Eastern Province"],
            saudi_cities=["Riyadh", "Khobar"],
            main_activities=["Roads, Bridges & Civil Infrastructure"],
            secondary_activities=["Electromechanical (MEP) Works"],
            contractor_classification="Roads",
            classification_grade=2,
            experience_years=15,
            manpower_count=250,
            equipment_tags=["Heavy Excavators", "Asphalt Pavers"],
            comfortable_project_size="20M - 100M SAR",
            preferred_project_value_sar=45000000.0,
            guarantee_capability_sar=25000000.0,
            certifications=["SCA_MUQAWIL", "ARAMCO_APPROVED"],
            direct_tender_interest=True,
            subcontracting_interest=True,
            vendor_registration_interest=True,
            excluded_project_types=["Residential villas"],
            annual_turnover=85000000.0,
            capacity_tags=["civil engineering", "roads"],
            exclusion_flags=[],
        )

        future_deadline = (datetime.utcnow() + timedelta(days=30)).isoformat()
        self.sample_tender = Tender(
            id="tender-test-01",
            source="Etimad",
            title="Northern Ring Road Extension Project",
            title_ar="مشروع امتداد الطريق الدائري الشمالي",
            work_category="Roads, Bridges & Civil Infrastructure",
            city="Riyadh",
            region="Riyadh Region",
            entity="Riyadh Municipality",
            budget_sar=40000000.0,
            bid_bond_sar=800000.0,
            deadline=future_deadline,
            description="Asphalt paving, bridge construction and drainage networks.",
            exclusion_flags=[],
            status="open",
        )

    def test_configuration_defaults(self):
        self.assertEqual(settings.APP_NAME, "Tender Intelligence Saudi")
        self.assertTrue(settings.MONGODB_URI.startswith("mongodb"))
        self.assertEqual(settings.API_PREFIX, "/api")

    def test_company_profile_serialization(self):
        d = self.sample_company.to_dict()
        self.assertEqual(d["name"], "Al-Bawani Contracting")
        self.assertEqual(d["name_ar"], "شركة البواني للمقاولات")
        self.assertEqual(d["company_size"], "Medium")
        self.assertEqual(d["classification_grade"], 2)

        deserialized = CompanyProfile.from_dict(d)
        self.assertEqual(deserialized.id, self.sample_company.id)
        self.assertEqual(deserialized.preferred_project_value_sar, 45000000.0)

    def test_mongodb_repository_crud(self):
        # Create
        self.repo.save_company(self.sample_company)
        # Read
        fetched = self.repo.get_company("comp-test-01")
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.name, "Al-Bawani Contracting")

        # Update
        fetched.manpower_count = 300
        self.repo.save_company(fetched)
        updated = self.repo.get_company("comp-test-01")
        self.assertEqual(updated.manpower_count, 300)

    def test_audit_logging_and_tenant_isolation(self):
        log1 = AuditLog(
            id="audit-1",
            tenant_id="tenant-alpha",
            action="CREATE_TENDER",
            entity="tender",
            entity_id="tender-001",
        )
        log2 = AuditLog(
            id="audit-2",
            tenant_id="tenant-beta",
            action="UPDATE_PROFILE",
            entity="company",
            entity_id="comp-002",
        )
        self.repo.log_audit_event(log1)
        self.repo.log_audit_event(log2)

        alpha_logs = self.repo.list_audit_events(tenant_id="tenant-alpha")
        self.assertEqual(len(alpha_logs), 1)
        self.assertEqual(alpha_logs[0]["action"], "CREATE_TENDER")

    def test_rule_company_size_does_not_determine_eligibility(self):
        small_contractor = CompanyProfile.from_dict(self.sample_company.to_dict())
        small_contractor.company_size = "Small"
        small_contractor.annual_turnover = 50000000.0

        large_contractor = CompanyProfile.from_dict(self.sample_company.to_dict())
        large_contractor.company_size = "Large"
        large_contractor.annual_turnover = 50000000.0

        small_res = compute_eligibility(small_contractor, self.sample_tender)
        large_res = compute_eligibility(large_contractor, self.sample_tender)

        self.assertTrue(small_res["passed"])
        self.assertTrue(large_res["passed"])

        # Size affects ranking score on mega projects
        mega_tender = Tender.from_dict(self.sample_tender.to_dict())
        mega_tender.budget_sar = 120000000.0
        mega_tender.budget = 120000000.0
        small_contractor.annual_turnover = 150000000.0
        large_contractor.annual_turnover = 150000000.0

        small_match = compute_match(small_contractor, mega_tender)
        large_match = compute_match(large_contractor, mega_tender)
        self.assertGreater(large_match["score"], small_match["score"])

    def test_excluded_project_scope_disqualification(self):
        villa_tender = Tender.from_dict(self.sample_tender.to_dict())
        villa_tender.title = "Residential Villas Compound in Diriyah"
        villa_tender.description = "Construction of private residential villas."
        res = compute_eligibility(self.sample_company, villa_tender)
        self.assertFalse(res["passed"])
        self.assertTrue(any("excluded project scope" in f for f in res["failed_criteria"]))

    def test_apscheduler_jobs_registration(self):
        self.scheduler.initialize()
        status = self.scheduler.get_status()
        self.assertEqual(status["jobs_count"], 4)
        job_ids = [j["id"] for j in status["jobs"]]
        self.assertIn("saudi_source_health_check", job_ids)
        self.assertIn("daily_etimad_ingestion", job_ids)
        self.assertIn("daily_saudi_opportunity_scan", job_ids)

    def test_chroma_vector_store_abstraction(self):
        chunks = [
            DocumentChunk(
                id="chunk-1",
                document_id="doc-01",
                tender_id=self.sample_tender.id,
                chunk_index=0,
                content="Contractor must execute asphalt paving and heavy road excavation.",
                locator="Section 3.1",
            ),
            DocumentChunk(
                id="chunk-2",
                document_id="doc-01",
                tender_id=self.sample_tender.id,
                chunk_index=1,
                content="Supplier must provide cloud data center telemetry sensors.",
                locator="Section 4.2",
            ),
        ]
        self.chroma.add_chunks(self.sample_tender.id, chunks)
        results = self.chroma.query_semantic("asphalt road paving excavation", top_k=1)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "chunk-1")
        self.assertEqual(results[0]["locator"], "Section 3.1")

    def test_saudi_sources_seeded_and_metadata(self):
        seeded = SourceRegistryService.seed_default_sources(self.repo)
        self.assertEqual(seeded, 42)
        # Idempotent re-seed
        self.assertEqual(SourceRegistryService.seed_default_sources(self.repo), 0)

        sources = self.repo.list_sources()
        self.assertEqual(len(sources), 42)

        etimad = self.repo.get_source("src-etimad")
        self.assertIsNotNone(etimad)
        self.assertEqual(etimad.name, "Etimad (Monafasat)")
        self.assertEqual(etimad.name_ar, "منصة اعتماد (منافسات الحكومية)")
        self.assertEqual(etimad.authority_type, "GOVERNMENT_PORTAL")
        self.assertEqual(etimad.verification_level, "VERIFIED_OFFICIAL")

        # Check RCJY (High priority)
        rcjy = self.repo.get_source("src-rcjy")
        self.assertIsNotNone(rcjy)
        self.assertEqual(rcjy.priority, "HIGH")
        self.assertEqual(rcjy.name, "Royal Commission for Jubail and Yanbu (RCJY)")
        self.assertEqual(rcjy.verification_status, "VERIFIED")

        # Check Ma'aden
        maaden = self.repo.get_source("src-maaden")
        self.assertIsNotNone(maaden)
        self.assertEqual(maaden.authority_type, "MINING_HEAVY_INDUSTRY")

        # Check SAR
        sar = self.repo.get_source("src-sar")
        self.assertIsNotNone(sar)
        self.assertEqual(sar.authority_type, "TRANSPORT_LOGISTICS")

        # Check SPA
        spa = self.repo.get_source("src-spa")
        self.assertIsNotNone(spa)
        self.assertEqual(spa.authority_type, "NEWS_DISCLOSURE_PORTAL")

        # Check giga projects
        giga_sources = self.repo.list_sources(authority_type="GIGA_PROJECT")
        self.assertGreaterEqual(len(giga_sources), 8)
        giga_ids = [s.id for s in giga_sources]
        self.assertIn("src-neom", giga_ids)
        self.assertIn("src-redsea", giga_ids)
        self.assertIn("src-qiddiya", giga_ids)
        self.assertIn("src-diriyah", giga_ids)
        self.assertIn("src-new-murabba", giga_ids)
        self.assertIn("src-soudah", giga_ids)

        # Check Tadawul award disclosures
        tadawul = self.repo.get_source("src-tadawul")
        self.assertIsNotNone(tadawul)
        self.assertEqual(tadawul.authority_type, "FINANCIAL_MARKET_DISCLOSURES")
        self.assertEqual(tadawul.verification_level, "OFFICIAL_DISCLOSURE")

        # Check DISCOVERY_REQUIRED handling on unverified sources
        kap = self.repo.get_source("src-kap")
        self.assertIsNotNone(kap)
        self.assertEqual(kap.verification_status, "DISCOVERY_REQUIRED")
        self.assertIsNone(kap.resolved_endpoint)

    def test_source_failure_isolation_and_circuit_breaker(self):
        SourceRegistryService.seed_default_sources(self.repo)

        # Healthy probe on Etimad
        res_etimad = SourceRegistryService.probe_source_health("src-etimad", self.repo, simulate_failure=False)
        self.assertEqual(res_etimad["status"], "SUCCESS")
        self.assertEqual(res_etimad["health_status"], "HEALTHY")

        # Simulate failure on NEOM
        res_neom_1 = SourceRegistryService.probe_source_health("src-neom", self.repo, simulate_failure=True)
        self.assertEqual(res_neom_1["status"], "FAILED")
        self.assertTrue(res_neom_1["isolated"])

        # Second consecutive failure degrades health
        res_neom_2 = SourceRegistryService.probe_source_health("src-neom", self.repo, simulate_failure=True)
        self.assertEqual(res_neom_2["health_status"], "DEGRADED")

        # Etimad remains healthy (isolated failure)
        etimad = self.repo.get_source("src-etimad")
        self.assertEqual(etimad.health_status, "HEALTHY")
        self.assertEqual(etimad.consecutive_failures, 0)

        # Verify source runs logged
        runs = self.repo.list_source_runs(source_id="src-neom")
        self.assertGreaterEqual(len(runs), 2)
        self.assertEqual(runs[0]["status"], "FAILED")

    def test_dynamic_source_discovery_service(self):
        from backend.app.sources.discovery import DynamicSourceDiscoveryService
        SourceRegistryService.seed_default_sources(self.repo)

        kap = self.repo.get_source("src-kap")
        self.assertEqual(kap.verification_status, "DISCOVERY_REQUIRED")

        # 1. Provide candidate links from official domain
        candidate_links = [
            {"url": "https://www.kingabdullahport.com.sa/business/tenders", "text": "Vendor Portal & Tenders"},
            {"url": "https://unauthorized-domain.com/leaked-tenders", "text": "Leaked RFPs"},
        ]

        disc_res = DynamicSourceDiscoveryService.discover_endpoint(kap, candidate_links=candidate_links)
        self.assertTrue(disc_res["success"])
        self.assertEqual(kap.verification_status, "VERIFIED")
        self.assertEqual(kap.resolved_endpoint, "https://www.kingabdullahport.com.sa/business/tenders")
        self.assertIn("RFP_TENDER_DOWNLOAD", kap.capability_tags)

        # 2. Test unverified candidate with outside domain fails safely
        sp_boulevard = self.repo.get_source("src-sports-boulevard")
        fail_links = [
            {"url": "https://random-blog.com/sports-boulevard", "text": "News About Sports Boulevard"}
        ]
        disc_fail = DynamicSourceDiscoveryService.discover_endpoint(sp_boulevard, candidate_links=fail_links)
        self.assertFalse(disc_fail["success"])
        self.assertEqual(sp_boulevard.verification_status, "DISCOVERY_REQUIRED")
        self.assertIsNone(sp_boulevard.resolved_endpoint)

    def test_changed_endpoint_rediscovery_and_history_preservation(self):
        from backend.app.sources.discovery import DynamicSourceDiscoveryService
        SourceRegistryService.seed_default_sources(self.repo)

        rcjy = self.repo.get_source("src-rcjy")
        initial_endpoint = rcjy.resolved_endpoint

        # Simulate changed endpoint rediscovery
        new_links = [
            {"url": "https://www.rcjy.gov.sa/ar/portal/procurement/new-tenders", "text": "البوابة الموحدة للمنافسات والمشتريات"}
        ]
        res = DynamicSourceDiscoveryService.handle_changed_endpoint(rcjy, self.repo, new_candidate_links=new_links)

        self.assertTrue(res["rediscovery_success"])
        self.assertEqual(res["previous_endpoint"], initial_endpoint)
        self.assertEqual(rcjy.resolved_endpoint, "https://www.rcjy.gov.sa/ar/portal/procurement/new-tenders")
        # History preserved (never silently replaced)
        self.assertEqual(len(rcjy.endpoint_history), 1)
        self.assertEqual(rcjy.endpoint_history[0]["endpoint"], initial_endpoint)

    def test_saudi_city_and_location_normalization(self):
        from backend.app.services.location_normalizer import normalize_saudi_location

        self.assertEqual(normalize_saudi_location("الجبيل الصناعية"), ("Eastern Province", "Jubail Industrial City"))
        self.assertEqual(normalize_saudi_location("Jubail"), ("Eastern Province", "Jubail"))
        self.assertEqual(normalize_saudi_location("Al-Khobar"), ("Eastern Province", "Khobar"))
        self.assertEqual(normalize_saudi_location("رأس الخير"), ("Eastern Province", "Ras Al Khair"))
        self.assertEqual(normalize_saudi_location("الرياض"), ("Riyadh Region", "Riyadh"))
        self.assertEqual(normalize_saudi_location("Jeddah"), ("Makkah Region", "Jeddah"))
        self.assertEqual(normalize_saudi_location("مدينة ينبع الصناعية"), ("Medina Region", "Yanbu Industrial City"))
        self.assertEqual(normalize_saudi_location("نيوم"), ("Tabuk Region", "NEOM"))
        self.assertEqual(normalize_saudi_location("NonExistentCity"), ("UNKNOWN", "UNKNOWN"))

    def test_public_contact_extraction_safety(self):
        from backend.app.services.contact_extractor import PublicContactExtractor

        text = "For official inquiries, email procurement@alriyadh.gov.sa or personal test@gmail.com. Phone: 0114112222"
        contact = PublicContactExtractor.extract_public_contact(text, default_portal_url="https://alriyadh.gov.sa")

        self.assertEqual(contact["procurement_email"], "procurement@alriyadh.gov.sa")
        # Personal gmail rejected
        self.assertNotIn("test@gmail.com", contact.values())
        self.assertEqual(contact["business_phone"], "0114112222")
        self.assertEqual(contact["supplier_portal"], "https://alriyadh.gov.sa")

    def test_government_and_private_opportunity_ingestion(self):
        from backend.app.ingestion.connectors import OpportunityIngestionPipeline
        SourceRegistryService.seed_default_sources(self.repo)

        # Run ingestion cycle
        res = OpportunityIngestionPipeline.run_ingestion_cycle(self.repo)
        self.assertGreaterEqual(res["total_ingested"], 6)
        self.assertEqual(len(res["adapter_errors"]), 0)

        # 1. Check Government Opportunity (Etimad)
        opps = self.repo.list_opportunities(source_id="src-etimad")
        self.assertGreaterEqual(len(opps), 1)
        etimad_opp = opps[0]
        self.assertEqual(etimad_opp.opportunity_type, "GOVERNMENT_TENDER")
        self.assertEqual(etimad_opp.confidence_level, "CONFIRMED_OPPORTUNITY")
        self.assertEqual(etimad_opp.city, "Riyadh")
        self.assertEqual(etimad_opp.region, "Riyadh Region")
        self.assertIsNotNone(etimad_opp.budget_sar)

        # 2. Check RCJY Opportunity
        rcjy_opps = self.repo.list_opportunities(source_id="src-rcjy")
        self.assertGreaterEqual(len(rcjy_opps), 1)
        rcjy_opp = rcjy_opps[0]
        self.assertEqual(rcjy_opp.city, "Jubail Industrial City")
        self.assertEqual(rcjy_opp.region, "Eastern Province")

        # 3. Check Private Subcontract Opportunity (Aramco)
        aramco_opps = self.repo.list_opportunities(source_id="src-aramco")
        self.assertGreaterEqual(len(aramco_opps), 1)
        aramco_opp = aramco_opps[0]
        self.assertEqual(aramco_opp.opportunity_type, "SUBCONTRACT_REQUEST")
        self.assertEqual(aramco_opp.confidence_level, "CONFIRMED_OPPORTUNITY")

        # 4. Check Market Signal is NOT promoted to Confirmed Opportunity (Rule B3)
        tadawul_opps = self.repo.list_opportunities(source_id="src-tadawul")
        self.assertGreaterEqual(len(tadawul_opps), 1)
        tadawul_opp = tadawul_opps[0]
        self.assertEqual(tadawul_opp.confidence_level, "MARKET_SIGNAL_ONLY")
        self.assertNotEqual(tadawul_opp.confidence_level, "CONFIRMED_OPPORTUNITY")

        # 5. Check UNKNOWN handling for missing data (Rule B1)
        furas_opps = self.repo.list_opportunities(source_id="src-furas")
        self.assertGreaterEqual(len(furas_opps), 1)
        furas_opp = furas_opps[0]
        self.assertEqual(furas_opp.contractor_classification_req, "UNKNOWN")
        self.assertIsNone(furas_opp.required_experience_years)

        # 6. Check Raw Source Record Preservation (Rule B4)
        raw_rec = self.repo.get_raw_record(etimad_opp.raw_record_id)
        self.assertIsNotNone(raw_rec)
        self.assertEqual(raw_rec.source_id, "src-etimad")
        self.assertTrue(len(raw_rec.raw_evidence_hash) > 20)

    def test_arabic_english_saudi_normalization(self):
        from backend.app.services.normalization import SaudiNormalizationService

        # Title normalization
        norm_title, orig = SaudiNormalizationService.normalize_title("مشروع توسعة وازدواج طريق الملك فهد بالرياض")
        self.assertNotIn("مشروع", norm_title)
        self.assertIn("توسعه", norm_title)

        # Entity normalization
        ent, _ = SaudiNormalizationService.normalize_entity("أمانة منطقة الرياض")
        self.assertEqual(ent, "Riyadh Municipality")

        rcjy_ent, _ = SaudiNormalizationService.normalize_entity("الهيئة الملكية للجبيل وينبع")
        self.assertEqual(rcjy_ent, "Royal Commission for Jubail and Yanbu (RCJY)")

        # Currency normalization
        self.assertEqual(SaudiNormalizationService.normalize_sar_currency("45,000,000 SAR"), 45000000.0)
        self.assertEqual(SaudiNormalizationService.normalize_sar_currency("25 مليون ريال"), 25000000.0)
        self.assertEqual(SaudiNormalizationService.normalize_sar_currency("12.5 M SAR"), 12500000.0)

    def test_multi_source_deduplication_arabic_and_english(self):
        from backend.app.services.deduplication import MultiSourceDeduplicationService
        from backend.app.models.schemas import CanonicalOpportunity

        opp_arabic = CanonicalOpportunity(
            id="opp-etimad-101",
            title="مشروع إنشاء محطة تحويل كهربائي بالجبيل الصناعية",
            title_ar="مشروع إنشاء محطة تحويل كهربائي بالجبيل الصناعية",
            entity="Saudi Electricity Company (SEC)",
            reference_number="SEC-JUB-2026-001",
            city="Jubail Industrial City",
            region="Eastern Province",
            work_category="Electrical Power & Substation EPC",
            primary_source_id="src-etimad",
            all_source_ids=["src-etimad"],
            budget_sar=50000000.0,
        )

        opp_english = CanonicalOpportunity(
            id="opp-sec-102",
            title="Construction of Power Substation in Jubail Industrial City",
            entity="SEC",
            reference_number="SEC-JUB-2026-001",
            city="Jubail Industrial City",
            region="Eastern Province",
            work_category="Electrical Power & Substation EPC",
            primary_source_id="src-sec",
            all_source_ids=["src-sec"],
            budget_sar=50000000.0,
        )

        self.assertTrue(MultiSourceDeduplicationService.are_duplicates(opp_arabic, opp_english))

        # Merge
        merged, conflicts = MultiSourceDeduplicationService.merge_duplicates(opp_arabic, opp_english)
        self.assertEqual(merged.reference_number, "SEC-JUB-2026-001")
        self.assertIn("src-etimad", merged.all_source_ids)
        self.assertIn("src-sec", merged.all_source_ids)
        self.assertEqual(len(conflicts), 0)

    def test_conflicting_sources_tracked_without_data_loss(self):
        from backend.app.services.deduplication import MultiSourceDeduplicationService
        from backend.app.models.schemas import CanonicalOpportunity

        opp_etimad = CanonicalOpportunity(
            id="opp-etimad-201",
            title="Road Paving Package in Yanbu",
            reference_number="RCJY-YNB-990",
            entity="RCJY",
            city="Yanbu",
            primary_source_id="src-etimad",
            budget_sar=45000000.0,
            closing_date="2026-11-01T12:00:00",
        )

        opp_spa = CanonicalOpportunity(
            id="opp-spa-202",
            title="Road Paving Package in Yanbu",
            reference_number="RCJY-YNB-990",
            entity="RCJY",
            city="Yanbu",
            primary_source_id="src-spa",
            budget_sar=40000000.0,  # Conflicting budget
            closing_date="2026-11-15T12:00:00",  # Conflicting closing date
        )

        merged, conflicts = MultiSourceDeduplicationService.merge_duplicates(opp_etimad, opp_spa)
        self.assertEqual(merged.verification_status, "CONFLICTING_SOURCES")
        self.assertIn("budget_sar", conflicts)
        self.assertIn("closing_date", conflicts)
        self.assertEqual(len(conflicts["budget_sar"]), 2)

    def test_company_size_alone_never_determines_eligibility(self):
        from backend.app.services.eligibility_engine import SaudiEligibilityEngine
        from backend.app.models.schemas import CanonicalOpportunity, CompanyProfile

        small_company = CompanyProfile(
            id="comp-small",
            name="Small Contractor Est.",
            company_size="Small",
            contractor_classification="Roads",
            classification_grade=2,
            experience_years=10,
            manpower_count=40,
            saudi_regions=["Riyadh Region"],
            guarantee_capability_sar=5000000.0,
            certifications=["SCA_MUQAWIL"],
        )

        large_company = CompanyProfile(
            id="comp-large",
            name="Large Contracting Corp",
            company_size="Large",
            contractor_classification="Roads",
            classification_grade=2,
            experience_years=10,
            manpower_count=400,
            saudi_regions=["Riyadh Region"],
            guarantee_capability_sar=5000000.0,
            certifications=["SCA_MUQAWIL"],
        )

        opp = CanonicalOpportunity(
            id="opp-test-size",
            title="Road Grading in Riyadh",
            entity="Riyadh Municipality",
            city="Riyadh",
            region="Riyadh Region",
            work_category="Roads, Bridges & Civil Infrastructure",
            contractor_classification_req="Roads Grade 2 or higher",
            required_experience_years=5,
            mandatory_certifications=["SCA_MUQAWIL"],
            bid_bond_sar=100000.0,
            closing_date="2026-12-01T00:00:00",
        )

        eval_small = SaudiEligibilityEngine.evaluate_eligibility(small_company, opp)
        eval_large = SaudiEligibilityEngine.evaluate_eligibility(large_company, opp)

        # Both meet all substantive requirements; small company is NOT disqualified due to size
        self.assertTrue(eval_small["passed"])
        self.assertEqual(eval_small["status"], "ELIGIBLE")
        self.assertTrue(eval_large["passed"])
        self.assertEqual(eval_large["status"], "ELIGIBLE")

    def test_hard_eligibility_failure_not_overridden_by_high_match_score(self):
        from backend.app.services.intelligence_pipeline import TenderIntelligencePipeline
        from backend.app.models.schemas import CanonicalOpportunity

        # Missing mandatory certification (ISO_9001)
        opp = CanonicalOpportunity(
            id="opp-test-independence",
            title="Northern Ring Road Extension Project in Riyadh",
            description="Major civil infrastructure and heavy road excavation.",
            entity="Riyadh Municipality",
            city="Riyadh",
            region="Riyadh Region",
            work_category="Roads, Bridges & Civil Infrastructure",
            budget_sar=45000000.0,  # Exact preferred budget
            bid_bond_sar=500000.0,
            required_experience_years=8,
            mandatory_certifications=["ISO_9001"],  # Sample company does not have this
            closing_date="2026-12-01T00:00:00",
        )

        res = TenderIntelligencePipeline.evaluate_opportunity(self.sample_company, opp)

        # Match score is high because scope, budget, and location fit perfectly
        self.assertGreaterEqual(res["match_score"]["total_score"], 80.0)
        self.assertEqual(res["match_score"]["label"], "STRONG_MATCH")

        # But Eligibility MUST be NOT_ELIGIBLE (Hard gate independent)
        self.assertFalse(res["eligibility"]["passed"])
        self.assertEqual(res["eligibility"]["status"], "NOT_ELIGIBLE")
        self.assertTrue(any("Missing mandatory certification: ISO_9001" in f for f in res["eligibility"]["failed_criteria"]))

    def test_large_project_evaluates_as_subcontract_target(self):
        from backend.app.services.intelligence_pipeline import TenderIntelligencePipeline
        from backend.app.models.schemas import CanonicalOpportunity

        # Massive 300M SAR Mega Project (Contractor preferred is 45M SAR)
        opp = CanonicalOpportunity(
            id="opp-mega-project",
            title="NEOM Magna Coastal Highway Mega Package",
            entity="NEOM Company",
            city="NEOM",
            region="Tabuk Region",
            work_category="Roads, Bridges & Civil Infrastructure",
            budget_sar=300000000.0,
            primary_source_id="src-neom",
            opportunity_type="PROJECT_SIGNAL",
            closing_date="2026-12-01T00:00:00",
        )

        res = TenderIntelligencePipeline.evaluate_opportunity(self.sample_company, opp)

        self.assertTrue(res["subcontract"]["is_subcontract_target"])
        self.assertEqual(res["subcontract"]["potential_level"], "HIGH")
        self.assertEqual(res["subcontract"]["recommended_positioning"], "SPECIALIST_SUBCONTRACTOR")
        self.assertEqual(res["gap_analysis"]["potential_action"], "SUBCONTRACT_TARGET")

    def test_rag_tender_analysis_evidence_and_low_confidence_review(self):
        from backend.app.rag.tender_analysis import TenderSpecificationAnalysisService

        spec_text = """
        SECTION 1: Scope of work includes construction of dual asphalt roads and drainage networks.
        SECTION 2: Classification requirement is Contractor Classification in Roads.
        SECTION 3: Mandatory certification: SCA Muqawil and ZATCA compliance.
        SECTION 4: Bid bond guarantee of 500,000 SAR is required upon submission.
        SECTION 5: High voltage underground utility conduits require dewatering hazard mitigation.
        """

        analysis = TenderSpecificationAnalysisService.analyze_tender_document(
            document_id="doc-spec-001",
            tender_id="tender-test-01",
            document_text=spec_text,
        )

        self.assertEqual(len(analysis["extracted_statements"]), 1)
        self.assertEqual(analysis["extracted_statements"][0]["category"], "SCOPE_OF_WORK")
        self.assertEqual(analysis["extracted_statements"][0]["locator"], "Line 1")

        # Check classification without explicit grade marked as REVIEW_REQUIRED (< 0.70 confidence)
        class_req = next(r for r in analysis["mandatory_requirements"] if r["type"] == "CLASSIFICATION")
        self.assertEqual(class_req["status"], "REVIEW_REQUIRED")
        self.assertLess(class_req["confidence"], 0.70)

        # Bid bond verified
        fin_req = next(r for r in analysis["mandatory_requirements"] if r["type"] == "FINANCIAL_GUARANTEE")
        self.assertEqual(fin_req["status"], "VERIFIED")
        self.assertGreaterEqual(fin_req["confidence"], 0.90)

    def test_daily_monitoring_run_isolated_execution(self):
        from backend.app.monitoring.daily_monitor import DailyMonitoringEngine
        from backend.app.ingestion.connectors import OpportunityIngestionPipeline

        SourceRegistryService.seed_default_sources(self.repo)
        OpportunityIngestionPipeline.run_ingestion_cycle(self.repo)

        # Run daily monitoring without fixtures (production mode)
        run = DailyMonitoringEngine.run_daily_monitoring(
            repo=self.repo,
            allow_test_fixtures=False,
            target_company_id=self.sample_company.id,
        )

        self.assertIsNotNone(run.id)
        self.assertGreaterEqual(run.sources_attempted, 5)
        # Blocked and auth-required sources isolated
        self.assertGreaterEqual(run.sources_blocked, 1)
        self.assertGreaterEqual(run.sources_auth_required, 1)
        # Verify run recorded in repo
        runs_in_db = self.repo.list_monitoring_runs()
        self.assertGreaterEqual(len(runs_in_db), 1)

    def test_fixture_data_excluded_from_production_counts(self):
        from backend.app.monitoring.daily_monitor import DailyMonitoringEngine

        SourceRegistryService.seed_default_sources(self.repo)

        prod_run = DailyMonitoringEngine.run_daily_monitoring(
            repo=self.repo,
            allow_test_fixtures=False,
        )
        self.assertFalse(prod_run.is_fixture_run)

        # In production run, Etimad (which is FIXTURE_ONLY) must NOT be marked as live
        etimad_detail = next((d for d in prod_run.source_details if d["source_id"] == "src-etimad"), None)
        if etimad_detail:
            self.assertFalse(etimad_detail["is_live"])
            self.assertEqual(etimad_detail["status"], "FIXTURE_ONLY")

    def test_market_signals_excluded_from_confirmed_opportunities(self):
        from backend.app.monitoring.daily_monitor import DailyMonitoringEngine
        from backend.app.ingestion.connectors import OpportunityIngestionPipeline

        SourceRegistryService.seed_default_sources(self.repo)
        OpportunityIngestionPipeline.run_ingestion_cycle(self.repo)

        run = DailyMonitoringEngine.run_daily_monitoring(
            repo=self.repo,
            allow_test_fixtures=True,
        )

        # Market signals are explicitly tracked and not merged into confirmed opportunities
        self.assertGreaterEqual(run.market_signals, 1)
        self.assertGreaterEqual(run.confirmed_opportunities, 1)
        # Confirmed + Possible + Market Signal equals canonical created
        self.assertEqual(
            run.confirmed_opportunities + run.possible_opportunities + run.market_signals,
            run.canonical_opportunities_created,
        )

    def test_immutable_daily_snapshot_history(self):
        from backend.app.monitoring.daily_monitor import DailyMonitoringEngine
        from backend.app.ingestion.connectors import OpportunityIngestionPipeline
        from datetime import date

        SourceRegistryService.seed_default_sources(self.repo)
        OpportunityIngestionPipeline.run_ingestion_cycle(self.repo)

        DailyMonitoringEngine.run_daily_monitoring(
            repo=self.repo,
            allow_test_fixtures=True,
            target_company_id=self.sample_company.id,
        )

        today_str = date.today().isoformat()
        snapshot = self.repo.get_daily_snapshot(today_str)
        self.assertIsNotNone(snapshot)
        initial_opp_count = snapshot.canonical_opportunities_count

        # Even if a new opportunity is added to the repository later:
        from backend.app.models.schemas import CanonicalOpportunity
        new_opp = CanonicalOpportunity(
            id="opp-late-arrival",
            title="Late Evening Emergency Tender",
            entity="Riyadh Municipality",
            primary_source_id="src-etimad",
        )
        self.repo.save_opportunity(new_opp)

        # Historical snapshot retrieved remains strictly immutable
        snapshot_after = self.repo.get_daily_snapshot(today_str)
        self.assertEqual(snapshot_after.canonical_opportunities_count, initial_opp_count)

    def test_saved_list_crud_and_persistence(self):
        from backend.app.models.schemas import SavedList

        saved_list = SavedList(
            id="list-jubail-october",
            company_id=self.sample_company.id,
            name="Jubail & Eastern Region Targets",
            notes="Target tenders for joint venture submission.",
            opportunity_ids=["opp-src-rcjy-002"],
        )

        # Create
        self.repo.save_saved_list(saved_list)
        fetched = self.repo.get_saved_list("list-jubail-october")
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.name, "Jubail & Eastern Region Targets")
        self.assertIn("opp-src-rcjy-002", fetched.opportunity_ids)

        # Update
        fetched.opportunity_ids.append("opp-src-etimad-001")
        fetched.notes = "Updated notes."
        self.repo.save_saved_list(fetched)

        updated = self.repo.get_saved_list("list-jubail-october")
        self.assertEqual(len(updated.opportunity_ids), 2)
        self.assertEqual(updated.notes, "Updated notes.")

        # List
        lists = self.repo.list_saved_lists(company_id=self.sample_company.id)
        self.assertEqual(len(lists), 1)

        # Delete
        deleted = self.repo.delete_saved_list("list-jubail-october")
        self.assertTrue(deleted)
        self.assertIsNone(self.repo.get_saved_list("list-jubail-october"))

if __name__ == "__main__":
    unittest.main()
