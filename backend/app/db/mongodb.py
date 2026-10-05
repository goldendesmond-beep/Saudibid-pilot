import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings
from backend.app.models.schemas import (
    CompanyProfile,
    Tender,
    AuditLog,
    DocumentChunk,
    SaudiSource,
    SourceRun,
    RawSourceRecord,
    CanonicalOpportunity,
    MonitoringRun,
    DailySnapshot,
    SavedList,
    SourceAccessProfile,
    AwardWatchlist,
    AwardResult,
    MainContractorRecord,
    AwardNotification,
    SubcontractPackage,
    SubcontractActionPlan,
    VendorRegistrationRecord,
    BDPipelineItem,
)

class MongoRepository:
    """Production MongoDB Repository Abstraction.
    
    Provides async/sync collection operations for:
    - companies
    - tenders / opportunities
    - matches
    - audit_logs
    - document_chunks
    - sources (Saudi Source Registry)
    - source_runs (Ingestion runs & health probes)
    - raw_records (Raw source records & evidence)
    - canonical_opportunities (Normalized opportunities)
    - monitoring_runs (Daily monitoring execution runs)
    - daily_snapshots (Immutable daily opportunity snapshots)
    - saved_lists (Contractor saved opportunity lists)
    
    Includes a fallback in-memory cache for standalone test environments.
    """

    def __init__(self, uri: str = settings.MONGODB_URI, database_name: str = settings.MONGODB_DATABASE):
        self.uri = uri
        self.database_name = database_name
        self._connected = False
        self._companies_collection: Dict[str, Dict[str, Any]] = {}
        self._tenders_collection: Dict[str, Dict[str, Any]] = {}
        self._audit_collection: List[Dict[str, Any]] = []
        self._chunks_collection: Dict[str, Dict[str, Any]] = {}
        self._sources_collection: Dict[str, Dict[str, Any]] = {}
        self._source_runs_collection: List[Dict[str, Any]] = []
        self._raw_records_collection: Dict[str, Dict[str, Any]] = {}
        self._opportunities_collection: Dict[str, Dict[str, Any]] = {}
        self._monitoring_runs_collection: Dict[str, Dict[str, Any]] = {}
        self._daily_snapshots_collection: Dict[str, Dict[str, Any]] = {}
        self._saved_lists_collection: Dict[str, Dict[str, Any]] = {}
        self._source_profiles_collection: Dict[str, Dict[str, Any]] = {}
        self._award_watches_collection: Dict[str, Dict[str, Any]] = {}
        self._award_results_collection: Dict[str, Dict[str, Any]] = {}
        self._main_contractors_collection: Dict[str, Dict[str, Any]] = {}
        self._notifications_collection: List[Dict[str, Any]] = []
        self._subcontract_packages_collection: Dict[str, Dict[str, Any]] = {}
        self._action_plans_collection: Dict[str, Dict[str, Any]] = {}
        self._vendor_registrations_collection: Dict[str, Dict[str, Any]] = {}
        self._bd_pipeline_collection: Dict[str, Dict[str, Any]] = {}

    def connect(self) -> bool:
        """Establish connection to MongoDB if motor/pymongo is available, or initialize memory store."""
        try:
            # When pymongo/motor is available in production container
            from pymongo import MongoClient
            self._client = MongoClient(self.uri, serverSelectionTimeoutMS=1000)
            self._db = self._client[self.database_name]
            self._client.admin.command('ping')
            self._connected = True
            return True
        except Exception:
            # Graceful test/offline fallback
            self._connected = False
            return False

    def is_connected(self) -> bool:
        return self._connected

    # Companies Collection
    def save_company(self, company: CompanyProfile) -> Dict[str, Any]:
        doc = company.to_dict()
        if self._connected:
            self._db.companies.replace_one({"id": company.id}, doc, upsert=True)
        self._companies_collection[company.id] = doc
        return doc

    def get_company(self, company_id: str) -> Optional[CompanyProfile]:
        if self._connected:
            doc = self._db.companies.find_one({"id": company_id})
            if doc:
                return CompanyProfile.from_dict(doc)
        doc = self._companies_collection.get(company_id)
        return CompanyProfile.from_dict(doc) if doc else None

    def list_companies(self) -> List[CompanyProfile]:
        if self._connected:
            cursor = self._db.companies.find({})
            return [CompanyProfile.from_dict(d) for d in cursor]
        return [CompanyProfile.from_dict(d) for d in self._companies_collection.values()]

    # Tenders Collection
    def save_tender(self, tender: Tender) -> Dict[str, Any]:
        doc = tender.to_dict()
        if self._connected:
            self._db.tenders.replace_one({"id": tender.id}, doc, upsert=True)
        self._tenders_collection[tender.id] = doc
        return doc

    def get_tender(self, tender_id: str) -> Optional[Tender]:
        if self._connected:
            doc = self._db.tenders.find_one({"id": tender_id})
            if doc:
                return Tender.from_dict(doc)
        doc = self._tenders_collection.get(tender_id)
        return Tender.from_dict(doc) if doc else None

    def list_tenders(self, status: Optional[str] = None, work_category: Optional[str] = None) -> List[Tender]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            query = {}
            if status:
                query["status"] = status
            if work_category:
                query["work_category"] = work_category
            items = list(self._db.tenders.find(query))
        else:
            items = list(self._tenders_collection.values())
            if status:
                items = [t for t in items if t.get("status") == status]
            if work_category:
                items = [t for t in items if t.get("work_category") == work_category]

        return [Tender.from_dict(i) for i in items]

    # Audit Logs Collection
    def log_audit_event(self, log: AuditLog) -> Dict[str, Any]:
        doc = log.to_dict()
        if self._connected:
            self._db.audit_logs.insert_one(doc)
        self._audit_collection.append(doc)
        return doc

    def list_audit_events(self, tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self._connected:
            query = {"tenant_id": tenant_id} if tenant_id else {}
            return list(self._db.audit_logs.find(query))
        if tenant_id:
            return [l for l in self._audit_collection if l.get("tenant_id") == tenant_id]
        return list(self._audit_collection)

    # Saudi Source Registry Collection
    def save_source(self, source: SaudiSource) -> Dict[str, Any]:
        doc = source.to_dict()
        if self._connected:
            self._db.sources.replace_one({"id": source.id}, doc, upsert=True)
        self._sources_collection[source.id] = doc
        return doc

    def get_source(self, source_id: str) -> Optional[SaudiSource]:
        if self._connected:
            doc = self._db.sources.find_one({"id": source_id})
            if doc:
                return SaudiSource.from_dict(doc)
        doc = self._sources_collection.get(source_id)
        return SaudiSource.from_dict(doc) if doc else None

    def list_sources(self, authority_type: Optional[str] = None, is_active: Optional[bool] = None) -> List[SaudiSource]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            query: Dict[str, Any] = {}
            if authority_type:
                query["authority_type"] = authority_type
            if is_active is not None:
                query["is_active"] = is_active
            items = list(self._db.sources.find(query))
        else:
            items = list(self._sources_collection.values())
            if authority_type:
                items = [s for s in items if s.get("authority_type") == authority_type]
            if is_active is not None:
                items = [s for s in items if s.get("is_active") == is_active]

        return [SaudiSource.from_dict(i) for i in items]

    # Source Ingestion Runs Collection
    def save_source_run(self, run: SourceRun) -> Dict[str, Any]:
        doc = run.to_dict()
        if self._connected:
            self._db.source_runs.insert_one(doc)
        self._source_runs_collection.append(doc)
        return doc

    def list_source_runs(self, source_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self._connected:
            query = {"source_id": source_id} if source_id else {}
            return list(self._db.source_runs.find(query).sort("started_at", -1))
        if source_id:
            runs = [r for r in self._source_runs_collection if r.get("source_id") == source_id]
        else:
            runs = list(self._source_runs_collection)
        return sorted(runs, key=lambda x: x.get("started_at", ""), reverse=True)

    # Raw Source Records Collection (Rule B4)
    def save_raw_record(self, raw_record: RawSourceRecord) -> Dict[str, Any]:
        doc = raw_record.to_dict()
        if self._connected:
            self._db.raw_records.replace_one({"id": raw_record.id}, doc, upsert=True)
        self._raw_records_collection[raw_record.id] = doc
        return doc

    def get_raw_record(self, raw_id: str) -> Optional[RawSourceRecord]:
        if self._connected:
            doc = self._db.raw_records.find_one({"id": raw_id})
            if doc:
                return RawSourceRecord.from_dict(doc)
        doc = self._raw_records_collection.get(raw_id)
        return RawSourceRecord.from_dict(doc) if doc else None

    # Canonical Opportunities Collection (Rule B1, B3, B4, B7)
    def save_opportunity(self, opp: CanonicalOpportunity) -> Dict[str, Any]:
        doc = opp.to_dict()
        if self._connected:
            self._db.opportunities.replace_one({"id": opp.id}, doc, upsert=True)
        self._opportunities_collection[opp.id] = doc
        return doc

    def get_opportunity(self, opp_id: str) -> Optional[CanonicalOpportunity]:
        if self._connected:
            doc = self._db.opportunities.find_one({"id": opp_id})
            if doc:
                return CanonicalOpportunity.from_dict(doc)
        doc = self._opportunities_collection.get(opp_id)
        return CanonicalOpportunity.from_dict(doc) if doc else None

    def list_opportunities(
        self,
        opportunity_type: Optional[str] = None,
        confidence_level: Optional[str] = None,
        source_id: Optional[str] = None,
        work_category: Optional[str] = None,
    ) -> List[CanonicalOpportunity]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            query: Dict[str, Any] = {}
            if opportunity_type:
                query["opportunity_type"] = opportunity_type
            if confidence_level:
                query["confidence_level"] = confidence_level
            if source_id:
                query["primary_source_id"] = source_id
            if work_category:
                query["work_category"] = work_category
            items = list(self._db.opportunities.find(query))
        else:
            items = list(self._opportunities_collection.values())
            if opportunity_type:
                items = [o for o in items if o.get("opportunity_type") == opportunity_type]
            if confidence_level:
                items = [o for o in items if o.get("confidence_level") == confidence_level]
            if source_id:
                items = [o for o in items if o.get("primary_source_id") == source_id]
            if work_category:
                items = [o for o in items if o.get("work_category") == work_category]

        return [CanonicalOpportunity.from_dict(i) for i in items]

    # Monitoring Runs Collection
    def save_monitoring_run(self, run: MonitoringRun) -> Dict[str, Any]:
        doc = run.to_dict()
        if self._connected:
            self._db.monitoring_runs.replace_one({"id": run.id}, doc, upsert=True)
        self._monitoring_runs_collection[run.id] = doc
        return doc

    def list_monitoring_runs(self, limit: int = 50) -> List[MonitoringRun]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            items = list(self._db.monitoring_runs.find({}).sort("timestamp", -1).limit(limit))
        else:
            items = sorted(
                list(self._monitoring_runs_collection.values()),
                key=lambda x: x.get("timestamp", ""),
                reverse=True,
            )[:limit]
        return [MonitoringRun.from_dict(i) for i in items]

    # Daily Snapshots Collection (Immutable history)
    def save_daily_snapshot(self, snapshot: DailySnapshot) -> Dict[str, Any]:
        doc = snapshot.to_dict()
        if self._connected:
            self._db.daily_snapshots.replace_one({"id": snapshot.id}, doc, upsert=True)
        self._daily_snapshots_collection[snapshot.id] = doc
        # Also index by date
        self._daily_snapshots_collection[snapshot.snapshot_date] = doc
        return doc

    def get_daily_snapshot(self, identifier: str) -> Optional[DailySnapshot]:
        if self._connected:
            doc = self._db.daily_snapshots.find_one({"$or": [{"id": identifier}, {"snapshot_date": identifier}]})
            if doc:
                return DailySnapshot.from_dict(doc)
        doc = self._daily_snapshots_collection.get(identifier)
        return DailySnapshot.from_dict(doc) if doc else None

    def list_daily_snapshots(self, limit: int = 30) -> List[DailySnapshot]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            items = list(self._db.daily_snapshots.find({}).sort("snapshot_date", -1).limit(limit))
        else:
            # Deduplicate by snapshot id
            seen = set()
            unique_items = []
            for d in self._daily_snapshots_collection.values():
                sid = d.get("id")
                if sid not in seen:
                    seen.add(sid)
                    unique_items.append(d)
            items = sorted(unique_items, key=lambda x: x.get("snapshot_date", ""), reverse=True)[:limit]
        return [DailySnapshot.from_dict(i) for i in items]

    # Saved Lists Collection
    def save_saved_list(self, saved_list: SavedList) -> Dict[str, Any]:
        doc = saved_list.to_dict()
        if self._connected:
            self._db.saved_lists.replace_one({"id": saved_list.id}, doc, upsert=True)
        self._saved_lists_collection[saved_list.id] = doc
        return doc

    def get_saved_list(self, list_id: str) -> Optional[SavedList]:
        if self._connected:
            doc = self._db.saved_lists.find_one({"id": list_id})
            if doc:
                return SavedList.from_dict(doc)
        doc = self._saved_lists_collection.get(list_id)
        return SavedList.from_dict(doc) if doc else None

    def list_saved_lists(self, company_id: Optional[str] = None) -> List[SavedList]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            query = {"company_id": company_id} if company_id else {}
            items = list(self._db.saved_lists.find(query).sort("created_at", -1))
        else:
            items = list(self._saved_lists_collection.values())
            if company_id:
                items = [i for i in items if i.get("company_id") == company_id]
            items = sorted(items, key=lambda x: x.get("created_at", ""), reverse=True)
        return [SavedList.from_dict(i) for i in items]

    def delete_saved_list(self, list_id: str) -> bool:
        if self._connected:
            res = self._db.saved_lists.delete_one({"id": list_id})
            deleted = res.deleted_count > 0
        else:
            deleted = list_id in self._saved_lists_collection
            if deleted:
                del self._saved_lists_collection[list_id]
        return deleted

    # Source Access Profiles (Part 0G)
    def save_source_access_profile(self, profile: SourceAccessProfile) -> Dict[str, Any]:
        doc = profile.to_dict()
        if self._connected:
            self._db.source_access_profiles.replace_one({"source_id": profile.source_id}, doc, upsert=True)
        self._source_profiles_collection[profile.source_id] = doc
        return doc

    def get_source_access_profile(self, source_id: str) -> Optional[SourceAccessProfile]:
        if self._connected:
            doc = self._db.source_access_profiles.find_one({"source_id": source_id})
            if doc:
                return SourceAccessProfile.from_dict(doc)
        doc = self._source_profiles_collection.get(source_id)
        return SourceAccessProfile.from_dict(doc) if doc else None

    def list_source_access_profiles(self) -> List[SourceAccessProfile]:
        if self._connected:
            cursor = self._db.source_access_profiles.find({})
            return [SourceAccessProfile.from_dict(d) for d in cursor]
        return [SourceAccessProfile.from_dict(d) for d in self._source_profiles_collection.values()]

    # Award Watchlist (Part A)
    def save_award_watch(self, watch: AwardWatchlist) -> Dict[str, Any]:
        doc = watch.to_dict()
        if self._connected:
            self._db.award_watchlists.replace_one({"id": watch.id}, doc, upsert=True)
        self._award_watches_collection[watch.id] = doc
        return doc

    def get_award_watch(self, watch_id: str) -> Optional[AwardWatchlist]:
        if self._connected:
            doc = self._db.award_watchlists.find_one({"id": watch_id})
            if doc:
                return AwardWatchlist.from_dict(doc)
        doc = self._award_watches_collection.get(watch_id)
        return AwardWatchlist.from_dict(doc) if doc else None

    def list_award_watches(self, company_id: Optional[str] = None, opportunity_id: Optional[str] = None, saved_list_id: Optional[str] = None) -> List[AwardWatchlist]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            query: Dict[str, Any] = {}
            if company_id:
                query["company_id"] = company_id
            if opportunity_id:
                query["opportunity_id"] = opportunity_id
            if saved_list_id:
                query["saved_list_id"] = saved_list_id
            items = list(self._db.award_watchlists.find(query).sort("watch_start_date", -1))
        else:
            items = list(self._award_watches_collection.values())
            if company_id:
                items = [i for i in items if i.get("company_id") == company_id]
            if opportunity_id:
                items = [i for i in items if i.get("opportunity_id") == opportunity_id]
            if saved_list_id:
                items = [i for i in items if i.get("saved_list_id") == saved_list_id]
            items = sorted(items, key=lambda x: x.get("watch_start_date", ""), reverse=True)
        return [AwardWatchlist.from_dict(i) for i in items]

    def delete_award_watch(self, watch_id: str) -> bool:
        if self._connected:
            res = self._db.award_watchlists.delete_one({"id": watch_id})
            deleted = res.deleted_count > 0
        else:
            deleted = watch_id in self._award_watches_collection
            if deleted:
                del self._award_watches_collection[watch_id]
        return deleted

    # Award Results (Part D & E)
    def save_award_result(self, result: AwardResult) -> Dict[str, Any]:
        doc = result.to_dict()
        if self._connected:
            self._db.award_results.replace_one({"id": result.id}, doc, upsert=True)
        self._award_results_collection[result.id] = doc
        return doc

    def get_award_result(self, result_id: str) -> Optional[AwardResult]:
        if self._connected:
            doc = self._db.award_results.find_one({"id": result_id})
            if doc:
                return AwardResult.from_dict(doc)
        doc = self._award_results_collection.get(result_id)
        return AwardResult.from_dict(doc) if doc else None

    def get_award_result_by_opportunity(self, opportunity_id: str) -> Optional[AwardResult]:
        if self._connected:
            doc = self._db.award_results.find_one({"opportunity_id": opportunity_id})
            if doc:
                return AwardResult.from_dict(doc)
        for doc in self._award_results_collection.values():
            if doc.get("opportunity_id") == opportunity_id:
                return AwardResult.from_dict(doc)
        return None

    def list_award_results(self, status: Optional[str] = None) -> List[AwardResult]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            query = {"status": status} if status else {}
            items = list(self._db.award_results.find(query).sort("checked_date", -1))
        else:
            items = list(self._award_results_collection.values())
            if status:
                items = [i for i in items if i.get("status") == status]
            items = sorted(items, key=lambda x: x.get("checked_date", ""), reverse=True)
        return [AwardResult.from_dict(i) for i in items]

    # Main Contractors (Part H)
    def save_main_contractor(self, contractor: MainContractorRecord) -> Dict[str, Any]:
        doc = contractor.to_dict()
        if self._connected:
            self._db.main_contractors.replace_one({"id": contractor.id}, doc, upsert=True)
        self._main_contractors_collection[contractor.id] = doc
        return doc

    def get_main_contractor(self, contractor_id: str) -> Optional[MainContractorRecord]:
        if self._connected:
            doc = self._db.main_contractors.find_one({"id": contractor_id})
            if doc:
                return MainContractorRecord.from_dict(doc)
        doc = self._main_contractors_collection.get(contractor_id)
        return MainContractorRecord.from_dict(doc) if doc else None

    def list_main_contractors(self) -> List[MainContractorRecord]:
        if self._connected:
            cursor = self._db.main_contractors.find({}).sort("award_date", -1)
            return [MainContractorRecord.from_dict(d) for d in cursor]
        items = sorted(list(self._main_contractors_collection.values()), key=lambda x: x.get("award_date", "") or "", reverse=True)
        return [MainContractorRecord.from_dict(d) for d in items]

    # Award Notifications (Part I)
    def save_notification(self, notif: AwardNotification) -> Dict[str, Any]:
        doc = notif.to_dict()
        if self._connected:
            self._db.notifications.insert_one(doc)
        self._notifications_collection.append(doc)
        return doc

    def list_notifications(self, tenant_id: str = "comp-sa-001", limit: int = 50) -> List[AwardNotification]:
        items: List[Dict[str, Any]] = []
        if self._connected:
            items = list(self._db.notifications.find({"tenant_id": tenant_id}).sort("timestamp", -1).limit(limit))
        else:
            items = [n for n in self._notifications_collection if n.get("tenant_id") == tenant_id]
            items = sorted(items, key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]
        return [AwardNotification.from_dict(i) for i in items]

    def mark_notification_read(self, notif_id: str) -> bool:
        if self._connected:
            res = self._db.notifications.update_one({"id": notif_id}, {"$set": {"read": True}})
            return res.modified_count > 0
        for n in self._notifications_collection:
            if n.get("id") == notif_id:
                n["read"] = True
                return True
        return False

    # Subcontract Packages (Stage 8 Part 5)
    def save_subcontract_package(self, package: SubcontractPackage) -> Dict[str, Any]:
        doc = package.to_dict()
        if self._connected:
            self._db.subcontract_packages.replace_one({"id": package.id}, doc, upsert=True)
        self._subcontract_packages_collection[package.id] = doc
        return doc

    def get_subcontract_package(self, package_id: str) -> Optional[SubcontractPackage]:
        if self._connected:
            doc = self._db.subcontract_packages.find_one({"id": package_id})
            if doc:
                return SubcontractPackage.from_dict(doc)
        doc = self._subcontract_packages_collection.get(package_id)
        return SubcontractPackage.from_dict(doc) if doc else None

    def list_subcontract_packages(
        self,
        main_contractor_id: Optional[str] = None,
        category: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> List[SubcontractPackage]:
        if self._connected:
            query: Dict[str, Any] = {}
            if main_contractor_id:
                query["main_contractor_id"] = main_contractor_id
            if category:
                query["package_category"] = category
            if project_id:
                query["project_id"] = project_id
            cursor = self._db.subcontract_packages.find(query).sort("created_at", -1)
            return [SubcontractPackage.from_dict(d) for d in cursor]

        items = list(self._subcontract_packages_collection.values())
        if main_contractor_id:
            items = [i for i in items if i.get("main_contractor_id") == main_contractor_id]
        if category:
            items = [i for i in items if i.get("package_category") == category]
        if project_id:
            items = [i for i in items if i.get("project_id") == project_id]
        items = sorted(items, key=lambda x: x.get("created_at", "") or "", reverse=True)
        return [SubcontractPackage.from_dict(d) for d in items]

    # Subcontract Action Plans (Stage 8 Part 7)
    def save_action_plan(self, plan: SubcontractActionPlan) -> Dict[str, Any]:
        doc = plan.to_dict()
        if self._connected:
            self._db.subcontract_action_plans.replace_one({"id": plan.id}, doc, upsert=True)
        self._action_plans_collection[plan.id] = doc
        return doc

    def get_action_plan(self, plan_id: str) -> Optional[SubcontractActionPlan]:
        if self._connected:
            doc = self._db.subcontract_action_plans.find_one({"id": plan_id})
            if doc:
                return SubcontractActionPlan.from_dict(doc)
        doc = self._action_plans_collection.get(plan_id)
        return SubcontractActionPlan.from_dict(doc) if doc else None

    def list_action_plans(self, tenant_id: str = "comp-sa-001") -> List[SubcontractActionPlan]:
        if self._connected:
            cursor = self._db.subcontract_action_plans.find({"tenant_id": tenant_id}).sort("updated_at", -1)
            return [SubcontractActionPlan.from_dict(d) for d in cursor]
        items = [p for p in self._action_plans_collection.values() if p.get("tenant_id") == tenant_id]
        items = sorted(items, key=lambda x: x.get("updated_at", "") or "", reverse=True)
        return [SubcontractActionPlan.from_dict(d) for d in items]

    def update_action_plan_status(self, plan_id: str, status: str, notes: Optional[str] = None) -> Optional[SubcontractActionPlan]:
        plan = self.get_action_plan(plan_id)
        if not plan:
            return None
        plan.status = status
        if notes:
            plan.notes = notes
        plan.updated_at = datetime.utcnow().isoformat()
        self.save_action_plan(plan)
        return plan

    # Vendor Registration Workspace (Stage 9 Parts A & B)
    def save_vendor_registration(self, record: VendorRegistrationRecord) -> Dict[str, Any]:
        doc = record.to_dict()
        if self._connected:
            self._db.vendor_registrations.replace_one({"id": record.id}, doc, upsert=True)
        self._vendor_registrations_collection[record.id] = doc
        return doc

    def get_vendor_registration(self, contractor_id: str, tenant_id: str = "comp-sa-001") -> Optional[VendorRegistrationRecord]:
        key = f"vreg-{contractor_id}-{tenant_id}"
        if self._connected:
            doc = self._db.vendor_registrations.find_one({"$or": [{"id": key}, {"contractor_id": contractor_id, "tenant_id": tenant_id}]})
            if doc:
                return VendorRegistrationRecord.from_dict(doc)
        doc = self._vendor_registrations_collection.get(key)
        if not doc:
            for d in self._vendor_registrations_collection.values():
                if d.get("contractor_id") == contractor_id and d.get("tenant_id") == tenant_id:
                    doc = d
                    break
        return VendorRegistrationRecord.from_dict(doc) if doc else None

    def list_vendor_registrations(self, tenant_id: str = "comp-sa-001") -> List[VendorRegistrationRecord]:
        if self._connected:
            cursor = self._db.vendor_registrations.find({"tenant_id": tenant_id}).sort("updated_at", -1)
            return [VendorRegistrationRecord.from_dict(d) for d in cursor]
        items = [v for v in self._vendor_registrations_collection.values() if v.get("tenant_id") == tenant_id]
        items = sorted(items, key=lambda x: x.get("updated_at", "") or "", reverse=True)
        return [VendorRegistrationRecord.from_dict(d) for d in items]

    # Business Development Pipeline (Stage 9 Parts D & E)
    def save_bd_pipeline_item(self, item: BDPipelineItem) -> Dict[str, Any]:
        doc = item.to_dict()
        if self._connected:
            self._db.bd_pipeline.replace_one({"id": item.id}, doc, upsert=True)
        self._bd_pipeline_collection[item.id] = doc
        return doc

    def get_bd_pipeline_item(self, item_id: str, tenant_id: str = "comp-sa-001") -> Optional[BDPipelineItem]:
        if self._connected:
            doc = self._db.bd_pipeline.find_one({"id": item_id, "tenant_id": tenant_id})
            if doc:
                return BDPipelineItem.from_dict(doc)
        doc = self._bd_pipeline_collection.get(item_id)
        if doc and doc.get("tenant_id") == tenant_id:
            return BDPipelineItem.from_dict(doc)
        return None

    def get_bd_pipeline_item_by_package(self, package_id: str, tenant_id: str = "comp-sa-001") -> Optional[BDPipelineItem]:
        if self._connected:
            doc = self._db.bd_pipeline.find_one({"package_id": package_id, "tenant_id": tenant_id})
            if doc:
                return BDPipelineItem.from_dict(doc)
        for doc in self._bd_pipeline_collection.values():
            if doc.get("package_id") == package_id and doc.get("tenant_id") == tenant_id:
                return BDPipelineItem.from_dict(doc)
        return None

    def list_bd_pipeline_items(
        self,
        tenant_id: str = "comp-sa-001",
        stage: Optional[str] = None,
        priority: Optional[str] = None,
        contractor_id: Optional[str] = None,
    ) -> List[BDPipelineItem]:
        query: Dict[str, Any] = {"tenant_id": tenant_id}
        if stage:
            query["stage"] = stage
        if priority:
            query["priority"] = priority
        if contractor_id:
            query["contractor_id"] = contractor_id

        if self._connected:
            cursor = self._db.bd_pipeline.find(query).sort("priority_score", -1)
            return [BDPipelineItem.from_dict(d) for d in cursor]

        items = [p for p in self._bd_pipeline_collection.values() if p.get("tenant_id") == tenant_id]
        if stage:
            items = [p for p in items if p.get("stage") == stage]
        if priority:
            items = [p for p in items if p.get("priority") == priority]
        if contractor_id:
            items = [p for p in items if p.get("contractor_id") == contractor_id]
        items = sorted(items, key=lambda x: x.get("priority_score", 0.0), reverse=True)
        return [BDPipelineItem.from_dict(d) for d in items]

    # Migration from Development JSON
    def migrate_from_json(self, json_path: str = "./data/companies.json") -> int:
        """Migrate existing Stage 2 JSON company profiles into MongoDB."""
        if not os.path.exists(json_path):
            return 0
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            migrated = 0
            for item in data:
                profile = CompanyProfile.from_dict(item)
                self.save_company(profile)
                migrated += 1
            return migrated
        except Exception as err:
            print(f"Error migrating from JSON: {err}")
            return 0

# Shared singleton
mongo_repo = MongoRepository()
