"""Prequalification Dossier Generator & Assembly Engine (Stage 10 Parts A, C, D).

Assembles contractor-specific prequalification dossiers against the Master Document Vault,
evaluates document readiness without ever fabricating missing or expired documents,
and outputs a structured 13-section submission package with complete manifest and cover sheet.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import PrequalificationDossier, CompanyDocumentVaultItem
from backend.app.services.document_vault import DocumentVaultService

# Verified requirement profiles for major Saudi contractors
CONTRACTOR_PROFILES: Dict[str, Dict[str, Any]] = {
    "ARAMCO_IKTVA": {
        "profile_name_en": "Saudi Aramco / IKTVA Supplier Prequalification",
        "profile_name_ar": "تأهيل المقاولين لدى أرامكو السعودية وبرنامج اكتفاء",
        "contractor_id": "contractor-aramco",
        "contractor_name": "Saudi Aramco",
        "contractor_name_ar": "أرامكو السعودية",
        "required_codes": [
            {"code": "CR_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "ZATCA_TAX", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "VAT_REG", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "GOSI_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "SAUDIZATION_NITAQAT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "CHAMBER_COMMERCE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "NATIONAL_ADDRESS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "BANK_IBAN", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "COMPANY_PROFILE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "02_Company_Profile"},
            {"code": "ORG_CHART", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "04_Technical_Capability"},
            {"code": "PROJECT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "05_Project_References"},
            {"code": "EQUIPMENT_FLEET", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "06_Equipment_and_Manpower"},
            {"code": "MANPOWER_LIST", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "06_Equipment_and_Manpower"},
            {"code": "AUDITED_FINANCIALS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "07_Financial"},
            {"code": "HSE_POLICY", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "09_HSE"},
            {"code": "QA_QC_MANUAL", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "08_QA_QC"},
            {"code": "ISO_9001", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "10_ISO"},
            {"code": "ISO_14001", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "10_ISO"},
            {"code": "ISO_45001", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "10_ISO"},
            {"code": "IKTVA_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "11_Local_Content"},
            {"code": "CLIENT_REFERENCES", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "12_Client_References"},
            {"code": "BANK_FACILITY", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "07_Financial"},
        ],
        "notes": "Aramco e-Marketplace / SAP Ariba registration requires audited IKTVA scorecard, ISO triple certs, and strict safety manual.",
    },
    "NESMA": {
        "profile_name_en": "Nesma & Partners Subcontractor Prequalification",
        "profile_name_ar": "تأهيل مقاولي الباطن - نسما وشركاهم",
        "contractor_id": "contractor-nesma",
        "contractor_name": "Nesma & Partners Contracting Co.",
        "contractor_name_ar": "شركة نسما وشركاهم للمقاولات",
        "required_codes": [
            {"code": "CR_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "MUQAWIL_CLASS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "ZATCA_TAX", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "VAT_REG", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "GOSI_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "SAUDIZATION_NITAQAT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "CHAMBER_COMMERCE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "COMPANY_PROFILE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "02_Company_Profile"},
            {"code": "PROJECT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "05_Project_References"},
            {"code": "EQUIPMENT_FLEET", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "06_Equipment_and_Manpower"},
            {"code": "AUDITED_FINANCIALS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "07_Financial"},
            {"code": "HSE_POLICY", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "09_HSE"},
            {"code": "QA_QC_MANUAL", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "08_QA_QC"},
            {"code": "ISO_9001", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "10_ISO"},
            {"code": "IKTVA_CERT", "mandatory": False, "level": "OPTIONAL", "section": "11_Local_Content"},
            {"code": "CLIENT_REFERENCES", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "12_Client_References"},
        ],
        "notes": "Nesma requires verified SCA classification, audited financials, and equipment fleet with valid registration.",
    },
    "AL_BAWANI": {
        "profile_name_en": "Al Bawani Holding Subcontractor Dossier",
        "profile_name_ar": "ملف تأهيل مقاولي الباطن - البواني القابضة",
        "contractor_id": "contractor-albawani",
        "contractor_name": "Al Bawani Holding",
        "contractor_name_ar": "شركة البواني القابضة",
        "required_codes": [
            {"code": "CR_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "MUQAWIL_CLASS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "ZATCA_TAX", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "VAT_REG", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "GOSI_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "SAUDIZATION_NITAQAT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "CHAMBER_COMMERCE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "NATIONAL_ADDRESS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "BANK_FACILITY", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "07_Financial"},
            {"code": "COMPANY_PROFILE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "02_Company_Profile"},
            {"code": "PROJECT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "05_Project_References"},
            {"code": "HSE_POLICY", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "09_HSE"},
            {"code": "QA_QC_MANUAL", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "08_QA_QC"},
            {"code": "ISO_9001", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "10_ISO"},
            {"code": "CLIENT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "12_Client_References"},
        ],
        "notes": "Al Bawani emphasizes bank credit lines, ISO 9001 certification, and direct client recommendation letters.",
    },
    "EL_SEIF": {
        "profile_name_en": "El Seif Engineering Contracting Prequalification",
        "profile_name_ar": "تأهيل السيف مهندسون مقاولون",
        "contractor_id": "contractor-elseif",
        "contractor_name": "El Seif Engineering Contracting",
        "contractor_name_ar": "شركة السيف مهندسون مقاولون",
        "required_codes": [
            {"code": "CR_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "MUQAWIL_CLASS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "ZATCA_TAX", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "VAT_REG", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "GOSI_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "SAUDIZATION_NITAQAT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "AUDITED_FINANCIALS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "07_Financial"},
            {"code": "MANPOWER_LIST", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "06_Equipment_and_Manpower"},
            {"code": "HSE_POLICY", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "09_HSE"},
            {"code": "QA_QC_MANUAL", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "08_QA_QC"},
            {"code": "PROJECT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "05_Project_References"},
            {"code": "ISO_9001", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "10_ISO"},
            {"code": "BANK_FACILITY", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "07_Financial"},
        ],
        "notes": "El Seif focuses heavily on technical staffing CVs, QA/QC plan, and 3-year audited financial stability.",
    },
    "RTCC": {
        "profile_name_en": "Al-Rashid Trading & Contracting (RTCC) Prequalification",
        "profile_name_ar": "تأهيل شركة الرشيد للتجارة والمقاولات",
        "contractor_id": "contractor-rtcc",
        "contractor_name": "Al-Rashid Trading & Contracting Co.",
        "contractor_name_ar": "شركة الرشيد للتجارة والمقاولات",
        "required_codes": [
            {"code": "CR_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "ZATCA_TAX", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "VAT_REG", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "GOSI_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "CHAMBER_COMMERCE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "COMPANY_PROFILE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "02_Company_Profile"},
            {"code": "PROJECT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "05_Project_References"},
            {"code": "EQUIPMENT_FLEET", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "06_Equipment_and_Manpower"},
            {"code": "CLIENT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "12_Client_References"},
        ],
        "notes": "RTCC requires active commercial registration in infrastructure/civil categories and past project handovers.",
    },
    "CCC": {
        "profile_name_en": "Consolidated Contractors Company (CCC) Dossier",
        "profile_name_ar": "ملف تأهيل شركة اتحاد المقاولين (CCC)",
        "contractor_id": "contractor-ccc",
        "contractor_name": "Consolidated Contractors Company",
        "contractor_name_ar": "شركة اتحاد المقاولين",
        "required_codes": [
            {"code": "CR_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "ZATCA_TAX", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "VAT_REG", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "GOSI_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "HSE_POLICY", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "09_HSE"},
            {"code": "QA_QC_MANUAL", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "08_QA_QC"},
            {"code": "ISO_9001", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "10_ISO"},
            {"code": "ISO_45001", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "10_ISO"},
            {"code": "EQUIPMENT_FLEET", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "06_Equipment_and_Manpower"},
            {"code": "MANPOWER_LIST", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "06_Equipment_and_Manpower"},
            {"code": "AUDITED_FINANCIALS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "07_Financial"},
        ],
        "notes": "CCC international standards require strict HSE statistics, ISO 45001, and audited plant equipment registers.",
    },
    "GENERIC_SAUDI": {
        "profile_name_en": "Standard Saudi Main Contractor Prequalification",
        "profile_name_ar": "التأهيل الموحد لمقاولي العموم في المملكة العربية السعودية",
        "contractor_id": "contractor-generic",
        "contractor_name": "General Saudi Main Contractor",
        "contractor_name_ar": "مقاول عام معتمد في المملكة",
        "required_codes": [
            {"code": "CR_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "MUQAWIL_CLASS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "ZATCA_TAX", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "VAT_REG", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "GOSI_CERT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "SAUDIZATION_NITAQAT", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "CHAMBER_COMMERCE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "NATIONAL_ADDRESS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "BANK_IBAN", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "03_Legal_and_Statutory"},
            {"code": "COMPANY_PROFILE", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "02_Company_Profile"},
            {"code": "PROJECT_REFERENCES", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "05_Project_References"},
            {"code": "AUDITED_FINANCIALS", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "07_Financial"},
            {"code": "HSE_POLICY", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "09_HSE"},
            {"code": "QA_QC_MANUAL", "mandatory": True, "level": "REQUIRED_VERIFIED", "section": "08_QA_QC"},
            {"code": "ISO_9001", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "10_ISO"},
            {"code": "CLIENT_REFERENCES", "mandatory": False, "level": "LIKELY_REQUIRED", "section": "12_Client_References"},
        ],
        "notes": "Comprehensive 16-point standard Saudi subcontract prequalification package.",
    },
}

STANDARD_SECTIONS = [
    {"index": "01", "name_en": "Cover & Transmittal Letter", "name_ar": "صفحة الغلاف وخطاب التقديم"},
    {"index": "02", "name_en": "Company Profile & Overview", "name_ar": "الملف التعريفي للشركة"},
    {"index": "03", "name_en": "Legal & Statutory Registrations", "name_ar": "التسجيلات النظامية والقانونية"},
    {"index": "04", "name_en": "Technical Capability & Org Chart", "name_ar": "القدرات الفنية والهيكل التنظيمي"},
    {"index": "05", "name_en": "Project References & Track Record", "name_ar": "سجل المشروعات المرجعية"},
    {"index": "06", "name_en": "Equipment Fleet & Manpower", "name_ar": "أسطول المعدات والكوادر البشرية"},
    {"index": "07", "name_en": "Financial Capability & Audits", "name_ar": "القدرات المالية والقوائم المدققة"},
    {"index": "08", "name_en": "Quality Assurance & QC Plan", "name_ar": "ضمان ومراقبة الجودة (QA/QC)"},
    {"index": "09", "name_en": "HSE Policy & Safety Manual", "name_ar": "دليل وسياسة السلامة والصحة المهنية"},
    {"index": "10", "name_en": "ISO Certifications", "name_ar": "شهادات الآيزو العالمية"},
    {"index": "11", "name_en": "Local Content & IKTVA", "name_ar": "المحتوى المحلي واكتفاء"},
    {"index": "12", "name_en": "Client References & Testimonials", "name_ar": "شهادات الإنجاز وحسن الأداء"},
    {"index": "13", "name_en": "Additional Client Requirements", "name_ar": "متطلبات إضافية خاصة بالعميل"},
]


class PrequalificationDossierService:
    """Service managing smart prequalification dossier assembly."""

    def __init__(self, vault_service: Optional[DocumentVaultService] = None, tenant_id: str = "comp-sa-001"):
        self.tenant_id = tenant_id
        self.vault_service = vault_service or DocumentVaultService(tenant_id=tenant_id)
        self._dossier_store: Dict[str, PrequalificationDossier] = {}

    def get_supported_profiles(self) -> List[Dict[str, Any]]:
        """List all supported contractor prequalification templates."""
        return [
            {
                "profile_key": k,
                "profile_name_en": v["profile_name_en"],
                "profile_name_ar": v["profile_name_ar"],
                "contractor_id": v["contractor_id"],
                "contractor_name": v["contractor_name"],
                "contractor_name_ar": v["contractor_name_ar"],
                "required_count": len(v["required_codes"]),
                "notes": v["notes"],
            }
            for k, v in CONTRACTOR_PROFILES.items()
        ]

    def assemble_dossier(
        self,
        profile_key: str,
        opportunity_id: Optional[str] = None,
        subcontract_package_id: Optional[str] = None,
        registration_id: Optional[str] = None,
        custom_notes: str = "",
    ) -> PrequalificationDossier:
        """Assemble a complete prequalification dossier tailored to a main contractor."""
        profile = CONTRACTOR_PROFILES.get(profile_key)
        if not profile:
            profile = CONTRACTOR_PROFILES["GENERIC_SAUDI"]
            profile_key = "GENERIC_SAUDI"

        contractor_id = profile["contractor_id"]
        dossier_id = f"dossier-{contractor_id}-{self.tenant_id}"

        requirements = profile["required_codes"]
        assembled_docs: List[Dict[str, Any]] = []
        missing_docs: List[Dict[str, Any]] = []
        expired_docs: List[Dict[str, Any]] = []
        unresolved_reasons: List[str] = []

        ready_mandatory = 0
        total_mandatory = 0
        ready_optional = 0
        total_optional = 0

        # Match each requirement against Company Document Vault
        for req in requirements:
            code = req["code"]
            is_mand = req["mandatory"]
            sec = req["section"]
            level = req["level"]

            if is_mand:
                total_mandatory += 1
            else:
                total_optional += 1

            vault_item = self.vault_service.get_document_by_code(code)

            if not vault_item or vault_item.document_status == "MISSING":
                item_info = {
                    "code": code,
                    "name_en": vault_item.name_en if vault_item else code,
                    "name_ar": vault_item.name_ar if vault_item else code,
                    "section": sec,
                    "is_mandatory": is_mand,
                    "requirement_level": level,
                    "match_status": "MISSING",
                    "reason": "Document not uploaded to Company Document Vault.",
                }
                missing_docs.append(item_info)
                if is_mand:
                    unresolved_reasons.append(f"Missing mandatory document: {item_info['name_en']}")

            elif vault_item.document_status == "EXPIRED":
                item_info = {
                    "code": code,
                    "name_en": vault_item.name_en,
                    "name_ar": vault_item.name_ar,
                    "filename": vault_item.filename,
                    "expiry_date": vault_item.expiry_date,
                    "section": sec,
                    "is_mandatory": is_mand,
                    "requirement_level": level,
                    "match_status": "EXPIRED",
                    "reason": f"Document expired on {vault_item.expiry_date[:10]}. Must be renewed.",
                }
                expired_docs.append(item_info)
                if is_mand:
                    unresolved_reasons.append(f"Expired mandatory certificate: {vault_item.name_en} (Expired: {vault_item.expiry_date[:10]})")

            elif vault_item.document_status == "EXPIRING_SOON":
                # Included but flagged as NEEDS_UPDATE
                assembled_docs.append({
                    "code": code,
                    "name_en": vault_item.name_en,
                    "name_ar": vault_item.name_ar,
                    "filename": vault_item.filename,
                    "file_url": vault_item.file_url,
                    "version": vault_item.version,
                    "expiry_date": vault_item.expiry_date,
                    "section": sec,
                    "is_mandatory": is_mand,
                    "requirement_level": level,
                    "match_status": "NEEDS_UPDATE",
                    "reason": f"Expires within 30 days ({vault_item.expiry_date[:10]}). Renewal in progress.",
                })
                if is_mand:
                    ready_mandatory += 1
                else:
                    ready_optional += 1

            else:  # VALID
                assembled_docs.append({
                    "code": code,
                    "name_en": vault_item.name_en,
                    "name_ar": vault_item.name_ar,
                    "filename": vault_item.filename,
                    "file_url": vault_item.file_url,
                    "version": vault_item.version,
                    "expiry_date": vault_item.expiry_date,
                    "section": sec,
                    "is_mandatory": is_mand,
                    "requirement_level": level,
                    "match_status": "READY",
                    "reason": "Verified and valid in Company Document Vault.",
                })
                if is_mand:
                    ready_mandatory += 1
                else:
                    ready_optional += 1

        # Calculate explainable readiness percentage
        # Mandatory items carry 80% total weight, optional carry 20%
        mand_score = (ready_mandatory / total_mandatory * 80.0) if total_mandatory > 0 else 80.0
        opt_score = (ready_optional / total_optional * 20.0) if total_optional > 0 else 20.0
        readiness_pct = round(mand_score + opt_score, 1)

        # Strict rule: If ANY mandatory document is missing or expired, status cannot be READY_FOR_EXPORT or 100%
        if unresolved_reasons:
            status = "DRAFT"
            if readiness_pct >= 100.0:
                readiness_pct = 95.0
        else:
            status = "READY_FOR_EXPORT"

        # Organize by 13 standard sections
        sections_data = []
        for sec in STANDARD_SECTIONS:
            sec_idx = sec["index"]
            sec_prefix = f"{sec_idx}_"
            matched_in_sec = [d for d in assembled_docs if d.get("section", "").startswith(sec_prefix)]
            missing_in_sec = [d for d in missing_docs if d.get("section", "").startswith(sec_prefix)]
            expired_in_sec = [d for d in expired_docs if d.get("section", "").startswith(sec_prefix)]
            sections_data.append({
                "index": sec["index"],
                "name_en": sec["name_en"],
                "name_ar": sec["name_ar"],
                "folder_name": f"{sec['index']}_{sec['name_en'].replace(' ', '_').replace('&', 'and')}",
                "documents": matched_in_sec,
                "missing_documents": missing_in_sec,
                "expired_documents": expired_in_sec,
                "total_items": len(matched_in_sec) + len(missing_in_sec) + len(expired_in_sec),
            })

        # Generate package manifest
        manifest = {
            "dossier_id": dossier_id,
            "generated_at": datetime.utcnow().isoformat(),
            "target_contractor": profile["contractor_name"],
            "target_contractor_ar": profile["contractor_name_ar"],
            "profile_type": profile_key,
            "package_structure": [s["folder_name"] for s in sections_data],
            "total_documents_included": len(assembled_docs),
            "total_documents_missing": len(missing_docs),
            "total_documents_expired": len(expired_docs),
            "readiness_percentage": readiness_pct,
            "can_export_zip": len(unresolved_reasons) == 0,
            "unresolved_mandatory_reasons": unresolved_reasons,
            "submission_cover_sheet": {
                "contractor_legal_name": "Saudi Advanced Construction Co. (SME)",
                "contractor_legal_name_ar": "شركة البناء المتقدم السعودية المحدودة",
                "cr_number": "7001892831",
                "national_address": "Al Malaz, Riyadh, Kingdom of Saudi Arabia",
                "contact_person": "Eng. Tariq Al-Ghamdi (Tendering Director)",
                "contact_email": "tendering@saudi-advanced.com",
                "contact_phone": "+966 11 489 2000",
                "transmittal_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "intended_client": profile["contractor_name"],
                "intended_scope": "Civil, Electromechanical & Infrastructure Subcontract Works",
            },
        }

        breakdown = {
            "ready_count": len(assembled_docs),
            "missing_count": len(missing_docs),
            "expired_count": len(expired_docs),
            "total_required": len(requirements),
            "mandatory_count": total_mandatory,
            "ready_mandatory_count": ready_mandatory,
            "unresolved_mandatory_reasons": unresolved_reasons,
        }

        dossier = PrequalificationDossier(
            id=dossier_id,
            contractor_id=contractor_id,
            contractor_name=profile["contractor_name"],
            contractor_name_ar=profile["contractor_name_ar"],
            profile_type=profile_key,
            tenant_id=self.tenant_id,
            registration_id=registration_id,
            opportunity_id=opportunity_id,
            subcontract_package_id=subcontract_package_id,
            status=status,
            readiness_percentage=readiness_pct,
            readiness_breakdown=breakdown,
            sections=sections_data,
            documents=assembled_docs,
            missing_documents=missing_docs,
            expired_documents=expired_docs,
            package_manifest=manifest,
            notes=custom_notes or profile["notes"],
        )

        self._dossier_store[dossier.id] = dossier
        return dossier

    def get_dossier(self, dossier_id: str) -> Optional[PrequalificationDossier]:
        """Retrieve a compiled dossier by ID."""
        return self._dossier_store.get(dossier_id)

    def list_dossiers(self) -> List[PrequalificationDossier]:
        """List all compiled dossiers."""
        return list(self._dossier_store.values())
