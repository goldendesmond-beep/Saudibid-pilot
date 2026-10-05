from typing import Dict, Any, List
from backend.app.models.schemas import CompanyProfile, CanonicalOpportunity
from backend.app.services.eligibility_engine import SaudiEligibilityEngine
from backend.app.services.match_score import MatchScoreService
from backend.app.services.subcontracting import SubcontractingEvaluator
from backend.app.services.gap_analysis import CompanyGapAnalysisService

class TenderIntelligencePipeline:
    """Unified Stage 5 Intelligence Engine for Saudi Contractors."""

    @classmethod
    def evaluate_opportunity(
        cls,
        company: CompanyProfile,
        opp: CanonicalOpportunity,
    ) -> Dict[str, Any]:
        # 1. Evidence-based Eligibility Gate
        eligibility = SaudiEligibilityEngine.evaluate_eligibility(company, opp)

        # 2. Continuous 0-100 Match Score
        match_score = MatchScoreService.compute_match_score(company, opp)

        # 3. Subcontracting Alternative
        subcontract = SubcontractingEvaluator.evaluate_subcontract_potential(company, opp, eligibility, match_score)

        # 4. Capability Gap Analysis
        gaps = CompanyGapAnalysisService.evaluate_gaps(company, opp, eligibility, match_score, subcontract)

        # Determine source live status
        from backend.app.monitoring.daily_monitor import SOURCE_LIVE_TRUTH
        src_truth = SOURCE_LIVE_TRUTH.get(opp.primary_source_id, {})
        source_live_status = src_truth.get("status", "VERIFIED_LIVE" if opp.primary_source_id in ["src-furas", "src-neom", "src-roshn"] else "FIXTURE_ONLY")

        return {
            "opportunity_id": opp.id,
            "opportunity_title": opp.title,
            "opportunity_title_ar": opp.title_ar,
            "entity": opp.entity,
            "city": opp.city,
            "region": opp.region,
            "work_category": opp.work_category,
            "budget_sar": opp.budget_sar,
            "closing_date": opp.closing_date,
            "publication_date": opp.publication_date,
            "discovered_at": opp.discovered_at,
            "reference_number": opp.reference_number,
            "primary_source_id": opp.primary_source_id,
            "source_live_status": source_live_status,
            "original_url": opp.original_url,
            "confidence_level": opp.confidence_level,
            "opportunity_type": opp.opportunity_type,
            "eligibility": eligibility,
            "match_score": match_score,
            "subcontract": subcontract,
            "gap_analysis": gaps,
        }
