import unittest
from datetime import datetime, timedelta
from backend.app.models.schemas import (
    AwardWatchlist,
    AwardResult,
    CanonicalOpportunity,
    SavedList,
    RawSourceRecord,
)
from backend.app.db.mongodb import MongoRepository
from backend.app.services.award_tracking import AwardTrackingService
from backend.app.services.source_recovery import (
    SaudiSourceRecoveryService,
    PRIORITY_SOURCE_PROFILES,
)

class TestStage7AwardsAndRecovery(unittest.TestCase):
    def setUp(self):
        self.repo = MongoRepository(database_name="test_stage7_db")
        SaudiSourceRecoveryService.seed_source_access_profiles(self.repo)

        # Seed sample opportunity
        self.opp = CanonicalOpportunity(
            id="opp-src-rcjy-002",
            title="Industrial Seawater Cooling Network Upgrades in Jubail Industrial City",
            title_ar="ترقية شبكة مياه التبريد الصناعية بمياه البحر في مدينة الجبيل الصناعية",
            entity="Royal Commission for Jubail and Yanbu (RCJY)",
            reference_number="RCJY-JUB-2026-041",
            city="Jubail Industrial City",
            region="Eastern Province",
            work_category="Water & Wastewater Networks",
            budget_sar=125000000.0,
            closing_date=(datetime.utcnow() + timedelta(days=10)).isoformat(),
            confidence_level="CONFIRMED_OPPORTUNITY",
            primary_source_id="src-rcjy",
            all_source_ids=["src-rcjy"],
        )
        self.repo.save_opportunity(self.opp)

    def test_blocked_source_is_never_reported_as_live(self):
        report = SaudiSourceRecoveryService.get_source_recovery_report(self.repo)
        report_map = {item["source_id"]: item for item in report}

        # Check Tadawul, RCJY, NCP, Etimad, Aramco
        self.assertIn("src-tadawul", report_map)
        self.assertFalse(report_map["src-tadawul"]["opportunity_ingestion_works"])
        self.assertEqual(report_map["src-tadawul"]["current_access_mode"], "ASSISTED_IMPORT")

        self.assertIn("src-rcjy", report_map)
        self.assertFalse(report_map["src-rcjy"]["opportunity_ingestion_works"])
        self.assertEqual(report_map["src-rcjy"]["current_access_mode"], "RUNTIME_ENVIRONMENT_BLOCKED")

        self.assertIn("src-ncp", report_map)
        self.assertFalse(report_map["src-ncp"]["opportunity_ingestion_works"])
        self.assertEqual(report_map["src-ncp"]["current_access_mode"], "RUNTIME_ENVIRONMENT_BLOCKED")

    def test_etimad_fallback_and_assisted_import(self):
        # Ingest assisted record into same canonical pipeline
        payload = {
            "title": "Operation and Maintenance of Public Street Lighting in Riyadh Municipality",
            "title_ar": "تشغيل وصيانة إنارة شوارع أمانة منطقة الرياض",
            "entity": "Riyadh Municipality (أمانة منطقة الرياض)",
            "city": "Riyadh",
            "region": "Riyadh Region",
            "work_category": "Electromechanical (MEP) Works",
            "budget_sar": 18500000.0,
            "reference_number": "ETM-2026-9921",
            "closing_date": (datetime.utcnow() + timedelta(days=20)).isoformat(),
            "file_name": "etimad_exported_notice.xlsx",
        }

        canonical_opp, raw_rec = SaudiSourceRecoveryService.process_assisted_import(
            repo=self.repo,
            source_id="src-etimad",
            import_type="ETIMAD_OFFICIAL_FILE_IMPORT",
            payload=payload,
        )

        self.assertIsNotNone(canonical_opp)
        self.assertIsNotNone(raw_rec)
        self.assertEqual(raw_rec.raw_fields["provenance"], "ETIMAD_OFFICIAL_FILE_IMPORT")
        self.assertEqual(canonical_opp.primary_source_id, "src-etimad")
        # Saudi normalization verified
        self.assertIn("Riyadh", canonical_opp.city)
        self.assertEqual(canonical_opp.budget_sar, 18500000.0)

        # Stored in repository
        fetched = self.repo.get_opportunity(canonical_opp.id)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.reference_number, "ETM-2026-9921")

    def test_rcjy_recovery_status_and_network_designation(self):
        profile = self.repo.get_source_access_profile("src-rcjy")
        self.assertIsNotNone(profile)
        self.assertEqual(profile.access_mode, "RUNTIME_ENVIRONMENT_BLOCKED")
        self.assertIn("Cloud Run", profile.failure_reason)
        self.assertTrue(profile.manual_import_supported)

    def test_ncp_recovery_status_and_pipeline_separation(self):
        profile = self.repo.get_source_access_profile("src-ncp")
        self.assertIsNotNone(profile)
        self.assertEqual(profile.access_mode, "RUNTIME_ENVIRONMENT_BLOCKED")
        self.assertTrue(profile.manual_import_supported)

    def test_tadawul_waf_handling(self):
        profile = self.repo.get_source_access_profile("src-tadawul")
        self.assertIsNotNone(profile)
        self.assertEqual(profile.access_mode, "ASSISTED_IMPORT")
        self.assertIn("WAF", profile.runtime_limitation)
        self.assertTrue(profile.award_data_supported)

    def test_aramco_auth_required_handling(self):
        report = SaudiSourceRecoveryService.get_source_recovery_report(self.repo)
        aramco = next((r for r in report if r["source_id"] == "src-aramco"), None)
        self.assertIsNotNone(aramco)
        self.assertTrue(aramco["authentication_required"])
        self.assertEqual(aramco["current_access_mode"], "AUTHENTICATED_LIVE")

    def test_award_watch_creation_and_persistence(self):
        watch = AwardTrackingService.register_award_watch(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
            company_id="comp-sa-001",
            saved_list_id="list-jubail-01",
        )

        self.assertIsNotNone(watch)
        self.assertEqual(watch.opportunity_id, "opp-src-rcjy-002")
        self.assertEqual(watch.company_id, "comp-sa-001")
        self.assertEqual(watch.current_award_status, "AWARD_PENDING")
        self.assertGreater(watch.checks_count, 0)
        self.assertIsNotNone(watch.next_check_at)

        # Retrieve from repository
        fetched = self.repo.get_award_watch(watch.id)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.id, watch.id)

    def test_adaptive_apscheduler_check_calculation(self):
        now_dt = datetime.utcnow()

        # 1. Before closing date -> checks after closing date + 1 day
        future_closing = (now_dt + timedelta(days=15)).isoformat()
        next_dt_future = AwardTrackingService.calculate_next_check_date(future_closing, now_dt)
        self.assertGreater(next_dt_future, now_dt + timedelta(days=14))

        # 2. 0-14 days after closing -> checks daily
        recent_closing = (now_dt - timedelta(days=3)).isoformat()
        next_dt_recent = AwardTrackingService.calculate_next_check_date(recent_closing, now_dt)
        self.assertLessEqual((next_dt_recent - now_dt).total_seconds() / 86400, 1.1)

        # 3. 15-60 days after closing -> checks weekly (every 7 days)
        mid_closing = (now_dt - timedelta(days=30)).isoformat()
        next_dt_mid = AwardTrackingService.calculate_next_check_date(mid_closing, now_dt)
        self.assertAlmostEqual((next_dt_mid - now_dt).total_seconds() / 86400, 7, delta=1)

        # 4. 60+ days after closing -> checks every 21 days
        old_closing = (now_dt - timedelta(days=80)).isoformat()
        next_dt_old = AwardTrackingService.calculate_next_check_date(old_closing, now_dt)
        self.assertAlmostEqual((next_dt_old - now_dt).total_seconds() / 86400, 21, delta=1)

    def test_verified_award_result_recording(self):
        # Register watch first
        AwardTrackingService.register_award_watch(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
        )

        # Record official verified award
        res = AwardTrackingService.record_award_result(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
            winner_legal_name="Al-Rashid Trading & Contracting Co.",
            source_type="OFFICIAL_OWNER_ANNOUNCEMENT",
            source_url="https://www.rcjy.gov.sa/en/Business/Awards/2026-041",
            award_date="2026-09-28",
            contract_value_sar=125000000.0,
            contract_duration="36 Months",
            evidence_text="Officially awarded under GTPL Article 52 by RCJY Procurement Board.",
            status="AWARDED_VERIFIED",
        )

        self.assertIsNotNone(res)
        self.assertEqual(res.status, "AWARDED_VERIFIED")
        self.assertEqual(res.winner_legal_name, "Al-Rashid Trading & Contracting Co.")
        self.assertEqual(res.contract_value_sar, 125000000.0)
        self.assertEqual(res.verification_confidence, 1.0)

        # Watch was updated to verified
        watches = self.repo.list_award_watches(opportunity_id="opp-src-rcjy-002")
        self.assertEqual(len(watches), 1)
        self.assertEqual(watches[0].current_award_status, "AWARDED_VERIFIED")
        self.assertEqual(watches[0].result_confidence, 1.0)

        # Main contractor handoff was created
        contractors = self.repo.list_main_contractors()
        self.assertGreaterEqual(len(contractors), 1)
        matching_contractor = next((c for c in contractors if c.contractor_name == "Al-Rashid Trading & Contracting Co."), None)
        self.assertIsNotNone(matching_contractor)
        self.assertEqual(matching_contractor.awarded_project_id, "opp-src-rcjy-002")

    def test_evidence_required_for_winner_and_result_not_public(self):
        # CRITICAL RULE: Never invent a winner without evidence
        res = AwardTrackingService.record_award_result(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
            winner_legal_name="UNKNOWN",
            source_type="ORIGINAL_TENDER_PORTAL",
            source_url="https://www.rcjy.gov.sa",
            status="AWARDED_VERIFIED",
        )

        # If winner is unknown or missing, status must automatically be RESULT_NOT_PUBLIC
        self.assertEqual(res.status, "RESULT_NOT_PUBLIC")
        self.assertEqual(res.winner_legal_name, "UNKNOWN")

    def test_cancelled_tender_handling(self):
        res = AwardTrackingService.record_award_result(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
            winner_legal_name="UNKNOWN",
            source_type="GOVERNMENT_AUTHORITY_NOTICE",
            source_url="https://www.rcjy.gov.sa",
            status="CANCELLED",
            evidence_text="Tender officially cancelled due to budget restructuring.",
        )

        self.assertEqual(res.status, "CANCELLED")

        # Notification dispatched
        notifs = self.repo.list_notifications()
        cancelled_notif = next((n for n in notifs if n.event_type == "TENDER_CANCELLED"), None)
        self.assertIsNotNone(cancelled_notif)

    def test_conflicting_award_sources_handling(self):
        # 1. Record first award result from Source A
        AwardTrackingService.record_award_result(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
            winner_legal_name="Al-Bawani Contracting",
            source_type="TADAWUL_DISCLOSURE",
            source_url="https://www.saudiexchange.sa",
            contract_value_sar=110000000.0,
            status="AWARDED_SINGLE_OFFICIAL_SOURCE",
        )

        # 2. Record conflicting result from Source B with different winner
        conflicting_res = AwardTrackingService.record_award_result(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
            winner_legal_name="El-Seif Engineering Contracting",
            source_type="OFFICIAL_OWNER_ANNOUNCEMENT",
            source_url="https://www.rcjy.gov.sa",
            contract_value_sar=145000000.0,
            status="AWARDED_VERIFIED",
        )

        self.assertEqual(conflicting_res.status, "CONFLICTING_SOURCES")
        self.assertGreaterEqual(len(conflicting_res.conflicting_details), 2)

        # Notification dispatched for conflicting award
        notifs = self.repo.list_notifications()
        conflict_notif = next((n for n in notifs if n.event_type == "CONFLICTING_AWARD_RESULT"), None)
        self.assertIsNotNone(conflict_notif)

    def test_saved_list_award_summary(self):
        # Create saved list
        sl = SavedList(
            id="list-test-summary",
            company_id="comp-sa-001",
            name="Eastern Province Infrastructure",
            opportunity_ids=["opp-src-rcjy-002"],
        )
        self.repo.save_saved_list(sl)

        # Record award
        AwardTrackingService.record_award_result(
            repo=self.repo,
            opportunity_id="opp-src-rcjy-002",
            winner_legal_name="Al-Rashid Trading & Contracting Co.",
            source_type="OFFICIAL_OWNER_ANNOUNCEMENT",
            source_url="https://www.rcjy.gov.sa",
            contract_value_sar=125000000.0,
            status="AWARDED_VERIFIED",
        )

        summary = AwardTrackingService.get_saved_list_award_summary(self.repo, "list-test-summary")
        self.assertEqual(summary["total_watched"], 1)
        self.assertEqual(summary["counts"]["AWARDED"], 1)
        self.assertEqual(summary["items"][0]["winner"], "Al-Rashid Trading & Contracting Co.")
        self.assertTrue(summary["items"][0]["is_public"])

    def test_source_failure_isolation_in_adaptive_checks(self):
        # Register two watches
        w1 = AwardTrackingService.register_award_watch(self.repo, "opp-src-rcjy-002")
        w2 = AwardTrackingService.register_award_watch(self.repo, "opp-test-nonexistent")

        # Run checks
        result = AwardTrackingService.run_adaptive_award_checks(self.repo)
        self.assertGreaterEqual(result["checks_attempted"], 2)
        self.assertGreaterEqual(result["successful_updates"], 2)
        self.assertEqual(result["isolated_failures"], 0)

if __name__ == "__main__":
    unittest.main()
