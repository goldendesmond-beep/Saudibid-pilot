import json
from typing import Dict, Any, Optional, List
from backend.app.core.config import settings
from backend.app.models.schemas import CompanyProfile, Tender, AuditLog, SaudiSource, SourceRun
from backend.app.db.mongodb import mongo_repo
from backend.app.rag.chroma import chroma_store
from backend.app.scheduler.jobs import scheduler_manager
from backend.app.services.matching_service import compute_match
from backend.app.sources.registry import SourceRegistryService

def create_app():
    """Application factory for FastAPI production backend."""
    try:
        from fastapi import FastAPI, Request, Response, Header, Query
        from fastapi.middleware.cors import CORSMiddleware
    except ImportError:
        # Standalone mock/runner mode if FastAPI is not installed in current environment
        return None

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Production API for Tender Intelligence Saudi",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup_event():
        mongo_repo.connect()
        chroma_store.connect()
        # Seed default company if empty
        if not mongo_repo.list_companies():
            mongo_repo.migrate_from_json("./data/companies.json")
        # Seed official Saudi sources
        SourceRegistryService.seed_default_sources(mongo_repo)
        if settings.SCHEDULER_AUTOSTART:
            scheduler_manager.initialize()
            scheduler_manager.start()

    @app.on_event("shutdown")
    async def shutdown_event():
        scheduler_manager.stop()

    @app.get("/health")
    def health_check():
        return {
            "status": "ok",
            "version": settings.APP_VERSION,
            "mongodb_connected": mongo_repo.is_connected(),
            "chroma_connected": chroma_store.is_connected(),
            "scheduler": scheduler_manager.get_status(),
        }

    # Companies endpoints
    @app.post("/companies")
    def create_or_update_company(body: Dict[str, Any], x_company_id: Optional[str] = Header(None)):
        cid = body.get("id") or x_company_id or f"comp-{int(datetime.utcnow().timestamp())}"
        body["id"] = cid
        profile = CompanyProfile.from_dict(body)
        saved = mongo_repo.save_company(profile)
        mongo_repo.log_audit_event(
            AuditLog(
                id=f"audit-{cid}",
                tenant_id=cid,
                action="UPDATE_PROFILE",
                entity="company_profile",
                entity_id=cid,
            )
        )
        return saved

    @app.get("/companies/{company_id}")
    def get_company(company_id: str):
        profile = mongo_repo.get_company(company_id)
        if not profile:
            return Response(content=json.dumps({"detail": f"company {company_id} not found"}), status_code=404)
        return profile.to_dict()

    # Tenders query
    @app.get("/tenders")
    def get_tenders(status: Optional[str] = None, work_category: Optional[str] = None):
        tenders = mongo_repo.list_tenders(status=status, work_category=work_category)
        return [t.to_dict() for t in tenders]

    # Matches execution
    @app.post("/matches/run")
    def run_matches(company_id: str = Query(...)):
        profile = mongo_repo.get_company(company_id)
        if not profile:
            return Response(content=json.dumps({"detail": f"company {company_id} not found"}), status_code=404)

        tenders = mongo_repo.list_tenders()
        results = [compute_match(profile, t) for t in tenders]
        results.sort(key=lambda x: (x["eligibility"]["passed"], x["score"]), reverse=True)
        return results

    @app.get("/matches")
    def get_matches(company_id: str = Query(...)):
        return run_matches(company_id=company_id)

    # Stage 5 Saudi Intelligence Pipeline Endpoint
    @app.post("/intelligence/evaluate")
    def evaluate_saudi_opportunities(company_id: str = Query(...)):
        from backend.app.services.intelligence_pipeline import TenderIntelligencePipeline
        from backend.app.ingestion.connectors import OpportunityIngestionPipeline

        profile = mongo_repo.get_company(company_id)
        if not profile:
            return Response(content=json.dumps({"detail": f"company {company_id} not found"}), status_code=404)

        # Ensure canonical opportunities exist
        opps = mongo_repo.list_opportunities()
        if not opps:
            OpportunityIngestionPipeline.run_ingestion_cycle(mongo_repo)
            opps = mongo_repo.list_opportunities()

        results = [TenderIntelligencePipeline.evaluate_opportunity(profile, opp) for opp in opps]
        # Sort eligible first, then by match score descending
        results.sort(
            key=lambda x: (
                x["eligibility"]["status"] == "ELIGIBLE",
                x["eligibility"]["status"] == "LIKELY_ELIGIBLE",
                x["eligibility"]["status"] == "REVIEW_REQUIRED",
                x["match_score"]["total_score"],
            ),
            reverse=True,
        )
        return results

    # Audit logging
    @app.get("/audit")
    def get_audit_trail(tenant_id: Optional[str] = None):
        return mongo_repo.list_audit_events(tenant_id=tenant_id)

    # Saudi Source Registry endpoints
    @app.get("/sources")
    def get_sources(authority_type: Optional[str] = None, is_active: Optional[bool] = None):
        sources = mongo_repo.list_sources(authority_type=authority_type, is_active=is_active)
        return [s.to_dict() for s in sources]

    @app.get("/sources/{source_id}")
    def get_source(source_id: str):
        source = mongo_repo.get_source(source_id)
        if not source:
            return Response(content=json.dumps({"detail": f"source {source_id} not found"}), status_code=404)
        return source.to_dict()

    @app.post("/sources/register")
    def register_source(body: Dict[str, Any]):
        try:
            created = SourceRegistryService.register_dynamic_source(body, mongo_repo)
            return created.to_dict()
        except ValueError as e:
            return Response(content=json.dumps({"detail": str(e)}), status_code=400)

    @app.post("/sources/{source_id}/probe")
    def probe_source(source_id: str, simulate_failure: bool = False):
        result = SourceRegistryService.probe_source_health(source_id, mongo_repo, simulate_failure=simulate_failure)
        if "error" in result:
            return Response(content=json.dumps({"detail": result["error"]}), status_code=404)
        return result

    @app.get("/sources/{source_id}/runs")
    def get_source_runs(source_id: str):
        return mongo_repo.list_source_runs(source_id=source_id)

    @app.post("/sources/{source_id}/discover")
    def discover_source_endpoint(source_id: str):
        from backend.app.sources.discovery import DynamicSourceDiscoveryService
        source = mongo_repo.get_source(source_id)
        if not source:
            return Response(content=json.dumps({"detail": f"source {source_id} not found"}), status_code=404)
        result = DynamicSourceDiscoveryService.discover_endpoint(source)
        mongo_repo.save_source(source)
        return result

    # Saudi Government & Private Opportunity Ingestion endpoints (Stage 4)
    @app.post("/opportunities/ingest")
    def trigger_opportunity_ingestion(source_id: Optional[str] = None):
        from backend.app.ingestion.connectors import OpportunityIngestionPipeline
        result = OpportunityIngestionPipeline.run_ingestion_cycle(mongo_repo, target_source_id=source_id)
        return result

    @app.get("/opportunities")
    def list_opportunities(
        opportunity_type: Optional[str] = None,
        confidence_level: Optional[str] = None,
        source_id: Optional[str] = None,
        work_category: Optional[str] = None,
    ):
        from backend.app.ingestion.connectors import OpportunityIngestionPipeline
        # Ensure initial opportunities are ingested if empty
        if not mongo_repo.list_opportunities():
            OpportunityIngestionPipeline.run_ingestion_cycle(mongo_repo)

        opps = mongo_repo.list_opportunities(
            opportunity_type=opportunity_type,
            confidence_level=confidence_level,
            source_id=source_id,
            work_category=work_category,
        )
        return [o.to_dict() for o in opps]

    @app.get("/opportunities/{opp_id}")
    def get_opportunity(opp_id: str):
        opp = mongo_repo.get_opportunity(opp_id)
        if not opp:
            return Response(content=json.dumps({"detail": f"opportunity {opp_id} not found"}), status_code=404)
        return opp.to_dict()

    @app.get("/opportunities/{opp_id}/raw")
    def get_opportunity_raw_evidence(opp_id: str):
        opp = mongo_repo.get_opportunity(opp_id)
        if not opp:
            return Response(content=json.dumps({"detail": f"opportunity {opp_id} not found"}), status_code=404)
        raw = mongo_repo.get_raw_record(opp.raw_record_id)
        if not raw:
            return Response(content=json.dumps({"detail": "raw evidence record not found"}), status_code=404)
        return raw.to_dict()

    # Stage 6 Daily Monitoring Endpoints
    @app.post("/monitoring/run")
    def trigger_daily_monitoring(allow_test_fixtures: bool = False, company_id: Optional[str] = None):
        from backend.app.monitoring.daily_monitor import DailyMonitoringEngine
        run = DailyMonitoringEngine.run_daily_monitoring(
            repo=mongo_repo,
            allow_test_fixtures=allow_test_fixtures,
            target_company_id=company_id,
        )
        return run.to_dict()

    @app.get("/monitoring/runs")
    def list_monitoring_runs(limit: int = 20):
        runs = mongo_repo.list_monitoring_runs(limit=limit)
        return [r.to_dict() for r in runs]

    @app.get("/monitoring/snapshots")
    def list_daily_snapshots(limit: int = 30):
        snapshots = mongo_repo.list_daily_snapshots(limit=limit)
        return [s.to_dict() for s in snapshots]

    @app.get("/monitoring/snapshots/{identifier}")
    def get_daily_snapshot(identifier: str):
        snapshot = mongo_repo.get_daily_snapshot(identifier)
        if not snapshot:
            return Response(content=json.dumps({"detail": f"snapshot {identifier} not found"}), status_code=404)
        return snapshot.to_dict()

    # Stage 6 Saved Lists Endpoints
    @app.get("/saved-lists")
    def list_saved_lists(company_id: Optional[str] = None):
        lists = mongo_repo.list_saved_lists(company_id=company_id)
        return [l.to_dict() for l in lists]

    @app.post("/saved-lists")
    async def create_saved_list(request: Request):
        from backend.app.models.schemas import SavedList
        import uuid
        data = await request.json()
        list_id = data.get("id") or f"list-{uuid.uuid4().hex[:8]}"
        saved_list = SavedList(
            id=list_id,
            company_id=data.get("company_id", "comp-sa-001"),
            name=data.get("name", "New Saved List"),
            notes=data.get("notes", ""),
            opportunity_ids=data.get("opportunity_ids", []),
            original_snapshot_id=data.get("original_snapshot_id"),
        )
        saved = mongo_repo.save_saved_list(saved_list)
        return Response(content=json.dumps(saved), status_code=201, media_type="application/json")

    @app.get("/saved-lists/{list_id}")
    def get_saved_list(list_id: str):
        sl = mongo_repo.get_saved_list(list_id)
        if not sl:
            return Response(content=json.dumps({"detail": f"saved list {list_id} not found"}), status_code=404)
        return sl.to_dict()

    @app.put("/saved-lists/{list_id}")
    async def update_saved_list(list_id: str, request: Request):
        from backend.app.models.schemas import SavedList
        sl = mongo_repo.get_saved_list(list_id)
        if not sl:
            return Response(content=json.dumps({"detail": f"saved list {list_id} not found"}), status_code=404)
        data = await request.json()
        if "name" in data:
            sl.name = data["name"]
        if "notes" in data:
            sl.notes = data["notes"]
        if "opportunity_ids" in data:
            sl.opportunity_ids = data["opportunity_ids"]
        sl.updated_at = datetime.utcnow().isoformat()
        saved = mongo_repo.save_saved_list(sl)
        return saved

    @app.delete("/saved-lists/{list_id}")
    def delete_saved_list(list_id: str):
        deleted = mongo_repo.delete_saved_list(list_id)
        if not deleted:
            return Response(content=json.dumps({"detail": f"saved list {list_id} not found"}), status_code=404)
        return {"success": True, "deleted_id": list_id}

    # Stage 7: Source Recovery Endpoints (Part 0)
    @app.get("/sources/recovery/report")
    def get_source_recovery_report():
        from backend.app.services.source_recovery import SaudiSourceRecoveryService
        return SaudiSourceRecoveryService.get_source_recovery_report(mongo_repo)

    @app.get("/sources/access-profiles")
    def get_source_access_profiles():
        from backend.app.services.source_recovery import SaudiSourceRecoveryService
        profiles = mongo_repo.list_source_access_profiles()
        if not profiles:
            SaudiSourceRecoveryService.seed_source_access_profiles(mongo_repo)
            profiles = mongo_repo.list_source_access_profiles()
        return [p.to_dict() for p in profiles]

    @app.post("/sources/assisted-import")
    async def process_assisted_import(request: Request):
        from backend.app.services.source_recovery import SaudiSourceRecoveryService
        data = await request.json()
        source_id = data.get("source_id", "src-etimad")
        import_type = data.get("import_type", "ETIMAD_MANUAL_ASSISTED_IMPORT")
        payload = data.get("payload", {})
        canonical_opp, raw_rec = SaudiSourceRecoveryService.process_assisted_import(
            repo=mongo_repo,
            source_id=source_id,
            import_type=import_type,
            payload=payload,
        )
        return {
            "success": True,
            "opportunity": canonical_opp.to_dict(),
            "raw_record_id": raw_rec.id,
            "provenance": import_type,
        }

    # Stage 7: Award Watchlist & Results Endpoints (Part A - I)
    @app.post("/awards/watch")
    async def watch_award_result(request: Request):
        from backend.app.services.award_tracking import AwardTrackingService
        data = await request.json()
        opportunity_id = data.get("opportunity_id")
        if not opportunity_id:
            return Response(content=json.dumps({"detail": "opportunity_id is required"}), status_code=400)
        watch = AwardTrackingService.register_award_watch(
            repo=mongo_repo,
            opportunity_id=opportunity_id,
            company_id=data.get("company_id", "comp-sa-001"),
            saved_list_id=data.get("saved_list_id"),
        )
        return watch.to_dict()

    @app.get("/awards/watches")
    def list_award_watches(
        company_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
        saved_list_id: Optional[str] = None,
    ):
        watches = mongo_repo.list_award_watches(
            company_id=company_id,
            opportunity_id=opportunity_id,
            saved_list_id=saved_list_id,
        )
        return [w.to_dict() for w in watches]

    @app.delete("/awards/watches/{watch_id}")
    def delete_award_watch(watch_id: str):
        deleted = mongo_repo.delete_award_watch(watch_id)
        if not deleted:
            return Response(content=json.dumps({"detail": f"watch {watch_id} not found"}), status_code=404)
        return {"success": True, "deleted_id": watch_id}

    @app.post("/awards/results")
    async def record_award_result(request: Request):
        from backend.app.services.award_tracking import AwardTrackingService
        data = await request.json()
        res = AwardTrackingService.record_award_result(
            repo=mongo_repo,
            opportunity_id=data.get("opportunity_id", ""),
            winner_legal_name=data.get("winner_legal_name", "UNKNOWN"),
            source_type=data.get("source_type", "ORIGINAL_TENDER_PORTAL"),
            source_url=data.get("source_url", ""),
            award_date=data.get("award_date"),
            contract_value_sar=data.get("contract_value_sar"),
            contract_duration=data.get("contract_duration"),
            evidence_text=data.get("evidence_text", ""),
            status=data.get("status", "AWARDED_VERIFIED"),
        )
        return res.to_dict()

    @app.get("/awards/results")
    def list_award_results(status: Optional[str] = None):
        results = mongo_repo.list_award_results(status=status)
        return [r.to_dict() for r in results]

    @app.get("/awards/results/{opportunity_id}")
    def get_award_result_for_opportunity(opportunity_id: str):
        res = mongo_repo.get_award_result_by_opportunity(opportunity_id)
        if not res:
            return Response(
                content=json.dumps({
                    "opportunity_id": opportunity_id,
                    "status": "NO_RESULT_FOUND_YET",
                    "winner_legal_name": "UNKNOWN",
                    "contract_value_sar": None,
                    "message": "Result Not Publicly Available",
                }),
                status_code=200,
            )
        return res.to_dict()

    @app.get("/saved-lists/{list_id}/award-summary")
    def get_saved_list_award_summary(list_id: str):
        from backend.app.services.award_tracking import AwardTrackingService
        summary = AwardTrackingService.get_saved_list_award_summary(mongo_repo, list_id)
        return summary

    @app.post("/awards/check-run")
    def run_adaptive_award_checks():
        from backend.app.services.award_tracking import AwardTrackingService
        res = AwardTrackingService.run_adaptive_award_checks(mongo_repo)
        return res

    @app.get("/main-contractors")
    def list_main_contractors():
        contractors = mongo_repo.list_main_contractors()
        return [c.to_dict() for c in contractors]

    @app.get("/notifications")
    def list_notifications(tenant_id: str = "comp-sa-001"):
        notifs = mongo_repo.list_notifications(tenant_id=tenant_id)
        return [n.to_dict() for n in notifs]

    @app.post("/notifications/{notif_id}/read")
    def mark_notification_read(notif_id: str):
        success = mongo_repo.mark_notification_read(notif_id)
        return {"success": success, "notification_id": notif_id}

    # Stage 8: Main Contractor & Subcontracting Intelligence Endpoints
    @app.get("/subcontract/contractors")
    def get_subcontract_main_contractors():
        contractors = mongo_repo.list_main_contractors()
        return [c.to_dict() for c in contractors]

    @app.get("/subcontract/contractors/{contractor_id}")
    def get_subcontract_main_contractor(contractor_id: str):
        contractor = mongo_repo.get_main_contractor(contractor_id)
        if not contractor:
            raise HTTPException(status_code=404, detail="Main contractor not found")
        return contractor.to_dict()

    @app.post("/subcontract/contractors/discover")
    def discover_main_contractor_from_award(payload: Dict[str, Any]):
        from backend.app.services.main_contractor_discovery import MainContractorDiscoveryService
        opportunity_id = payload.get("opportunity_id")
        if not opportunity_id:
            raise HTTPException(status_code=400, detail="opportunity_id is required")

        award = mongo_repo.get_award_result_by_opportunity(opportunity_id)
        if not award:
            raise HTTPException(status_code=404, detail="Award result not found for opportunity")

        opp = mongo_repo.get_opportunity(opportunity_id)

        try:
            record = MainContractorDiscoveryService.create_or_update_contractor_profile(mongo_repo, award, opp)
            packages = MainContractorDiscoveryService.decompose_subcontract_packages(award, opp, record)
            for pkg in packages:
                mongo_repo.save_subcontract_package(pkg)
            return {
                "contractor": record.to_dict(),
                "packages_generated": len(packages),
                "packages": [p.to_dict() for p in packages],
            }
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))

    @app.get("/subcontract/packages")
    def list_subcontract_packages(
        main_contractor_id: Optional[str] = None,
        category: Optional[str] = None,
        project_id: Optional[str] = None,
    ):
        packages = mongo_repo.list_subcontract_packages(
            main_contractor_id=main_contractor_id,
            category=category,
            project_id=project_id,
        )
        return [p.to_dict() for p in packages]

    @app.get("/subcontract/packages/{package_id}")
    def get_subcontract_package(package_id: str):
        pkg = mongo_repo.get_subcontract_package(package_id)
        if not pkg:
            raise HTTPException(status_code=404, detail="Subcontract package not found")
        return pkg.to_dict()

    @app.get("/subcontract/matches")
    def get_subcontract_matches(company_id: str = "comp-sa-001"):
        from backend.app.services.subcontracting_intelligence import SubcontractingIntelligenceService
        company = mongo_repo.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company profile not found")

        packages = mongo_repo.list_subcontract_packages()
        matches = []
        for pkg in packages:
            match = SubcontractingIntelligenceService.evaluate_subcontract_match(pkg, company)
            matches.append({
                "package": pkg.to_dict(),
                "match": match.to_dict(),
            })

        matches = sorted(matches, key=lambda x: x["match"]["match_score"], reverse=True)
        return matches

    @app.post("/subcontract/action-plan/{package_id}")
    def create_subcontract_action_plan(package_id: str, company_id: str = "comp-sa-001"):
        from backend.app.services.subcontracting_intelligence import SubcontractingIntelligenceService
        pkg = mongo_repo.get_subcontract_package(package_id)
        if not pkg:
            raise HTTPException(status_code=404, detail="Subcontract package not found")

        contractor = mongo_repo.get_main_contractor(pkg.main_contractor_id)
        if not contractor:
            raise HTTPException(status_code=404, detail="Main contractor not found")

        company = mongo_repo.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company profile not found")

        plan = SubcontractingIntelligenceService.generate_subcontract_action_plan(
            mongo_repo, pkg, contractor, company
        )
        return plan.to_dict()

    @app.get("/subcontract/action-plans")
    def list_subcontract_action_plans(tenant_id: str = "comp-sa-001"):
        plans = mongo_repo.list_action_plans(tenant_id=tenant_id)
        return [p.to_dict() for p in plans]

    @app.patch("/subcontract/action-plan/{plan_id}/status")
    def update_action_plan_status(plan_id: str, payload: Dict[str, Any]):
        status = payload.get("status")
        notes = payload.get("notes")
        if not status:
            raise HTTPException(status_code=400, detail="status is required")
        updated = mongo_repo.update_action_plan_status(plan_id, status, notes)
        if not updated:
            raise HTTPException(status_code=404, detail="Action plan not found")
        return updated.to_dict()

    # Stage 9: Vendor Registration & Workspace Endpoints
    @app.get("/vendor-registrations")
    def list_vendor_registrations(tenant_id: str = "comp-sa-001"):
        regs = mongo_repo.list_vendor_registrations(tenant_id=tenant_id)
        return [r.to_dict() for r in regs]

    @app.get("/vendor-registrations/checklist/standard")
    def get_standard_prequalification_checklist(category: Optional[str] = None):
        from backend.app.services.vendor_registration import VendorRegistrationService
        docs = VendorRegistrationService.get_standard_checklist(package_category=category)
        return [d.to_dict() for d in docs]

    @app.get("/vendor-registrations/{contractor_id}")
    def get_vendor_registration(contractor_id: str, tenant_id: str = "comp-sa-001"):
        reg = mongo_repo.get_vendor_registration(contractor_id, tenant_id=tenant_id)
        if not reg:
            from backend.app.services.vendor_registration import VendorRegistrationService
            reg = VendorRegistrationService.discover_or_create_vendor_registration(contractor_id, mongo_repo, tenant_id=tenant_id)
        return reg.to_dict()

    @app.post("/vendor-registrations/{contractor_id}/discover")
    def discover_vendor_registration(contractor_id: str, tenant_id: str = "comp-sa-001"):
        from backend.app.services.vendor_registration import VendorRegistrationService
        reg = VendorRegistrationService.discover_or_create_vendor_registration(contractor_id, mongo_repo, tenant_id=tenant_id)
        return reg.to_dict()

    @app.patch("/vendor-registrations/{contractor_id}/status")
    def update_vendor_registration_status(contractor_id: str, payload: Dict[str, Any], tenant_id: str = "comp-sa-001"):
        from backend.app.services.vendor_registration import VendorRegistrationService
        status = payload.get("status")
        notes = payload.get("notes")
        ref = payload.get("reference")
        if not status:
            raise HTTPException(status_code=400, detail="status is required")
        try:
            reg = VendorRegistrationService.update_registration_status(
                contractor_id=contractor_id,
                new_status=status,
                repo=mongo_repo,
                tenant_id=tenant_id,
                notes=notes,
                submitted_reference=ref,
            )
            return reg.to_dict()
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))

    # Stage 9: Business Development Pipeline Endpoints
    @app.get("/bd/pipeline")
    def list_bd_pipeline(
        stage: Optional[str] = None,
        priority: Optional[str] = None,
        contractor_id: Optional[str] = None,
        tenant_id: str = "comp-sa-001",
    ):
        items = mongo_repo.list_bd_pipeline_items(
            tenant_id=tenant_id,
            stage=stage,
            priority=priority,
            contractor_id=contractor_id,
        )
        return [i.to_dict() for i in items]

    @app.get("/bd/pipeline/{pipeline_id}")
    def get_bd_pipeline_item(pipeline_id: str, tenant_id: str = "comp-sa-001"):
        item = mongo_repo.get_bd_pipeline_item(pipeline_id, tenant_id=tenant_id)
        if not item:
            raise HTTPException(status_code=404, detail="BD Pipeline item not found")
        return item.to_dict()

    @app.post("/bd/pipeline/generate-from-package/{package_id}")
    def generate_bd_pipeline_from_package(package_id: str, tenant_id: str = "comp-sa-001"):
        from backend.app.services.business_development import BusinessDevelopmentService
        try:
            item = BusinessDevelopmentService.create_or_sync_pipeline_item(package_id, mongo_repo, tenant_id=tenant_id)
            return item.to_dict()
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))

    @app.patch("/bd/pipeline/{pipeline_id}/stage")
    def update_bd_pipeline_stage(pipeline_id: str, payload: Dict[str, Any], tenant_id: str = "comp-sa-001"):
        from backend.app.services.business_development import BusinessDevelopmentService
        new_stage = payload.get("stage")
        notes = payload.get("notes")
        next_follow_up = payload.get("next_follow_up_date")
        if not new_stage:
            raise HTTPException(status_code=400, detail="stage is required")
        try:
            item = BusinessDevelopmentService.update_stage(
                pipeline_id=pipeline_id,
                new_stage=new_stage,
                repo=mongo_repo,
                tenant_id=tenant_id,
                notes=notes,
                next_follow_up=next_follow_up,
            )
            return item.to_dict()
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))

    @app.get("/bd/outreach-templates")
    def get_outreach_templates(
        package_name: str = "General Construction Works",
        project_name: str = "Saudi Commercial Project",
        project_owner: str = "Saudi Project Authority",
        contractor_name: str = "Main Contractor",
    ):
        from backend.app.services.business_development import BusinessDevelopmentService
        templates = BusinessDevelopmentService.generate_outreach_templates(
            package_name=package_name,
            project_name=project_name,
            project_owner=project_owner,
            contractor_name=contractor_name,
        )
        return templates

    @app.get("/sources/audit-report")
    def get_sources_audit_report():
        import json
        import os
        path = "backend/app/sources/live_source_audit_report.json"
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"error": "Audit report not yet generated"}

    # Stage 10: Master Company Document Vault Endpoints
    @app.get("/vault/documents")
    def list_vault_documents(category: Optional[str] = None, tenant_id: str = "comp-sa-001"):
        from backend.app.services.document_vault import DocumentVaultService
        svc = DocumentVaultService(tenant_id=tenant_id)
        docs = svc.get_all_documents(category=category)
        return [d.to_dict() for d in docs]

    @app.get("/vault/documents/{doc_id}")
    def get_vault_document(doc_id: str, tenant_id: str = "comp-sa-001"):
        from backend.app.services.document_vault import DocumentVaultService
        svc = DocumentVaultService(tenant_id=tenant_id)
        doc = svc.get_document_by_id(doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Vault document not found")
        return doc.to_dict()

    @app.patch("/vault/documents/{doc_id}")
    def update_vault_document(doc_id: str, payload: Dict[str, Any], tenant_id: str = "comp-sa-001"):
        from backend.app.services.document_vault import DocumentVaultService
        svc = DocumentVaultService(tenant_id=tenant_id)
        try:
            updated = svc.update_document(
                item_id=doc_id,
                filename=payload.get("filename"),
                expiry_date=payload.get("expiry_date"),
                version=payload.get("version"),
                notes=payload.get("notes"),
            )
            return updated.to_dict()
        except KeyError as err:
            raise HTTPException(status_code=404, detail=str(err))

    @app.get("/vault/summary")
    def get_vault_summary(tenant_id: str = "comp-sa-001"):
        from backend.app.services.document_vault import DocumentVaultService
        svc = DocumentVaultService(tenant_id=tenant_id)
        return svc.get_vault_summary()

    # Stage 10: Prequalification Dossier Generator Endpoints
    @app.get("/dossiers/profiles")
    def list_dossier_profiles(tenant_id: str = "comp-sa-001"):
        from backend.app.services.prequalification_dossier import PrequalificationDossierService
        svc = PrequalificationDossierService(tenant_id=tenant_id)
        return svc.get_supported_profiles()

    @app.get("/dossiers")
    def list_dossiers(tenant_id: str = "comp-sa-001"):
        from backend.app.services.prequalification_dossier import PrequalificationDossierService
        svc = PrequalificationDossierService(tenant_id=tenant_id)
        return [d.to_dict() for d in svc.list_dossiers()]

    @app.get("/dossiers/{dossier_id}")
    def get_dossier(dossier_id: str, tenant_id: str = "comp-sa-001"):
        from backend.app.services.prequalification_dossier import PrequalificationDossierService
        svc = PrequalificationDossierService(tenant_id=tenant_id)
        dossier = svc.get_dossier(dossier_id)
        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier not found")
        return dossier.to_dict()

    @app.post("/dossiers/assemble")
    def assemble_dossier(payload: Dict[str, Any], tenant_id: str = "comp-sa-001"):
        from backend.app.services.prequalification_dossier import PrequalificationDossierService
        profile_key = payload.get("profile_key", "GENERIC_SAUDI")
        opp_id = payload.get("opportunity_id")
        pkg_id = payload.get("subcontract_package_id")
        reg_id = payload.get("registration_id")
        notes = payload.get("notes", "")
        svc = PrequalificationDossierService(tenant_id=tenant_id)
        dossier = svc.assemble_dossier(
            profile_key=profile_key,
            opportunity_id=opp_id,
            subcontract_package_id=pkg_id,
            registration_id=reg_id,
            custom_notes=notes,
        )
        return dossier.to_dict()

    # Stage 10: Proposal Workspace & BOQ Assistant Endpoints
    @app.get("/proposals")
    def list_proposals(tenant_id: str = "comp-sa-001"):
        from backend.app.services.proposal_and_boq import ProposalAndBOQService
        svc = ProposalAndBOQService(tenant_id=tenant_id)
        return [p.to_dict() for p in svc.list_proposals()]

    @app.get("/proposals/{proposal_id}")
    def get_proposal(proposal_id: str, tenant_id: str = "comp-sa-001"):
        from backend.app.services.proposal_and_boq import ProposalAndBOQService
        svc = ProposalAndBOQService(tenant_id=tenant_id)
        prop = svc.get_proposal(proposal_id)
        if not prop:
            raise HTTPException(status_code=404, detail="Proposal not found")
        return prop.to_dict()

    @app.patch("/proposals/{proposal_id}/status")
    def update_proposal_status(proposal_id: str, payload: Dict[str, Any], tenant_id: str = "comp-sa-001"):
        from backend.app.services.proposal_and_boq import ProposalAndBOQService
        new_status = payload.get("status")
        ref = payload.get("submission_reference")
        notes = payload.get("notes")
        if not new_status:
            raise HTTPException(status_code=400, detail="status is required")
        svc = ProposalAndBOQService(tenant_id=tenant_id)
        try:
            updated = svc.update_proposal_status(
                proposal_id=proposal_id,
                new_status=new_status,
                submission_reference=ref,
                notes=notes,
            )
            return updated.to_dict()
        except (KeyError, ValueError) as err:
            raise HTTPException(status_code=400, detail=str(err))

    @app.get("/boqs/{boq_id}")
    def get_boq(boq_id: str, tenant_id: str = "comp-sa-001"):
        from backend.app.services.proposal_and_boq import ProposalAndBOQService
        svc = ProposalAndBOQService(tenant_id=tenant_id)
        boq = svc.get_boq(boq_id)
        if not boq:
            raise HTTPException(status_code=404, detail="BOQ sheet not found")
        return boq.to_dict()

    @app.patch("/boqs/{boq_id}/item")
    def update_boq_item(boq_id: str, payload: Dict[str, Any], tenant_id: str = "comp-sa-001"):
        from backend.app.services.proposal_and_boq import ProposalAndBOQService
        item_no = payload.get("item_number")
        unit_rate = payload.get("unit_rate")
        qty = payload.get("quantity")
        notes = payload.get("notes")
        source = payload.get("rate_source", "USER_ENTERED")
        if not item_no:
            raise HTTPException(status_code=400, detail="item_number is required")
        svc = ProposalAndBOQService(tenant_id=tenant_id)
        try:
            updated = svc.update_boq_item(
                boq_id=boq_id,
                item_number=item_no,
                unit_rate=unit_rate,
                quantity=qty,
                notes=notes,
                rate_source=source,
            )
            return updated.to_dict()
        except KeyError as err:
            raise HTTPException(status_code=404, detail=str(err))

    # Stage 10: Unified Action Center Endpoints
    @app.get("/action-center/items")
    def list_action_items(priority: Optional[str] = None, tenant_id: str = "comp-sa-001"):
        from backend.app.services.action_center import ActionCenterService
        svc = ActionCenterService(tenant_id=tenant_id)
        items = svc.get_action_items(priority_filter=priority)
        return [i.to_dict() for i in items]

    @app.get("/action-center/summary")
    def get_action_center_summary(tenant_id: str = "comp-sa-001"):
        from backend.app.services.action_center import ActionCenterService
        svc = ActionCenterService(tenant_id=tenant_id)
        return svc.get_action_center_summary()

    return app

# Expose app instance
app = create_app()
