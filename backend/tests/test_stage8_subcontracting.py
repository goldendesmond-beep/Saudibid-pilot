"""Stage 8: Main Contractor & Subcontracting Intelligence Test Suite.

Verifies:
1. Verified input gate (only verified prime awards accepted; rumors and market signals rejected)
2. Contractor name normalization & identity resolution
3. Public business contact enforcement (rejecting personal email domains)
4. Official portal discovery & authentication state tracking
5. Subcontract package decomposition & distinction between confirmed vs inferred
6. Company-to-subcontract matching, scoring, and eligibility
7. Action plan generation & step progression
"""

import unittest
from datetime import datetime

from backend.app.models.schemas import (
    AwardResult,
    CanonicalOpportunity,
    CompanyProfile,
    MainContractorRecord,
    SubcontractPackage,
    SubcontractActionPlan,
)
from backend.app.db.mongodb import MongoRepository
from backend.app.services.main_contractor_discovery import (
    MainContractorDiscoveryService,
    VERIFIED_SAUDI_PRIME_CONTRACTORS,
)
from backend.app.services.subcontracting_intelligence import (
    SubcontractingIntelligenceService,
)


class TestStage8SubcontractingIntelligence(unittest.TestCase):

    def setUp(self):
        self.repo = MongoRepository()
        self.company = CompanyProfile(
            id="comp-sa-001",
            name="Al-Yamama Modern Contracting Co.",
            name_ar="شركة اليمامة الحديثة للمقاولات",
            cr_number="1010189421",
            company_size="MEDIUM",
            classification_grade=2,
            preferred_project_value_sar=25_000_000.0,
            saudi_regions=["Eastern Province", "Riyadh Region"],
            saudi_cities=["Jubail", "Dammam", "Khobar", "Riyadh"],
            main_activities=["ELECTROMECHANICAL", "MEP", "HVAC", "CIVIL"],
            secondary_activities=["EARTHWORKS", "WATER_SEWAGE"],
            equipment_tags=["Excavator Cat 320", "Wheel Loader", "Mobile Crane 50T"],
            certifications=["ISO 9001", "ISO 45001"],
        )
        self.repo.save_company(self.company)

    def test_verified_input_gate_accepts_verified_awards(self):
        """Rule: Verified award results pass the input gate."""
        award = AwardResult(
            id="award-001",
            opportunity_id="opp-rcjy-001",
            official_tender_number="RCJY-2026-041",
            project_title="Jubail Seawater Cooling Network Expansion",
            owner_entity="Royal Commission for Jubail and Yanbu (RCJY)",
            winner_legal_name="Al-Rashid Trading & Contracting Co.",
            winner_normalized_name="Al-Rashid Trading & Contracting",
            award_date="2026-09-28",
            contract_value_sar=125_000_000.0,
            source_url="https://www.rcjy.gov.sa/awards/2026-041",
            source_type="ORIGINAL_TENDER_PORTAL",
            evidence_text="Official RCJY procurement award board gazette announcement.",
            verification_confidence=1.0,
            status="AWARDED_VERIFIED",
        )
        is_valid, reason = MainContractorDiscoveryService.validate_award_input(award)
        self.assertTrue(is_valid)
        self.assertEqual(reason, "VERIFIED_MAIN_CONTRACTOR_GATE_PASSED")

    def test_verified_input_gate_rejects_pending_or_unverified(self):
        """Rule: Awards that are pending, undisclosed, conflicting, or rumors are rejected."""
        # Pending award
        award_pending = AwardResult(
            id="award-002",
            opportunity_id="opp-002",
            official_tender_number="ETM-002",
            project_title="Riyadh Roads",
            owner_entity="Riyadh Municipality",
            winner_legal_name="UNKNOWN",
            status="AWARD_PENDING",
        )
        is_valid, reason = MainContractorDiscoveryService.validate_award_input(award_pending)
        self.assertFalse(is_valid)
        self.assertEqual(reason, "AWARD_NOT_YET_CONFIRMED")

        # Result not public
        award_not_public = AwardResult(
            id="award-003",
            opportunity_id="opp-003",
            official_tender_number="ETM-003",
            project_title="Dam Expansion",
            owner_entity="Ministry of Environment",
            winner_legal_name="",
            status="RESULT_NOT_PUBLIC",
        )
        is_valid, reason = MainContractorDiscoveryService.validate_award_input(award_not_public)
        self.assertFalse(is_valid)

        # Conflicting sources
        award_conflicting = AwardResult(
            id="award-004",
            opportunity_id="opp-004",
            official_tender_number="ETM-004",
            project_title="Hospital Construction",
            owner_entity="Ministry of Health",
            winner_legal_name="Consortium A",
            status="CONFLICTING_SOURCES",
        )
        is_valid, reason = MainContractorDiscoveryService.validate_award_input(award_conflicting)
        self.assertFalse(is_valid)
        self.assertEqual(reason, "CONFLICTING_AWARD_SOURCES_REQUIRE_MANUAL_REVIEW")

    def test_contractor_name_normalization(self):
        """Rule: Strip Arabic and English corporate prefixes and suffixes cleanly."""
        raw_ar = "شركة نسما وشركاهم للمقاولات المحدودة"
        norm_ar = MainContractorDiscoveryService.normalize_contractor_name(raw_ar)
        self.assertNotIn("شركة", norm_ar)
        self.assertIn("نسما وشركاهم", norm_ar)

        raw_en = "Company Al Bawani Co. Ltd."
        norm_en = MainContractorDiscoveryService.normalize_contractor_name(raw_en)
        self.assertNotIn("Company", norm_en)
        self.assertIn("Al Bawani", norm_en)

    def test_reject_personal_emails_from_business_contacts(self):
        """Rule: Never accept personal email domains (Gmail, Yahoo, Hotmail) as verified procurement contacts."""
        self.assertTrue(MainContractorDiscoveryService.validate_business_email("procurement@nesma-partners.com"))
        self.assertTrue(MainContractorDiscoveryService.validate_business_email("purchasing@albawani.net"))
        self.assertFalse(MainContractorDiscoveryService.validate_business_email("contractor.bid@gmail.com"))
        self.assertFalse(MainContractorDiscoveryService.validate_business_email("saudi_procurement@yahoo.com"))
        self.assertFalse(MainContractorDiscoveryService.validate_business_email("tenders@hotmail.com"))

    def test_contractor_identity_resolution_known_primes(self):
        """Rule: Known prime contractors map to verified domains, classifications and headquarters."""
        profile = MainContractorDiscoveryService.resolve_contractor_identity("Nesma & Partners Contracting Company")
        self.assertEqual(profile["normalized_name"], "Nesma & Partners")
        self.assertEqual(profile["headquarters"], "Al-Khobar, Eastern Province")
        self.assertEqual(profile["cr_number"], "2051020470")
        self.assertTrue(profile["saudi_presence"])
        self.assertIn("nesma-partners.com", profile["official_website"])

    def test_portal_links_structure_and_authentication(self):
        """Rule: Portal links preserve link type, domain, and truthful authentication status."""
        profile = MainContractorDiscoveryService.resolve_contractor_identity("Al Bawani Co. Ltd.")
        links = profile.get("portal_links", [])
        self.assertGreater(len(links), 0)

        # Check fields
        portal = links[0]
        self.assertIn("url", portal)
        self.assertIn("link_type", portal)
        self.assertIn("authentication_required", portal)
        self.assertIn(portal["registration_status"], ["PUBLIC", "AUTH_REQUIRED", "REGISTRATION_REQUIRED"])

    def test_subcontract_package_decomposition(self):
        """Rule: Prime award is decomposed into realistic trade packages with clear inferred flag."""
        award = AwardResult(
            id="award-010",
            opportunity_id="opp-neom-001",
            official_tender_number="NEOM-2026-TUNNEL",
            project_title="NEOM High Speed Rail Tunnels Package",
            owner_entity="NEOM",
            winner_legal_name="Nesma & Partners Contracting Co.",
            winner_normalized_name="Nesma & Partners",
            award_date="2026-08-14",
            contract_value_sar=1_000_000_000.0,
            source_url="https://www.neom.com/awards",
            source_type="ORIGINAL_TENDER_PORTAL",
            evidence_text="Official NEOM award release.",
            verification_confidence=1.0,
            status="AWARDED_VERIFIED",
        )

        record = MainContractorDiscoveryService.create_or_update_contractor_profile(self.repo, award, None)
        packages = MainContractorDiscoveryService.decompose_subcontract_packages(award, None, record)

        self.assertGreater(len(packages), 0)

        categories = [p.package_category for p in packages]
        self.assertIn("MEP", categories)
        self.assertIn("CIVIL", categories)
        self.assertIn("BUILDINGS", categories)

        for p in packages:
            self.assertTrue(p.is_inferred)
            self.assertEqual(p.evidence_level, "INFERRED_FROM_PRIME_SCOPE")
            self.assertGreater(p.estimated_value_sar, 0)
            self.assertEqual(p.main_contractor_id, record.id)

    def test_subcontract_match_scoring_and_eligibility(self):
        """Rule: Subcontract package matches contractor profile across activity, geography, scale, and classification."""
        pkg = SubcontractPackage(
            id="pkg-test-01",
            main_contractor_id="contractor-al-rashid",
            main_contractor_name="Al-Rashid Trading & Contracting Co.",
            project_id="opp-rcjy-002",
            project_name="Jubail Seawater Cooling Network",
            project_owner="RCJY",
            project_location="Jubail Industrial City, Eastern Province",
            package_name="Pumping Station Electromechanical & Valves Installation",
            package_category="MEP",
            description="High voltage pump alignments and valve installation.",
            evidence_level="CONFIRMED",
            evidence_source="Official Appendix",
            likely_timing="45 Days",
            estimated_value_sar=18_000_000.0,
            small_contractor_friendly=True,
            is_inferred=False,
        )

        match = SubcontractingIntelligenceService.evaluate_subcontract_match(pkg, self.company)
        self.assertGreaterEqual(match.match_score, 80.0)
        self.assertEqual(match.eligibility_status, "ELIGIBLE")
        self.assertEqual(match.estimated_competitiveness, "HIGH")
        self.assertIn("Trade capability confirmed in MEP", match.fit_reasons[0])

    def test_action_plan_generation_and_step_completion(self):
        """Rule: Action plan generates 5 steps, document checklist, and bilingual outreach draft."""
        contractor = MainContractorRecord(
            id="contractor-test",
            contractor_name="Al-Rashid Trading & Contracting Co.",
            contractor_name_ar="شركة الراشد للتجارة والمقاولات",
            official_website="https://www.rtcc.com.sa",
            portal_links=[
                {
                    "url": "https://www.rtcc.com.sa/suppliers",
                    "link_type": "VENDOR_REGISTRATION",
                    "registration_status": "PUBLIC",
                }
            ],
            contacts=[
                {
                    "contact_type": "PROCUREMENT_OFFICE",
                    "email": "purchasing@rtcc.com.sa",
                    "phone": "+966-11-401-2550",
                }
            ],
        )

        pkg = SubcontractPackage(
            id="pkg-test-02",
            main_contractor_id=contractor.id,
            main_contractor_name=contractor.contractor_name,
            project_id="opp-002",
            project_name="Jubail Seawater Network",
            project_owner="RCJY",
            project_location="Jubail",
            package_name="Underground Piping Trenching Package",
            package_category="CIVIL",
            description="Trenching and earthworks",
            is_inferred=True,
        )

        plan = SubcontractingIntelligenceService.generate_subcontract_action_plan(
            self.repo, pkg, contractor, self.company
        )

        self.assertEqual(len(plan.steps), 5)
        self.assertEqual(plan.status, "NOT_STARTED")
        self.assertIn("Commercial Registration (CR)", [d["document_name"] for d in plan.required_documents])
        self.assertIn("purchasing@rtcc.com.sa", plan.outreach_contact.get("email"))
        self.assertIn("Al-Rashid", plan.outreach_email_draft["body_en"])
        self.assertIn("الراشد", plan.outreach_email_draft["body_ar"])

        # Update status
        updated = self.repo.update_action_plan_status(plan.id, "PORTAL_REGISTERED", "Registered on vendor portal.")
        self.assertEqual(updated.status, "PORTAL_REGISTERED")
        self.assertEqual(updated.notes, "Registered on vendor portal.")


if __name__ == "__main__":
    unittest.main()
