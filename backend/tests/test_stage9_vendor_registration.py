"""Unit & Integration Tests for Stage 9 — Vendor Registration, Business Development & Source Reliability."""

import unittest
from datetime import datetime

from backend.app.models.schemas import (
    AwardResult,
    CanonicalOpportunity,
    MainContractorRecord,
    SubcontractPackage,
    VendorRegistrationRecord,
    BDPipelineItem,
    PrequalificationDocument,
)
from backend.app.db.mongodb import MongoRepository
from backend.app.services.vendor_registration import (
    VendorRegistrationService,
    STANDARD_PREQUALIFICATION_DOCUMENTS,
)
from backend.app.services.business_development import (
    BusinessDevelopmentService,
    CRM_STAGES,
)


class TestStage9VendorRegistrationAndBD(unittest.TestCase):
    def setUp(self):
        self.repo = MongoRepository()
        self.tenant_id = "comp-sa-001"

        # Seed sample verified main contractor from Stage 8
        self.contractor = MainContractorRecord(
            id="contractor-test-prime",
            contractor_name="Al-Rashid Trading & Contracting Co.",
            contractor_name_ar="شركة الراشد للتجارة والمقاولات",
            normalized_name="Al-Rashid Trading & Contracting",
            commercial_brand_name="RTCC",
            verification_status="VERIFIED_MAIN_CONTRACTOR",
            official_website="https://www.rtcc.com.sa",
            headquarters="Riyadh, Saudi Arabia",
            cr_number="1010006275",
            awarded_project_id="opp-test-jubail-01",
            portal_links=[
                {
                    "url": "https://www.rtcc.com.sa/procurement/vendor-registration",
                    "link_type": "VENDOR_REGISTRATION",
                    "registration_status": "PUBLIC",
                    "evidence_source": "https://www.rtcc.com.sa",
                }
            ],
            contacts=[
                {
                    "email": "purchasing@rtcc.com.sa",
                    "phone": "+966-11-200-4500",
                    "department": "Procurement Directorate",
                }
            ],
        )
        self.repo.save_main_contractor(self.contractor)

        # Seed sample subcontract package from Stage 8
        self.package = SubcontractPackage(
            id="pkg-test-seawater-piping",
            main_contractor_id="contractor-test-prime",
            main_contractor_name="Al-Rashid Trading & Contracting Co.",
            main_contractor_name_ar="شركة الراشد للتجارة والمقاولات",
            project_id="opp-test-jubail-01",
            project_name="Jubail Seawater Cooling Network Phase 2",
            project_owner="Royal Commission for Jubail and Yanbu (RCJY)",
            project_location="Jubail Industrial City",
            package_name="Industrial HDPE Piping Subcontract",
            package_category="PIPING",
            description="Supply and laying of high-density polyethylene seawater pipes.",
            evidence_level="CONFIRMED",
            evidence_source="RCJY Gazette #2026-041",
            estimated_value_sar=18500000.0,
            match_score=91.0,
            eligibility_status="ELIGIBLE",
            small_contractor_friendly=True,
            is_inferred=False,
        )
        self.repo.save_subcontract_package(self.package)

    def test_vendor_portal_discovery_and_classification(self):
        """Rule: Vendor portal discovery accurately identifies portal URL, type, and access state."""
        vreg = VendorRegistrationService.discover_or_create_vendor_registration(
            contractor_id=self.contractor.id,
            repo=self.repo,
            tenant_id=self.tenant_id,
        )

        self.assertIsNotNone(vreg)
        self.assertEqual(vreg.contractor_id, self.contractor.id)
        self.assertEqual(vreg.vendor_portal_url, "https://www.rtcc.com.sa/procurement/vendor-registration")
        self.assertEqual(vreg.portal_type, "VENDOR_REGISTRATION")
        self.assertEqual(vreg.portal_status, "PUBLIC")
        self.assertEqual(vreg.registration_status, "PORTAL_FOUND")
        self.assertEqual(vreg.commercial_registration, "1010006275")
        self.assertEqual(vreg.procurement_contact.get("email"), "purchasing@rtcc.com.sa")

    def test_prequalification_checklist_completeness_and_iktva(self):
        """Rule: Standard checklist contains 22 Saudi documents across Statutory, Technical, Financial, HSE, and Local Content."""
        docs = VendorRegistrationService.get_standard_checklist(package_category="PIPING")
        self.assertEqual(len(docs), 22)  # 22 standard docs

        codes = [d.code for d in docs]
        self.assertIn("DOC_CR", codes)
        self.assertIn("DOC_MUQAWIL", codes)
        self.assertIn("DOC_ZATCA", codes)
        self.assertIn("DOC_VAT", codes)
        self.assertIn("DOC_GOSI", codes)
        self.assertIn("DOC_SAUDIZATION", codes)
        self.assertIn("DOC_CHAMBER", codes)
        self.assertIn("DOC_NATIONAL_ADDRESS", codes)
        self.assertIn("DOC_BANK_IBAN", codes)
        self.assertIn("DOC_HSE_POLICY", codes)
        self.assertIn("DOC_QAQC_PLAN", codes)
        self.assertIn("DOC_FINANCIALS_3YR", codes)
        self.assertIn("DOC_IKTVA", codes)

        # For PIPING / Industrial category, IKTVA is elevated to REQUIRED_VERIFIED
        iktva_doc = next(d for d in docs if d.code == "DOC_IKTVA")
        self.assertEqual(iktva_doc.requirement_level, "REQUIRED_VERIFIED")
        self.assertTrue(iktva_doc.is_mandatory)

    def test_registration_lifecycle_transitions_and_rules(self):
        """Rule: Registration lifecycle transitions are validated and support audit notes."""
        vreg = VendorRegistrationService.discover_or_create_vendor_registration(
            contractor_id=self.contractor.id,
            repo=self.repo,
            tenant_id=self.tenant_id,
        )
        self.assertEqual(vreg.registration_status, "PORTAL_FOUND")

        # Advance to PREPARING
        updated = VendorRegistrationService.update_registration_status(
            contractor_id=self.contractor.id,
            new_status="PREPARING",
            repo=self.repo,
            tenant_id=self.tenant_id,
            notes="Dossier documents uploaded to workspace",
        )
        self.assertEqual(updated.registration_status, "PREPARING")

        # Advance to SUBMITTED with reference
        submitted = VendorRegistrationService.update_registration_status(
            contractor_id=self.contractor.id,
            new_status="SUBMITTED",
            repo=self.repo,
            tenant_id=self.tenant_id,
            submitted_reference="RTCC-VEND-2026-0819",
        )
        self.assertEqual(submitted.registration_status, "SUBMITTED")
        self.assertIn("RTCC-VEND-2026-0819", submitted.notes)

        # Invalid status should be rejected
        with self.assertRaises(ValueError):
            VendorRegistrationService.update_registration_status(
                contractor_id=self.contractor.id,
                new_status="INVALID_STAGE",
                repo=self.repo,
                tenant_id=self.tenant_id,
            )

    def test_bd_pipeline_creation_and_deduplication(self):
        """Rule: Pipeline items connect award, main contractor, package, and prevent duplicates."""
        item1 = BusinessDevelopmentService.create_or_sync_pipeline_item(
            package_id=self.package.id,
            repo=self.repo,
            tenant_id=self.tenant_id,
        )
        self.assertIsNotNone(item1)
        self.assertEqual(item1.package_id, self.package.id)
        self.assertEqual(item1.contractor_id, self.contractor.id)
        self.assertEqual(item1.stage, "TARGET_IDENTIFIED")

        # Second call returns existing without duplication
        item2 = BusinessDevelopmentService.create_or_sync_pipeline_item(
            package_id=self.package.id,
            repo=self.repo,
            tenant_id=self.tenant_id,
        )
        self.assertEqual(item1.id, item2.id)

    def test_action_priority_scoring_and_explanations(self):
        """Rule: Priority engine computes explainable scores (ACTION_NOW for high fit & open portal)."""
        vreg = VendorRegistrationService.discover_or_create_vendor_registration(
            contractor_id=self.contractor.id,
            repo=self.repo,
            tenant_id=self.tenant_id,
        )

        tier, score, reasons = BusinessDevelopmentService.calculate_priority_score(
            package=self.package,
            contractor=self.contractor,
            vreg=vreg,
            sme_fit_score=91.0,
        )

        self.assertEqual(tier, "ACTION_NOW")
        self.assertGreaterEqual(score, 78.0)
        self.assertTrue(len(reasons) >= 3)
        self.assertTrue(any("SME Trade" in r for r in reasons))
        self.assertTrue(any("Verified Prime Contractor Award" in r for r in reasons))

    def test_bilingual_outreach_template_generation(self):
        """Rule: Generates Arabic and English formal EOI drafts with verified data auto-fill."""
        templates = BusinessDevelopmentService.generate_outreach_templates(
            package_name=self.package.package_name,
            project_name=self.package.project_name,
            project_owner=self.package.project_owner,
            contractor_name=self.contractor.contractor_name,
            location="Jubail Industrial City",
            work_category="Industrial Piping",
            company_name="Saudi Tech Contracting Co.",
            company_cr="1010998877",
            contractor_name_ar=self.contractor.contractor_name_ar,
        )

        self.assertIn("EOI", templates)
        self.assertIn("VENDOR_REGISTRATION_INQUIRY", templates)
        self.assertIn("FOLLOW_UP", templates)

        eoi = templates["EOI"]
        self.assertIn("Jubail Seawater Cooling Network Phase 2", eoi["body_en"])
        self.assertIn("Al-Rashid Trading & Contracting Co.", eoi["body_en"])
        self.assertIn("Industrial HDPE Piping Subcontract", eoi["body_en"])
        self.assertIn("1010998877", eoi["body_en"])

        # Arabic template verification
        self.assertIn("شركة الراشد للتجارة والمقاولات", eoi["body_ar"])
        self.assertIn("إبداء الرغبة الرسمي", eoi["body_ar"])

    def test_stage7_stage8_stage9_end_to_end_flow(self):
        """Rule: End-to-end lineage: Verified Award -> Subcontract Package -> Vendor Registration -> BD Pipeline."""
        # 1. From Stage 8 Subcontract Package
        pkg = self.repo.get_subcontract_package(self.package.id)
        self.assertIsNotNone(pkg)

        # 2. To Stage 9 Vendor Registration Workspace
        vreg = VendorRegistrationService.discover_or_create_vendor_registration(
            contractor_id=pkg.main_contractor_id,
            repo=self.repo,
            tenant_id=self.tenant_id,
        )
        self.assertIsNotNone(vreg)
        self.assertEqual(vreg.contractor_name, pkg.main_contractor_name)

        # 3. To Stage 9 BD Pipeline
        bd_item = BusinessDevelopmentService.create_or_sync_pipeline_item(
            package_id=pkg.id,
            repo=self.repo,
            tenant_id=self.tenant_id,
        )
        self.assertIsNotNone(bd_item)
        self.assertEqual(bd_item.package_name, pkg.package_name)
        self.assertEqual(bd_item.priority, "ACTION_NOW")

        # 4. Advance BD Stage to EOI_SENT
        advanced = BusinessDevelopmentService.update_stage(
            pipeline_id=bd_item.id,
            new_stage="EOI_SENT",
            repo=self.repo,
            tenant_id=self.tenant_id,
            notes="Formal EOI dispatched via purchasing email",
        )
        self.assertEqual(advanced.stage, "EOI_SENT")
        self.assertIn("EOI dispatched", advanced.notes)


if __name__ == "__main__":
    unittest.main()
