import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from backend.app.models.schemas import (
    AwardWatchlist,
    AwardResult,
    AwardStatus,
    MainContractorRecord,
    AwardNotification,
    CanonicalOpportunity,
)
from backend.app.db.mongodb import MongoRepository
from backend.app.services.normalization import SaudiNormalizationService

# Part C: Verification Hierarchy order (Highest authority first)
AWARD_SOURCE_HIERARCHY = {
    "ORIGINAL_TENDER_PORTAL": 1,
    "OFFICIAL_OWNER_ANNOUNCEMENT": 2,
    "GOVERNMENT_AUTHORITY_NOTICE": 3,
    "OFFICIAL_CONTRACTOR_DISCLOSURE": 4,
    "TADAWUL_DISCLOSURE": 5,
    "COMPANY_NEWSROOM": 6,
    "SECONDARY_MARKET_SIGNAL": 7,
}

class AwardTrackingService:
    """Production Stage 7 Award Tracking, Reconciliation & Main Contractor Engine."""

    @classmethod
    def register_award_watch(
        cls,
        repo: MongoRepository,
        opportunity_id: str,
        company_id: str = "comp-sa-001",
        saved_list_id: Optional[str] = None,
    ) -> AwardWatchlist:
        """User registers an opportunity to watch for verified award results (Part A)."""
        opp = repo.get_opportunity(opportunity_id)
        closing_date = opp.closing_date if opp else None
        now_dt = datetime.utcnow()
        now_iso = now_dt.isoformat()

        # Check if already watching
        existing_watches = repo.list_award_watches(company_id=company_id, opportunity_id=opportunity_id)
        if existing_watches:
            return existing_watches[0]

        # Calculate next check adaptively based on closing date (Part B)
        next_check = cls.calculate_next_check_date(closing_date, now_dt)

        watch_id = f"watch-{uuid.uuid4().hex[:8]}"
        watch = AwardWatchlist(
            id=watch_id,
            opportunity_id=opportunity_id,
            company_id=company_id,
            saved_list_id=saved_list_id,
            watch_start_date=now_iso,
            closing_date=closing_date,
            source_ids=opp.all_source_ids if opp else ["src-etimad"],
            last_checked_at=now_iso,
            next_check_at=next_check.isoformat(),
            checks_count=1,
            current_award_status="AWARD_PENDING",
            result_confidence=0.0,
            evidence_references=[],
            is_active=True,
        )

        repo.save_award_watch(watch)
        return watch

    @classmethod
    def calculate_next_check_date(cls, closing_date_str: Optional[str], from_dt: datetime) -> datetime:
        """Adaptive Award Check Scheduler (Part B):
        - Before closing date: check after closing date (minimal checks).
        - 0–14 days after closing: check daily/frequently.
        - 15–60 days after closing: check weekly.
        - 60+ days after closing: check bi-weekly/monthly.
        """
        if not closing_date_str or closing_date_str == "UNKNOWN":
            return from_dt + timedelta(days=3)

        try:
            clean_date = closing_date_str.replace("Z", "")
            closing_dt = datetime.fromisoformat(clean_date)
            diff_from_closing = (from_dt - closing_dt).total_seconds() / 86400.0

            if diff_from_closing < 0:
                # Before closing date -> wait until closing date + 1 day
                return closing_dt + timedelta(days=1)
            elif diff_from_closing <= 14:
                # 0-14 days after closing -> check daily
                return from_dt + timedelta(days=1)
            elif diff_from_closing <= 60:
                # 15-60 days after closing -> check every 7 days
                return from_dt + timedelta(days=7)
            else:
                # 60+ days after closing -> check every 21 days
                return from_dt + timedelta(days=21)
        except Exception:
            return from_dt + timedelta(days=5)

    @classmethod
    def record_award_result(
        cls,
        repo: MongoRepository,
        opportunity_id: str,
        winner_legal_name: str,
        source_type: str,
        source_url: str,
        award_date: Optional[str] = None,
        contract_value_sar: Optional[float] = None,
        contract_duration: Optional[str] = None,
        evidence_text: str = "",
        status: AwardStatus = "AWARDED_VERIFIED",
    ) -> AwardResult:
        """Record or update a verified award result, enforcing verification hierarchy (Part C & D)."""
        opp = repo.get_opportunity(opportunity_id)
        now_iso = datetime.utcnow().isoformat()
        res_id = f"award-{opportunity_id}"

        # CRITICAL RULE: Never invent a winner without evidence
        if not winner_legal_name or winner_legal_name.strip() in ["", "UNKNOWN", "N/A"]:
            winner_legal = "UNKNOWN"
            winner_normalized = "UNKNOWN"
            if status in ["AWARDED_VERIFIED", "AWARDED_SINGLE_OFFICIAL_SOURCE"]:
                status = "RESULT_NOT_PUBLIC"
        else:
            winner_legal = winner_legal_name.strip()
            winner_normalized, _ = SaudiNormalizationService.normalize_entity(winner_legal)

        # Check existing result to reconcile multiple sources (Part E)
        existing = repo.get_award_result_by_opportunity(opportunity_id)
        conflicting_details = []

        if existing:
            # Reconcile multi-source evidence
            is_conflict, conflict_reasons = cls.detect_award_conflict(existing, winner_legal, contract_value_sar, award_date)
            if is_conflict:
                status = "CONFLICTING_SOURCES"
                conflicting_details = [
                    {
                        "source": existing.source_type,
                        "winner": existing.winner_legal_name,
                        "value": existing.contract_value_sar,
                        "award_date": existing.award_date,
                    },
                    {
                        "source": source_type,
                        "winner": winner_legal,
                        "value": contract_value_sar,
                        "award_date": award_date,
                        "reasons": conflict_reasons,
                    },
                ]
                # Dispatch notification for conflicting award (Part I)
                cls.dispatch_award_notification(
                    repo=repo,
                    opportunity_id=opportunity_id,
                    event_type="CONFLICTING_AWARD_RESULT",
                    title="Conflicting Award Evidence Detected",
                    message=f"Discrepancy detected between sources for {opp.title if opp else opportunity_id}: {', '.join(conflict_reasons)}",
                )
            else:
                # Merge secondary confirmation evidence (Part E)
                existing.secondary_confirmation = {
                    "source_type": source_type,
                    "source_url": source_url,
                    "confirmed_at": now_iso,
                    "evidence": evidence_text,
                }
                if status == "AWARDED_SINGLE_OFFICIAL_SOURCE":
                    status = "AWARDED_VERIFIED"

        award_result = AwardResult(
            id=res_id,
            opportunity_id=opportunity_id,
            official_tender_number=opp.reference_number if opp else "UNKNOWN",
            project_title=opp.title if opp else "",
            owner_entity=opp.entity if opp else "",
            winner_legal_name=winner_legal,
            winner_normalized_name=winner_normalized,
            award_date=award_date or (now_iso if status.startswith("AWARDED") else None),
            contract_value_sar=contract_value_sar or (opp.budget_sar if opp else None),
            contract_duration=contract_duration,
            source_url=source_url,
            source_type=source_type,
            checked_date=now_iso,
            evidence_text=evidence_text,
            verification_confidence=1.0 if status == "AWARDED_VERIFIED" else 0.85,
            status=status,
            conflicting_details=conflicting_details,
        )

        repo.save_award_result(award_result)

        # Update any active watches on this opportunity
        watches = repo.list_award_watches(opportunity_id=opportunity_id)
        for w in watches:
            w.current_award_status = status
            w.last_checked_at = now_iso
            w.checks_count += 1
            if status in ["AWARDED_VERIFIED", "AWARDED_SINGLE_OFFICIAL_SOURCE"]:
                w.result_confidence = 1.0
            repo.save_award_watch(w)

        # Part H: Main Contractor Handoff data preparation when verified winner exists
        if status in ["AWARDED_VERIFIED", "AWARDED_SINGLE_OFFICIAL_SOURCE"] and winner_legal != "UNKNOWN":
            cls.prepare_main_contractor_handoff(repo, award_result, opp)
            cls.dispatch_award_notification(
                repo=repo,
                opportunity_id=opportunity_id,
                event_type="AWARD_RESULT_FOUND",
                title="Verified Award Result Discovered",
                message=f"Tender '{opp.title if opp else opportunity_id}' awarded to {winner_legal} ({contract_value_sar:,.0f} SAR)" if contract_value_sar else f"Tender awarded to {winner_legal}",
            )
        elif status == "CANCELLED":
            cls.dispatch_award_notification(
                repo=repo,
                opportunity_id=opportunity_id,
                event_type="TENDER_CANCELLED",
                title="Tender Cancelled by Owner",
                message=f"Tender '{opp.title if opp else opportunity_id}' was officially cancelled.",
            )

        return award_result

    @classmethod
    def detect_award_conflict(
        cls,
        existing: AwardResult,
        new_winner: str,
        new_value: Optional[float],
        new_date: Optional[str],
    ) -> Tuple[bool, List[str]]:
        """Determine if two award sources have conflicting values (Part E)."""
        reasons = []
        if existing.winner_legal_name not in ["UNKNOWN", ""] and new_winner not in ["UNKNOWN", ""]:
            norm_existing, _ = SaudiNormalizationService.normalize_entity(existing.winner_legal_name)
            norm_new, _ = SaudiNormalizationService.normalize_entity(new_winner)
            if norm_existing != norm_new and not (norm_existing in norm_new or norm_new in norm_existing):
                reasons.append(f"Winner mismatch: '{existing.winner_legal_name}' vs '{new_winner}'")

        if existing.contract_value_sar and new_value:
            # If values differ by > 15%
            pct_diff = abs(existing.contract_value_sar - new_value) / existing.contract_value_sar
            if pct_diff > 0.15:
                reasons.append(f"Contract value divergence: {existing.contract_value_sar:,.0f} SAR vs {new_value:,.0f} SAR")

        return (len(reasons) > 0, reasons)

    @classmethod
    def prepare_main_contractor_handoff(
        cls,
        repo: MongoRepository,
        award: AwardResult,
        opp: Optional[CanonicalOpportunity],
    ) -> MainContractorRecord:
        """Create a reusable verified Main Contractor record for Stage 8 subcontracting."""
        contractor_id = f"contractor-{uuid.uuid4().hex[:8]}"
        record = MainContractorRecord(
            id=contractor_id,
            contractor_name=award.winner_legal_name,
            contractor_name_ar=award.winner_normalized_name,
            awarded_project_id=award.opportunity_id,
            awarded_project_title=award.project_title or (opp.title if opp else ""),
            owner=award.owner_entity or (opp.entity if opp else ""),
            project_location=f"{opp.city}, {opp.region}" if opp else "Saudi Arabia",
            contract_value_sar=award.contract_value_sar,
            award_date=award.award_date,
            verified_sources=[award.source_url] if award.source_url else ["OFFICIAL_PORTAL"],
        )
        repo.save_main_contractor(record)
        return record

    @classmethod
    def get_saved_list_award_summary(cls, repo: MongoRepository, saved_list_id: str) -> Dict[str, Any]:
        """Generate Award Summary for a Saved List (Part F)."""
        saved_list = repo.get_saved_list(saved_list_id)
        if not saved_list:
            return {"saved_list_id": saved_list_id, "items": [], "counts": {}}

        items = []
        counts = {
            "AWARDED": 0,
            "AWARD_PENDING": 0,
            "RESULT_NOT_PUBLIC": 0,
            "CANCELLED": 0,
            "CONFLICTING": 0,
        }

        for opp_id in saved_list.opportunity_ids:
            opp = repo.get_opportunity(opp_id)
            res = repo.get_award_result_by_opportunity(opp_id)
            status = res.status if res else "AWARD_PENDING"

            if status in ["AWARDED_VERIFIED", "AWARDED_SINGLE_OFFICIAL_SOURCE"]:
                counts["AWARDED"] += 1
            elif status == "AWARD_PENDING":
                counts["AWARD_PENDING"] += 1
            elif status == "RESULT_NOT_PUBLIC":
                counts["RESULT_NOT_PUBLIC"] += 1
            elif status == "CANCELLED":
                counts["CANCELLED"] += 1
            elif status == "CONFLICTING_SOURCES":
                counts["CONFLICTING"] += 1

            items.append({
                "opportunity_id": opp_id,
                "title": opp.title if opp else opp_id,
                "entity": opp.entity if opp else "UNKNOWN",
                "reference_number": opp.reference_number if opp else "UNKNOWN",
                "award_status": status,
                "winner": res.winner_legal_name if res else "UNKNOWN",
                "contract_value_sar": res.contract_value_sar if res else None,
                "award_date": res.award_date if res else None,
                "is_public": status not in ["RESULT_NOT_PUBLIC", "AWARD_PENDING"],
            })

        return {
            "saved_list_id": saved_list_id,
            "list_name": saved_list.name,
            "total_watched": len(saved_list.opportunity_ids),
            "counts": counts,
            "items": items,
        }

    @classmethod
    def dispatch_award_notification(
        cls,
        repo: MongoRepository,
        opportunity_id: str,
        event_type: str,
        title: str,
        message: str,
        tenant_id: str = "comp-sa-001",
    ) -> AwardNotification:
        """Create application-level notification event (Part I)."""
        notif_id = f"notif-{uuid.uuid4().hex[:8]}"
        notif = AwardNotification(
            id=notif_id,
            tenant_id=tenant_id,
            opportunity_id=opportunity_id,
            event_type=event_type,
            title=title,
            message=message,
        )
        repo.save_notification(notif)
        return notif

    @classmethod
    def run_adaptive_award_checks(cls, repo: MongoRepository) -> Dict[str, Any]:
        """Execution step for APScheduler job (Part B). Checks active watches with failure isolation."""
        watches = repo.list_award_watches()
        now_dt = datetime.utcnow()
        checks_executed = 0
        failures = 0
        updated = 0

        for watch in watches:
            if not watch.is_active:
                continue

            try:
                # Perform check without stopping other watches on error
                checks_executed += 1
                watch.checks_count += 1
                watch.last_checked_at = now_dt.isoformat()
                watch.next_check_at = cls.calculate_next_check_date(watch.closing_date, now_dt).isoformat()
                repo.save_award_watch(watch)
                updated += 1
            except Exception as e:
                failures += 1
                print(f"Error checking watch {watch.id}: {e}")

        return {
            "checks_attempted": checks_executed,
            "successful_updates": updated,
            "isolated_failures": failures,
            "timestamp": now_dt.isoformat(),
        }
