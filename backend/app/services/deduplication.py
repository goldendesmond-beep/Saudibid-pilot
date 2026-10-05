import hashlib
from typing import List, Dict, Any, Optional, Tuple
from backend.app.models.schemas import CanonicalOpportunity, RawSourceRecord
from backend.app.services.normalization import SaudiNormalizationService

SOURCE_PRIORITY_ORDER = {
    "src-etimad": 100,
    "src-rcjy": 95,
    "src-furas": 90,
    "src-ncp": 90,
    "src-aramco": 85,
    "src-sabic": 85,
    "src-sec": 80,
    "src-nwc": 80,
    "src-neom": 80,
    "src-roshn": 75,
    "src-tadawul": 70,
    "src-spa": 65,
}

class MultiSourceDeduplicationService:
    """Detects, merges, and tracks conflicts across multiple procurement sources."""

    @staticmethod
    def generate_project_fingerprint(
        ref_number: Optional[str],
        title: str,
        entity: str,
        city: str,
    ) -> str:
        """Create a deterministic project fingerprint for duplicate clustering."""
        norm_title, _ = SaudiNormalizationService.normalize_title(title)
        norm_entity, _ = SaudiNormalizationService.normalize_entity(entity)
        norm_ref = (ref_number or "").strip().upper()

        if norm_ref and norm_ref != "UNKNOWN":
            base = f"REF::{norm_ref}::{norm_entity.lower()}"
        else:
            base = f"TITLE::{norm_title[:40].lower()}::{norm_entity.lower()}::{city.lower()}"

        return hashlib.sha256(base.encode("utf-8")).hexdigest()

    @classmethod
    def are_duplicates(
        cls,
        opp_a: CanonicalOpportunity,
        opp_b: CanonicalOpportunity,
    ) -> bool:
        """Evaluate if two opportunities refer to the same physical project."""
        # 1. Exact reference number match (if not UNKNOWN)
        if (
            opp_a.reference_number
            and opp_b.reference_number
            and opp_a.reference_number != "UNKNOWN"
            and opp_b.reference_number != "UNKNOWN"
            and opp_a.reference_number.strip().upper() == opp_b.reference_number.strip().upper()
        ):
            return True

        # 2. Same fingerprint
        fp_a = cls.generate_project_fingerprint(opp_a.reference_number, opp_a.title, opp_a.entity, opp_a.city)
        fp_b = cls.generate_project_fingerprint(opp_b.reference_number, opp_b.title, opp_b.entity, opp_b.city)
        if fp_a == fp_b:
            return True

        # 3. High title similarity + same entity + same city
        norm_title_a, _ = SaudiNormalizationService.normalize_title(opp_a.title)
        norm_title_b, _ = SaudiNormalizationService.normalize_title(opp_b.title)
        norm_ent_a, _ = SaudiNormalizationService.normalize_entity(opp_a.entity)
        norm_ent_b, _ = SaudiNormalizationService.normalize_entity(opp_b.entity)

        if norm_ent_a.lower() == norm_ent_b.lower() and opp_a.city.lower() == opp_b.city.lower():
            # Check overlap tokens
            tokens_a = set(norm_title_a.lower().split())
            tokens_b = set(norm_title_b.lower().split())
            if tokens_a and tokens_b:
                intersection = tokens_a.intersection(tokens_b)
                jaccard = len(intersection) / len(tokens_a.union(tokens_b))
                if jaccard >= 0.65:
                    return True

        return False

    @classmethod
    def merge_duplicates(
        cls,
        primary: CanonicalOpportunity,
        incoming: CanonicalOpportunity,
    ) -> Tuple[CanonicalOpportunity, Dict[str, Any]]:
        """Merge incoming duplicate into primary canonical opportunity while preserving all evidence & conflicts."""
        # Preserve source IDs
        for sid in incoming.all_source_ids:
            if sid not in primary.all_source_ids:
                primary.all_source_ids.append(sid)

        # Detect conflicts
        conflicts: Dict[str, List[Dict[str, Any]]] = {}

        # Budget conflict
        if (
            primary.budget_sar is not None
            and incoming.budget_sar is not None
            and primary.budget_sar != incoming.budget_sar
        ):
            conflicts["budget_sar"] = [
                {"source_id": primary.primary_source_id, "value": primary.budget_sar},
                {"source_id": incoming.primary_source_id, "value": incoming.budget_sar},
            ]

        # Closing date conflict
        if (
            primary.closing_date
            and incoming.closing_date
            and primary.closing_date != incoming.closing_date
        ):
            conflicts["closing_date"] = [
                {"source_id": primary.primary_source_id, "value": primary.closing_date},
                {"source_id": incoming.primary_source_id, "value": incoming.closing_date},
            ]

        # Classification conflict
        if (
            primary.contractor_classification_req != "UNKNOWN"
            and incoming.contractor_classification_req != "UNKNOWN"
            and primary.contractor_classification_req != incoming.contractor_classification_req
        ):
            conflicts["contractor_classification_req"] = [
                {"source_id": primary.primary_source_id, "value": primary.contractor_classification_req},
                {"source_id": incoming.primary_source_id, "value": incoming.contractor_classification_req},
            ]

        # If conflicts exist, mark CONFLICTING_SOURCES
        if conflicts:
            primary.verification_status = "CONFLICTING_SOURCES"

        # Determine priority source
        prio_primary = SOURCE_PRIORITY_ORDER.get(primary.primary_source_id, 50)
        prio_incoming = SOURCE_PRIORITY_ORDER.get(incoming.primary_source_id, 50)

        # Fill UNKNOWN values from incoming if incoming has valid data
        if primary.budget_sar is None and incoming.budget_sar is not None:
            primary.budget_sar = incoming.budget_sar
        if primary.contractor_classification_req == "UNKNOWN" and incoming.contractor_classification_req != "UNKNOWN":
            primary.contractor_classification_req = incoming.contractor_classification_req
        if primary.required_experience_years is None and incoming.required_experience_years is not None:
            primary.required_experience_years = incoming.required_experience_years
        if not primary.mandatory_certifications and incoming.mandatory_certifications:
            primary.mandatory_certifications = list(set(primary.mandatory_certifications + incoming.mandatory_certifications))

        return primary, conflicts
