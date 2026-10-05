"""Unit and Integration Tests for Stage 10:
Prequalification Dossier Generation, Master Document Vault, Proposal Workspace,
BOQ Assistant, Bid/No-Bid Decision Support, and Unified Action Center.
"""

import unittest
from datetime import datetime

from backend.app.models.schemas import (
    CompanyDocumentVaultItem,
    PrequalificationDossier,
    ProposalPackage,
    BOQSheet,
    BOQItem,
    ActionCenterItem,
)
from backend.app.services.document_vault import DocumentVaultService
from backend.app.services.prequalification_dossier import PrequalificationDossierService, CONTRACTOR_PROFILES
from backend.app.services.proposal_and_boq import ProposalAndBOQService
from backend.app.services.action_center import ActionCenterService


class TestStage10DossierAndProposals(unittest.TestCase):
    """Test suite ensuring Stage 10 features operate truthfully without regressions."""

    def setUp(self):
        self.tenant_id = "comp-sa-001"
        self.vault_service = DocumentVaultService(tenant_id=self.tenant_id)
        self.dossier_service = PrequalificationDossierService(vault_service=self.vault_service, tenant_id=self.tenant_id)
        self.proposal_service = ProposalAndBOQService(tenant_id=self.tenant_id)
        self.action_service = ActionCenterService(
            vault_service=self.vault_service,
            proposal_service=self.proposal_service,
            tenant_id=self.tenant_id,
        )

    def test_document_vault_expiry_and_status_computation(self):
        """Rule: Vault calculates status accurately; expired documents are never hidden as VALID."""
        # Check ZATCA document which is seeded with past expiry date
        zatca = self.vault_service.get_document_by_code("ZATCA_TAX")
        self.assertIsNotNone(zatca)
        self.assertEqual(zatca.document_status, "EXPIRED")

        # Check CR certificate which expires in 2027
        cr = self.vault_service.get_document_by_code("CR_CERT")
        self.assertIsNotNone(cr)
        self.assertEqual(cr.document_status, "VALID")

        # Test updating document with new valid date transitions status to VALID
        updated = self.vault_service.update_document(
            item_id=zatca.id,
            filename="ZATCA_Tax_Clearance_Renewed_1447.pdf",
            expiry_date="2027-04-30T00:00:00Z",
            notes="Renewed via ZATCA portal.",
        )
        self.assertEqual(updated.document_status, "VALID")
        self.assertEqual(updated.filename, "ZATCA_Tax_Clearance_Renewed_1447.pdf")

    def test_smart_dossier_assembly_and_mandatory_rejection(self):
        """Rule: Expired or missing mandatory items prevent 100% readiness and READY_FOR_EXPORT status."""
        # Assemble dossier for Nesma with the initial vault (where ZATCA is expired)
        dossier = self.dossier_service.assemble_dossier("NESMA")
        self.assertIsNotNone(dossier)
        self.assertEqual(dossier.contractor_id, "contractor-nesma")

        # ZATCA is expired, so dossier status MUST remain DRAFT, not READY_FOR_EXPORT
        self.assertEqual(dossier.status, "DRAFT")
        self.assertLess(dossier.readiness_percentage, 100.0)

        # Check that expired document is listed in expired_documents with exact reason
        expired_codes = [d["code"] for d in dossier.expired_documents]
        self.assertIn("ZATCA_TAX", expired_codes)

        # Unresolved mandatory reasons must be present
        self.assertTrue(len(dossier.readiness_breakdown["unresolved_mandatory_reasons"]) > 0)
        self.assertIn("ZATCA", str(dossier.readiness_breakdown["unresolved_mandatory_reasons"]))

    def test_dossier_package_13_sections_and_manifest(self):
        """Rule: Dossier generates standard 13-section structure and submission cover sheet."""
        dossier = self.dossier_service.assemble_dossier("ARAMCO_IKTVA")
        self.assertEqual(len(dossier.sections), 13)

        # Verify section indices 01 through 13
        indices = [s["index"] for s in dossier.sections]
        self.assertEqual(indices, [f"{i:02d}" for i in range(1, 14)])

        # Check manifest data
        manifest = dossier.package_manifest
        self.assertIn("submission_cover_sheet", manifest)
        cover = manifest["submission_cover_sheet"]
        self.assertEqual(cover["cr_number"], "7001892831")
        self.assertEqual(cover["intended_client"], "Saudi Aramco")

    def test_proposal_lifecycle_and_user_action_protection(self):
        """Rule: Proposal cannot be marked SUBMITTED or AWARDED without explicit user action or reference."""
        props = self.proposal_service.list_proposals()
        self.assertTrue(len(props) > 0)
        prop = props[0]

        # Initial state should be READY (or DRAFT)
        self.assertIn(prop.status, ["DRAFT", "READY"])

        # Update status to SUBMITTED requires submission reference
        updated = self.proposal_service.update_proposal_status(
            proposal_id=prop.id,
            new_status="SUBMITTED",
            submission_reference="NESMA-SUB-2026-0492",
            notes="Formally uploaded to Nesma procurement portal.",
        )
        self.assertEqual(updated.status, "SUBMITTED")
        self.assertEqual(updated.submission_reference, "NESMA-SUB-2026-0492")
        self.assertIsNotNone(updated.submitted_at)

    def test_explainable_bid_no_bid_decision_engine(self):
        """Rule: Bid/No-Bid computes explainable scores with transparent factor weights."""
        decision = self.proposal_service.calculate_bid_decision(
            scope_fit_score=92.0,
            capability_score=88.0,
            geography_fit=90.0,
            prequal_readiness=85.0,
            pricing_completeness=100.0,
            days_to_deadline=12,
        )
        self.assertEqual(decision["decision"], "BID")
        self.assertGreaterEqual(decision["score"], 75.0)
        self.assertEqual(len(decision["factors"]), 6)

        # Test low score evaluates to NO_BID
        low_decision = self.proposal_service.calculate_bid_decision(
            scope_fit_score=30.0,
            capability_score=40.0,
            geography_fit=30.0,
            prequal_readiness=20.0,
            pricing_completeness=40.0,
            days_to_deadline=1,
        )
        self.assertEqual(low_decision["decision"], "NO_BID")
        self.assertLess(low_decision["score"], 45.0)

    def test_boq_calculations_unpriced_rates_and_vat(self):
        """Rule: BOQ calculates line totals (Q x R), flags unpriced rates without fabricating prices, and adds 15% ZATCA VAT."""
        boq_id = f"boq-nesma-dgda-{self.tenant_id}"
        boq = self.proposal_service.get_boq(boq_id)
        self.assertIsNotNone(boq)

        # Item 4.1 was left unpriced
        unpriced_item = [it for it in boq.items if it["item_number"] == "4.1"][0]
        self.assertIsNone(unpriced_item["unit_rate"])
        self.assertIsNone(unpriced_item["total"])
        self.assertTrue(unpriced_item["is_price_missing"])
        self.assertGreater(boq.unpriced_items_count, 0)

        # Verify mathematical hierarchy:
        # Subtotal + Overhead (10%) + Contingency (5%) + Margin (12%) + VAT (15%) = Grand Total
        direct = boq.subtotal
        overhead = round(direct * 0.10, 2)
        contingency = round(direct * 0.05, 2)
        net_before_margin = direct + overhead + contingency
        margin = round(net_before_margin * 0.12, 2)
        net_before_vat = net_before_margin + margin
        expected_vat = round(net_before_vat * 0.15, 2)
        expected_grand_total = round(net_before_vat + expected_vat, 2)

        self.assertEqual(boq.overhead_amount, overhead)
        self.assertEqual(boq.contingency_amount, contingency)
        self.assertEqual(boq.margin_amount, margin)
        self.assertEqual(boq.vat_amount, expected_vat)
        self.assertEqual(boq.grand_total, expected_grand_total)

        # Now price the unpriced item
        updated_boq = self.proposal_service.update_boq_item(
            boq_id=boq_id,
            item_number="4.1",
            unit_rate=45000.0,
            rate_source="USER_ENTERED",
        )
        self.assertEqual(updated_boq.unpriced_items_count, 0)
        self.assertEqual(updated_boq.pricing_completeness_percentage, 100.0)

    def test_action_center_priority_queue_and_deep_links(self):
        """Rule: Unified Action Center ranks tasks into ACTION_NOW and links to underlying records."""
        actions = self.action_service.get_action_items()
        self.assertTrue(len(actions) > 0)

        # ACTION_NOW items should appear before MONITOR items
        priorities = [a.priority for a in actions]
        if "ACTION_NOW" in priorities and "MONITOR" in priorities:
            now_idx = priorities.index("ACTION_NOW")
            mon_idx = priorities.index("MONITOR")
            self.assertLess(now_idx, mon_idx)

        # Ensure deep links and targets exist
        for act in actions:
            self.assertTrue(len(act.deep_link) > 0)
            self.assertTrue(len(act.target_id) > 0)
            self.assertTrue(len(act.action_cta_en) > 0)

    def test_end_to_end_lineage_stage7_to_stage10(self):
        """Rule: End-to-end provenance: Award -> Contractor -> Subcontract -> Registration -> Dossier -> Proposal -> BOQ -> Action."""
        # 1. Main contractor Nesma from Stage 8
        contractor_id = "contractor-nesma"

        # 2. Assemble Dossier tailored to Nesma
        dossier = self.dossier_service.assemble_dossier("NESMA")
        self.assertEqual(dossier.contractor_id, contractor_id)

        # 3. Retrieve linked proposal
        prop = self.proposal_service.get_proposal(f"prop-nesma-dgda-{self.tenant_id}")
        self.assertIsNotNone(prop)
        self.assertEqual(prop.main_contractor_id, contractor_id)

        # 4. Verify linked BOQ
        boq = self.proposal_service.get_boq(prop.boq_id)
        self.assertIsNotNone(boq)
        self.assertEqual(boq.proposal_id, prop.id)

        # 5. Check that unpriced BOQ generated an actionable item in Action Center
        actions = self.action_service.get_action_items()
        boq_actions = [a for a in actions if a.category == "BOQ_UNPRICED" and a.target_id == boq.id]
        self.assertTrue(len(boq_actions) > 0)
        self.assertEqual(boq_actions[0].priority, "ACTION_NOW")


if __name__ == "__main__":
    unittest.main()
