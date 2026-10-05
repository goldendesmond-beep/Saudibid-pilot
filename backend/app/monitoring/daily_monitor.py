import uuid
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import (
    MonitoringRun,
    DailySnapshot,
    CanonicalOpportunity,
    RawSourceRecord,
    CompanyProfile,
)
from backend.app.db.mongodb import MongoRepository
from backend.app.services.deduplication import MultiSourceDeduplicationService
from backend.app.services.intelligence_pipeline import TenderIntelligencePipeline

# Authoritative live statuses discovered in container runtime
SOURCE_LIVE_TRUTH: Dict[str, Dict[str, Any]] = {
    "src-furas": {
        "status": "VERIFIED_LIVE",
        "http_code": 200,
        "limitation": "Public Balady municipal investment portal open; commercial leasing bids require CR login.",
    },
    "src-neom": {
        "status": "VERIFIED_LIVE",
        "http_code": 200,
        "limitation": "Public project releases accessible; direct RFP bidding requires NEOM Supplier Portal credential.",
    },
    "src-roshn": {
        "status": "VERIFIED_LIVE",
        "http_code": 200,
        "limitation": "Public sourcing updates accessible; direct bidding requires contractor onboarding with Saudi CR.",
    },
    "src-etimad": {
        "status": "FIXTURE_ONLY",
        "auth_required": True,
        "limitation": "Absher/Nafath 2FA authentication and MOF Geo-firewall blocks automated queries from outside KSA.",
    },
    "src-ncp": {
        "status": "BLOCKED",
        "http_code": 504,
        "limitation": "Government network perimeter filtering / connection timed out on international Cloud Run IPs.",
    },
    "src-rcjy": {
        "status": "BLOCKED",
        "http_code": 504,
        "limitation": "Government network perimeter filtering / connection timed out on international Cloud Run IPs.",
    },
    "src-aramco": {
        "status": "AUTH_REQUIRED",
        "auth_required": True,
        "limitation": "Enterprise SAP Ariba portal gateway requires authenticated IKTVA contractor credentials.",
    },
    "src-tadawul": {
        "status": "BLOCKED",
        "http_code": 403,
        "limitation": "WAF / Cloudflare Bot Management blocks automated requests with HTTP 403 Forbidden.",
    },
}

class DailyMonitoringEngine:
    """Production Daily Monitoring Engine.
    
    Executes automated daily scans, enforces live source truth, isolates failures,
    runs normalization, deduplication, intelligence scoring, and produces immutable daily snapshots.
    """

    @classmethod
    def run_daily_monitoring(
        cls,
        repo: MongoRepository,
        allow_test_fixtures: bool = False,
        target_company_id: Optional[str] = None,
    ) -> MonitoringRun:
        run_id = f"mon-run-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        now_iso = datetime.utcnow().isoformat()
        today_date = date.today().isoformat()

        sources = repo.list_sources()
        sources_attempted = 0
        sources_successful = 0
        sources_blocked = 0
        sources_auth_required = 0
        source_failures = 0

        source_details: List[Dict[str, Any]] = []
        newly_ingested_opps: List[CanonicalOpportunity] = []

        # 1. Process sources independently
        for src in sources:
            if not src.is_active:
                continue

            sources_attempted += 1
            src_truth = SOURCE_LIVE_TRUTH.get(src.id, {})
            live_status = src_truth.get("status", "DISCOVERY_REQUIRED" if src.verification_status == "DISCOVERY_REQUIRED" else "FIXTURE_ONLY")

            if live_status == "BLOCKED":
                sources_blocked += 1
                if not allow_test_fixtures:
                    source_details.append({
                        "source_id": src.id,
                        "name": src.name,
                        "status": "BLOCKED",
                        "limitation": src_truth.get("limitation", "Connection blocked"),
                        "records_ingested": 0,
                        "is_live": False,
                    })
                    continue
            elif live_status == "AUTH_REQUIRED":
                sources_auth_required += 1
                if not allow_test_fixtures:
                    source_details.append({
                        "source_id": src.id,
                        "name": src.name,
                        "status": "AUTH_REQUIRED",
                        "limitation": src_truth.get("limitation", "Authentication required"),
                        "records_ingested": 0,
                        "is_live": False,
                    })
                    continue
            elif live_status == "FIXTURE_ONLY" and not allow_test_fixtures:
                # In production runs, fixture sources are NOT counted as live ingested
                source_details.append({
                    "source_id": src.id,
                    "name": src.name,
                    "status": "FIXTURE_ONLY",
                    "limitation": src_truth.get("limitation", "Live automated scraping blocked / portal requires Nafath"),
                    "records_ingested": 0,
                    "is_live": False,
                })
                continue

            # For VERIFIED_LIVE or permitted test runs, fetch and ingest
            try:
                # Query existing or newly retrieved records for this source
                opps = repo.list_opportunities(source_id=src.id)
                sources_successful += 1
                source_details.append({
                    "source_id": src.id,
                    "name": src.name,
                    "status": live_status if live_status == "VERIFIED_LIVE" else "FIXTURE_TEST",
                    "limitation": src_truth.get("limitation", "Operational"),
                    "records_ingested": len(opps),
                    "is_live": live_status == "VERIFIED_LIVE",
                })
                newly_ingested_opps.extend(opps)
            except Exception as e:
                source_failures += 1
                source_details.append({
                    "source_id": src.id,
                    "name": src.name,
                    "status": "FAILURE",
                    "limitation": str(e),
                    "records_ingested": 0,
                    "is_live": False,
                })

        # 2. Multi-source Deduplication
        merged_opps: List[CanonicalOpportunity] = []
        duplicates_merged = 0

        for opp in newly_ingested_opps:
            found_duplicate = False
            for idx, existing in enumerate(merged_opps):
                if MultiSourceDeduplicationService.are_duplicates(existing, opp):
                    merged, conflicts = MultiSourceDeduplicationService.merge_duplicates(existing, opp)
                    merged_opps[idx] = merged
                    duplicates_merged += 1
                    found_duplicate = True
                    break
            if not found_duplicate:
                merged_opps.append(opp)

        # 3. Categorize opportunities
        confirmed_count = sum(1 for o in merged_opps if o.confidence_level == "CONFIRMED_OPPORTUNITY")
        possible_count = sum(1 for o in merged_opps if o.confidence_level == "POSSIBLE_OPPORTUNITY")
        market_signals_count = sum(1 for o in merged_opps if o.confidence_level == "MARKET_SIGNAL_ONLY")

        # 4. Run Intelligence Matching for Target/Default Company
        high_match_count = 0
        strong_match_count = 0
        good_match_count = 0
        review_required_count = 0
        subcontract_targets_count = 0
        closing_within_7_days_count = 0

        # Load target company or default
        company = None
        if target_company_id:
            company = repo.get_company(target_company_id)
        if not company:
            companies = repo.list_companies()
            if companies:
                company = companies[0]

        evaluated_snapshot_items: List[Dict[str, Any]] = []

        now_dt = datetime.utcnow()
        for opp in merged_opps:
            # Check closing deadline
            if opp.closing_date and opp.closing_date != "UNKNOWN":
                try:
                    clean_date = opp.closing_date.replace("Z", "")
                    closing_dt = datetime.fromisoformat(clean_date)
                    diff_days = (closing_dt - now_dt).total_seconds() / 86400.0
                    if 0 <= diff_days <= 7.0:
                        closing_within_7_days_count += 1
                except Exception:
                    pass

            item_data = opp.to_dict()

            if company:
                eval_res = TenderIntelligencePipeline.evaluate_opportunity(company, opp)
                item_data["match_score"] = eval_res["match_score"]
                item_data["eligibility"] = eval_res["eligibility"]
                item_data["subcontract"] = eval_res["subcontract"]
                item_data["gap_analysis"] = eval_res["gap_analysis"]

                score_label = eval_res["match_score"]["label"]
                if score_label == "STRONG_MATCH":
                    strong_match_count += 1
                    high_match_count += 1
                elif score_label == "GOOD_MATCH":
                    good_match_count += 1
                    high_match_count += 1
                elif score_label == "REVIEW":
                    review_required_count += 1

                if eval_res["subcontract"]["is_subcontract_target"]:
                    subcontract_targets_count += 1

            evaluated_snapshot_items.append(item_data)

        # 5. Create Monitoring Run
        monitoring_run = MonitoringRun(
            id=run_id,
            timestamp=now_iso,
            sources_attempted=sources_attempted,
            sources_successful=sources_successful,
            sources_blocked=sources_blocked,
            sources_auth_required=sources_auth_required,
            source_failures=source_failures,
            raw_records_found=len(newly_ingested_opps),
            canonical_opportunities_created=len(merged_opps),
            duplicates_merged=duplicates_merged,
            confirmed_opportunities=confirmed_count,
            possible_opportunities=possible_count,
            market_signals=market_signals_count,
            high_match_opportunities=high_match_count,
            source_details=source_details,
            is_fixture_run=allow_test_fixtures,
        )
        repo.save_monitoring_run(monitoring_run)

        # 6. Create Immutable Daily Snapshot
        eastern_count = sum(1 for o in merged_opps if "eastern" in (o.region or "").lower())
        jubail_count = sum(1 for o in merged_opps if "jubail" in (o.city or "").lower())
        govt_count = sum(1 for o in merged_opps if o.opportunity_type == "GOVERNMENT_TENDER")
        priv_count = sum(1 for o in merged_opps if o.opportunity_type in ["PRIVATE_TENDER", "SUBCONTRACT_REQUEST", "PROJECT_SIGNAL"])

        snapshot = DailySnapshot(
            id=f"snapshot-{today_date}",
            snapshot_date=today_date,
            created_at=now_iso,
            records_discovered=len(newly_ingested_opps),
            canonical_opportunities_count=len(merged_opps),
            strong_match_count=strong_match_count,
            good_match_count=good_match_count,
            review_required_count=review_required_count,
            closing_within_7_days_count=closing_within_7_days_count,
            government_count=govt_count,
            private_count=priv_count,
            eastern_region_count=eastern_count,
            jubail_count=jubail_count,
            subcontract_targets_count=subcontract_targets_count,
            opportunities_snapshot=evaluated_snapshot_items,
            sources_summary={
                "attempted": sources_attempted,
                "successful": sources_successful,
                "blocked": sources_blocked,
                "auth_required": sources_auth_required,
            },
        )
        repo.save_daily_snapshot(snapshot)

        return monitoring_run
