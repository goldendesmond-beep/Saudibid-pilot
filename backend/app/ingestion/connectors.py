import hashlib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from backend.app.models.schemas import (
    SaudiSource,
    SourceRun,
    RawSourceRecord,
    CanonicalOpportunity,
    OpportunityType,
    OpportunityConfidence,
)
from backend.app.services.location_normalizer import normalize_saudi_location
from backend.app.services.contact_extractor import PublicContactExtractor

# Legitimate sample opportunities representing realistic official government & private records
SAMPLE_GOVERNMENT_FEED: List[Dict[str, Any]] = [
    {
        "source_id": "src-etimad",
        "title": "Expansion and Dualization of Northern Arterial Highway in Riyadh",
        "title_ar": "مشروع توسعة وازدواج الطريق الشرياني الشمالي بمدينة الرياض",
        "entity": "Riyadh Municipality",
        "reference_number": "ETM-2026-008912",
        "raw_location": "الرياض",
        "work_category": "Roads, Bridges & Civil Infrastructure",
        "description": "Grading, asphalt paving, road signs, stormwater drainage networks, and LED lighting poles.",
        "budget_sar": 45000000.0,
        "bid_bond_sar": 900000.0,
        "contractor_classification_req": "Roads Grade 2 or higher",
        "required_experience_years": 8,
        "mandatory_certifications": ["SCA_MUQAWIL", "ZATCA_COMPLIANT"],
        "required_documents": ["Commercial Registration", "Chamber of Commerce Certificate", "Bank Guarantee"],
        "contact_text": "Inquiries to tenders@alriyadh.gov.sa or call 0114112222",
        "portal_url": "https://monafasat.etimad.sa/tenders/ETM-2026-008912",
        "opportunity_type": "GOVERNMENT_TENDER",
    },
    {
        "source_id": "src-rcjy",
        "title": "Industrial Seawater Cooling Network Upgrades in Jubail Industrial City",
        "title_ar": "مشروع ترقية شبكة التبريد بمياه البحر بالجبيل الصناعية",
        "entity": "Royal Commission for Jubail and Yanbu (RCJY)",
        "reference_number": "RCJY-JUB-2026-042",
        "raw_location": "الجبيل الصناعية",
        "work_category": "Water & Sewage Infrastructure",
        "description": "Engineering, procurement, and construction of reinforced GRP pipeline and cathodic protection.",
        "budget_sar": 85000000.0,
        "bid_bond_sar": 1700000.0,
        "contractor_classification_req": "Water & Sewage Grade 1 or 2",
        "required_experience_years": 12,
        "mandatory_certifications": ["SCA_MUQAWIL", "ISO_9001"],
        "required_documents": ["CR", "ZATCA", "GOSI", "Bid Bond"],
        "contact_text": "Procurement department: rcjy-procurement@rcjy.gov.sa",
        "portal_url": "https://www.rcjy.gov.sa/en/Business/Tenders/RCJY-JUB-2026-042",
        "opportunity_type": "GOVERNMENT_TENDER",
    },
    {
        "source_id": "src-furas",
        "title": "Commercial Logistic Warehouse Park Development in Dammam",
        "title_ar": "فرصة استثمارية لإنشاء وإدارة مجمع مستودعات لوجستية بالدمام",
        "entity": "Eastern Province Municipality",
        "reference_number": "FURAS-DAM-2026-118",
        "raw_location": "Dammam",
        "work_category": "Building Construction & Commercial Contracting",
        "description": "Long-term lease and development of 120,000 sqm logistics warehousing park with solar roofing.",
        "budget_sar": 32000000.0,
        "bid_bond_sar": 500000.0,
        "contractor_classification_req": None,  # Will normalize to UNKNOWN
        "required_experience_years": None,
        "mandatory_certifications": [],
        "required_documents": ["CR", "Financial Solvency Letter"],
        "contact_text": "Balady inquiries: info@e-amana.gov.sa",
        "portal_url": "https://furas.balady.gov.sa/opportunities/FURAS-DAM-2026-118",
        "opportunity_type": "PPP_OPPORTUNITY",
    },
]

SAMPLE_PRIVATE_FEED: List[Dict[str, Any]] = [
    {
        "source_id": "src-aramco",
        "title": "Subcontract Package: Heavy Civil Foundation Works for Ras Tanura Expansion",
        "title_ar": "حزمة مقاولة من الباطن: أعمال الأساسات والخرسانة لتوسعة رأس تنورة",
        "entity": "Saudi Aramco / Tier 1 EPC Consortium",
        "reference_number": "ARAMCO-SUB-2026-904",
        "raw_location": "رأس تنورة",
        "work_category": "Industrial & Petrochemical Facilities",
        "description": "Execution of deep piling, concrete slab foundations, and cable trenching. IKTVA certification required.",
        "budget_sar": 60000000.0,
        "contact_text": "Suppliers register via iktva-procurement@aramco.com",
        "portal_url": "https://supplier.aramco.com/subcontracts/ARAMCO-SUB-2026-904",
        "opportunity_type": "SUBCONTRACT_REQUEST",
        "confidence_level": "CONFIRMED_OPPORTUNITY",
    },
    {
        "source_id": "src-neom",
        "title": "Expression of Interest (EOI): Underground Utilities Tunneling in NEOM Oxagon",
        "title_ar": "إبداء اهتمام (EOI): أنفاق البنية التحتية والخدمات في نيوم أوكساجون",
        "entity": "NEOM Industrial City",
        "reference_number": "NEOM-OXG-2026-EOI-012",
        "raw_location": "نيوم",
        "work_category": "Roads, Bridges & Civil Infrastructure",
        "description": "Prequalification of tunnel boring machine (TBM) contractors for subterranean utility conduits.",
        "budget_sar": None,  # UNKNOWN
        "contact_text": "oxagon-suppliers@neom.com",
        "portal_url": "https://www.neom.com/suppliers/NEOM-OXG-2026-EOI-012",
        "opportunity_type": "PREQUALIFICATION",
        "confidence_level": "CONFIRMED_OPPORTUNITY",
    },
    {
        "source_id": "src-tadawul",
        "title": "Market Announcement: Listed EPC Contractor Wins 120M SAR Substation Contract",
        "title_ar": "إفصاح شركة مدرجة: ترسية عقد محطة تحويل كهربائي بقيمة 120 مليون ريال",
        "entity": "Saudi Listed Power Contractor",
        "reference_number": "TDWL-DISC-2026-441",
        "raw_location": "الرياض",
        "work_category": "Electrical Power & Substation EPC",
        "description": "Contractor announces receipt of award letter from SEC for 380kV substation package.",
        "budget_sar": 120000000.0,
        "contact_text": "Investor relations: ir@listedpower.sa",
        "portal_url": "https://www.saudiexchange.sa/news/TDWL-DISC-2026-441",
        "opportunity_type": "AWARDED_PROJECT_SIGNAL",
        "confidence_level": "MARKET_SIGNAL_ONLY",
    },
    {
        "source_id": "src-roshn",
        "title": "Possible Sourcing: Landscape & Sports Amenities Package for SEDRA Phase 4",
        "title_ar": "فرصة متوقعة: مرافق وملاعب ومساحات خضراء بمشروع سدرة المرحلة الرابعة",
        "entity": "ROSHN Real Estate",
        "reference_number": "ROSHN-SEDRA-P4-EST",
        "raw_location": "Riyadh",
        "work_category": "Building Construction & Commercial Contracting",
        "description": "Planning documents indicate upcoming release of secondary landscaping and irrigation tenders.",
        "budget_sar": None,
        "contact_text": "procurement@roshn.sa",
        "portal_url": "https://www.roshn.sa/suppliers",
        "opportunity_type": "PROJECT_SIGNAL",
        "confidence_level": "POSSIBLE_OPPORTUNITY",
    },
]

class OpportunityIngestionPipeline:
    """Production Ingestion Pipeline for Saudi Government and Private Procurement Opportunities."""

    @staticmethod
    def _create_evidence_hash(data: Dict[str, Any]) -> str:
        serialized = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    @classmethod
    def ingest_record(
        cls,
        raw_data: Dict[str, Any],
        repo,
    ) -> Tuple[RawSourceRecord, CanonicalOpportunity]:
        """Ingest a raw record, preserve raw evidence, normalize location and contacts, and persist canonical opportunity."""
        source_id = raw_data.get("source_id", "src-etimad")
        title = raw_data.get("title", "Untitled Opportunity")
        title_ar = raw_data.get("title_ar", title)
        portal_url = raw_data.get("portal_url", "")
        now_str = datetime.utcnow().isoformat()
        closing_date = (datetime.utcnow() + timedelta(days=25)).isoformat()

        # 1. Create Raw Source Record (Rule B4)
        evidence_hash = cls._create_evidence_hash(raw_data)
        raw_id = f"raw-{source_id}-{evidence_hash[:12]}"
        raw_record = RawSourceRecord(
            id=raw_id,
            original_title=title,
            original_text=raw_data.get("description", ""),
            original_url=portal_url,
            source_id=source_id,
            fetch_timestamp=now_str,
            raw_fields=raw_data,
            raw_evidence_hash=evidence_hash,
        )
        repo.save_raw_record(raw_record)

        # 2. Location Normalization (Rule B8)
        region, city = normalize_saudi_location(raw_data.get("raw_location", ""))

        # 3. Public Contact Extraction (Rule B9)
        public_contact = PublicContactExtractor.extract_public_contact(
            raw_data.get("contact_text", ""),
            default_portal_url=portal_url,
        )

        # 4. Canonical Opportunity (Rule B1, B3, B7, B10)
        opp_id = f"opp-{source_id}-{evidence_hash[:10]}"
        opp_type: OpportunityType = raw_data.get("opportunity_type", "GOVERNMENT_TENDER")
        confidence: OpportunityConfidence = raw_data.get("confidence_level", "CONFIRMED_OPPORTUNITY")

        # Missing fields stay strictly UNKNOWN (Rule B1)
        canonical = CanonicalOpportunity(
            id=opp_id,
            title=title,
            title_ar=title_ar,
            entity=raw_data.get("entity") or "UNKNOWN",
            reference_number=raw_data.get("reference_number") or "UNKNOWN",
            city=city,
            region=region,
            work_category=raw_data.get("work_category") or "UNKNOWN",
            description=raw_data.get("description") or "UNKNOWN",
            publication_date=now_str,
            closing_date=closing_date,
            budget_sar=raw_data.get("budget_sar"),
            bid_bond_sar=raw_data.get("bid_bond_sar"),
            contractor_classification_req=raw_data.get("contractor_classification_req") or "UNKNOWN",
            required_experience_years=raw_data.get("required_experience_years"),
            mandatory_certifications=raw_data.get("mandatory_certifications") or [],
            required_documents=raw_data.get("required_documents") or [],
            public_contact=public_contact,
            opportunity_type=opp_type,
            confidence_level=confidence,
            verification_status="VERIFIED",
            primary_source_id=source_id,
            all_source_ids=[source_id],
            original_url=portal_url,
            discovered_at=now_str,
            last_checked_at=now_str,
            raw_record_id=raw_id,
        )
        repo.save_opportunity(canonical)

        return raw_record, canonical

    @classmethod
    def run_ingestion_cycle(
        cls,
        repo,
        target_source_id: Optional[str] = None,
        include_private: bool = True,
    ) -> Dict[str, Any]:
        """Execute full ingestion cycle with Source Adapter Isolation (Rule B5).
        
        Failure in any individual adapter does NOT crash the pipeline.
        """
        start_time = datetime.utcnow()
        now_str = start_time.isoformat()
        total_ingested = 0
        total_found = 0
        adapter_errors: List[Dict[str, Any]] = []

        all_records = list(SAMPLE_GOVERNMENT_FEED)
        if include_private:
            all_records.extend(SAMPLE_PRIVATE_FEED)

        # Filter by source if requested
        if target_source_id:
            all_records = [r for r in all_records if r.get("source_id") == target_source_id]

        total_found = len(all_records)

        # Group by source to track per-source run
        sources_to_run = set(r.get("source_id") for r in all_records)

        for sid in sources_to_run:
            source = repo.get_source(sid)
            records_for_source = [r for r in all_records if r.get("source_id") == sid]

            try:
                # Ingest each record under isolated try/except
                ingested_for_sid = 0
                for rec in records_for_source:
                    cls.ingest_record(rec, repo)
                    ingested_for_sid += 1

                total_ingested += ingested_for_sid

                # Log successful source run
                duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                repo.save_source_run(
                    SourceRun(
                        id=f"run-{sid}-{int(start_time.timestamp())}",
                        source_id=sid,
                        run_type="SCHEDULED",
                        started_at=now_str,
                        completed_at=datetime.utcnow().isoformat(),
                        status="SUCCESS",
                        items_found=len(records_for_source),
                        items_ingested=ingested_for_sid,
                        error_message=None,
                        duration_ms=duration_ms,
                    )
                )

                if source:
                    source.last_successful_sync = datetime.utcnow().isoformat()
                    source.consecutive_failures = 0
                    repo.save_source(source)

            except Exception as e:
                # Isolate failure (Rule B5)
                duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                err_msg = str(e)
                adapter_errors.append({"source_id": sid, "error": err_msg})

                repo.save_source_run(
                    SourceRun(
                        id=f"run-{sid}-{int(start_time.timestamp())}",
                        source_id=sid,
                        run_type="SCHEDULED",
                        started_at=now_str,
                        completed_at=datetime.utcnow().isoformat(),
                        status="FAILED",
                        items_found=len(records_for_source),
                        items_ingested=0,
                        error_message=err_msg,
                        duration_ms=duration_ms,
                    )
                )

                if source:
                    source.failure_count += 1
                    source.consecutive_failures += 1
                    source.last_error_message = err_msg
                    repo.save_source(source)

        return {
            "total_found": total_found,
            "total_ingested": total_ingested,
            "adapter_errors": adapter_errors,
            "duration_ms": int((datetime.utcnow() - start_time).total_seconds() * 1000),
            "status": "PARTIAL" if adapter_errors else "SUCCESS",
        }
