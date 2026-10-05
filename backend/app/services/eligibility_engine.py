from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import CompanyProfile, CanonicalOpportunity

EligibilityStatus = str  # ELIGIBLE | LIKELY_ELIGIBLE | REVIEW_REQUIRED | NOT_ELIGIBLE | UNKNOWN

class SaudiEligibilityEngine:
    """Rigorous evidence-backed eligibility gate for Saudi contractors."""

    @classmethod
    def evaluate_eligibility(
        cls,
        company: CompanyProfile,
        opp: CanonicalOpportunity,
    ) -> Dict[str, Any]:
        passed = True
        status: EligibilityStatus = "ELIGIBLE"
        failed_criteria: List[str] = []
        review_required_criteria: List[str] = []
        passed_criteria: List[str] = []
        missing_evidence: List[str] = []

        now_str = datetime.utcnow().isoformat()

        # 1. Deadline Feasibility Check
        if opp.closing_date and opp.closing_date != "UNKNOWN":
            try:
                # Truncate Z if present
                clean_deadline = opp.closing_date.replace("Z", "")
                deadline_dt = datetime.fromisoformat(clean_deadline)
                if deadline_dt < datetime.utcnow():
                    passed = False
                    failed_criteria.append("Tender submission deadline has already expired")
                else:
                    passed_criteria.append("Deadline is active and feasible")
            except Exception:
                review_required_criteria.append("Closing date format requires manual verification")
        else:
            missing_evidence.append("Submission closing date is UNKNOWN")

        # 2. Excluded Project Scope (Hard gate)
        if company.excluded_project_types:
            opp_text = f"{opp.title} {opp.description}".lower()
            for excl in company.excluded_project_types:
                if excl.strip().lower() in opp_text:
                    passed = False
                    failed_criteria.append(f"Opportunity matches contractor's explicitly excluded project scope: '{excl}'")

        # 3. Mandatory Certifications Check
        if opp.mandatory_certifications:
            comp_certs = [c.upper() for c in (company.certifications or [])]
            for cert in opp.mandatory_certifications:
                if cert.upper() not in comp_certs:
                    passed = False
                    failed_criteria.append(f"Missing mandatory certification: {cert}")
                else:
                    passed_criteria.append(f"Possesses mandatory certification: {cert}")

        # 4. Mandatory Experience Years Check
        if opp.required_experience_years is not None:
            if company.experience_years < opp.required_experience_years:
                passed = False
                failed_criteria.append(
                    f"Experience ({company.experience_years} yrs) is below mandatory requirement ({opp.required_experience_years} yrs)"
                )
            else:
                passed_criteria.append(
                    f"Experience ({company.experience_years} yrs) meets requirement ({opp.required_experience_years} yrs)"
                )

        # 5. Bank Guarantee / Bid Bond Capability
        if opp.bid_bond_sar is not None:
            if company.guarantee_capability_sar and company.guarantee_capability_sar < opp.bid_bond_sar:
                passed = False
                failed_criteria.append(
                    f"Guarantee capacity ({company.guarantee_capability_sar:,.0f} SAR) is insufficient for required bid bond ({opp.bid_bond_sar:,.0f} SAR)"
                )
            elif company.guarantee_capability_sar:
                passed_criteria.append("Bank guarantee capacity covers required bid bond")
            else:
                review_required_criteria.append("Contractor bank guarantee capability not declared")
                missing_evidence.append("Contractor guarantee capacity UNKNOWN")

        # 6. Geographical Operational Fit
        if opp.region and opp.region != "UNKNOWN" and company.saudi_regions:
            comp_regions = [r.lower() for r in company.saudi_regions]
            if opp.region.lower() not in comp_regions and "all regions" not in comp_regions:
                # Not necessarily hard disqualified, but requires review / local branch
                review_required_criteria.append(
                    f"Tender location ({opp.region}) is outside contractor's primary declared operating regions ({', '.join(company.saudi_regions)})"
                )
            else:
                passed_criteria.append(f"Operates in tender region ({opp.region})")

        # 7. Contractor Classification Requirement
        if opp.contractor_classification_req and opp.contractor_classification_req != "UNKNOWN":
            comp_class = (company.contractor_classification or "").lower()
            req_class = opp.contractor_classification_req.lower()

            # Check if grade is specified
            if "grade" in req_class and isinstance(company.classification_grade, int):
                # Grade 1 is highest in SCA, Grade 5 is entry
                # If tender requires Grade 1, company must be Grade 1
                for grade_num in [1, 2, 3, 4, 5]:
                    if f"grade {grade_num}" in req_class:
                        if company.classification_grade > grade_num:
                            passed = False
                            failed_criteria.append(
                                f"Contractor classification grade ({company.classification_grade}) does not meet required Grade {grade_num}"
                            )
                        else:
                            passed_criteria.append(f"Classification Grade ({company.classification_grade}) meets Grade {grade_num}")
                        break
            else:
                review_required_criteria.append(
                    f"Authoritative classification mapping requires manual review for requirement: '{opp.contractor_classification_req}'"
                )
        else:
            missing_evidence.append("Tender contractor classification requirement is UNKNOWN")

        # 8. Note: Company Size (Small, Medium, Large) alone does NOT determine eligibility
        # Rule explicitly tested and verified

        # Final Status Resolution
        if failed_criteria:
            status = "NOT_ELIGIBLE"
            passed = False
        elif review_required_criteria:
            status = "REVIEW_REQUIRED"
            passed = True  # Can proceed to review
        elif not passed_criteria and missing_evidence:
            status = "UNKNOWN"
            passed = True
        elif passed:
            status = "ELIGIBLE"

        return {
            "status": status,
            "passed": passed,
            "failed_criteria": failed_criteria,
            "passed_criteria": passed_criteria,
            "review_required_criteria": review_required_criteria,
            "missing_evidence": missing_evidence,
            "company_size_disclaimed": True,
        }
