"""Proposal Workspace, Explainable Bid/No-Bid Decision Engine & BOQ Assistant (Stage 10 Parts E, F, G).

Maintains end-to-end traceability from Tender/Award to Main Contractor, Trade Package, Prequalification,
Proposal, and line-item Bill of Quantities with 15% ZATCA VAT.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import ProposalPackage, BOQSheet, BOQItem


class ProposalAndBOQService:
    """Service managing proposals, bid/no-bid decision analysis, and BOQ worksheets."""

    def __init__(self, tenant_id: str = "comp-sa-001"):
        self.tenant_id = tenant_id
        self._proposals: Dict[str, ProposalPackage] = {}
        self._boqs: Dict[str, BOQSheet] = {}
        self._seed_default_proposals_and_boq()

    def _seed_default_proposals_and_boq(self) -> None:
        """Seed initial proposal and BOQ linked to verified Stage 8 prime contractor awards."""
        # 1. Proposal for Nesma & Partners Diriyah Gate Subcontract Package
        prop_id = f"prop-nesma-dgda-{self.tenant_id}"
        boq_id = f"boq-nesma-dgda-{self.tenant_id}"

        # Standard construction trade BOQ items
        boq_items = [
            {
                "item_number": "1.1",
                "description": "Mobilization, site offices, temporary utilities and hoarding",
                "description_ar": "التجهيزات الموقعية والمكاتب المؤقتة والأسوار وتمديد الخدمات",
                "unit": "lump_sum",
                "quantity": 1.0,
                "unit_rate": 250000.0,
                "rate_source": "USER_ENTERED",
                "trade_category": "Preliminaries",
                "notes": "Includes safety perimeter and security access control.",
            },
            {
                "item_number": "2.1",
                "description": "Bulk excavation in medium to hard rock including disposal offsite",
                "description_ar": "حفريات عامة في تربة صخرية متوسطة إلى صلبة مع الترحيل للمقلب المعتمد",
                "unit": "m3",
                "quantity": 8500.0,
                "unit_rate": 65.0,
                "rate_source": "VERIFIED_SOURCE",
                "trade_category": "Earthworks",
                "notes": "Verified against Diriyah geotechnical borehole logs.",
            },
            {
                "item_number": "2.2",
                "description": "Engineered backfilling in 250mm compacted layers to 95% MDD",
                "description_ar": "ردم هندسي على طبقات مدموكة 250 ملم بنسبة دمك لا تقل عن 95%",
                "unit": "m3",
                "quantity": 3200.0,
                "unit_rate": 45.0,
                "rate_source": "USER_ENTERED",
                "trade_category": "Earthworks",
                "notes": "Tested via approved third-party laboratory.",
            },
            {
                "item_number": "3.1",
                "description": "Reinforced concrete foundations C35/45 sulphate-resisting cement",
                "description_ar": "خرسانة مسلحة للأساسات C35/45 أسمنت مقاوم للكبريتات",
                "unit": "m3",
                "quantity": 1450.0,
                "unit_rate": 780.0,
                "rate_source": "VERIFIED_SOURCE",
                "trade_category": "Structural Concrete",
                "notes": "Includes rebar ASTM A615 Grade 60 and approved formwork.",
            },
            {
                "item_number": "3.2",
                "description": "Reinforced concrete columns and suspended slabs C40/50",
                "description_ar": "خرسانة مسلحة للأعمدة والأسقف المعلقة C40/50",
                "unit": "m3",
                "quantity": 2100.0,
                "unit_rate": 890.0,
                "rate_source": "USER_ENTERED",
                "trade_category": "Structural Concrete",
                "notes": "Includes fair-face finish for exposed soffits.",
            },
            {
                "item_number": "4.1",
                "description": "Electromechanical low-voltage main distribution panels (MDBs)",
                "description_ar": "لوحات التوزيع الكهربائية الرئيسية للجهد المنخفض (MDB)",
                "unit": "set",
                "quantity": 6.0,
                "unit_rate": None,  # Intentionally unpriced to test unpriced-rate detection
                "rate_source": "UNKNOWN",
                "trade_category": "Electrical MEP",
                "notes": "Pending vendor quotation from Schneider / ABB distributor.",
            },
        ]

        boq = BOQSheet(
            id=boq_id,
            tenant_id=self.tenant_id,
            proposal_id=prop_id,
            package_id="pkg-nesma-dgda-001",
            title="BOQ - Structural & Civil Subcontract Package (Diriyah Gate Phase 2)",
            title_ar="جدول الكميات - حزمة الأعمال الإنشائية والمدنية (مشروع بوابة الدرعية)",
            items=boq_items,
            overhead_percent=10.0,
            contingency_percent=5.0,
            margin_percent=12.0,
            vat_percent=15.0,
            currency="SAR",
            notes="Prepared for Nesma & Partners procurement evaluation.",
        )
        self._boqs[boq.id] = boq

        # Compute explainable Bid/No-Bid decision
        decision_info = self.calculate_bid_decision(
            scope_fit_score=90.0,
            capability_score=85.0,
            geography_fit=95.0,
            prequal_readiness=85.0,
            pricing_completeness=boq.pricing_completeness_percentage,
            days_to_deadline=14,
        )

        proposal = ProposalPackage(
            id=prop_id,
            title="Subcontract Proposal — Diriyah Gate Infrastructure & Civil Package",
            title_ar="عرض سعر مقاولة باطن — أعمال البنية التحتية والإنشائية بمشروع بوابة الدرعية",
            main_contractor_id="contractor-nesma",
            main_contractor_name="Nesma & Partners Contracting Co.",
            main_contractor_name_ar="شركة نسما وشركاهم للمقاولات",
            project_name="Diriyah Gate Mixed-Use Development Phase 2",
            trade_package_name="Civil Earthworks & Substructure Package",
            tenant_id=self.tenant_id,
            tender_id="tnd-dgda-2026-081",
            award_id="awd-nesma-dgda-2026",
            trade_package_id="pkg-nesma-dgda-001",
            registration_id=f"vreg-contractor-nesma-{self.tenant_id}",
            dossier_id=f"dossier-contractor-nesma-{self.tenant_id}",
            boq_id=boq_id,
            status="READY",
            bid_decision=decision_info["decision"],
            bid_decision_score=decision_info["score"],
            bid_decision_factors=decision_info["factors"],
            submission_deadline="2026-10-25T16:00:00Z",
            boq_grand_total_sar=boq.grand_total,
            assigned_lead="Eng. Tariq Al-Ghamdi (Tendering Director)",
            notes="Fully compliant with Nesma subcontractor specifications. 1 MEP item unpriced.",
            provenance={
                "source": "Nesma & Partners Subcontract Request",
                "official_tender_no": "DGDA-2026-PKG-09",
                "verified_award_value_sar": 285000000.0,
                "subcontract_estimate_sar": 7500000.0,
            },
        )
        self._proposals[proposal.id] = proposal

    def calculate_bid_decision(
        self,
        scope_fit_score: float,
        capability_score: float,
        geography_fit: float,
        prequal_readiness: float,
        pricing_completeness: float,
        days_to_deadline: int,
    ) -> Dict[str, Any]:
        """Explainable Bid/No-Bid Decision Engine.

        Never lets AI silently make a commercial decision; outputs transparent factor weights.
        """
        # Factor weights:
        # Scope alignment: 25%
        # Company capability: 20%
        # Geography: 15%
        # Prequalification document readiness: 15%
        # Pricing completeness: 15%
        # Time urgency / deadline: 10%
        time_score = 100.0 if days_to_deadline >= 10 else (70.0 if days_to_deadline >= 5 else 40.0)

        total_score = (
            (scope_fit_score * 0.25)
            + (capability_score * 0.20)
            + (geography_fit * 0.15)
            + (prequal_readiness * 0.15)
            + (pricing_completeness * 0.15)
            + (time_score * 0.10)
        )
        total_score = round(total_score, 1)

        factors = [
            {
                "factor_name": "Scope & Trade Fit",
                "weight_percent": 25,
                "score": scope_fit_score,
                "status": "STRONG" if scope_fit_score >= 80 else "ACCEPTABLE",
                "explanation": f"Match score {scope_fit_score}% in core civil earthworks and concrete classification.",
            },
            {
                "factor_name": "Company Capability & Fleet",
                "weight_percent": 20,
                "score": capability_score,
                "status": "STRONG" if capability_score >= 80 else "ACCEPTABLE",
                "explanation": "Plant fleet and licensed engineering manpower readily available.",
            },
            {
                "factor_name": "Geographic Proximity",
                "weight_percent": 15,
                "score": geography_fit,
                "status": "STRONG",
                "explanation": "Project site located in Riyadh with zero mobilization overhead.",
            },
            {
                "factor_name": "Prequalification Readiness",
                "weight_percent": 15,
                "score": prequal_readiness,
                "status": "STRONG" if prequal_readiness >= 80 else "REVIEW_REQUIRED",
                "explanation": f"Contractor document vault provides {prequal_readiness}% submission readiness.",
            },
            {
                "factor_name": "BOQ Pricing Completeness",
                "weight_percent": 15,
                "score": pricing_completeness,
                "status": "STRONG" if pricing_completeness >= 90 else "ATTENTION_REQUIRED",
                "explanation": f"{pricing_completeness}% of line items have confirmed rates. Unpriced items must be completed before final dispatch.",
            },
            {
                "factor_name": "Submission Time Margin",
                "weight_percent": 10,
                "score": time_score,
                "status": "STRONG" if days_to_deadline >= 10 else "URGENT",
                "explanation": f"{days_to_deadline} days remaining until closing date.",
            },
        ]

        if total_score >= 75.0:
            decision = "BID"
            recommendation = "Proceed with final proposal finalization and submission to prime contractor."
        elif total_score >= 60.0:
            decision = "CONDITIONAL_BID"
            recommendation = "Proceed conditionally after pricing remaining unpriced items and renewing pending documents."
        elif total_score >= 45.0:
            decision = "REVIEW"
            recommendation = "Hold commercial proposal for executive tendering review."
        else:
            decision = "NO_BID"
            recommendation = "Decline opportunity due to low capability fit or severe time constraint."

        return {
            "score": total_score,
            "decision": decision,
            "recommendation": recommendation,
            "factors": factors,
        }

    # Proposal CRUD
    def list_proposals(self) -> List[ProposalPackage]:
        """List all proposals."""
        return list(self._proposals.values())

    def get_proposal(self, proposal_id: str) -> Optional[ProposalPackage]:
        """Get proposal by ID."""
        return self._proposals.get(proposal_id)

    def update_proposal_status(
        self,
        proposal_id: str,
        new_status: str,
        submission_reference: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> ProposalPackage:
        """Update proposal lifecycle stage.

        Strict rule: Never marks SUBMITTED or AWARDED without explicit user action or reference.
        """
        valid_statuses = [
            "DRAFT",
            "IN_REVIEW",
            "READY",
            "SUBMITTED",
            "CLARIFICATION",
            "REVISED",
            "AWARDED",
            "LOST",
            "CANCELLED",
        ]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid proposal status: {new_status}")

        proposal = self._proposals.get(proposal_id)
        if not proposal:
            raise KeyError(f"Proposal {proposal_id} not found")

        proposal.status = new_status
        if new_status == "SUBMITTED":
            proposal.submitted_at = datetime.utcnow().isoformat()
            if submission_reference:
                proposal.submission_reference = submission_reference
        if notes:
            proposal.notes = f"{proposal.notes} | [{datetime.utcnow().strftime('%Y-%m-%d')}] {notes}".strip(" |")

        proposal.updated_at = datetime.utcnow().isoformat()
        return proposal

    # BOQ CRUD & Calculation
    def get_boq(self, boq_id: str) -> Optional[BOQSheet]:
        """Retrieve BOQ sheet."""
        return self._boqs.get(boq_id)

    def update_boq_item(
        self,
        boq_id: str,
        item_number: str,
        unit_rate: Optional[float],
        quantity: Optional[float] = None,
        notes: Optional[str] = None,
        rate_source: str = "USER_ENTERED",
    ) -> BOQSheet:
        """Update line item unit rate or quantity and re-calculate grand total with VAT."""
        boq = self._boqs.get(boq_id)
        if not boq:
            raise KeyError(f"BOQ {boq_id} not found")

        found = False
        for it in boq.items:
            if it.get("item_number") == item_number:
                found = True
                if quantity is not None:
                    it["quantity"] = float(quantity)
                if unit_rate is not None:
                    it["unit_rate"] = float(unit_rate)
                    it["rate_source"] = rate_source
                else:
                    it["unit_rate"] = None
                    it["rate_source"] = "UNKNOWN"
                if notes:
                    it["notes"] = notes
                break

        if not found:
            raise KeyError(f"Item number {item_number} not found in BOQ {boq_id}")

        boq.updated_at = datetime.utcnow().isoformat()
        boq._calculate_totals()

        # Update linked proposal grand total
        if boq.proposal_id and boq.proposal_id in self._proposals:
            self._proposals[boq.proposal_id].boq_grand_total_sar = boq.grand_total

        return boq

    def add_boq_item(
        self,
        boq_id: str,
        item_number: str,
        description: str,
        unit: str,
        quantity: float,
        unit_rate: Optional[float] = None,
        trade_category: str = "General",
        notes: str = "",
        rate_source: str = "USER_ENTERED",
    ) -> BOQSheet:
        """Add new item to BOQ and recalculate."""
        boq = self._boqs.get(boq_id)
        if not boq:
            raise KeyError(f"BOQ {boq_id} not found")

        new_item = {
            "item_number": item_number,
            "description": description,
            "description_ar": description,
            "unit": unit,
            "quantity": float(quantity),
            "unit_rate": float(unit_rate) if unit_rate is not None else None,
            "rate_source": rate_source if unit_rate is not None else "UNKNOWN",
            "trade_category": trade_category,
            "notes": notes,
        }
        boq.items.append(new_item)
        boq.updated_at = datetime.utcnow().isoformat()
        boq._calculate_totals()

        if boq.proposal_id and boq.proposal_id in self._proposals:
            self._proposals[boq.proposal_id].boq_grand_total_sar = boq.grand_total

        return boq
