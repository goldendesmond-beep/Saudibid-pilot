from typing import Dict, Any, List
from backend.app.models.schemas import CompanyProfile, CanonicalOpportunity

class SubcontractingEvaluator:
    """Evaluates whether large or restricted opportunities can serve as high-value subcontracting targets."""

    @classmethod
    def evaluate_subcontract_potential(
        cls,
        company: CompanyProfile,
        opp: CanonicalOpportunity,
        eligibility: Dict[str, Any],
        match_score: Dict[str, Any],
    ) -> Dict[str, Any]:
        is_subcontract_target = False
        potential_level = "LOW"  # HIGH | MEDIUM | LOW
        subcontract_rationale: List[str] = []

        # 1. Opportunity is explicitly a subcontract request or giga-project tier-1 package
        if opp.opportunity_type in ["SUBCONTRACT_REQUEST", "PROJECT_SIGNAL"]:
            if company.subcontracting_interest:
                is_subcontract_target = True
                potential_level = "HIGH"
                subcontract_rationale.append("Opportunity is explicitly structured as a subcontract / supplier opportunity.")

        # 2. Large Mega-Project where contractor cannot be Main Contractor
        pref_sar = company.preferred_project_value_sar or 30000000.0
        if opp.budget_sar and opp.budget_sar >= (pref_sar * 2.5):
            # Too large for prime contractor, but scope aligns with company capabilities
            act_fit = match_score["components"].get("activity_fit", 0)
            if act_fit >= 15.0 and company.subcontracting_interest:
                is_subcontract_target = True
                potential_level = "HIGH" if potential_level != "HIGH" else "HIGH"
                subcontract_rationale.append(
                    f"Mega-project budget ({opp.budget_sar:,.0f} SAR) exceeds prime contractor envelope, "
                    f"offering prime subcontracting packages for specialist scope '{opp.work_category}'."
                )

        # 3. Giga-project or Tier-1 Owner where direct tender has strict grade 1 gate
        if opp.primary_source_id in ["src-neom", "src-redsea", "src-qiddiya", "src-diriyah", "src-aramco"]:
            if not eligibility["passed"] and company.subcontracting_interest:
                is_subcontract_target = True
                if potential_level == "LOW":
                    potential_level = "MEDIUM"
                subcontract_rationale.append(
                    f"Direct prime bidding with {opp.entity} has stringent prequalification, "
                    f"making awardee tier-1 contractor outreach the recommended pursuit strategy."
                )

        return {
            "is_subcontract_target": is_subcontract_target,
            "potential_level": potential_level,
            "subcontract_rationale": subcontract_rationale,
            "recommended_positioning": "SPECIALIST_SUBCONTRACTOR" if is_subcontract_target else "PRIME_BIDDER",
        }
