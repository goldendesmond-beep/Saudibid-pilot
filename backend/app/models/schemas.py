from datetime import datetime
from typing import List, Optional, Dict, Any, Literal

CompanySize = Literal["Small", "Medium", "Large"]
ClassificationGrade = Literal[1, 2, 3, 4, 5, "Unclassified"]

class CompanyProfile:
    def __init__(
        self,
        id: str,
        name: str,
        name_ar: Optional[str] = None,
        cr_number: Optional[str] = None,
        company_size: CompanySize = "Medium",
        saudi_regions: Optional[List[str]] = None,
        saudi_cities: Optional[List[str]] = None,
        main_activities: Optional[List[str]] = None,
        secondary_activities: Optional[List[str]] = None,
        contractor_classification: str = "Roads & Buildings",
        classification_grade: ClassificationGrade = 2,
        experience_years: int = 10,
        manpower_count: int = 100,
        equipment_tags: Optional[List[str]] = None,
        comfortable_project_size: str = "20M - 100M SAR",
        preferred_project_value_sar: float = 30000000.0,
        guarantee_capability_sar: float = 15000000.0,
        certifications: Optional[List[str]] = None,
        direct_tender_interest: bool = True,
        subcontracting_interest: bool = True,
        vendor_registration_interest: bool = True,
        excluded_project_types: Optional[List[str]] = None,
        cpv_codes: Optional[List[str]] = None,
        regions: Optional[List[str]] = None,
        annual_turnover: float = 50000000.0,
        capacity_tags: Optional[List[str]] = None,
        exclusion_flags: Optional[List[str]] = None,
    ):
        self.id = id
        self.name = name
        self.name_ar = name_ar or ""
        self.cr_number = cr_number or ""
        self.company_size = company_size
        self.saudi_regions = saudi_regions or []
        self.saudi_cities = saudi_cities or []
        self.main_activities = main_activities or []
        self.secondary_activities = secondary_activities or []
        self.contractor_classification = contractor_classification
        self.classification_grade = classification_grade
        self.experience_years = experience_years
        self.manpower_count = manpower_count
        self.equipment_tags = equipment_tags or []
        self.comfortable_project_size = comfortable_project_size
        self.preferred_project_value_sar = preferred_project_value_sar
        self.guarantee_capability_sar = guarantee_capability_sar
        self.certifications = certifications or []
        self.direct_tender_interest = direct_tender_interest
        self.subcontracting_interest = subcontracting_interest
        self.vendor_registration_interest = vendor_registration_interest
        self.excluded_project_types = excluded_project_types or []
        self.cpv_codes = cpv_codes or []
        self.regions = regions or []
        self.annual_turnover = annual_turnover
        self.capacity_tags = capacity_tags or []
        self.exclusion_flags = exclusion_flags or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "name_ar": self.name_ar,
            "cr_number": self.cr_number,
            "company_size": self.company_size,
            "saudi_regions": self.saudi_regions,
            "saudi_cities": self.saudi_cities,
            "main_activities": self.main_activities,
            "secondary_activities": self.secondary_activities,
            "contractor_classification": self.contractor_classification,
            "classification_grade": self.classification_grade,
            "experience_years": self.experience_years,
            "manpower_count": self.manpower_count,
            "equipment_tags": self.equipment_tags,
            "comfortable_project_size": self.comfortable_project_size,
            "preferred_project_value_sar": self.preferred_project_value_sar,
            "guarantee_capability_sar": self.guarantee_capability_sar,
            "certifications": self.certifications,
            "direct_tender_interest": self.direct_tender_interest,
            "subcontracting_interest": self.subcontracting_interest,
            "vendor_registration_interest": self.vendor_registration_interest,
            "excluded_project_types": self.excluded_project_types,
            "cpv_codes": self.cpv_codes,
            "regions": self.regions,
            "annual_turnover": self.annual_turnover,
            "capacity_tags": self.capacity_tags,
            "exclusion_flags": self.exclusion_flags,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CompanyProfile":
        return cls(
            id=data.get("id", ""),
            name=data.get("name", "Unknown Contractor"),
            name_ar=data.get("name_ar"),
            cr_number=data.get("cr_number"),
            company_size=data.get("company_size", "Medium"),
            saudi_regions=data.get("saudi_regions", []),
            saudi_cities=data.get("saudi_cities", []),
            main_activities=data.get("main_activities", []),
            secondary_activities=data.get("secondary_activities", []),
            contractor_classification=data.get("contractor_classification", "Roads & Buildings"),
            classification_grade=data.get("classification_grade", 2),
            experience_years=int(data.get("experience_years", 10)),
            manpower_count=int(data.get("manpower_count", 100)),
            equipment_tags=data.get("equipment_tags", []),
            comfortable_project_size=data.get("comfortable_project_size", "20M - 100M SAR"),
            preferred_project_value_sar=float(data.get("preferred_project_value_sar", 30000000.0)),
            guarantee_capability_sar=float(data.get("guarantee_capability_sar", 15000000.0)),
            certifications=data.get("certifications", []),
            direct_tender_interest=data.get("direct_tender_interest", True),
            subcontracting_interest=data.get("subcontracting_interest", True),
            vendor_registration_interest=data.get("vendor_registration_interest", True),
            excluded_project_types=data.get("excluded_project_types", []),
            cpv_codes=data.get("cpv_codes", []),
            regions=data.get("regions", []),
            annual_turnover=float(data.get("annual_turnover", 50000000.0)),
            capacity_tags=data.get("capacity_tags", []),
            exclusion_flags=data.get("exclusion_flags", []),
        )


class Tender:
    def __init__(
        self,
        id: str,
        source: str,
        title: str,
        title_ar: Optional[str] = None,
        work_category: Optional[str] = None,
        city: Optional[str] = None,
        region: Optional[str] = None,
        entity: Optional[str] = None,
        entity_ar: Optional[str] = None,
        reference_number: Optional[str] = None,
        opportunity_type: Optional[str] = None,
        budget_sar: Optional[float] = None,
        budget: Optional[float] = None,
        bid_bond_sar: Optional[float] = None,
        cpv_codes: Optional[List[str]] = None,
        deadline: Optional[str] = None,
        nuts: Optional[List[str]] = None,
        description: str = "",
        description_ar: Optional[str] = None,
        raw_doc_uri: str = "",
        exclusion_flags: Optional[List[str]] = None,
        status: str = "open",
    ):
        self.id = id
        self.source = source
        self.title = title
        self.title_ar = title_ar or ""
        self.work_category = work_category or ""
        self.city = city or ""
        self.region = region or ""
        self.entity = entity or ""
        self.entity_ar = entity_ar or ""
        self.reference_number = reference_number or ""
        self.opportunity_type = opportunity_type or "Government Tender"
        self.budget_sar = budget_sar
        self.budget = budget or budget_sar
        self.bid_bond_sar = bid_bond_sar
        self.cpv_codes = cpv_codes or []
        self.deadline = deadline or datetime.utcnow().isoformat()
        self.nuts = nuts or []
        self.description = description
        self.description_ar = description_ar or ""
        self.raw_doc_uri = raw_doc_uri
        self.exclusion_flags = exclusion_flags or []
        self.status = status

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "source": self.source,
            "title": self.title,
            "title_ar": self.title_ar,
            "work_category": self.work_category,
            "city": self.city,
            "region": self.region,
            "entity": self.entity,
            "entity_ar": self.entity_ar,
            "reference_number": self.reference_number,
            "opportunity_type": self.opportunity_type,
            "budget_sar": self.budget_sar,
            "budget": self.budget,
            "bid_bond_sar": self.bid_bond_sar,
            "cpv_codes": self.cpv_codes,
            "deadline": self.deadline,
            "nuts": self.nuts,
            "description": self.description,
            "description_ar": self.description_ar,
            "raw_doc_uri": self.raw_doc_uri,
            "exclusion_flags": self.exclusion_flags,
            "status": self.status,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Tender":
        return cls(
            id=data.get("id", ""),
            source=data.get("source", "Etimad"),
            title=data.get("title", ""),
            title_ar=data.get("title_ar"),
            work_category=data.get("work_category"),
            city=data.get("city"),
            region=data.get("region"),
            entity=data.get("entity"),
            entity_ar=data.get("entity_ar"),
            reference_number=data.get("reference_number"),
            opportunity_type=data.get("opportunity_type"),
            budget_sar=data.get("budget_sar"),
            budget=data.get("budget"),
            bid_bond_sar=data.get("bid_bond_sar"),
            cpv_codes=data.get("cpv_codes", []),
            deadline=data.get("deadline"),
            nuts=data.get("nuts", []),
            description=data.get("description", ""),
            description_ar=data.get("description_ar"),
            raw_doc_uri=data.get("raw_doc_uri", ""),
            exclusion_flags=data.get("exclusion_flags", []),
            status=data.get("status", "open"),
        )


class AuditLog:
    def __init__(
        self,
        id: str,
        tenant_id: str,
        action: str,
        entity: str,
        entity_id: str,
        actor: str = "system",
        timestamp: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        result: str = "success",
    ):
        self.id = id
        self.tenant_id = tenant_id
        self.action = action
        self.entity = entity
        self.entity_id = entity_id
        self.actor = actor
        self.timestamp = timestamp or datetime.utcnow().isoformat()
        self.metadata = metadata or {}
        self.result = result

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "action": self.action,
            "entity": self.entity,
            "entity_id": self.entity_id,
            "actor": self.actor,
            "timestamp": self.timestamp,
            "metadata": self.metadata,
            "result": self.result,
        }


class DocumentChunk:
    def __init__(
        self,
        id: str,
        document_id: str,
        tender_id: str,
        chunk_index: int,
        content: str,
        locator: str,
        embedding: Optional[List[float]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.id = id
        self.document_id = document_id
        self.tender_id = tender_id
        self.chunk_index = chunk_index
        self.content = content
        self.locator = locator
        self.embedding = embedding
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "tender_id": self.tender_id,
            "chunk_index": self.chunk_index,
            "content": self.content,
            "locator": self.locator,
            "embedding": self.embedding,
            "metadata": self.metadata,
        }


SourceHealthStatus = Literal["HEALTHY", "DEGRADED", "UNREACHABLE", "MAINTENANCE"]
SourcePriority = Literal["HIGH", "MEDIUM", "STANDARD"]
SourceVerificationStatus = Literal["VERIFIED", "DISCOVERY_REQUIRED", "UNVERIFIED"]

SourceAuthorityType = Literal[
    "GOVERNMENT_PORTAL",
    "MUNICIPAL_INVESTMENT",
    "PPP_PRIVATIZATION",
    "SEMI_GOVERNMENT_SOE",
    "UTILITIES_SOE",
    "SOE_DEVELOPER",
    "GOVERNMENT_AUTHORITY",
    "GIGA_PROJECT",
    "SOVEREIGN_WEALTH_FUND",
    "FINANCIAL_MARKET_DISCLOSURES",
    "TRANSPORT_LOGISTICS",
    "MINING_HEAVY_INDUSTRY",
    "WATER_INFRASTRUCTURE",
    "AIRPORT_OPERATOR",
    "PORT_TERMINAL_OPERATOR",
    "NEWS_DISCLOSURE_PORTAL",
]

class SaudiSource:
    def __init__(
        self,
        id: str,
        name: str,
        name_ar: str,
        authority_type: SourceAuthorityType,
        url: str,
        canonical_domain: Optional[str] = None,
        resolved_endpoint: Optional[str] = None,
        capability_tags: Optional[List[str]] = None,
        priority: SourcePriority = "STANDARD",
        public_access: bool = True,
        verification_status: SourceVerificationStatus = "VERIFIED",
        last_verified_at: Optional[str] = None,
        endpoint_history: Optional[List[Dict[str, Any]]] = None,
        health_status: SourceHealthStatus = "HEALTHY",
        is_active: bool = True,
        requires_auth: bool = False,
        auth_type: str = "PUBLIC",
        verification_level: str = "VERIFIED_OFFICIAL",
        rate_limit_per_minute: int = 60,
        last_health_check: Optional[str] = None,
        last_successful_sync: Optional[str] = None,
        last_error_message: Optional[str] = None,
        failure_count: int = 0,
        consecutive_failures: int = 0,
        supported_opportunity_types: Optional[List[str]] = None,
        coverage_regions: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.id = id
        self.name = name
        self.name_ar = name_ar
        self.authority_type = authority_type
        self.source_type = authority_type  # alias
        self.url = url
        self.canonical_domain = canonical_domain or url
        self.resolved_endpoint = resolved_endpoint or (url if verification_status == "VERIFIED" else None)
        self.capability_tags = capability_tags or ["TENDER_LISTING", "VENDOR_REGISTRATION"]
        self.priority = priority
        self.public_access = public_access
        self.verification_status = verification_status
        self.last_verified_at = last_verified_at or (datetime.utcnow().isoformat() if verification_status == "VERIFIED" else None)
        self.endpoint_history = endpoint_history or []
        self.health_status = health_status
        self.is_active = is_active
        self.requires_auth = requires_auth
        self.auth_required = requires_auth  # alias
        self.auth_type = auth_type
        self.verification_level = verification_level
        self.rate_limit_per_minute = rate_limit_per_minute
        self.last_health_check = last_health_check or datetime.utcnow().isoformat()
        self.last_successful_sync = last_successful_sync
        self.last_error_message = last_error_message
        self.failure_count = failure_count
        self.consecutive_failures = consecutive_failures
        self.supported_opportunity_types = supported_opportunity_types or ["Government Tender", "Direct Purchase"]
        self.coverage_regions = coverage_regions or ["All Regions"]
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "name_ar": self.name_ar,
            "authority_type": self.authority_type,
            "source_type": self.source_type,
            "url": self.url,
            "canonical_domain": self.canonical_domain,
            "resolved_endpoint": self.resolved_endpoint,
            "capability_tags": self.capability_tags,
            "priority": self.priority,
            "public_access": self.public_access,
            "verification_status": self.verification_status,
            "last_verified_at": self.last_verified_at,
            "endpoint_history": self.endpoint_history,
            "health_status": self.health_status,
            "is_active": self.is_active,
            "requires_auth": self.requires_auth,
            "auth_required": self.auth_required,
            "auth_type": self.auth_type,
            "verification_level": self.verification_level,
            "rate_limit_per_minute": self.rate_limit_per_minute,
            "last_health_check": self.last_health_check,
            "last_successful_sync": self.last_successful_sync,
            "last_error_message": self.last_error_message,
            "failure_count": self.failure_count,
            "consecutive_failures": self.consecutive_failures,
            "supported_opportunity_types": self.supported_opportunity_types,
            "coverage_regions": self.coverage_regions,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SaudiSource":
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            name_ar=data.get("name_ar", ""),
            authority_type=data.get("authority_type", data.get("source_type", "GOVERNMENT_PORTAL")),
            url=data.get("url", ""),
            canonical_domain=data.get("canonical_domain"),
            resolved_endpoint=data.get("resolved_endpoint"),
            capability_tags=data.get("capability_tags"),
            priority=data.get("priority", "STANDARD"),
            public_access=data.get("public_access", True),
            verification_status=data.get("verification_status", "VERIFIED"),
            last_verified_at=data.get("last_verified_at"),
            endpoint_history=data.get("endpoint_history", []),
            health_status=data.get("health_status", "HEALTHY"),
            is_active=data.get("is_active", True),
            requires_auth=data.get("requires_auth", data.get("auth_required", False)),
            auth_type=data.get("auth_type", "PUBLIC"),
            verification_level=data.get("verification_level", "VERIFIED_OFFICIAL"),
            rate_limit_per_minute=int(data.get("rate_limit_per_minute", 60)),
            last_health_check=data.get("last_health_check"),
            last_successful_sync=data.get("last_successful_sync"),
            last_error_message=data.get("last_error_message"),
            failure_count=int(data.get("failure_count", 0)),
            consecutive_failures=int(data.get("consecutive_failures", 0)),
            supported_opportunity_types=data.get("supported_opportunity_types", []),
            coverage_regions=data.get("coverage_regions", []),
            metadata=data.get("metadata", {}),
        )


class SourceRun:
    def __init__(
        self,
        id: str,
        source_id: str,
        run_type: str = "SCHEDULED",
        started_at: Optional[str] = None,
        completed_at: Optional[str] = None,
        status: str = "SUCCESS",
        items_found: int = 0,
        items_ingested: int = 0,
        error_message: Optional[str] = None,
        duration_ms: int = 0,
    ):
        self.id = id
        self.source_id = source_id
        self.run_type = run_type
        self.started_at = started_at or datetime.utcnow().isoformat()
        self.completed_at = completed_at or datetime.utcnow().isoformat()
        self.status = status
        self.items_found = items_found
        self.items_ingested = items_ingested
        self.error_message = error_message
        self.duration_ms = duration_ms

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "source_id": self.source_id,
            "run_type": self.run_type,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "status": self.status,
            "items_found": self.items_found,
            "items_ingested": self.items_ingested,
            "error_message": self.error_message,
            "duration_ms": self.duration_ms,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SourceRun":
        return cls(
            id=data.get("id", ""),
            source_id=data.get("source_id", ""),
            run_type=data.get("run_type", "SCHEDULED"),
            started_at=data.get("started_at"),
            completed_at=data.get("completed_at"),
            status=data.get("status", "SUCCESS"),
            items_found=int(data.get("items_found", 0)),
            items_ingested=int(data.get("items_ingested", 0)),
            error_message=data.get("error_message"),
            duration_ms=int(data.get("duration_ms", 0)),
        )


OpportunityType = Literal[
    "GOVERNMENT_TENDER",
    "PRIVATE_TENDER",
    "RFQ",
    "RFP",
    "EOI",
    "PREQUALIFICATION",
    "SUBCONTRACT_REQUEST",
    "VENDOR_REGISTRATION",
    "CONTRACTOR_REGISTRATION",
    "PROJECT_SIGNAL",
    "PPP_OPPORTUNITY",
    "AWARDED_PROJECT_SIGNAL",
]

OpportunityConfidence = Literal[
    "CONFIRMED_OPPORTUNITY",
    "POSSIBLE_OPPORTUNITY",
    "MARKET_SIGNAL_ONLY",
]

class RawSourceRecord:
    def __init__(
        self,
        id: str,
        original_title: str,
        original_text: str,
        original_url: str,
        source_id: str,
        fetch_timestamp: Optional[str] = None,
        raw_fields: Optional[Dict[str, Any]] = None,
        raw_evidence_hash: Optional[str] = None,
    ):
        self.id = id
        self.original_title = original_title
        self.original_text = original_text
        self.original_url = original_url
        self.source_id = source_id
        self.fetch_timestamp = fetch_timestamp or datetime.utcnow().isoformat()
        self.raw_fields = raw_fields or {}
        self.raw_evidence_hash = raw_evidence_hash or ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "original_title": self.original_title,
            "original_text": self.original_text,
            "original_url": self.original_url,
            "source_id": self.source_id,
            "fetch_timestamp": self.fetch_timestamp,
            "raw_fields": self.raw_fields,
            "raw_evidence_hash": self.raw_evidence_hash,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RawSourceRecord":
        return cls(
            id=data.get("id", ""),
            original_title=data.get("original_title", ""),
            original_text=data.get("original_text", ""),
            original_url=data.get("original_url", ""),
            source_id=data.get("source_id", ""),
            fetch_timestamp=data.get("fetch_timestamp"),
            raw_fields=data.get("raw_fields", {}),
            raw_evidence_hash=data.get("raw_evidence_hash", ""),
        )


class CanonicalOpportunity:
    def __init__(
        self,
        id: str,
        title: str,
        title_ar: Optional[str] = None,
        entity: Optional[str] = None,
        reference_number: Optional[str] = None,
        city: Optional[str] = None,
        region: Optional[str] = None,
        work_category: Optional[str] = None,
        description: Optional[str] = None,
        publication_date: Optional[str] = None,
        clarification_deadline: Optional[str] = None,
        closing_date: Optional[str] = None,
        budget_sar: Optional[float] = None,
        bid_bond_sar: Optional[float] = None,
        contractor_classification_req: Optional[str] = None,
        required_experience_years: Optional[int] = None,
        mandatory_certifications: Optional[List[str]] = None,
        required_documents: Optional[List[str]] = None,
        public_contact: Optional[Dict[str, Any]] = None,
        opportunity_type: OpportunityType = "GOVERNMENT_TENDER",
        confidence_level: OpportunityConfidence = "CONFIRMED_OPPORTUNITY",
        verification_status: str = "VERIFIED",
        primary_source_id: str = "src-etimad",
        all_source_ids: Optional[List[str]] = None,
        original_url: str = "",
        discovered_at: Optional[str] = None,
        last_checked_at: Optional[str] = None,
        raw_record_id: Optional[str] = None,
    ):
        self.id = id
        self.title = title
        self.title_ar = title_ar or title
        self.entity = entity or "UNKNOWN"
        self.reference_number = reference_number or "UNKNOWN"
        self.city = city or "UNKNOWN"
        self.region = region or "UNKNOWN"
        self.work_category = work_category or "UNKNOWN"
        self.description = description or "UNKNOWN"
        self.publication_date = publication_date or datetime.utcnow().isoformat()
        self.clarification_deadline = clarification_deadline
        self.closing_date = closing_date
        self.budget_sar = budget_sar
        self.bid_bond_sar = bid_bond_sar
        self.contractor_classification_req = contractor_classification_req or "UNKNOWN"
        self.required_experience_years = required_experience_years
        self.mandatory_certifications = mandatory_certifications or []
        self.required_documents = required_documents or []
        self.public_contact = public_contact or {}
        self.opportunity_type = opportunity_type
        self.confidence_level = confidence_level
        self.verification_status = verification_status
        self.primary_source_id = primary_source_id
        self.all_source_ids = all_source_ids or [primary_source_id]
        self.original_url = original_url
        self.discovered_at = discovered_at or datetime.utcnow().isoformat()
        self.last_checked_at = last_checked_at or datetime.utcnow().isoformat()
        self.raw_record_id = raw_record_id or f"raw-{id}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "title_ar": self.title_ar,
            "entity": self.entity,
            "reference_number": self.reference_number,
            "city": self.city,
            "region": self.region,
            "work_category": self.work_category,
            "description": self.description,
            "publication_date": self.publication_date,
            "clarification_deadline": self.clarification_deadline,
            "closing_date": self.closing_date,
            "budget_sar": self.budget_sar,
            "bid_bond_sar": self.bid_bond_sar,
            "contractor_classification_req": self.contractor_classification_req,
            "required_experience_years": self.required_experience_years,
            "mandatory_certifications": self.mandatory_certifications,
            "required_documents": self.required_documents,
            "public_contact": self.public_contact,
            "opportunity_type": self.opportunity_type,
            "confidence_level": self.confidence_level,
            "verification_status": self.verification_status,
            "primary_source_id": self.primary_source_id,
            "all_source_ids": self.all_source_ids,
            "original_url": self.original_url,
            "discovered_at": self.discovered_at,
            "last_checked_at": self.last_checked_at,
            "raw_record_id": self.raw_record_id,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CanonicalOpportunity":
        return cls(
            id=data.get("id", ""),
            title=data.get("title", ""),
            title_ar=data.get("title_ar"),
            entity=data.get("entity"),
            reference_number=data.get("reference_number"),
            city=data.get("city"),
            region=data.get("region"),
            work_category=data.get("work_category"),
            description=data.get("description"),
            publication_date=data.get("publication_date"),
            clarification_deadline=data.get("clarification_deadline"),
            closing_date=data.get("closing_date"),
            budget_sar=data.get("budget_sar"),
            bid_bond_sar=data.get("bid_bond_sar"),
            contractor_classification_req=data.get("contractor_classification_req"),
            required_experience_years=data.get("required_experience_years"),
            mandatory_certifications=data.get("mandatory_certifications"),
            required_documents=data.get("required_documents"),
            public_contact=data.get("public_contact"),
            opportunity_type=data.get("opportunity_type", "GOVERNMENT_TENDER"),
            confidence_level=data.get("confidence_level", "CONFIRMED_OPPORTUNITY"),
            verification_status=data.get("verification_status", "VERIFIED"),
            primary_source_id=data.get("primary_source_id", "src-etimad"),
            all_source_ids=data.get("all_source_ids"),
            original_url=data.get("original_url", ""),
            discovered_at=data.get("discovered_at"),
            last_checked_at=data.get("last_checked_at"),
            raw_record_id=data.get("raw_record_id"),
        )


class MonitoringRun:
    def __init__(
        self,
        id: str,
        timestamp: Optional[str] = None,
        sources_attempted: int = 0,
        sources_successful: int = 0,
        sources_blocked: int = 0,
        sources_auth_required: int = 0,
        source_failures: int = 0,
        raw_records_found: int = 0,
        canonical_opportunities_created: int = 0,
        duplicates_merged: int = 0,
        confirmed_opportunities: int = 0,
        possible_opportunities: int = 0,
        market_signals: int = 0,
        high_match_opportunities: int = 0,
        source_details: Optional[List[Dict[str, Any]]] = None,
        is_fixture_run: bool = False,
    ):
        self.id = id
        self.timestamp = timestamp or datetime.utcnow().isoformat()
        self.sources_attempted = sources_attempted
        self.sources_successful = sources_successful
        self.sources_blocked = sources_blocked
        self.sources_auth_required = sources_auth_required
        self.source_failures = source_failures
        self.raw_records_found = raw_records_found
        self.canonical_opportunities_created = canonical_opportunities_created
        self.duplicates_merged = duplicates_merged
        self.confirmed_opportunities = confirmed_opportunities
        self.possible_opportunities = possible_opportunities
        self.market_signals = market_signals
        self.high_match_opportunities = high_match_opportunities
        self.source_details = source_details or []
        self.is_fixture_run = is_fixture_run

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "sources_attempted": self.sources_attempted,
            "sources_successful": self.sources_successful,
            "sources_blocked": self.sources_blocked,
            "sources_auth_required": self.sources_auth_required,
            "source_failures": self.source_failures,
            "raw_records_found": self.raw_records_found,
            "canonical_opportunities_created": self.canonical_opportunities_created,
            "duplicates_merged": self.duplicates_merged,
            "confirmed_opportunities": self.confirmed_opportunities,
            "possible_opportunities": self.possible_opportunities,
            "market_signals": self.market_signals,
            "high_match_opportunities": self.high_match_opportunities,
            "source_details": self.source_details,
            "is_fixture_run": self.is_fixture_run,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MonitoringRun":
        return cls(
            id=data.get("id", ""),
            timestamp=data.get("timestamp"),
            sources_attempted=int(data.get("sources_attempted", 0)),
            sources_successful=int(data.get("sources_successful", 0)),
            sources_blocked=int(data.get("sources_blocked", 0)),
            sources_auth_required=int(data.get("sources_auth_required", 0)),
            source_failures=int(data.get("source_failures", 0)),
            raw_records_found=int(data.get("raw_records_found", 0)),
            canonical_opportunities_created=int(data.get("canonical_opportunities_created", 0)),
            duplicates_merged=int(data.get("duplicates_merged", 0)),
            confirmed_opportunities=int(data.get("confirmed_opportunities", 0)),
            possible_opportunities=int(data.get("possible_opportunities", 0)),
            market_signals=int(data.get("market_signals", 0)),
            high_match_opportunities=int(data.get("high_match_opportunities", 0)),
            source_details=data.get("source_details", []),
            is_fixture_run=bool(data.get("is_fixture_run", False)),
        )


class DailySnapshot:
    def __init__(
        self,
        id: str,
        snapshot_date: str,
        created_at: Optional[str] = None,
        records_discovered: int = 0,
        canonical_opportunities_count: int = 0,
        strong_match_count: int = 0,
        good_match_count: int = 0,
        review_required_count: int = 0,
        closing_within_7_days_count: int = 0,
        government_count: int = 0,
        private_count: int = 0,
        eastern_region_count: int = 0,
        jubail_count: int = 0,
        subcontract_targets_count: int = 0,
        opportunities_snapshot: Optional[List[Dict[str, Any]]] = None,
        sources_summary: Optional[Dict[str, Any]] = None,
    ):
        self.id = id
        self.snapshot_date = snapshot_date
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.records_discovered = records_discovered
        self.canonical_opportunities_count = canonical_opportunities_count
        self.strong_match_count = strong_match_count
        self.good_match_count = good_match_count
        self.review_required_count = review_required_count
        self.closing_within_7_days_count = closing_within_7_days_count
        self.government_count = government_count
        self.private_count = private_count
        self.eastern_region_count = eastern_region_count
        self.jubail_count = jubail_count
        self.subcontract_targets_count = subcontract_targets_count
        self.opportunities_snapshot = opportunities_snapshot or []
        self.sources_summary = sources_summary or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "snapshot_date": self.snapshot_date,
            "created_at": self.created_at,
            "records_discovered": self.records_discovered,
            "canonical_opportunities_count": self.canonical_opportunities_count,
            "strong_match_count": self.strong_match_count,
            "good_match_count": self.good_match_count,
            "review_required_count": self.review_required_count,
            "closing_within_7_days_count": self.closing_within_7_days_count,
            "government_count": self.government_count,
            "private_count": self.private_count,
            "eastern_region_count": self.eastern_region_count,
            "jubail_count": self.jubail_count,
            "subcontract_targets_count": self.subcontract_targets_count,
            "opportunities_snapshot": self.opportunities_snapshot,
            "sources_summary": self.sources_summary,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DailySnapshot":
        return cls(
            id=data.get("id", ""),
            snapshot_date=data.get("snapshot_date", ""),
            created_at=data.get("created_at"),
            records_discovered=int(data.get("records_discovered", 0)),
            canonical_opportunities_count=int(data.get("canonical_opportunities_count", 0)),
            strong_match_count=int(data.get("strong_match_count", 0)),
            good_match_count=int(data.get("good_match_count", 0)),
            review_required_count=int(data.get("review_required_count", 0)),
            closing_within_7_days_count=int(data.get("closing_within_7_days_count", 0)),
            government_count=int(data.get("government_count", 0)),
            private_count=int(data.get("private_count", 0)),
            eastern_region_count=int(data.get("eastern_region_count", 0)),
            jubail_count=int(data.get("jubail_count", 0)),
            subcontract_targets_count=int(data.get("subcontract_targets_count", 0)),
            opportunities_snapshot=data.get("opportunities_snapshot", []),
            sources_summary=data.get("sources_summary", {}),
        )


class SavedList:
    def __init__(
        self,
        id: str,
        company_id: str,
        name: str,
        notes: str = "",
        opportunity_ids: Optional[List[str]] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
        original_snapshot_id: Optional[str] = None,
    ):
        self.id = id
        self.company_id = company_id
        self.name = name
        self.notes = notes
        self.opportunity_ids = opportunity_ids or []
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()
        self.original_snapshot_id = original_snapshot_id

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "company_id": self.company_id,
            "name": self.name,
            "notes": self.notes,
            "opportunity_ids": self.opportunity_ids,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "original_snapshot_id": self.original_snapshot_id,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SavedList":
        return cls(
            id=data.get("id", ""),
            company_id=data.get("company_id", ""),
            name=data.get("name", ""),
            notes=data.get("notes", ""),
            opportunity_ids=data.get("opportunity_ids", []),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            original_snapshot_id=data.get("original_snapshot_id"),
        )


SourceAccessMode = Literal[
    "DIRECT_LIVE",
    "API_LIVE",
    "FEED_LIVE",
    "OFFICIAL_FILE_LIVE",
    "AUTHENTICATED_LIVE",
    "ASSISTED_IMPORT",
    "SIGNAL_ONLY",
    "RUNTIME_ENVIRONMENT_BLOCKED",
    "BLOCKED",
    "DISCOVERY_REQUIRED",
]

AwardStatus = Literal[
    "AWARD_PENDING",
    "AWARDED_VERIFIED",
    "AWARDED_SINGLE_OFFICIAL_SOURCE",
    "CANCELLED",
    "RE_TENDERED",
    "RESULT_NOT_PUBLIC",
    "NO_RESULT_FOUND_YET",
    "CONFLICTING_SOURCES",
]

class SourceAccessProfile:
    def __init__(
        self,
        source_id: str,
        access_mode: SourceAccessMode,
        canonical_domain: str,
        resolved_endpoint: Optional[str] = None,
        last_attempt: Optional[str] = None,
        last_success: Optional[str] = None,
        failure_reason: Optional[str] = None,
        auth_requirement: bool = False,
        runtime_limitation: str = "",
        manual_import_supported: bool = True,
        award_data_supported: bool = True,
        opportunity_data_supported: bool = True,
    ):
        self.source_id = source_id
        self.access_mode = access_mode
        self.canonical_domain = canonical_domain
        self.resolved_endpoint = resolved_endpoint
        self.last_attempt = last_attempt
        self.last_success = last_success
        self.failure_reason = failure_reason
        self.auth_requirement = auth_requirement
        self.runtime_limitation = runtime_limitation
        self.manual_import_supported = manual_import_supported
        self.award_data_supported = award_data_supported
        self.opportunity_data_supported = opportunity_data_supported

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "access_mode": self.access_mode,
            "canonical_domain": self.canonical_domain,
            "resolved_endpoint": self.resolved_endpoint,
            "last_attempt": self.last_attempt,
            "last_success": self.last_success,
            "failure_reason": self.failure_reason,
            "auth_requirement": self.auth_requirement,
            "runtime_limitation": self.runtime_limitation,
            "manual_import_supported": self.manual_import_supported,
            "award_data_supported": self.award_data_supported,
            "opportunity_data_supported": self.opportunity_data_supported,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SourceAccessProfile":
        return cls(
            source_id=data.get("source_id", ""),
            access_mode=data.get("access_mode", "DISCOVERY_REQUIRED"),
            canonical_domain=data.get("canonical_domain", ""),
            resolved_endpoint=data.get("resolved_endpoint"),
            last_attempt=data.get("last_attempt"),
            last_success=data.get("last_success"),
            failure_reason=data.get("failure_reason"),
            auth_requirement=bool(data.get("auth_requirement", False)),
            runtime_limitation=data.get("runtime_limitation", ""),
            manual_import_supported=bool(data.get("manual_import_supported", True)),
            award_data_supported=bool(data.get("award_data_supported", True)),
            opportunity_data_supported=bool(data.get("opportunity_data_supported", True)),
        )


class AwardWatchlist:
    def __init__(
        self,
        id: str,
        opportunity_id: str,
        company_id: str = "comp-sa-001",
        saved_list_id: Optional[str] = None,
        watch_start_date: Optional[str] = None,
        closing_date: Optional[str] = None,
        source_ids: Optional[List[str]] = None,
        last_checked_at: Optional[str] = None,
        next_check_at: Optional[str] = None,
        checks_count: int = 0,
        current_award_status: AwardStatus = "AWARD_PENDING",
        result_confidence: float = 0.0,
        evidence_references: Optional[List[Dict[str, Any]]] = None,
        is_active: bool = True,
    ):
        self.id = id
        self.opportunity_id = opportunity_id
        self.company_id = company_id
        self.saved_list_id = saved_list_id
        self.watch_start_date = watch_start_date or datetime.utcnow().isoformat()
        self.closing_date = closing_date
        self.source_ids = source_ids or []
        self.last_checked_at = last_checked_at
        self.next_check_at = next_check_at
        self.checks_count = checks_count
        self.current_award_status = current_award_status
        self.result_confidence = result_confidence
        self.evidence_references = evidence_references or []
        self.is_active = is_active

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "watch_id": self.id,
            "opportunity_id": self.opportunity_id,
            "company_id": self.company_id,
            "saved_list_id": self.saved_list_id,
            "watch_start_date": self.watch_start_date,
            "closing_date": self.closing_date,
            "source_ids": self.source_ids,
            "last_checked_at": self.last_checked_at,
            "next_check_at": self.next_check_at,
            "checks_count": self.checks_count,
            "current_award_status": self.current_award_status,
            "result_confidence": self.result_confidence,
            "evidence_references": self.evidence_references,
            "is_active": self.is_active,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AwardWatchlist":
        return cls(
            id=data.get("id") or data.get("watch_id", ""),
            opportunity_id=data.get("opportunity_id", ""),
            company_id=data.get("company_id", "comp-sa-001"),
            saved_list_id=data.get("saved_list_id"),
            watch_start_date=data.get("watch_start_date"),
            closing_date=data.get("closing_date"),
            source_ids=data.get("source_ids", []),
            last_checked_at=data.get("last_checked_at"),
            next_check_at=data.get("next_check_at"),
            checks_count=int(data.get("checks_count", 0)),
            current_award_status=data.get("current_award_status", "AWARD_PENDING"),
            result_confidence=float(data.get("result_confidence", 0.0)),
            evidence_references=data.get("evidence_references", []),
            is_active=bool(data.get("is_active", True)),
        )


class AwardResult:
    def __init__(
        self,
        id: str,
        opportunity_id: str,
        official_tender_number: str = "UNKNOWN",
        project_title: str = "",
        owner_entity: str = "",
        winner_legal_name: str = "UNKNOWN",
        winner_normalized_name: str = "UNKNOWN",
        award_date: Optional[str] = None,
        contract_value_sar: Optional[float] = None,
        contract_duration: Optional[str] = None,
        source_url: str = "",
        source_type: str = "ORIGINAL_TENDER_PORTAL",
        checked_date: Optional[str] = None,
        evidence_text: str = "",
        verification_confidence: float = 1.0,
        secondary_confirmation: Optional[Dict[str, Any]] = None,
        status: AwardStatus = "AWARD_PENDING",
        conflicting_details: Optional[List[Dict[str, Any]]] = None,
    ):
        self.id = id
        self.opportunity_id = opportunity_id
        self.official_tender_number = official_tender_number
        self.project_title = project_title
        self.owner_entity = owner_entity
        self.winner_legal_name = winner_legal_name
        self.winner_normalized_name = winner_normalized_name
        self.award_date = award_date
        self.contract_value_sar = contract_value_sar
        self.contract_duration = contract_duration
        self.source_url = source_url
        self.source_type = source_type
        self.checked_date = checked_date or datetime.utcnow().isoformat()
        self.evidence_text = evidence_text
        self.verification_confidence = verification_confidence
        self.secondary_confirmation = secondary_confirmation or {}
        self.status = status
        self.conflicting_details = conflicting_details or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "opportunity_id": self.opportunity_id,
            "official_tender_number": self.official_tender_number,
            "project_title": self.project_title,
            "owner_entity": self.owner_entity,
            "winner_legal_name": self.winner_legal_name,
            "winner_normalized_name": self.winner_normalized_name,
            "award_date": self.award_date,
            "contract_value_sar": self.contract_value_sar,
            "contract_duration": self.contract_duration,
            "source_url": self.source_url,
            "source_type": self.source_type,
            "checked_date": self.checked_date,
            "evidence_text": self.evidence_text,
            "verification_confidence": self.verification_confidence,
            "secondary_confirmation": self.secondary_confirmation,
            "status": self.status,
            "conflicting_details": self.conflicting_details,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AwardResult":
        return cls(
            id=data.get("id", ""),
            opportunity_id=data.get("opportunity_id", ""),
            official_tender_number=data.get("official_tender_number", "UNKNOWN"),
            project_title=data.get("project_title", ""),
            owner_entity=data.get("owner_entity", ""),
            winner_legal_name=data.get("winner_legal_name", "UNKNOWN"),
            winner_normalized_name=data.get("winner_normalized_name", "UNKNOWN"),
            award_date=data.get("award_date"),
            contract_value_sar=data.get("contract_value_sar"),
            contract_duration=data.get("contract_duration"),
            source_url=data.get("source_url", ""),
            source_type=data.get("source_type", "ORIGINAL_TENDER_PORTAL"),
            checked_date=data.get("checked_date"),
            evidence_text=data.get("evidence_text", ""),
            verification_confidence=float(data.get("verification_confidence", 1.0)),
            secondary_confirmation=data.get("secondary_confirmation", {}),
            status=data.get("status", "AWARD_PENDING"),
            conflicting_details=data.get("conflicting_details", []),
        )


class MainContractorRecord:
    def __init__(
        self,
        id: str,
        contractor_name: str,
        contractor_name_ar: Optional[str] = None,
        normalized_name: Optional[str] = None,
        commercial_brand_name: Optional[str] = None,
        verification_status: str = "VERIFIED_MAIN_CONTRACTOR",
        official_website: Optional[str] = None,
        headquarters: Optional[str] = None,
        saudi_presence: bool = True,
        cr_number: Optional[str] = None,
        company_size: Optional[str] = None,
        contractor_classification: Optional[str] = None,
        specialties: Optional[List[str]] = None,
        industries: Optional[List[str]] = None,
        geographic_coverage: Optional[List[str]] = None,
        known_clients: Optional[List[str]] = None,
        active_saudi_projects: Optional[List[Dict[str, Any]]] = None,
        awarded_project_id: str = "",
        awarded_project_title: str = "",
        owner: str = "",
        project_location: str = "",
        contract_value_sar: Optional[float] = None,
        award_date: Optional[str] = None,
        verified_sources: Optional[List[str]] = None,
        portal_links: Optional[List[Dict[str, Any]]] = None,
        contacts: Optional[List[Dict[str, Any]]] = None,
        created_at: Optional[str] = None,
        last_verified_date: Optional[str] = None,
    ):
        self.id = id
        self.contractor_name = contractor_name
        self.contractor_name_ar = contractor_name_ar or contractor_name
        self.normalized_name = normalized_name or contractor_name
        self.commercial_brand_name = commercial_brand_name or contractor_name
        self.verification_status = verification_status
        self.official_website = official_website or ""
        self.headquarters = headquarters or "Saudi Arabia"
        self.saudi_presence = saudi_presence
        self.cr_number = cr_number
        self.company_size = company_size or "Large Enterprise"
        self.contractor_classification = contractor_classification or "Grade 1 Contractor"
        self.specialties = specialties or []
        self.industries = industries or []
        self.geographic_coverage = geographic_coverage or ["Riyadh Region", "Eastern Province", "Makkah Region"]
        self.known_clients = known_clients or []
        self.active_saudi_projects = active_saudi_projects or []
        self.awarded_project_id = awarded_project_id
        self.awarded_project_title = awarded_project_title
        self.owner = owner
        self.project_location = project_location
        self.contract_value_sar = contract_value_sar
        self.award_date = award_date
        self.verified_sources = verified_sources or []
        self.portal_links = portal_links or []
        self.contacts = contacts or []
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.last_verified_date = last_verified_date or (datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "contractor_name": self.contractor_name,
            "contractor_name_ar": self.contractor_name_ar,
            "normalized_name": self.normalized_name,
            "commercial_brand_name": self.commercial_brand_name,
            "verification_status": self.verification_status,
            "official_website": self.official_website,
            "headquarters": self.headquarters,
            "saudi_presence": self.saudi_presence,
            "cr_number": self.cr_number,
            "company_size": self.company_size,
            "contractor_classification": self.contractor_classification,
            "specialties": self.specialties,
            "industries": self.industries,
            "geographic_coverage": self.geographic_coverage,
            "known_clients": self.known_clients,
            "active_saudi_projects": self.active_saudi_projects,
            "awarded_project_id": self.awarded_project_id,
            "awarded_project_title": self.awarded_project_title,
            "owner": self.owner,
            "project_location": self.project_location,
            "contract_value_sar": self.contract_value_sar,
            "award_date": self.award_date,
            "verified_sources": self.verified_sources,
            "portal_links": self.portal_links,
            "contacts": self.contacts,
            "created_at": self.created_at,
            "last_verified_date": self.last_verified_date,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MainContractorRecord":
        return cls(
            id=data.get("id", ""),
            contractor_name=data.get("contractor_name", ""),
            contractor_name_ar=data.get("contractor_name_ar"),
            normalized_name=data.get("normalized_name"),
            commercial_brand_name=data.get("commercial_brand_name"),
            verification_status=data.get("verification_status", "VERIFIED_MAIN_CONTRACTOR"),
            official_website=data.get("official_website"),
            headquarters=data.get("headquarters"),
            saudi_presence=bool(data.get("saudi_presence", True)),
            cr_number=data.get("cr_number"),
            company_size=data.get("company_size"),
            contractor_classification=data.get("contractor_classification"),
            specialties=data.get("specialties", []),
            industries=data.get("industries", []),
            geographic_coverage=data.get("geographic_coverage", []),
            known_clients=data.get("known_clients", []),
            active_saudi_projects=data.get("active_saudi_projects", []),
            awarded_project_id=data.get("awarded_project_id", ""),
            awarded_project_title=data.get("awarded_project_title", ""),
            owner=data.get("owner", ""),
            project_location=data.get("project_location", ""),
            contract_value_sar=data.get("contract_value_sar"),
            award_date=data.get("award_date"),
            verified_sources=data.get("verified_sources", []),
            portal_links=data.get("portal_links", []),
            contacts=data.get("contacts", []),
            created_at=data.get("created_at"),
            last_verified_date=data.get("last_verified_date"),
        )


class SubcontractPackage:
    def __init__(
        self,
        id: str,
        main_contractor_id: str,
        main_contractor_name: str,
        main_contractor_name_ar: Optional[str] = None,
        project_id: str = "",
        project_name: str = "",
        project_name_ar: Optional[str] = None,
        project_owner: str = "",
        project_location: str = "",
        package_name: str = "",
        package_name_ar: Optional[str] = None,
        package_category: str = "CIVIL",
        description: str = "",
        evidence_level: str = "CONFIRMED",
        evidence_source: str = "",
        likely_timing: str = "30-60 Days Post-Award",
        estimated_scope: Optional[str] = None,
        required_capabilities: Optional[List[str]] = None,
        likely_prequalification: str = "Vendor CR & Muqawil Classification",
        known_requirements: Optional[List[str]] = None,
        unknown_requirements: Optional[List[str]] = None,
        small_contractor_friendly: bool = True,
        is_inferred: bool = False,
        estimated_value_sar: Optional[float] = None,
        match_score: Optional[float] = None,
        eligibility_status: Optional[str] = None,
        bd_status: str = "DISCOVERED",
        bd_notes: str = "",
        bd_follow_up_date: Optional[str] = None,
        bd_responsible_user: Optional[str] = None,
        priority_label: str = "HIGH_PRIORITY_TARGET",
        priority_reasons: Optional[List[str]] = None,
        created_at: Optional[str] = None,
    ):
        self.id = id
        self.main_contractor_id = main_contractor_id
        self.main_contractor_name = main_contractor_name
        self.main_contractor_name_ar = main_contractor_name_ar or main_contractor_name
        self.project_id = project_id
        self.project_name = project_name
        self.project_name_ar = project_name_ar or project_name
        self.project_owner = project_owner
        self.project_location = project_location
        self.package_name = package_name
        self.package_name_ar = package_name_ar or package_name
        self.package_category = package_category
        self.description = description
        self.evidence_level = evidence_level
        self.evidence_source = evidence_source
        self.likely_timing = likely_timing
        self.estimated_scope = estimated_scope or "Turnkey supply & installation package"
        self.required_capabilities = required_capabilities or []
        self.likely_prequalification = likely_prequalification
        self.known_requirements = known_requirements or ["Valid Saudi CR", "GOSI Compliance", "Chamber of Commerce"]
        self.unknown_requirements = unknown_requirements or ["Specific Brand Pre-approval List", "Project-Specific QA/QC Matrix"]
        self.small_contractor_friendly = small_contractor_friendly
        self.is_inferred = is_inferred
        self.estimated_value_sar = estimated_value_sar
        self.match_score = match_score
        self.eligibility_status = eligibility_status
        self.bd_status = bd_status
        self.bd_notes = bd_notes
        self.bd_follow_up_date = bd_follow_up_date
        self.bd_responsible_user = bd_responsible_user
        self.priority_label = priority_label
        self.priority_reasons = priority_reasons or ["Direct capability match", "Verified open registration portal"]
        self.created_at = created_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "main_contractor_id": self.main_contractor_id,
            "main_contractor_name": self.main_contractor_name,
            "main_contractor_name_ar": self.main_contractor_name_ar,
            "project_id": self.project_id,
            "project_name": self.project_name,
            "project_name_ar": self.project_name_ar,
            "project_owner": self.project_owner,
            "project_location": self.project_location,
            "package_name": self.package_name,
            "package_name_ar": self.package_name_ar,
            "package_category": self.package_category,
            "description": self.description,
            "evidence_level": self.evidence_level,
            "evidence_source": self.evidence_source,
            "likely_timing": self.likely_timing,
            "estimated_scope": self.estimated_scope,
            "required_capabilities": self.required_capabilities,
            "likely_prequalification": self.likely_prequalification,
            "known_requirements": self.known_requirements,
            "unknown_requirements": self.unknown_requirements,
            "small_contractor_friendly": self.small_contractor_friendly,
            "is_inferred": self.is_inferred,
            "estimated_value_sar": self.estimated_value_sar,
            "match_score": self.match_score,
            "eligibility_status": self.eligibility_status,
            "bd_status": self.bd_status,
            "bd_notes": self.bd_notes,
            "bd_follow_up_date": self.bd_follow_up_date,
            "bd_responsible_user": self.bd_responsible_user,
            "priority_label": self.priority_label,
            "priority_reasons": self.priority_reasons,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SubcontractPackage":
        return cls(
            id=data.get("id", ""),
            main_contractor_id=data.get("main_contractor_id", ""),
            main_contractor_name=data.get("main_contractor_name", ""),
            main_contractor_name_ar=data.get("main_contractor_name_ar"),
            project_id=data.get("project_id", ""),
            project_name=data.get("project_name", ""),
            project_name_ar=data.get("project_name_ar"),
            project_owner=data.get("project_owner", ""),
            project_location=data.get("project_location", ""),
            package_name=data.get("package_name", ""),
            package_name_ar=data.get("package_name_ar"),
            package_category=data.get("package_category", "CIVIL"),
            description=data.get("description", ""),
            evidence_level=data.get("evidence_level", "CONFIRMED"),
            evidence_source=data.get("evidence_source", ""),
            likely_timing=data.get("likely_timing", "30-60 Days Post-Award"),
            estimated_scope=data.get("estimated_scope"),
            required_capabilities=data.get("required_capabilities", []),
            likely_prequalification=data.get("likely_prequalification", "Vendor CR & Muqawil"),
            known_requirements=data.get("known_requirements", []),
            unknown_requirements=data.get("unknown_requirements", []),
            small_contractor_friendly=bool(data.get("small_contractor_friendly", True)),
            is_inferred=bool(data.get("is_inferred", False)),
            estimated_value_sar=data.get("estimated_value_sar"),
            match_score=data.get("match_score"),
            eligibility_status=data.get("eligibility_status"),
            bd_status=data.get("bd_status", "DISCOVERED"),
            bd_notes=data.get("bd_notes", ""),
            bd_follow_up_date=data.get("bd_follow_up_date"),
            bd_responsible_user=data.get("bd_responsible_user"),
            priority_label=data.get("priority_label", "HIGH_PRIORITY_TARGET"),
            priority_reasons=data.get("priority_reasons", []),
            created_at=data.get("created_at"),
        )


class ContractorPortalLink:
    """Discovered supplier / vendor / subcontractor portal link (Stage 8 Part 3)."""
    def __init__(
        self,
        url: str,
        link_type: str = "VENDOR_REGISTRATION",
        evidence_source: str = "OFFICIAL_COMPANY_WEBSITE",
        verified_domain: str = "",
        last_checked: Optional[str] = None,
        authentication_required: bool = False,
        registration_status: str = "PUBLIC",
        notes: str = "",
    ):
        self.url = url
        self.link_type = link_type
        self.evidence_source = evidence_source
        self.verified_domain = verified_domain
        self.last_checked = last_checked or datetime.utcnow().isoformat()
        self.authentication_required = authentication_required
        self.registration_status = registration_status
        self.notes = notes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "url": self.url,
            "link_type": self.link_type,
            "evidence_source": self.evidence_source,
            "verified_domain": self.verified_domain,
            "last_checked": self.last_checked,
            "authentication_required": self.authentication_required,
            "registration_status": self.registration_status,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ContractorPortalLink":
        return cls(
            url=data.get("url", ""),
            link_type=data.get("link_type", "VENDOR_REGISTRATION"),
            evidence_source=data.get("evidence_source", "OFFICIAL_COMPANY_WEBSITE"),
            verified_domain=data.get("verified_domain", ""),
            last_checked=data.get("last_checked"),
            authentication_required=bool(data.get("authentication_required", False)),
            registration_status=data.get("registration_status", "PUBLIC"),
            notes=data.get("notes", ""),
        )


class SubcontractMatch:
    """Evaluation result of matching a contractor capability profile to a subcontract package (Stage 8 Part 6)."""
    def __init__(
        self,
        package_id: str,
        company_id: str,
        match_score: float,
        eligibility_status: str = "ELIGIBLE",
        fit_reasons: Optional[List[str]] = None,
        gap_warnings: Optional[List[str]] = None,
        recommended_approach: str = "DIRECT_VENDOR_REGISTRATION",
        estimated_competitiveness: str = "HIGH",
        calculated_at: Optional[str] = None,
    ):
        self.package_id = package_id
        self.company_id = company_id
        self.match_score = match_score
        self.eligibility_status = eligibility_status
        self.fit_reasons = fit_reasons or []
        self.gap_warnings = gap_warnings or []
        self.recommended_approach = recommended_approach
        self.estimated_competitiveness = estimated_competitiveness
        self.calculated_at = calculated_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "package_id": self.package_id,
            "company_id": self.company_id,
            "match_score": self.match_score,
            "eligibility_status": self.eligibility_status,
            "fit_reasons": self.fit_reasons,
            "gap_warnings": self.gap_warnings,
            "recommended_approach": self.recommended_approach,
            "estimated_competitiveness": self.estimated_competitiveness,
            "calculated_at": self.calculated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SubcontractMatch":
        return cls(
            package_id=data.get("package_id", ""),
            company_id=data.get("company_id", ""),
            match_score=float(data.get("match_score", 0.0)),
            eligibility_status=data.get("eligibility_status", "ELIGIBLE"),
            fit_reasons=data.get("fit_reasons", []),
            gap_warnings=data.get("gap_warnings", []),
            recommended_approach=data.get("recommended_approach", "DIRECT_VENDOR_REGISTRATION"),
            estimated_competitiveness=data.get("estimated_competitiveness", "HIGH"),
            calculated_at=data.get("calculated_at"),
        )


class SubcontractActionPlan:
    """Actionable 5-step subcontract engagement & registration plan (Stage 8 Part 7)."""
    def __init__(
        self,
        id: str,
        package_id: str,
        main_contractor_id: str,
        tenant_id: str = "comp-sa-001",
        portal_registration_url: str = "",
        registration_portal_type: str = "VENDOR_PORTAL",
        required_documents: Optional[List[Dict[str, Any]]] = None,
        outreach_contact: Optional[Dict[str, Any]] = None,
        outreach_email_draft: Optional[Dict[str, str]] = None,
        steps: Optional[List[Dict[str, Any]]] = None,
        status: str = "NOT_STARTED",
        notes: str = "",
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.package_id = package_id
        self.main_contractor_id = main_contractor_id
        self.tenant_id = tenant_id
        self.portal_registration_url = portal_registration_url
        self.registration_portal_type = registration_portal_type
        self.required_documents = required_documents or [
            {"document_name": "Commercial Registration (CR)", "is_mandatory": True, "status": "READY"},
            {"document_name": "Zakat, Tax and Customs Authority (ZATCA) Certificate", "is_mandatory": True, "status": "READY"},
            {"document_name": "GOSI Compliance Certificate", "is_mandatory": True, "status": "READY"},
            {"document_name": "Chamber of Commerce Certificate", "is_mandatory": True, "status": "READY"},
            {"document_name": "Saudi Contractors Authority (Muqawil) Classification", "is_mandatory": True, "status": "READY"},
            {"document_name": "Company Profile & Project References Dossier", "is_mandatory": True, "status": "READY"},
            {"document_name": "Audited Financial Statements (Last 2 Years)", "is_mandatory": False, "status": "PENDING_REVIEW"},
            {"document_name": "ISO 9001 / 14001 / 45001 Certifications", "is_mandatory": False, "status": "READY"},
        ]
        self.outreach_contact = outreach_contact or {}
        self.outreach_email_draft = outreach_email_draft or {}
        self.steps = steps or [
            {"step": 1, "title": "Portal Registration", "description": "Submit online onboarding on contractor supplier portal", "status": "PENDING"},
            {"step": 2, "title": "Prequalification Dossier", "description": "Upload verified CR, Zakat, GOSI & Muqawil classification", "status": "PENDING"},
            {"step": 3, "title": "Direct BD Outreach", "description": "Dispatch introductory email with project reference to procurement office", "status": "PENDING"},
            {"step": 4, "title": "Scope & Commercial Alignment", "description": "Review package specs and propose capacity allocation", "status": "PENDING"},
            {"step": 5, "title": "RFP / Quotation Submission", "description": "Submit pricing and technical proposal upon invitation", "status": "PENDING"},
        ]
        self.status = status
        self.notes = notes
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "package_id": self.package_id,
            "main_contractor_id": self.main_contractor_id,
            "tenant_id": self.tenant_id,
            "portal_registration_url": self.portal_registration_url,
            "registration_portal_type": self.registration_portal_type,
            "required_documents": self.required_documents,
            "outreach_contact": self.outreach_contact,
            "outreach_email_draft": self.outreach_email_draft,
            "steps": self.steps,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SubcontractActionPlan":
        return cls(
            id=data.get("id", ""),
            package_id=data.get("package_id", ""),
            main_contractor_id=data.get("main_contractor_id", ""),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            portal_registration_url=data.get("portal_registration_url", ""),
            registration_portal_type=data.get("registration_portal_type", "VENDOR_PORTAL"),
            required_documents=data.get("required_documents"),
            outreach_contact=data.get("outreach_contact"),
            outreach_email_draft=data.get("outreach_email_draft"),
            steps=data.get("steps"),
            status=data.get("status", "NOT_STARTED"),
            notes=data.get("notes", ""),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


class AwardNotification:
    def __init__(
        self,
        id: str,
        tenant_id: str,
        opportunity_id: str,
        event_type: str,
        title: str,
        message: str,
        timestamp: Optional[str] = None,
        read: bool = False,
    ):
        self.id = id
        self.tenant_id = tenant_id
        self.opportunity_id = opportunity_id
        self.event_type = event_type
        self.title = title
        self.message = message
        self.timestamp = timestamp or datetime.utcnow().isoformat()
        self.read = read

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "opportunity_id": self.opportunity_id,
            "event_type": self.event_type,
            "title": self.title,
            "message": self.message,
            "timestamp": self.timestamp,
            "read": self.read,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AwardNotification":
        return cls(
            id=data.get("id", ""),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            opportunity_id=data.get("opportunity_id", ""),
            event_type=data.get("event_type", "AWARD_RESULT_FOUND"),
            title=data.get("title", ""),
            message=data.get("message", ""),
            timestamp=data.get("timestamp"),
            read=bool(data.get("read", False)),
        )


# ==============================================================================
# Stage 9: Vendor Registration, Prequalification & BD Pipeline Models
# ==============================================================================

class PrequalificationDocument:
    """Configurable Saudi contractor prequalification compliance document."""

    def __init__(
        self,
        code: str,
        name_en: str,
        name_ar: str,
        category: str = "STATUTORY",
        is_mandatory: bool = True,
        requirement_level: str = "REQUIRED_VERIFIED",
        status: str = "READY",
        file_url: Optional[str] = None,
        expiry_date: Optional[str] = None,
        is_expired: bool = False,
        issuing_authority: Optional[str] = None,
        notes: str = "",
    ):
        self.code = code
        self.name_en = name_en
        self.name_ar = name_ar
        self.category = category  # STATUTORY, TECHNICAL, FINANCIAL, QUALITY_HSE, LOCAL_CONTENT
        self.is_mandatory = is_mandatory
        self.requirement_level = requirement_level  # REQUIRED_VERIFIED, LIKELY_REQUIRED, OPTIONAL, UNKNOWN
        self.status = status  # READY, MISSING, EXPIRED, PENDING_REVIEW
        self.file_url = file_url
        self.expiry_date = expiry_date
        self.is_expired = is_expired
        self.issuing_authority = issuing_authority
        self.notes = notes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "code": self.code,
            "name_en": self.name_en,
            "name_ar": self.name_ar,
            "category": self.category,
            "is_mandatory": self.is_mandatory,
            "requirement_level": self.requirement_level,
            "status": self.status,
            "file_url": self.file_url,
            "expiry_date": self.expiry_date,
            "is_expired": self.is_expired,
            "issuing_authority": self.issuing_authority,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PrequalificationDocument":
        return cls(
            code=data.get("code", ""),
            name_en=data.get("name_en", ""),
            name_ar=data.get("name_ar", ""),
            category=data.get("category", "STATUTORY"),
            is_mandatory=bool(data.get("is_mandatory", True)),
            requirement_level=data.get("requirement_level", "REQUIRED_VERIFIED"),
            status=data.get("status", "READY"),
            file_url=data.get("file_url"),
            expiry_date=data.get("expiry_date"),
            is_expired=bool(data.get("is_expired", False)),
            issuing_authority=data.get("issuing_authority"),
            notes=data.get("notes", ""),
        )


class VendorRegistrationRecord:
    """Permanent vendor/supplier onboarding record with a verified Saudi main contractor."""

    def __init__(
        self,
        id: str,
        contractor_id: str,
        contractor_name: str,
        contractor_name_ar: str,
        tenant_id: str = "comp-sa-001",
        commercial_registration: Optional[str] = None,
        location: str = "Riyadh, Saudi Arabia",
        official_website: str = "",
        vendor_portal_url: str = "",
        portal_type: str = "VENDOR_REGISTRATION",
        portal_status: str = "PUBLIC",  # PUBLIC, REGISTRATION_REQUIRED, AUTH_REQUIRED, INVITATION_ONLY, UNAVAILABLE, UNKNOWN
        registration_status: str = "NOT_STARTED",  # NOT_STARTED, PORTAL_FOUND, PREPARING, READY_TO_SUBMIT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, RENEWAL_REQUIRED, UNKNOWN
        last_checked: Optional[str] = None,
        procurement_contact: Optional[Dict[str, Any]] = None,
        registration_deadline: Optional[str] = None,
        required_documents: Optional[List[Dict[str, Any]]] = None,
        missing_documents: Optional[List[str]] = None,
        evidence_sources: Optional[List[str]] = None,
        confidence_level: str = "VERIFIED",  # VERIFIED, INFERRED, UNKNOWN
        notes: str = "",
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.contractor_id = contractor_id
        self.contractor_name = contractor_name
        self.contractor_name_ar = contractor_name_ar
        self.tenant_id = tenant_id
        self.commercial_registration = commercial_registration
        self.location = location
        self.official_website = official_website
        self.vendor_portal_url = vendor_portal_url
        self.portal_type = portal_type
        self.portal_status = portal_status
        self.registration_status = registration_status
        self.last_checked = last_checked or datetime.utcnow().isoformat()
        self.procurement_contact = procurement_contact or {}
        self.registration_deadline = registration_deadline
        self.required_documents = required_documents or []
        self.missing_documents = missing_documents or []
        self.evidence_sources = evidence_sources or []
        self.confidence_level = confidence_level
        self.notes = notes
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "contractor_id": self.contractor_id,
            "contractor_name": self.contractor_name,
            "contractor_name_ar": self.contractor_name_ar,
            "tenant_id": self.tenant_id,
            "commercial_registration": self.commercial_registration,
            "location": self.location,
            "official_website": self.official_website,
            "vendor_portal_url": self.vendor_portal_url,
            "portal_type": self.portal_type,
            "portal_status": self.portal_status,
            "registration_status": self.registration_status,
            "last_checked": self.last_checked,
            "procurement_contact": self.procurement_contact,
            "registration_deadline": self.registration_deadline,
            "required_documents": self.required_documents,
            "missing_documents": self.missing_documents,
            "evidence_sources": self.evidence_sources,
            "confidence_level": self.confidence_level,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "VendorRegistrationRecord":
        return cls(
            id=data.get("id", ""),
            contractor_id=data.get("contractor_id", ""),
            contractor_name=data.get("contractor_name", ""),
            contractor_name_ar=data.get("contractor_name_ar", ""),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            commercial_registration=data.get("commercial_registration"),
            location=data.get("location", "Riyadh, Saudi Arabia"),
            official_website=data.get("official_website", ""),
            vendor_portal_url=data.get("vendor_portal_url", ""),
            portal_type=data.get("portal_type", "VENDOR_REGISTRATION"),
            portal_status=data.get("portal_status", "PUBLIC"),
            registration_status=data.get("registration_status", "NOT_STARTED"),
            last_checked=data.get("last_checked"),
            procurement_contact=data.get("procurement_contact"),
            registration_deadline=data.get("registration_deadline"),
            required_documents=data.get("required_documents"),
            missing_documents=data.get("missing_documents"),
            evidence_sources=data.get("evidence_sources"),
            confidence_level=data.get("confidence_level", "VERIFIED"),
            notes=data.get("notes", ""),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


class BDPipelineItem:
    """Targeted Business Development pipeline opportunity connecting award, contractor, and subcontract package."""

    def __init__(
        self,
        id: str,
        tenant_id: str,
        project_name: str,
        project_owner: str,
        contractor_id: str,
        contractor_name: str,
        contractor_name_ar: str,
        package_name: str,
        work_category: str,
        stage: str = "TARGET_IDENTIFIED",
        priority: str = "ACTION_NOW",  # ACTION_NOW, ACTION_THIS_WEEK, MONITOR, LOW_PRIORITY
        priority_score: float = 85.0,
        priority_reasons: Optional[List[str]] = None,
        opportunity_id: Optional[str] = None,
        award_reference: Optional[str] = None,
        package_id: Optional[str] = None,
        estimated_value_sar: Optional[float] = None,
        registration_id: Optional[str] = None,
        portal_url: Optional[str] = None,
        procurement_contact: Optional[Dict[str, Any]] = None,
        eoi_template_ar: str = "",
        eoi_template_en: str = "",
        last_activity_date: Optional[str] = None,
        next_follow_up_date: Optional[str] = None,
        assigned_to: str = "Business Development Directorate",
        notes: str = "",
        provenance: Optional[Dict[str, Any]] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.tenant_id = tenant_id
        self.project_name = project_name
        self.project_owner = project_owner
        self.contractor_id = contractor_id
        self.contractor_name = contractor_name
        self.contractor_name_ar = contractor_name_ar
        self.package_name = package_name
        self.work_category = work_category
        self.stage = stage  # TARGET_IDENTIFIED, VENDOR_PORTAL_FOUND, REGISTRATION_IN_PROGRESS, REGISTERED, PROCUREMENT_CONTACT_FOUND, EOI_PREPARED, EOI_SENT, FOLLOW_UP, PREQUALIFICATION, RFQ_RECEIVED, BID_SUBMITTED, WON, LOST, ON_HOLD
        self.priority = priority
        self.priority_score = priority_score
        self.priority_reasons = priority_reasons or []
        self.opportunity_id = opportunity_id
        self.award_reference = award_reference
        self.package_id = package_id
        self.estimated_value_sar = estimated_value_sar
        self.registration_id = registration_id
        self.portal_url = portal_url
        self.procurement_contact = procurement_contact or {}
        self.eoi_template_ar = eoi_template_ar
        self.eoi_template_en = eoi_template_en
        self.last_activity_date = last_activity_date or datetime.utcnow().isoformat()
        self.next_follow_up_date = next_follow_up_date
        self.assigned_to = assigned_to
        self.notes = notes
        self.provenance = provenance or {}
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "project_name": self.project_name,
            "project_owner": self.project_owner,
            "contractor_id": self.contractor_id,
            "contractor_name": self.contractor_name,
            "contractor_name_ar": self.contractor_name_ar,
            "package_name": self.package_name,
            "work_category": self.work_category,
            "stage": self.stage,
            "priority": self.priority,
            "priority_score": self.priority_score,
            "priority_reasons": self.priority_reasons,
            "opportunity_id": self.opportunity_id,
            "award_reference": self.award_reference,
            "package_id": self.package_id,
            "estimated_value_sar": self.estimated_value_sar,
            "registration_id": self.registration_id,
            "portal_url": self.portal_url,
            "procurement_contact": self.procurement_contact,
            "eoi_template_ar": self.eoi_template_ar,
            "eoi_template_en": self.eoi_template_en,
            "last_activity_date": self.last_activity_date,
            "next_follow_up_date": self.next_follow_up_date,
            "assigned_to": self.assigned_to,
            "notes": self.notes,
            "provenance": self.provenance,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BDPipelineItem":
        return cls(
            id=data.get("id", ""),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            project_name=data.get("project_name", ""),
            project_owner=data.get("project_owner", ""),
            contractor_id=data.get("contractor_id", ""),
            contractor_name=data.get("contractor_name", ""),
            contractor_name_ar=data.get("contractor_name_ar", ""),
            package_name=data.get("package_name", ""),
            work_category=data.get("work_category", ""),
            stage=data.get("stage", "TARGET_IDENTIFIED"),
            priority=data.get("priority", "ACTION_NOW"),
            priority_score=float(data.get("priority_score", 80.0)),
            priority_reasons=data.get("priority_reasons"),
            opportunity_id=data.get("opportunity_id"),
            award_reference=data.get("award_reference"),
            package_id=data.get("package_id"),
            estimated_value_sar=data.get("estimated_value_sar"),
            registration_id=data.get("registration_id"),
            portal_url=data.get("portal_url"),
            procurement_contact=data.get("procurement_contact"),
            eoi_template_ar=data.get("eoi_template_ar", ""),
            eoi_template_en=data.get("eoi_template_en", ""),
            last_activity_date=data.get("last_activity_date"),
            next_follow_up_date=data.get("next_follow_up_date"),
            assigned_to=data.get("assigned_to", "Business Development Directorate"),
            notes=data.get("notes", ""),
            provenance=data.get("provenance"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


# ==============================================================================
# STAGE 10 SCHEMAS — DOSSIER GENERATOR, DOCUMENT VAULT, PROPOSAL, BOQ & ACTION CENTER
# ==============================================================================

class CompanyDocumentVaultItem:
    """Master company credential or compliance document stored in the vault."""

    def __init__(
        self,
        id: str,
        code: str,
        name_en: str,
        name_ar: str,
        category: str,  # STATUTORY, TECHNICAL, FINANCIAL, QUALITY_HSE, LOCAL_CONTENT
        tenant_id: str = "comp-sa-001",
        filename: str = "",
        file_url: Optional[str] = None,
        version: str = "1.0",
        issue_date: Optional[str] = None,
        expiry_date: Optional[str] = None,
        issuing_authority: Optional[str] = None,
        issuing_authority_ar: Optional[str] = None,
        document_status: str = "VALID",  # VALID, EXPIRING_SOON, EXPIRED, MISSING, UNKNOWN
        verification_status: str = "VERIFIED",  # VERIFIED, INFERRED, UNKNOWN
        notes: str = "",
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.code = code
        self.name_en = name_en
        self.name_ar = name_ar
        self.category = category
        self.tenant_id = tenant_id
        self.filename = filename
        self.file_url = file_url
        self.version = version
        self.issue_date = issue_date
        self.expiry_date = expiry_date
        self.issuing_authority = issuing_authority
        self.issuing_authority_ar = issuing_authority_ar
        self.verification_status = verification_status
        self.notes = notes
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()
        self.document_status = self._compute_status(document_status)

    def _compute_status(self, current_status: str) -> str:
        if not self.filename and not self.file_url:
            return "MISSING"
        if not self.expiry_date:
            return current_status if current_status != "MISSING" else "VALID"
        try:
            exp = datetime.fromisoformat(self.expiry_date.replace("Z", "+00:00")).date()
            today = datetime.utcnow().date()
            days_left = (exp - today).days
            if days_left < 0:
                return "EXPIRED"
            elif days_left <= 30:
                return "EXPIRING_SOON"
            else:
                return "VALID"
        except Exception:
            return current_status

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "code": self.code,
            "name_en": self.name_en,
            "name_ar": self.name_ar,
            "category": self.category,
            "tenant_id": self.tenant_id,
            "filename": self.filename,
            "file_url": self.file_url,
            "version": self.version,
            "issue_date": self.issue_date,
            "expiry_date": self.expiry_date,
            "issuing_authority": self.issuing_authority,
            "issuing_authority_ar": self.issuing_authority_ar,
            "document_status": self.document_status,
            "verification_status": self.verification_status,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CompanyDocumentVaultItem":
        return cls(
            id=data.get("id", ""),
            code=data.get("code", ""),
            name_en=data.get("name_en", ""),
            name_ar=data.get("name_ar", ""),
            category=data.get("category", "STATUTORY"),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            filename=data.get("filename", ""),
            file_url=data.get("file_url"),
            version=data.get("version", "1.0"),
            issue_date=data.get("issue_date"),
            expiry_date=data.get("expiry_date"),
            issuing_authority=data.get("issuing_authority"),
            issuing_authority_ar=data.get("issuing_authority_ar"),
            document_status=data.get("document_status", "VALID"),
            verification_status=data.get("verification_status", "VERIFIED"),
            notes=data.get("notes", ""),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


class PrequalificationDossier:
    """Contractor-specific compiled prequalification dossier package."""

    def __init__(
        self,
        id: str,
        contractor_id: str,
        contractor_name: str,
        contractor_name_ar: str,
        profile_type: str = "GENERIC_SAUDI",  # ARAMCO_IKTVA, NESMA, AL_BAWANI, EL_SEIF, RTCC, CCC, CUSTOM, GENERIC_SAUDI
        tenant_id: str = "comp-sa-001",
        registration_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
        subcontract_package_id: Optional[str] = None,
        status: str = "DRAFT",  # DRAFT, READY_FOR_EXPORT, SUBMITTED, ARCHIVED
        readiness_percentage: float = 0.0,
        readiness_breakdown: Optional[Dict[str, Any]] = None,
        sections: Optional[List[Dict[str, Any]]] = None,
        documents: Optional[List[Dict[str, Any]]] = None,
        missing_documents: Optional[List[Dict[str, Any]]] = None,
        expired_documents: Optional[List[Dict[str, Any]]] = None,
        package_manifest: Optional[Dict[str, Any]] = None,
        notes: str = "",
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.contractor_id = contractor_id
        self.contractor_name = contractor_name
        self.contractor_name_ar = contractor_name_ar
        self.profile_type = profile_type
        self.tenant_id = tenant_id
        self.registration_id = registration_id
        self.opportunity_id = opportunity_id
        self.subcontract_package_id = subcontract_package_id
        self.status = status
        self.readiness_percentage = readiness_percentage
        self.readiness_breakdown = readiness_breakdown or {}
        self.sections = sections or []
        self.documents = documents or []
        self.missing_documents = missing_documents or []
        self.expired_documents = expired_documents or []
        self.package_manifest = package_manifest or {}
        self.notes = notes
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "contractor_id": self.contractor_id,
            "contractor_name": self.contractor_name,
            "contractor_name_ar": self.contractor_name_ar,
            "profile_type": self.profile_type,
            "tenant_id": self.tenant_id,
            "registration_id": self.registration_id,
            "opportunity_id": self.opportunity_id,
            "subcontract_package_id": self.subcontract_package_id,
            "status": self.status,
            "readiness_percentage": self.readiness_percentage,
            "readiness_breakdown": self.readiness_breakdown,
            "sections": self.sections,
            "documents": self.documents,
            "missing_documents": self.missing_documents,
            "expired_documents": self.expired_documents,
            "package_manifest": self.package_manifest,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PrequalificationDossier":
        return cls(
            id=data.get("id", ""),
            contractor_id=data.get("contractor_id", ""),
            contractor_name=data.get("contractor_name", ""),
            contractor_name_ar=data.get("contractor_name_ar", ""),
            profile_type=data.get("profile_type", "GENERIC_SAUDI"),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            registration_id=data.get("registration_id"),
            opportunity_id=data.get("opportunity_id"),
            subcontract_package_id=data.get("subcontract_package_id"),
            status=data.get("status", "DRAFT"),
            readiness_percentage=float(data.get("readiness_percentage", 0.0)),
            readiness_breakdown=data.get("readiness_breakdown"),
            sections=data.get("sections"),
            documents=data.get("documents"),
            missing_documents=data.get("missing_documents"),
            expired_documents=data.get("expired_documents"),
            package_manifest=data.get("package_manifest"),
            notes=data.get("notes", ""),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


class BOQItem:
    """Individual Bill of Quantities item."""

    def __init__(
        self,
        item_number: str,
        description: str,
        description_ar: Optional[str] = None,
        unit: str = "m2",
        quantity: float = 1.0,
        unit_rate: Optional[float] = None,
        total: Optional[float] = None,
        rate_source: str = "USER_ENTERED",  # USER_ENTERED, IMPORTED, VERIFIED_SOURCE, ESTIMATED, UNKNOWN
        trade_category: str = "Civil / Architectural",
        notes: str = "",
        is_price_missing: bool = False,
    ):
        self.item_number = item_number
        self.description = description
        self.description_ar = description_ar or description
        self.unit = unit
        self.quantity = float(quantity)
        self.unit_rate = float(unit_rate) if unit_rate is not None else None
        if self.unit_rate is not None:
            self.total = round(self.quantity * self.unit_rate, 2)
            self.is_price_missing = False
        else:
            self.total = None
            self.is_price_missing = True
        self.rate_source = rate_source if self.unit_rate is not None else "UNKNOWN"
        self.trade_category = trade_category
        self.notes = notes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "item_number": self.item_number,
            "description": self.description,
            "description_ar": self.description_ar,
            "unit": self.unit,
            "quantity": self.quantity,
            "unit_rate": self.unit_rate,
            "total": self.total,
            "rate_source": self.rate_source,
            "trade_category": self.trade_category,
            "notes": self.notes,
            "is_price_missing": self.is_price_missing,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BOQItem":
        return cls(
            item_number=str(data.get("item_number", "1.0")),
            description=data.get("description", ""),
            description_ar=data.get("description_ar"),
            unit=data.get("unit", "no"),
            quantity=float(data.get("quantity", 1.0)),
            unit_rate=float(data["unit_rate"]) if data.get("unit_rate") is not None else None,
            total=float(data["total"]) if data.get("total") is not None else None,
            rate_source=data.get("rate_source", "USER_ENTERED"),
            trade_category=data.get("trade_category", "General"),
            notes=data.get("notes", ""),
            is_price_missing=bool(data.get("is_price_missing", False)),
        )


class BOQSheet:
    """Bill of Quantities worksheet connected to a subcontract trade package or proposal."""

    def __init__(
        self,
        id: str,
        tenant_id: str = "comp-sa-001",
        proposal_id: Optional[str] = None,
        package_id: Optional[str] = None,
        title: str = "Trade Package BOQ",
        title_ar: Optional[str] = None,
        items: Optional[List[Dict[str, Any]]] = None,
        subtotal: float = 0.0,
        overhead_percent: float = 10.0,
        overhead_amount: float = 0.0,
        contingency_percent: float = 5.0,
        contingency_amount: float = 0.0,
        margin_percent: float = 12.0,
        margin_amount: float = 0.0,
        vat_percent: float = 15.0,
        vat_amount: float = 0.0,
        grand_total: float = 0.0,
        unpriced_items_count: int = 0,
        pricing_completeness_percentage: float = 100.0,
        currency: str = "SAR",
        notes: str = "",
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.tenant_id = tenant_id
        self.proposal_id = proposal_id
        self.package_id = package_id
        self.title = title
        self.title_ar = title_ar or title
        self.items = items or []
        self.overhead_percent = float(overhead_percent)
        self.contingency_percent = float(contingency_percent)
        self.margin_percent = float(margin_percent)
        self.vat_percent = float(vat_percent)
        self.currency = currency
        self.notes = notes
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()
        self._calculate_totals()

    def _calculate_totals(self) -> None:
        subtotal = 0.0
        unpriced = 0
        total_items = len(self.items)

        for it in self.items:
            rate = it.get("unit_rate")
            qty = float(it.get("quantity", 0.0))
            if rate is not None:
                tot = round(qty * float(rate), 2)
                it["total"] = tot
                it["is_price_missing"] = False
                subtotal += tot
            else:
                it["total"] = None
                it["is_price_missing"] = True
                unpriced += 1

        self.subtotal = round(subtotal, 2)
        self.unpriced_items_count = unpriced
        self.pricing_completeness_percentage = (
            round(((total_items - unpriced) / total_items) * 100.0, 1) if total_items > 0 else 100.0
        )

        self.overhead_amount = round(self.subtotal * (self.overhead_percent / 100.0), 2)
        self.contingency_amount = round(self.subtotal * (self.contingency_percent / 100.0), 2)
        direct_and_oh = self.subtotal + self.overhead_amount + self.contingency_amount
        self.margin_amount = round(direct_and_oh * (self.margin_percent / 100.0), 2)
        net_before_vat = direct_and_oh + self.margin_amount
        self.vat_amount = round(net_before_vat * (self.vat_percent / 100.0), 2)
        self.grand_total = round(net_before_vat + self.vat_amount, 2)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "proposal_id": self.proposal_id,
            "package_id": self.package_id,
            "title": self.title,
            "title_ar": self.title_ar,
            "items": self.items,
            "subtotal": self.subtotal,
            "overhead_percent": self.overhead_percent,
            "overhead_amount": self.overhead_amount,
            "contingency_percent": self.contingency_percent,
            "contingency_amount": self.contingency_amount,
            "margin_percent": self.margin_percent,
            "margin_amount": self.margin_amount,
            "vat_percent": self.vat_percent,
            "vat_amount": self.vat_amount,
            "grand_total": self.grand_total,
            "unpriced_items_count": self.unpriced_items_count,
            "pricing_completeness_percentage": self.pricing_completeness_percentage,
            "currency": self.currency,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BOQSheet":
        return cls(
            id=data.get("id", ""),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            proposal_id=data.get("proposal_id"),
            package_id=data.get("package_id"),
            title=data.get("title", "Trade Package BOQ"),
            title_ar=data.get("title_ar"),
            items=data.get("items"),
            overhead_percent=float(data.get("overhead_percent", 10.0)),
            contingency_percent=float(data.get("contingency_percent", 5.0)),
            margin_percent=float(data.get("margin_percent", 12.0)),
            vat_percent=float(data.get("vat_percent", 15.0)),
            currency=data.get("currency", "SAR"),
            notes=data.get("notes", ""),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


class ProposalPackage:
    """Comprehensive subcontract proposal tracking object connecting Tender to BOQ."""

    def __init__(
        self,
        id: str,
        title: str,
        main_contractor_id: str,
        main_contractor_name: str,
        project_name: str,
        trade_package_name: str,
        tenant_id: str = "comp-sa-001",
        title_ar: Optional[str] = None,
        main_contractor_name_ar: Optional[str] = None,
        tender_id: Optional[str] = None,
        award_id: Optional[str] = None,
        trade_package_id: Optional[str] = None,
        registration_id: Optional[str] = None,
        dossier_id: Optional[str] = None,
        boq_id: Optional[str] = None,
        status: str = "DRAFT",  # DRAFT, IN_REVIEW, READY, SUBMITTED, CLARIFICATION, REVISED, AWARDED, LOST, CANCELLED
        bid_decision: str = "BID",  # BID, CONDITIONAL_BID, REVIEW, NO_BID
        bid_decision_score: float = 85.0,
        bid_decision_factors: Optional[List[Dict[str, Any]]] = None,
        submission_deadline: Optional[str] = None,
        submission_reference: Optional[str] = None,
        submitted_at: Optional[str] = None,
        boq_grand_total_sar: Optional[float] = None,
        assigned_lead: str = "Commercial Director",
        notes: str = "",
        provenance: Optional[Dict[str, Any]] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.title = title
        self.title_ar = title_ar or title
        self.main_contractor_id = main_contractor_id
        self.main_contractor_name = main_contractor_name
        self.main_contractor_name_ar = main_contractor_name_ar or main_contractor_name
        self.project_name = project_name
        self.trade_package_name = trade_package_name
        self.tenant_id = tenant_id
        self.tender_id = tender_id
        self.award_id = award_id
        self.trade_package_id = trade_package_id
        self.registration_id = registration_id
        self.dossier_id = dossier_id
        self.boq_id = boq_id
        self.status = status
        self.bid_decision = bid_decision
        self.bid_decision_score = float(bid_decision_score)
        self.bid_decision_factors = bid_decision_factors or []
        self.submission_deadline = submission_deadline
        self.submission_reference = submission_reference
        self.submitted_at = submitted_at
        self.boq_grand_total_sar = boq_grand_total_sar
        self.assigned_lead = assigned_lead
        self.notes = notes
        self.provenance = provenance or {}
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "title_ar": self.title_ar,
            "main_contractor_id": self.main_contractor_id,
            "main_contractor_name": self.main_contractor_name,
            "main_contractor_name_ar": self.main_contractor_name_ar,
            "project_name": self.project_name,
            "trade_package_name": self.trade_package_name,
            "tenant_id": self.tenant_id,
            "tender_id": self.tender_id,
            "award_id": self.award_id,
            "trade_package_id": self.trade_package_id,
            "registration_id": self.registration_id,
            "dossier_id": self.dossier_id,
            "boq_id": self.boq_id,
            "status": self.status,
            "bid_decision": self.bid_decision,
            "bid_decision_score": self.bid_decision_score,
            "bid_decision_factors": self.bid_decision_factors,
            "submission_deadline": self.submission_deadline,
            "submission_reference": self.submission_reference,
            "submitted_at": self.submitted_at,
            "boq_grand_total_sar": self.boq_grand_total_sar,
            "assigned_lead": self.assigned_lead,
            "notes": self.notes,
            "provenance": self.provenance,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ProposalPackage":
        return cls(
            id=data.get("id", ""),
            title=data.get("title", ""),
            title_ar=data.get("title_ar"),
            main_contractor_id=data.get("main_contractor_id", ""),
            main_contractor_name=data.get("main_contractor_name", ""),
            main_contractor_name_ar=data.get("main_contractor_name_ar"),
            project_name=data.get("project_name", ""),
            trade_package_name=data.get("trade_package_name", ""),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            tender_id=data.get("tender_id"),
            award_id=data.get("award_id"),
            trade_package_id=data.get("trade_package_id"),
            registration_id=data.get("registration_id"),
            dossier_id=data.get("dossier_id"),
            boq_id=data.get("boq_id"),
            status=data.get("status", "DRAFT"),
            bid_decision=data.get("bid_decision", "BID"),
            bid_decision_score=float(data.get("bid_decision_score", 85.0)),
            bid_decision_factors=data.get("bid_decision_factors"),
            submission_deadline=data.get("submission_deadline"),
            submission_reference=data.get("submission_reference"),
            submitted_at=data.get("submitted_at"),
            boq_grand_total_sar=float(data["boq_grand_total_sar"]) if data.get("boq_grand_total_sar") is not None else None,
            assigned_lead=data.get("assigned_lead", "Commercial Director"),
            notes=data.get("notes", ""),
            provenance=data.get("provenance"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


class ActionCenterItem:
    """Action item combining critical tasks across Stages 1 to 10."""

    def __init__(
        self,
        id: str,
        priority: str,  # ACTION_NOW, ACTION_THIS_WEEK, MONITOR, LOW_PRIORITY
        category: str,  # PREQUAL_DOCUMENT, REGISTRATION_DEADLINE, NEW_AWARD, CONTRACTOR_PORTAL, PROPOSAL_DEADLINE, BOQ_UNPRICED, FOLLOW_UP_DUE
        title_en: str,
        title_ar: str,
        description_en: str,
        description_ar: str,
        tenant_id: str = "comp-sa-001",
        due_date: Optional[str] = None,
        is_overdue: bool = False,
        target_type: str = "PROPOSAL",  # CONTRACTOR, OPPORTUNITY, PACKAGE, PROPOSAL, DOCUMENT, BOQ
        target_id: str = "",
        target_name: str = "",
        deep_link: str = "",
        action_cta_en: str = "Take Action",
        action_cta_ar: str = "اتخاذ إجراء",
        created_at: Optional[str] = None,
    ):
        self.id = id
        self.priority = priority
        self.category = category
        self.title_en = title_en
        self.title_ar = title_ar
        self.description_en = description_en
        self.description_ar = description_ar
        self.tenant_id = tenant_id
        self.due_date = due_date
        self.is_overdue = is_overdue
        self.target_type = target_type
        self.target_id = target_id
        self.target_name = target_name
        self.deep_link = deep_link
        self.action_cta_en = action_cta_en
        self.action_cta_ar = action_cta_ar
        self.created_at = created_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "priority": self.priority,
            "category": self.category,
            "title_en": self.title_en,
            "title_ar": self.title_ar,
            "description_en": self.description_en,
            "description_ar": self.description_ar,
            "tenant_id": self.tenant_id,
            "due_date": self.due_date,
            "is_overdue": self.is_overdue,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "target_name": self.target_name,
            "deep_link": self.deep_link,
            "action_cta_en": self.action_cta_en,
            "action_cta_ar": self.action_cta_ar,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ActionCenterItem":
        return cls(
            id=data.get("id", ""),
            priority=data.get("priority", "ACTION_NOW"),
            category=data.get("category", "PROPOSAL_DEADLINE"),
            title_en=data.get("title_en", ""),
            title_ar=data.get("title_ar", ""),
            description_en=data.get("description_en", ""),
            description_ar=data.get("description_ar", ""),
            tenant_id=data.get("tenant_id", "comp-sa-001"),
            due_date=data.get("due_date"),
            is_overdue=bool(data.get("is_overdue", False)),
            target_type=data.get("target_type", "PROPOSAL"),
            target_id=data.get("target_id", ""),
            target_name=data.get("target_name", ""),
            deep_link=data.get("deep_link", ""),
            action_cta_en=data.get("action_cta_en", "Take Action"),
            action_cta_ar=data.get("action_cta_ar", "اتخاذ إجراء"),
            created_at=data.get("created_at"),
        )






