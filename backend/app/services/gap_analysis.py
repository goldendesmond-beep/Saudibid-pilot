from typing import Dict, Any, List
from backend.app.models.schemas import CompanyProfile, CanonicalOpportunity

class CompanyGapAnalysisService:
    """Rigorous gap analysis comparing contractor profile against tender requirements."""

    @classmethod
    def evaluate_gaps(
        cls,
        company: CompanyProfile,
        opp: CanonicalOpportunity,
        eligibility: Dict[str, Any],
        match_score: Dict[str, Any],
        subcontract_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        available: List[str] = []
        missing: List[str] = []
        unknown: List[str] = []

        # 1. Activities & Work Category
        comp_acts = [a.lower() for a in (company.main_activities + company.secondary_activities)]
        opp_cat = opp.work_category.lower()
        if opp_cat != "unknown":
            if any(a in opp_cat or opp_cat in a for a in comp_acts):
                available.append(f"Work Category: {opp.work_category}")
            else:
                missing.append(f"Core activity mismatch for '{opp.work_category}'")
        else:
            unknown.append("Tender work category is UNKNOWN")

        # 2. Regional Footprint
        if opp.region and opp.region != "UNKNOWN":
            comp_regs = [r.lower() for r in (company.saudi_regions or [])]
            if "all regions" in comp_regs or opp.region.lower() in comp_regs:
                available.append(f"Operating license & footprint in {opp.region}")
            else:
                missing.append(f"No declared operating presence in {opp.region}")
        else:
            unknown.append("Tender geographical province is UNKNOWN")

        # 3. Certifications
        if opp.mandatory_certifications:
            comp_certs = [c.upper() for c in (company.certifications or [])]
            for cert in opp.mandatory_certifications:
                if cert.upper() in comp_certs:
                    available.append(f"Certification: {cert}")
                else:
                    missing.append(f"Missing mandatory certification: {cert}")

        # 4. Guarantee / Bid Bond
        if opp.bid_bond_sar is not None:
            if company.guarantee_capability_sar and company.guarantee_capability_sar >= opp.bid_bond_sar:
                available.append(f"Bank Guarantee capability ({company.guarantee_capability_sar:,.0f} SAR >= {opp.bid_bond_sar:,.0f} SAR)")
            elif company.guarantee_capability_sar:
                missing.append(f"Insufficient bank guarantee capability for {opp.bid_bond_sar:,.0f} SAR bid bond")
            else:
                unknown.append("Contractor guarantee capacity UNKNOWN")

        # 5. Determine recommended action
        if subcontract_data.get("is_subcontract_target"):
            potential_action = "SUBCONTRACT_TARGET"
        elif not eligibility["passed"]:
            potential_action = "NO_ACTION"
        elif eligibility["status"] == "REVIEW_REQUIRED":
            potential_action = "REVIEW_REQUIREMENT"
        elif opp.opportunity_type in ["VENDOR_REGISTRATION", "PREQUALIFICATION"]:
            potential_action = "VENDOR_REGISTRATION"
        else:
            potential_action = "DIRECT_TENDER"

        return {
            "opportunity_id": opp.id,
            "company_id": company.id,
            "available_capabilities": available,
            "missing_capabilities": missing,
            "unknown_capabilities": unknown,
            "potential_action": potential_action,
            "disclaimer": "Decision-support output only. Human engineering review required before any submission.",
        }
