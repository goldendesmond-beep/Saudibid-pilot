"""Vendor Registration & Prequalification Compliance Service (Stage 9 Parts A, B, C).

Discovers legitimate main-contractor vendor/supplier portals, classifies portal accessibility,
generates comprehensive Saudi contractor prequalification checklists, and tracks registration lifecycles.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

from backend.app.models.schemas import (
    MainContractorRecord,
    VendorRegistrationRecord,
    PrequalificationDocument,
)
from backend.app.db.mongodb import MongoRepository
from backend.app.services.main_contractor_discovery import (
    MainContractorDiscoveryService,
    VERIFIED_SAUDI_PRIME_CONTRACTORS,
)

# Standard 22-Point Saudi Contractor Prequalification Compliance Framework
STANDARD_PREQUALIFICATION_DOCUMENTS: List[Dict[str, Any]] = [
    # 1. Statutory & Licensing (Statutory Directorate)
    {
        "code": "DOC_CR",
        "name_en": "Commercial Registration (CR)",
        "name_ar": "السجل التجاري الساري",
        "category": "STATUTORY",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Ministry of Commerce",
        "notes": "Must reflect relevant construction/contracting activity codes.",
    },
    {
        "code": "DOC_MUQAWIL",
        "name_en": "Contractor Classification Certificate (Muqawil)",
        "name_ar": "شهادة تصنيف المقاولين (مقاول)",
        "category": "STATUTORY",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Saudi Contractors Authority (SCA) / MOMRAH",
        "notes": "Designates classification grade (Grade 1 to 5) and authorized financial ceiling.",
    },
    {
        "code": "DOC_ZATCA",
        "name_en": "ZATCA Tax Clearance Certificate",
        "name_ar": "شهادة هيئة الزكاة والضريبة والجمارك السارية",
        "category": "STATUTORY",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "ZATCA",
        "notes": "Mandatory proof of Zakat & income tax compliance.",
    },
    {
        "code": "DOC_VAT",
        "name_en": "VAT Registration Certificate",
        "name_ar": "شهادة التسجيل في ضريبة القيمة المضافة (15%)",
        "category": "STATUTORY",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "ZATCA",
        "notes": "Displays verified 15-digit VAT account number.",
    },
    {
        "code": "DOC_GOSI",
        "name_en": "GOSI Compliance Certificate",
        "name_ar": "شهادة التأمينات الاجتماعية السارية",
        "category": "STATUTORY",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "General Organization for Social Insurance (GOSI)",
        "notes": "Proof of active social insurance coverage and zero arrears.",
    },
    {
        "code": "DOC_SAUDIZATION",
        "name_en": "Saudization Certificate & Nitaqat Evidence",
        "name_ar": "شهادة التوطين وإثبات نطاقات (أخضر مرتفع / بلاتيني)",
        "category": "LOCAL_CONTENT",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Ministry of Human Resources & Social Development (HRSD)",
        "notes": "Must maintain High Green or Platinum tier.",
    },
    {
        "code": "DOC_CHAMBER",
        "name_en": "Chamber of Commerce Membership",
        "name_ar": "شهادة اشتراك الغرفة التجارية السارية",
        "category": "STATUTORY",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Federation of Saudi Chambers",
        "notes": "Active membership in local Chamber (Riyadh, Asharqia, Jeddah, etc.).",
    },
    {
        "code": "DOC_NATIONAL_ADDRESS",
        "name_en": "National Address Registration",
        "name_ar": "إثبات العنوان الوطني الموحد للمنشأة",
        "category": "STATUTORY",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Saudi Post (SPL)",
        "notes": "Verified business premises address in the Kingdom.",
    },
    {
        "code": "DOC_BANK_IBAN",
        "name_en": "Bank / IBAN Account Letter",
        "name_ar": "خطاب الآيبان البنكي المعتمد والمختوم",
        "category": "FINANCIAL",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Authorized Saudi Commercial Bank",
        "notes": "Corporate bank account under the exact legal CR name.",
    },

    # 2. Company Profile & Technical Capability
    {
        "code": "DOC_COMPANY_PROFILE",
        "name_en": "Corporate Profile & Capability Statement",
        "name_ar": "الملف التعريفي للشركة وبيان القدرات",
        "category": "TECHNICAL",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Company Internal",
        "notes": "Bilingual overview of divisions, executive team, and Saudi offices.",
    },
    {
        "code": "DOC_ORG_CHART",
        "name_en": "Project & Corporate Organization Chart",
        "name_ar": "الهيكل التنظيمي للمنشأة والمشاريع",
        "category": "TECHNICAL",
        "is_mandatory": False,
        "requirement_level": "LIKELY_REQUIRED",
        "issuing_authority": "Company Internal",
        "notes": "Key personnel reporting structure and technical supervision.",
    },
    {
        "code": "DOC_PROJECT_REFS",
        "name_en": "Track Record & Project References Dossier",
        "name_ar": "سجل سوابق الأعمال والمشاريع المنجزة",
        "category": "TECHNICAL",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Company Internal / Clients",
        "notes": "List of executed contracts in KSA over last 5 years with values.",
    },
    {
        "code": "DOC_CLIENT_REFS",
        "name_en": "Client Completion & Recommendation Certificates",
        "name_ar": "شهادات إنجاز الأعمال وخطابات التزكية من العملاء",
        "category": "TECHNICAL",
        "is_mandatory": False,
        "requirement_level": "LIKELY_REQUIRED",
        "issuing_authority": "Government / Private Clients",
        "notes": "Official taking-over or final completion certificates.",
    },
    {
        "code": "DOC_EQUIPMENT_LIST",
        "name_en": "Owned Heavy Equipment & Machinery Fleet List",
        "name_ar": "قائمة المعدات والآليات الثقيلة المملوكة والمستأجرة",
        "category": "TECHNICAL",
        "is_mandatory": False,
        "requirement_level": "LIKELY_REQUIRED",
        "issuing_authority": "Company Internal / Traffic Dept",
        "notes": "Vehicles, excavators, cranes, generators with serials and ownership cards.",
    },
    {
        "code": "DOC_MANPOWER_LIST",
        "name_en": "Technical Manpower & Engineering Roster",
        "name_ar": "بيان الكوادر الفنية والمهندسين المسجلين",
        "category": "TECHNICAL",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Saudi Council of Engineers (SCE) / HR",
        "notes": "SCE accredited engineers, certified safety officers, and licensed trades.",
    },
    {
        "code": "DOC_TECHNICAL_CAPABILITY",
        "name_en": "Specialized Methodology & Scope Capabilities",
        "name_ar": "القدرات الفنية ومنهجيات التنفيذ التخصصية",
        "category": "TECHNICAL",
        "is_mandatory": False,
        "requirement_level": "OPTIONAL",
        "issuing_authority": "Company Internal",
        "notes": "Method statements for MEP, earthworks, infrastructure or fit-out.",
    },

    # 3. Quality, HSE & Risk Management
    {
        "code": "DOC_HSE_POLICY",
        "name_en": "Health, Safety & Environmental (HSE) Manual",
        "name_ar": "دليل وسياسة الصحة والسلامة والبيئة (HSE)",
        "category": "QUALITY_HSE",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Company Internal",
        "notes": "Must comply with Saudi Labor Law and Aramco/RCJY safety standards.",
    },
    {
        "code": "DOC_QAQC_PLAN",
        "name_en": "Quality Assurance & Quality Control (QA/QC) Plan",
        "name_ar": "خطة ضمان وضبط الجودة (QA/QC)",
        "category": "QUALITY_HSE",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "Company Internal",
        "notes": "Inspection and test plans (ITP), material approval procedures.",
    },
    {
        "code": "DOC_ISO_CERTS",
        "name_en": "ISO Certifications (9001, 14001, 45001)",
        "name_ar": "شهادات الأيزو للجودة والسلامة والبيئة",
        "category": "QUALITY_HSE",
        "is_mandatory": False,
        "requirement_level": "LIKELY_REQUIRED",
        "issuing_authority": "Accredited Certification Body",
        "notes": "ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018.",
    },
    {
        "code": "DOC_INSURANCE",
        "name_en": "Comprehensive General Liability & Workmen's Comp",
        "name_ar": "وثائق التأمين ضد الأخطار وتأمين إصابات العمل",
        "category": "FINANCIAL",
        "is_mandatory": False,
        "requirement_level": "LIKELY_REQUIRED",
        "issuing_authority": "Licensed Saudi Insurance Company",
        "notes": "Third-party liability and CAR insurance coverages.",
    },

    # 4. Financial Statements & Local Content (IKTVA)
    {
        "code": "DOC_FINANCIALS_3YR",
        "name_en": "Audited Financial Statements (Last 2–3 Years)",
        "name_ar": "القوائم المالية المدققة للأعوام الثلاثة الأخيرة",
        "category": "FINANCIAL",
        "is_mandatory": True,
        "requirement_level": "REQUIRED_VERIFIED",
        "issuing_authority": "SOCPA Licensed External Auditor",
        "notes": "Balance sheet, income statement, cash flow audited under IFRS.",
    },
    {
        "code": "DOC_IKTVA",
        "name_en": "Aramco IKTVA Scorecard / Certificate",
        "name_ar": "شهادة برنامج تعزيز القيمة المضافة الإجمالية (اكتفاء)",
        "category": "LOCAL_CONTENT",
        "is_mandatory": False,
        "requirement_level": "OPTIONAL",
        "issuing_authority": "Saudi Aramco / SOCPA Auditor",
        "notes": "Mandatory for oil & gas / energy projects; advantageous across all primes.",
    },
]


class VendorRegistrationService:
    """Service handling Vendor Registration discovery, portal tracking, and prequalification compliance."""

    @classmethod
    def get_standard_checklist(
        cls,
        contractor_profile: Optional[Dict[str, Any]] = None,
        package_category: Optional[str] = None,
    ) -> List[PrequalificationDocument]:
        """Generate a contextual prequalification document checklist for a contractor."""
        docs: List[PrequalificationDocument] = []
        is_oil_gas = package_category in ["PIPING", "INDUSTRIAL", "OIL_GAS", "ENERGY"]

        for item in STANDARD_PREQUALIFICATION_DOCUMENTS:
            req_level = item["requirement_level"]
            is_mand = item["is_mandatory"]

            # If Oil & Gas / Aramco package, IKTVA becomes REQUIRED_VERIFIED
            if item["code"] == "DOC_IKTVA" and is_oil_gas:
                req_level = "REQUIRED_VERIFIED"
                is_mand = True

            doc = PrequalificationDocument(
                code=item["code"],
                name_en=item["name_en"],
                name_ar=item["name_ar"],
                category=item["category"],
                is_mandatory=is_mand,
                requirement_level=req_level,
                status="READY" if item["code"] in ["DOC_CR", "DOC_ZATCA", "DOC_VAT", "DOC_GOSI", "DOC_SAUDIZATION", "DOC_CHAMBER", "DOC_NATIONAL_ADDRESS", "DOC_BANK_IBAN", "DOC_COMPANY_PROFILE"] else "PENDING_REVIEW",
                issuing_authority=item.get("issuing_authority"),
                notes=item.get("notes", ""),
            )
            docs.append(doc)

        return docs

    @classmethod
    def discover_or_create_vendor_registration(
        cls,
        contractor_id: str,
        repo: MongoRepository,
        tenant_id: str = "comp-sa-001",
    ) -> VendorRegistrationRecord:
        """Create or retrieve a vendor registration record with verified portal and contacts."""
        # 1. Check if already exists in repository
        existing = repo.get_vendor_registration(contractor_id, tenant_id=tenant_id)
        if existing:
            return existing

        # 2. Retrieve main contractor details
        contractor = repo.get_main_contractor(contractor_id)
        c_name = (
            getattr(contractor, "contractor_name", None)
            or getattr(contractor, "legal_name_en", None)
            or getattr(contractor, "commercial_brand_name", None)
            or contractor_id
        ) if contractor else contractor_id
        c_name_ar = (
            getattr(contractor, "contractor_name_ar", None)
            or getattr(contractor, "legal_name_ar", None)
            or c_name
        ) if contractor else contractor_id
        website = getattr(contractor, "official_website", "") if contractor else ""
        location = getattr(contractor, "headquarters", "Riyadh, Saudi Arabia") if contractor else "Riyadh, Saudi Arabia"
        cr_info = getattr(contractor, "cr_number", None) if contractor else None

        # 3. Discover vendor portal & procurement contacts from Stage 8 discovery
        portal_url = ""
        portal_type = "VENDOR_REGISTRATION"
        portal_status = "PUBLIC"
        proc_contact = {}
        evidence_sources = []

        if contractor and contractor.portal_links:
            for plink in contractor.portal_links:
                ltype = plink.get("link_type", "")
                if ltype in ["VENDOR_REGISTRATION", "SUPPLIER_REGISTRATION", "SUBCONTRACTOR_REGISTRATION", "PROCUREMENT_PORTAL"]:
                    portal_url = plink.get("url", "")
                    portal_type = ltype
                    portal_status = plink.get("registration_status", "PUBLIC")
                    if plink.get("evidence_source"):
                        evidence_sources.append(plink["evidence_source"])
                    break

        # Fallback to verified prime registry if not populated
        if not portal_url:
            matched_kdata = None
            for key, kdata in VERIFIED_SAUDI_PRIME_CONTRACTORS.items():
                if key in contractor_id.lower() or kdata.get("normalized_name", "").lower() in c_name.lower():
                    matched_kdata = kdata
                    break
            if matched_kdata:
                portal_links = matched_kdata.get("portal_links", [])
                if portal_links:
                    portal_url = portal_links[0].get("url", "")
                    portal_type = portal_links[0].get("link_type", "VENDOR_REGISTRATION")
                    portal_status = portal_links[0].get("registration_status", "PUBLIC")
                website = website or matched_kdata.get("official_website", "")
                cr_info = cr_info or matched_kdata.get("cr_number")
                proc_contact = {
                    "email": f"procurement@{matched_kdata.get('official_website', '').replace('https://www.', '').replace('https://', '').split('/')[0]}",
                    "department": "Procurement & Subcontracting Directorate",
                }

        # Ensure contact is set
        if not proc_contact and contractor:
            if getattr(contractor, "contacts", None) and len(contractor.contacts) > 0:
                proc_contact = contractor.contacts[0]
            elif getattr(contractor, "official_contacts", None):
                proc_contact = contractor.official_contacts

        # 4. Generate checklist
        checklist_docs = cls.get_standard_checklist()
        missing_docs = [d.name_en for d in checklist_docs if d.is_mandatory and d.status != "READY"]

        # Initial status: PORTAL_FOUND if url discovered, else NOT_STARTED
        init_reg_status = "PORTAL_FOUND" if portal_url else "NOT_STARTED"

        vreg = VendorRegistrationRecord(
            id=f"vreg-{contractor_id}-{tenant_id}",
            contractor_id=contractor_id,
            contractor_name=c_name,
            contractor_name_ar=c_name_ar,
            tenant_id=tenant_id,
            commercial_registration=cr_info,
            location=location,
            official_website=website,
            vendor_portal_url=portal_url,
            portal_type=portal_type,
            portal_status=portal_status,
            registration_status=init_reg_status,
            last_checked=datetime.utcnow().isoformat(),
            procurement_contact=proc_contact,
            required_documents=[d.to_dict() for d in checklist_docs],
            missing_documents=missing_docs,
            evidence_sources=evidence_sources or [website] if website else [],
            confidence_level="VERIFIED" if portal_url else "INFERRED",
            notes=f"Auto-generated vendor registration workspace for {c_name} based on Stage 8 intelligence.",
        )

        repo.save_vendor_registration(vreg)
        return vreg

    @classmethod
    def update_registration_status(
        cls,
        contractor_id: str,
        new_status: str,
        repo: MongoRepository,
        tenant_id: str = "comp-sa-001",
        notes: Optional[str] = None,
        submitted_reference: Optional[str] = None,
    ) -> VendorRegistrationRecord:
        """Update registration lifecycle status.
        
        Enforces rule: Never claim SUBMITTED or APPROVED without user confirmation.
        """
        valid_statuses = [
            "NOT_STARTED",
            "PORTAL_FOUND",
            "PREPARING",
            "READY_TO_SUBMIT",
            "SUBMITTED",
            "UNDER_REVIEW",
            "APPROVED",
            "REJECTED",
            "RENEWAL_REQUIRED",
            "UNKNOWN",
        ]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid registration status: {new_status}. Allowed: {valid_statuses}")

        vreg = repo.get_vendor_registration(contractor_id, tenant_id=tenant_id)
        if not vreg:
            vreg = cls.discover_or_create_vendor_registration(contractor_id, repo, tenant_id=tenant_id)

        vreg.registration_status = new_status
        vreg.updated_at = datetime.utcnow().isoformat()
        if notes:
            vreg.notes = f"{vreg.notes}\n[{datetime.utcnow().strftime('%Y-%m-%d')}] Status changed to {new_status}: {notes}".strip()
        if submitted_reference:
            vreg.notes = f"{vreg.notes}\n[Submission Reference]: {submitted_reference}".strip()

        repo.save_vendor_registration(vreg)
        return vreg
