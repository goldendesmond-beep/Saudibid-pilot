from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.app.models.schemas import CompanyProfile, Tender

def compute_eligibility(profile: CompanyProfile, tender: Tender) -> Dict[str, Any]:
    failed: List[str] = []
    warnings: List[str] = []

    # 1. Exclusion flags check (hard fail)
    overlap_flags = [f for f in profile.exclusion_flags if f in tender.exclusion_flags]
    if overlap_flags:
        failed.append(f"exclusion flag overlap: {', '.join(sorted(overlap_flags))}")

    # 2. Excluded project types check (hard fail)
    if profile.excluded_project_types:
        tender_desc = f"{tender.title} {tender.description} {tender.work_category}".lower()
        for ex in profile.excluded_project_types:
            if ex.lower() in tender_desc:
                failed.append(f"excluded project scope: {ex}")
                break

    # 3. Financial requirement (hard fail)
    effective_budget = tender.budget_sar if tender.budget_sar is not None else tender.budget
    effective_capacity = profile.annual_turnover or profile.preferred_project_value_sar or 0.0
    if effective_budget is not None and effective_capacity > 0:
        if effective_capacity < effective_budget:
            failed.append(f"annual turnover {effective_capacity} below required {effective_budget}")

    # 4. Deadline check (3-day lead window, hard fail)
    try:
        deadline_dt = datetime.fromisoformat(tender.deadline.replace("Z", "+00:00"))
        cutoff_dt = datetime.now(deadline_dt.tzinfo) + timedelta(days=3)
        if deadline_dt <= cutoff_dt:
            failed.append("deadline within 3-day lead window or past")
    except Exception:
        pass

    # 5. Status check (hard fail)
    if tender.status != "open":
        failed.append("tender not open")

    # NOTE: Company size must affect ranking but must NOT automatically determine eligibility.

    return {
        "passed": len(failed) == 0,
        "failed_criteria": failed,
        "warnings": warnings,
        "rule_version": "2.5.0-saudi-production",
    }


def compute_match(profile: CompanyProfile, tender: Tender) -> Dict[str, Any]:
    reasons: List[str] = []
    rule_score = 0.0

    # 1. Saudi Work Category & Activity overlap
    profile_activities = [
        act.lower()
        for act in (profile.main_activities + profile.secondary_activities + profile.capacity_tags)
    ]
    tender_text = f"{tender.title} {tender.description} {tender.work_category}".lower()
    matched_acts = [act for act in profile_activities if act in tender_text]

    activity_ratio = (
        len(matched_acts) / max(min(len(profile_activities), 3), 1)
        if profile_activities else 0.0
    )
    combined_activity_score = min(activity_ratio, 1.0)
    rule_score += 0.35 * combined_activity_score
    if combined_activity_score > 0:
        reasons.append(f"Matched activities: {', '.join(matched_acts[:2])}")

    # 2. Saudi Region & City match
    region_hit = any(r.lower() in tender_text or (tender.region and r.lower() in tender.region.lower()) for r in profile.saudi_regions)
    city_hit = any(c.lower() in tender_text or (tender.city and c.lower() in tender.city.lower()) for c in profile.saudi_cities)

    location_score = 0.0
    if city_hit:
        location_score = 1.0
        reasons.append(f"Direct city match: {tender.city or 'local city'}")
    elif region_hit:
        location_score = 0.75
        reasons.append(f"Regional coverage in {tender.region or 'target region'}")
    rule_score += 0.25 * location_score

    # 3. Budget Envelope
    effective_budget = tender.budget_sar if tender.budget_sar is not None else tender.budget
    effective_capacity = profile.annual_turnover or profile.preferred_project_value_sar or 0.0
    budget_feasible = (
        effective_budget is None or effective_capacity <= 0 or effective_budget <= effective_capacity * 1.5
    )
    rule_score += 0.15 * (1.0 if budget_feasible else 0.0)
    if budget_feasible and effective_budget:
        reasons.append("Budget within financial capacity envelope")

    # 4. Company Size Alignment (Ranking bonus, NOT eligibility disqualifier)
    size_fit_score = 0.5
    if effective_budget:
        if effective_budget >= 50000000:
            size_fit_score = 1.0 if profile.company_size == "Large" else 0.6 if profile.company_size == "Medium" else 0.3
        elif effective_budget <= 10000000:
            size_fit_score = 1.0 if profile.company_size == "Small" else 0.8 if profile.company_size == "Medium" else 0.5
        else:
            size_fit_score = 1.0 if profile.company_size == "Medium" else 0.8 if profile.company_size == "Large" else 0.6

    rule_score += 0.15 * size_fit_score
    if size_fit_score >= 0.8:
        reasons.append(f"Company size ({profile.company_size}) optimal for project scale")

    # 5. Classification Grade
    grade_map = {1: 1.0, 2: 0.85, 3: 0.70, 4: 0.55, 5: 0.40}
    grade_score = grade_map.get(profile.classification_grade, 0.5)
    rule_score += 0.10 * grade_score

    # Semantic Scope Fit
    semantic_score = 0.35
    common_terms = sum(1 for tag in (profile.capacity_tags + profile.equipment_tags) if tag.lower() in tender_text)
    if common_terms > 0:
        semantic_score = min(0.95, 0.4 + common_terms * 0.12)
    if combined_activity_score > 0:
        semantic_score = min(0.95, semantic_score + 0.1)

    eligibility = compute_eligibility(profile, tender)
    total_score = round(0.4 * semantic_score + 0.6 * rule_score, 2)

    return {
        "tender_id": tender.id,
        "company_id": profile.id,
        "score": total_score,
        "semantic_score": round(semantic_score, 2),
        "rule_score": round(rule_score, 2),
        "reasons": reasons,
        "eligibility": eligibility,
    }
