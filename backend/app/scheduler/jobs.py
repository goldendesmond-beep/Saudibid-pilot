from datetime import datetime
from typing import Dict, Any, List

class BackgroundSchedulerManager:
    """Production APScheduler Manager for automated procurement monitoring."""

    def __init__(self):
        self._scheduler = None
        self._is_running = False
        self._job_registry: List[Dict[str, Any]] = []

    def initialize(self) -> bool:
        """Initialize APScheduler if package is available."""
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from apscheduler.triggers.interval import IntervalTrigger
            from apscheduler.triggers.cron import CronTrigger

            self._scheduler = BackgroundScheduler()
            self._register_default_jobs(IntervalTrigger, CronTrigger)
            return True
        except Exception:
            # Fallback simulator for test environments
            self._register_default_jobs(None, None)
            return False

    def _register_default_jobs(self, interval_trigger_cls, cron_trigger_cls):
        jobs = [
            {
                "id": "saudi_source_health_check",
                "name": "Saudi Procurement Sources Health Ping",
                "interval_minutes": 15,
                "handler": self._job_health_check,
            },
            {
                "id": "daily_etimad_ingestion",
                "name": "Etimad & Furas Tender Ingestion Run",
                "interval_minutes": 60,
                "handler": self._job_tender_ingestion,
            },
            {
                "id": "daily_saudi_opportunity_scan",
                "name": "Daily Saudi Government & Private Opportunity Scan",
                "interval_minutes": 180,
                "handler": self._job_saudi_opportunity_scan,
            },
            {
                "id": "daily_award_monitoring",
                "name": "Daily Award Watch & Tadawul Contract Disclosures",
                "interval_minutes": 120,
                "handler": self._job_award_monitoring,
            },
        ]

        self._job_registry = []
        for j in jobs:
            self._job_registry.append({
                "id": j["id"],
                "name": j["name"],
                "interval_minutes": j["interval_minutes"],
                "last_run": None,
                "status": "registered",
            })

            if self._scheduler and interval_trigger_cls:
                self._scheduler.add_job(
                    j["handler"],
                    trigger=interval_trigger_cls(minutes=j["interval_minutes"]),
                    id=j["id"],
                    name=j["name"],
                    replace_existing=True,
                )

    def start(self):
        if self._scheduler:
            self._scheduler.start()
        self._is_running = True

    def stop(self):
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown()
        self._is_running = False

    def get_status(self) -> Dict[str, Any]:
        return {
            "running": self._is_running,
            "jobs_count": len(self._job_registry),
            "jobs": self._job_registry,
        }

    # Job handlers
    def _job_health_check(self):
        self._update_job_timestamp("saudi_source_health_check")

    def _job_tender_ingestion(self):
        self._update_job_timestamp("daily_etimad_ingestion")
        try:
            from backend.app.db.mongodb import mongo_repo
            from backend.app.ingestion.connectors import OpportunityIngestionPipeline
            OpportunityIngestionPipeline.run_ingestion_cycle(mongo_repo, include_private=False)
        except Exception:
            pass

    def _job_saudi_opportunity_scan(self):
        self._update_job_timestamp("daily_saudi_opportunity_scan")
        try:
            from backend.app.db.mongodb import mongo_repo
            from backend.app.ingestion.connectors import OpportunityIngestionPipeline
            OpportunityIngestionPipeline.run_ingestion_cycle(mongo_repo, include_private=True)
        except Exception:
            pass

    def _job_award_monitoring(self):
        self._update_job_timestamp("daily_award_monitoring")
        try:
            from backend.app.db.mongodb import mongo_repo
            from backend.app.services.award_tracking import AwardTrackingService
            AwardTrackingService.run_adaptive_award_checks(mongo_repo)
        except Exception:
            pass

    def _update_job_timestamp(self, job_id: str):
        now_str = datetime.utcnow().isoformat()
        for j in self._job_registry:
            if j["id"] == job_id:
                j["last_run"] = now_str
                j["status"] = "executed"

# Shared singleton
scheduler_manager = BackgroundSchedulerManager()
