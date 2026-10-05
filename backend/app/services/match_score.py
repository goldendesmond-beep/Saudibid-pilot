from typing import Dict, Any, List, Optional
from backend.app.models.schemas import CompanyProfile, CanonicalOpportunity

class MatchScoreService:
    """Computes an explainable, deterministic 0–100 continuous Match Score."""

    @classmethod
    def compute_match_score(
        cls,
        company: CompanyProfile,
        opp: CanonicalOpportunity,
    ) -> Dict[str, Any]:
        components = {}
        positive_reasons: List[str] = []
        concerns: List[str] = []
        missing_information: List[str] = []

        # 1. Activity / Work Category Fit (0–25)
        activity_score = 0.0
        comp_activities = [a.lower() for a in (company.main_activities + company.secondary_activities)]
        opp_cat = opp.work_category.lower()
        if opp_cat != "unknown":
            if any(act in opp_cat or opp_cat in act for act in comp_activities):
                activity_score = 25.0
                positive_reasons.append(f"Direct alignment with contractor activities: '{opp.work_category}'")
            elif any(w in opp_cat for act in comp_activities for w in act.split()):
                activity_score = 15.0
                positive_reasons.append(f"Partial scope alignment with work category: '{opp.work_category}'")
            else:
                activity_score = 5.0
                concerns.append(f"Work category '{opp.work_category}' is outside contractor's core activity list")
        else:
            activity_score = 12.0
            missing_information.append("Tender work category is UNKNOWN")
        components["activity_fit"] = round(activity_score, 1)

        # 2. Geographic Regional Presence (0–20)
        geo_score = 0.0
        comp_regions = [r.lower() for r in (company.saudi_regions or [])]
        comp_cities = [c.lower() for c in (company.saudi_cities or [])]
        opp_region = opp.region.lower()
        opp_city = opp.city.lower()

        if "all regions" in comp_regions:
            geo_score = 20.0
            positive_reasons.append("Contractor maintains Kingdom-wide operational license")
        elif opp_city != "unknown" and opp_city in comp_cities:
            geo_score = 20.0
            positive_reasons.append(f"Contractor has active presence in tender city: '{opp.city}'")
        elif opp_region != "unknown" and opp_region in comp_regions:
            geo_score = 16.0
            positive_reasons.append(f"Contractor operates within tender province: '{opp.region}'")
        elif opp_region == "unknown":
            geo_score = 10.0
            missing_information.append("Opportunity regional location is UNKNOWN")
        else:
            geo_score = 4.0
            concerns.append(f"Contractor does not have established operations in '{opp.region}'")
        components["geographic_fit"] = round(geo_score, 1)

        # 3. Project Scale & Financial Fit (0–20)
        scale_score = 0.0
        if opp.budget_sar is not None and opp.budget_sar > 0:
            pref = company.preferred_project_value_sar or 30000000.0
            ratio = opp.budget_sar / pref
            if 0.5 <= ratio <= 2.0:
                scale_score = 20.0
                positive_reasons.append(f"Tender budget ({opp.budget_sar:,.0f} SAR) fits contractor preferred scale envelope")
            elif 0.2 <= ratio < 0.5:
                scale_score = 14.0
                positive_reasons.append("Project value is on the smaller side of contractor preferred scale")
            elif 2.0 < ratio <= 4.0:
                scale_score = 10.0
                concerns.append("Project value exceeds preferred project size envelope (potential subcontracting target)")
            else:
                scale_score = 4.0
                concerns.append(f"Project value ({opp.budget_sar:,.0f} SAR) represents major scale divergence")
        else:
            scale_score = 10.0
            missing_information.append("Tender project budget / value is UNKNOWN")
        components["project_scale_fit"] = round(scale_score, 1)

        # 4. Capacity, Manpower & Equipment Fit (0–15)
        cap_score = 0.0
        if company.manpower_count >= 100:
            cap_score += 8.0
        elif company.manpower_count >= 30:
            cap_score += 5.0
        else:
            cap_score += 3.0

        if company.equipment_tags:
            opp_text = f"{opp.title} {opp.description}".lower()
            if any(eq.lower() in opp_text for eq in company.equipment_tags):
                cap_score += 7.0
                positive_reasons.append("Contractor equipment fleet matches required project tasks")
            else:
                cap_score += 4.0
        else:
            cap_score += 3.0
            missing_information.append("Contractor equipment fleet tags are not declared")
        components["capacity_fit"] = round(cap_score, 1)

        # 5. Opportunity Type Preference Fit (0–10)
        pref_score = 0.0
        if opp.opportunity_type in ["GOVERNMENT_TENDER", "PRIVATE_TENDER"] and company.direct_tender_interest:
            pref_score = 10.0
            positive_reasons.append("Contractor has active interest in direct public tenders")
        elif opp.opportunity_type in ["SUBCONTRACT_REQUEST", "PROJECT_SIGNAL"] and company.subcontracting_interest:
            pref_score = 10.0
            positive_reasons.append("Contractor is interested in subcontracting packages")
        elif opp.opportunity_type in ["VENDOR_REGISTRATION", "PREQUALIFICATION"] and company.vendor_registration_interest:
            pref_score = 10.0
            positive_reasons.append("Opportunity aligns with vendor registration focus")
        else:
            pref_score = 6.0
        components["preference_fit"] = round(pref_score, 1)

        # 6. Scope Semantic Relevance (0–10)
        sem_score = 8.0  # Baseline token relevance
        opp_text = f"{opp.title} {opp.description}".lower()
        if company.capacity_tags:
            matches = [t for t in company.capacity_tags if t.lower() in opp_text]
            if len(matches) >= 2:
                sem_score = 10.0
                positive_reasons.append(f"Strong semantic alignment on keywords: {', '.join(matches)}")
            elif len(matches) == 1:
                sem_score = 8.5
            else:
                sem_score = 6.0
        components["semantic_fit"] = round(sem_score, 1)

        total_score = sum(components.values())
        total_score = max(0.0, min(100.0, round(total_score, 1)))

        # Display label
        if total_score >= 80.0:
            label = "STRONG_MATCH"
        elif total_score >= 65.0:
            label = "GOOD_MATCH"
        elif total_score >= 50.0:
            label = "REVIEW"
        else:
            label = "LOW_MATCH"

        return {
            "total_score": total_score,
            "label": label,
            "components": components,
            "positive_reasons": positive_reasons,
            "concerns": concerns,
            "missing_information": missing_information,
        }
