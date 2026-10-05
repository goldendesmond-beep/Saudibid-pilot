"""Company Document Vault Service (Stage 10 Part B).

Manages reusable company compliance documents, corporate registrations, technical qualifications,
financial audits, HSE/ISO certifications, and IKTVA records with strict expiry tracking.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import CompanyDocumentVaultItem

# Standard master document templates for Saudi contractors
STANDARD_VAULT_TEMPLATES = [
    # Statutory
    {
        "code": "CR_CERT",
        "name_en": "Commercial Registration Certificate (CR)",
        "name_ar": "السجل التجاري",
        "category": "STATUTORY",
        "filename": "CR_7001892831_Active.pdf",
        "issuing_authority": "Ministry of Commerce (MOC)",
        "issuing_authority_ar": "وزارة التجارة",
        "version": "2026.1",
        "issue_date": "2024-01-15T00:00:00Z",
        "expiry_date": "2027-01-14T00:00:00Z",
        "document_status": "VALID",
        "notes": "Verified active registration under Saudi commercial registry.",
    },
    {
        "code": "MUQAWIL_CLASS",
        "name_en": "Muqawil / SCA Classification Grade 2",
        "name_ar": "شهادة تصنيف المقاولين - الدرجة الثانية",
        "category": "STATUTORY",
        "filename": "Muqawil_Classification_Grade2.pdf",
        "issuing_authority": "Saudi Contractors Authority (SCA)",
        "issuing_authority_ar": "الهيئة السعودية للمقاولين",
        "version": "2025.2",
        "issue_date": "2024-05-10T00:00:00Z",
        "expiry_date": "2026-11-20T00:00:00Z",
        "document_status": "VALID",
        "notes": "Grade 2 Civil & Electromechanical Building Works classification.",
    },
    {
        "code": "ZATCA_TAX",
        "name_en": "ZATCA Tax Clearance Certificate",
        "name_ar": "شهادة الزكاة وضريبة الدخل",
        "category": "STATUTORY",
        "filename": "ZATCA_Tax_Clearance_1446.pdf",
        "issuing_authority": "ZATCA",
        "issuing_authority_ar": "هيئة الزكاة والضريبة والجمارك",
        "version": "1446-H",
        "issue_date": "2024-04-01T00:00:00Z",
        "expiry_date": "2025-04-30T00:00:00Z",
        "document_status": "EXPIRED",  # Intentionally past date to test strict expiry rejection
        "notes": "Zakat compliance certificate for fiscal year 1445. RENEWAL REQUIRED.",
    },
    {
        "code": "VAT_REG",
        "name_en": "Value Added Tax (VAT) Registration",
        "name_ar": "شهادة التسجيل في ضريبة القيمة المضافة",
        "category": "STATUTORY",
        "filename": "VAT_Registration_Certificate.pdf",
        "issuing_authority": "ZATCA",
        "issuing_authority_ar": "هيئة الزكاة والضريبة والجمارك",
        "version": "1.0",
        "issue_date": "2020-01-01T00:00:00Z",
        "expiry_date": None,
        "document_status": "VALID",
        "notes": "Permanent standard 15% VAT registration number.",
    },
    {
        "code": "GOSI_CERT",
        "name_en": "GOSI Compliance Certificate",
        "name_ar": "شهادة التأمينات الاجتماعية (GOSI)",
        "category": "STATUTORY",
        "filename": "GOSI_Compliance_Cert_Q3_2026.pdf",
        "issuing_authority": "General Organization for Social Insurance",
        "issuing_authority_ar": "المؤسسة العامة للتأمينات الاجتماعية",
        "version": "2026.3",
        "issue_date": "2026-08-01T00:00:00Z",
        "expiry_date": "2026-10-25T00:00:00Z",  # Within 20 days -> EXPIRING_SOON
        "document_status": "EXPIRING_SOON",
        "notes": "Covers all registered labor and engineering staff.",
    },
    {
        "code": "SAUDIZATION_NITAQAT",
        "name_en": "Saudization (Nitaqat High Green) Certificate",
        "name_ar": "شهادة السعودة (نطاقات - أخضر مرتفع)",
        "category": "STATUTORY",
        "filename": "Nitaqat_High_Green_Evidence.pdf",
        "issuing_authority": "Ministry of Human Resources (MHRSD)",
        "issuing_authority_ar": "وزارة الموارد البشرية والتنمية الاجتماعية",
        "version": "2026.2",
        "issue_date": "2026-06-01T00:00:00Z",
        "expiry_date": "2027-06-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Maintained 38% Saudization ratio in High Green tier.",
    },
    {
        "code": "CHAMBER_COMMERCE",
        "name_en": "Chamber of Commerce Membership",
        "name_ar": "اشتراك الغرفة التجارية",
        "category": "STATUTORY",
        "filename": "Riyadh_Chamber_Membership_2026.pdf",
        "issuing_authority": "Riyadh Chamber",
        "issuing_authority_ar": "غرفة الرياض",
        "version": "2026",
        "issue_date": "2026-01-01T00:00:00Z",
        "expiry_date": "2026-12-31T00:00:00Z",
        "document_status": "VALID",
        "notes": "First Class Chamber Membership #289100.",
    },
    {
        "code": "NATIONAL_ADDRESS",
        "name_en": "Saudi National Address Proof",
        "name_ar": "العنوان الوطني المعتمد",
        "category": "STATUTORY",
        "filename": "National_Address_SPL_Certificate.pdf",
        "issuing_authority": "Saudi Post (SPL)",
        "issuing_authority_ar": "البريد السعودي - سبل",
        "version": "2025.1",
        "issue_date": "2024-03-01T00:00:00Z",
        "expiry_date": "2027-03-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Registered headquarters: Al Malaz District, Riyadh.",
    },
    {
        "code": "BANK_IBAN",
        "name_en": "Bank Account & IBAN Attestation Letter",
        "name_ar": "شهادة الحساب البنكي والآيبان المعتمد",
        "category": "STATUTORY",
        "filename": "Alinma_Bank_IBAN_Attestation.pdf",
        "issuing_authority": "Alinma Bank",
        "issuing_authority_ar": "مصرف الإنماء",
        "version": "2025",
        "issue_date": "2025-01-10T00:00:00Z",
        "expiry_date": None,
        "document_status": "VALID",
        "notes": "Verified SAR corporate settlement account.",
    },

    # Technical
    {
        "code": "COMPANY_PROFILE",
        "name_en": "Corporate Profile & Capability Statement",
        "name_ar": "الملف التعريفي للشركة ونطاق الأعمال",
        "category": "TECHNICAL",
        "filename": "SaudiSME_Corporate_Profile_2026.pdf",
        "issuing_authority": "Contractor Executive Office",
        "issuing_authority_ar": "مكتب الإدارة التنفيذية",
        "version": "2026.2",
        "issue_date": "2026-01-01T00:00:00Z",
        "expiry_date": "2027-01-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Bilingual Arab/English detailed capability presentation.",
    },
    {
        "code": "ORG_CHART",
        "name_en": "Executive Organization Chart & Governance",
        "name_ar": "الهيكل التنظيمي المعتمد للشركة",
        "category": "TECHNICAL",
        "filename": "Corporate_Org_Chart_Signed.pdf",
        "issuing_authority": "HR Directorate",
        "issuing_authority_ar": "إدارة الموارد البشرية",
        "version": "Rev 4",
        "issue_date": "2026-01-15T00:00:00Z",
        "expiry_date": "2027-01-15T00:00:00Z",
        "document_status": "VALID",
        "notes": "Details executive management, project managers, and QA/HSE teams.",
    },
    {
        "code": "PROJECT_REFERENCES",
        "name_en": "Completed & Ongoing Projects Track Record",
        "name_ar": "سجل المشروعات المنفذة وقيد التنفيذ",
        "category": "TECHNICAL",
        "filename": "Completed_Projects_Track_Record_2022_2026.pdf",
        "issuing_authority": "PMO Directorate",
        "issuing_authority_ar": "إدارة المشروعات",
        "version": "2026.1",
        "issue_date": "2026-02-01T00:00:00Z",
        "expiry_date": "2027-02-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Includes 14 completed MEP and civil projects totaling 185M SAR.",
    },
    {
        "code": "EQUIPMENT_FLEET",
        "name_en": "Heavy Machinery & Equipment Fleet List",
        "name_ar": "قائمة الآليات والمعدات المملوكة والمستأجرة",
        "category": "TECHNICAL",
        "filename": "Equipment_Fleet_Register_With_Istemarah.pdf",
        "issuing_authority": "Plant & Fleet Directorate",
        "issuing_authority_ar": "إدارة الحركة والمعدات",
        "version": "2026.2",
        "issue_date": "2026-03-01T00:00:00Z",
        "expiry_date": "2027-03-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Lists excavators, cranes, generators with valid registration cards.",
    },
    {
        "code": "MANPOWER_LIST",
        "name_en": "Key Personnel & Technical Manpower CVs",
        "name_ar": "قائمة الكوادر الفنية وسير المهندسين الذاتية",
        "category": "TECHNICAL",
        "filename": "Key_Engineers_CVs_SCE_Licensed.pdf",
        "issuing_authority": "Technical Office",
        "issuing_authority_ar": "المكتب الفني",
        "version": "2026.1",
        "issue_date": "2026-01-01T00:00:00Z",
        "expiry_date": "2027-01-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Includes 8 SCE-accredited senior civil and MEP engineers.",
    },
    {
        "code": "CLIENT_REFERENCES",
        "name_en": "Client Completion & Recommendation Letters",
        "name_ar": "شهادات الإنجاز وحسن الأداء من العملاء",
        "category": "TECHNICAL",
        "filename": "Client_Handover_Certificates_Bundle.pdf",
        "issuing_authority": "Past Project Owners / Main Contractors",
        "issuing_authority_ar": "ملاك المشاريع ومقاولو العموم",
        "version": "2025",
        "issue_date": "2025-11-01T00:00:00Z",
        "expiry_date": None,
        "document_status": "VALID",
        "notes": "5 signed performance certificates from Ministry of Health & private developers.",
    },

    # Financial
    {
        "code": "AUDITED_FINANCIALS",
        "name_en": "Audited Financial Statements (Last 3 Years)",
        "name_ar": "القوائم المالية المدققة للسنوات الثلاث الأخيرة",
        "category": "FINANCIAL",
        "filename": "Audited_Financials_2023_2024_2025.pdf",
        "issuing_authority": "Licensed SOCPA Chartered Accountant",
        "issuing_authority_ar": "محاسب قانوني معتمد (سوكبا)",
        "version": "FY2025",
        "issue_date": "2026-03-15T00:00:00Z",
        "expiry_date": "2027-03-31T00:00:00Z",
        "document_status": "VALID",
        "notes": "Clean audit opinion, positive EBITDA, certified via Qawaem portal.",
    },
    {
        "code": "BANK_FACILITY",
        "name_en": "Bank Credit Facility & Performance Bond Letter",
        "name_ar": "خطاب التسهيلات البنكية والضمانات الابتدائية",
        "category": "FINANCIAL",
        "filename": "Bank_Facilities_and_Credit_Line.pdf",
        "issuing_authority": "Alinma Bank Corporate Banking",
        "issuing_authority_ar": "مصرف الإنماء - إدارة الشركات",
        "version": "2026",
        "issue_date": "2026-02-01T00:00:00Z",
        "expiry_date": "2027-02-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Credit line up to 25,000,000 SAR for project bonding and advance guarantees.",
    },

    # Quality & HSE
    {
        "code": "HSE_POLICY",
        "name_en": "Health, Safety & Environment (HSE) Manual",
        "name_ar": "دليل وسياسة السلامة والصحة المهنية والبيئة",
        "category": "QUALITY_HSE",
        "filename": "Corporate_HSE_Plan_and_Manual_2026.pdf",
        "issuing_authority": "HSE Directorate",
        "issuing_authority_ar": "إدارة السلامة والصحة المهنية",
        "version": "Rev 5",
        "issue_date": "2026-01-10T00:00:00Z",
        "expiry_date": "2027-01-10T00:00:00Z",
        "document_status": "VALID",
        "notes": "Includes Zero Incident objective, hazard identification, and emergency response.",
    },
    {
        "code": "QA_QC_MANUAL",
        "name_en": "Quality Assurance & Quality Control (QA/QC) Plan",
        "name_ar": "دليل وخطة ضمان ومراقبة الجودة (QA/QC)",
        "category": "QUALITY_HSE",
        "filename": "QA_QC_Manual_and_ITP_Templates.pdf",
        "issuing_authority": "Quality Assurance Directorate",
        "issuing_authority_ar": "إدارة تأكيد الجودة",
        "version": "Rev 3",
        "issue_date": "2026-01-10T00:00:00Z",
        "expiry_date": "2027-01-10T00:00:00Z",
        "document_status": "VALID",
        "notes": "Includes Inspection & Test Plans (ITP) for civil and electromechanical works.",
    },
    {
        "code": "ISO_9001",
        "name_en": "ISO 9001:2015 Quality Management System",
        "name_ar": "شهادة الآيزو 9001 لنظم إدارة الجودة",
        "category": "QUALITY_HSE",
        "filename": "ISO_9001_2015_Certificate.pdf",
        "issuing_authority": "Bureau Veritas / IAF Accredited",
        "issuing_authority_ar": "بيرو فيريتاس",
        "version": "QMS-2024",
        "issue_date": "2024-06-01T00:00:00Z",
        "expiry_date": "2027-05-31T00:00:00Z",
        "document_status": "VALID",
        "notes": "Accredited scope: Construction of buildings and electromechanical works.",
    },
    {
        "code": "ISO_14001",
        "name_en": "ISO 14001:2015 Environmental Management System",
        "name_ar": "شهادة الآيزو 14001 للإدارة البيئية",
        "category": "QUALITY_HSE",
        "filename": "ISO_14001_2015_Certificate.pdf",
        "issuing_authority": "Bureau Veritas / IAF Accredited",
        "issuing_authority_ar": "بيرو فيريتاس",
        "version": "EMS-2024",
        "issue_date": "2024-06-01T00:00:00Z",
        "expiry_date": "2027-05-31T00:00:00Z",
        "document_status": "VALID",
        "notes": "Environmental compliance certification.",
    },
    {
        "code": "ISO_45001",
        "name_en": "ISO 45001:2018 Occupational Health & Safety",
        "name_ar": "شهادة الآيزو 45001 للسلامة والصحة المهنية",
        "category": "QUALITY_HSE",
        "filename": "ISO_45001_2018_Certificate.pdf",
        "issuing_authority": "Bureau Veritas / IAF Accredited",
        "issuing_authority_ar": "بيرو فيريتاس",
        "version": "OHSMS-2024",
        "issue_date": "2024-06-01T00:00:00Z",
        "expiry_date": "2027-05-31T00:00:00Z",
        "document_status": "VALID",
        "notes": "Occupational health and safety management certification.",
    },

    # Local Content
    {
        "code": "IKTVA_CERT",
        "name_en": "Saudi Aramco IKTVA Scorecard / Certificate",
        "name_ar": "شهادة برنامج تعزيز القيمة المضافة الإجمالية (اكتفاء)",
        "category": "LOCAL_CONTENT",
        "filename": "IKTVA_Scorecard_Aramco_2025.pdf",
        "issuing_authority": "Saudi Aramco Local Content Directorate",
        "issuing_authority_ar": "أرامكو السعودية - إدارة المحتوى المحلي",
        "version": "2025",
        "issue_date": "2025-02-01T00:00:00Z",
        "expiry_date": "2027-02-01T00:00:00Z",
        "document_status": "VALID",
        "notes": "Verified 54% audited IKTVA local content score.",
    },
]


class DocumentVaultService:
    """Service managing the master company document vault."""

    def __init__(self, tenant_id: str = "comp-sa-001"):
        self.tenant_id = tenant_id
        self._vault_store: Dict[str, CompanyDocumentVaultItem] = {}
        self._seed_default_vault()

    def _seed_default_vault(self) -> None:
        """Seed initial realistic vault records for the contractor."""
        for t in STANDARD_VAULT_TEMPLATES:
            item_id = f"vault-{t['code'].lower()}-{self.tenant_id}"
            item = CompanyDocumentVaultItem(
                id=item_id,
                code=t["code"],
                name_en=t["name_en"],
                name_ar=t["name_ar"],
                category=t["category"],
                tenant_id=self.tenant_id,
                filename=t["filename"],
                file_url=f"/vault-files/{t['filename']}",
                version=t["version"],
                issue_date=t["issue_date"],
                expiry_date=t["expiry_date"],
                issuing_authority=t["issuing_authority"],
                issuing_authority_ar=t["issuing_authority_ar"],
                document_status=t["document_status"],
                verification_status="VERIFIED",
                notes=t["notes"],
            )
            self._vault_store[item.id] = item

    def get_all_documents(self, category: Optional[str] = None) -> List[CompanyDocumentVaultItem]:
        """List all vault items, optionally filtered by category."""
        items = list(self._vault_store.values())
        if category and category != "ALL":
            items = [i for i in items if i.category == category]
        return items

    def get_document_by_code(self, code: str) -> Optional[CompanyDocumentVaultItem]:
        """Get document by its standardized code."""
        for item in self._vault_store.values():
            if item.code.upper() == code.upper():
                return item
        return None

    def get_document_by_id(self, item_id: str) -> Optional[CompanyDocumentVaultItem]:
        """Get document by its primary ID."""
        return self._vault_store.get(item_id)

    def update_document(
        self,
        item_id: str,
        filename: Optional[str] = None,
        expiry_date: Optional[str] = None,
        version: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> CompanyDocumentVaultItem:
        """Update document metadata, renewing or re-uploading file."""
        item = self._vault_store.get(item_id)
        if not item:
            raise KeyError(f"Vault document {item_id} not found")

        if filename is not None:
            item.filename = filename
            item.file_url = f"/vault-files/{filename}"
        if expiry_date is not None:
            item.expiry_date = expiry_date
        if version is not None:
            item.version = version
        if notes is not None:
            item.notes = notes

        item.updated_at = datetime.utcnow().isoformat()
        item.document_status = item._compute_status(item.document_status)
        return item

    def get_vault_summary(self) -> Dict[str, Any]:
        """Compute status counts and upcoming expiry alerts."""
        items = list(self._vault_store.values())
        total = len(items)
        valid = sum(1 for i in items if i.document_status == "VALID")
        expiring = sum(1 for i in items if i.document_status == "EXPIRING_SOON")
        expired = sum(1 for i in items if i.document_status == "EXPIRED")
        missing = sum(1 for i in items if i.document_status == "MISSING")

        alerts = []
        for i in items:
            if i.document_status == "EXPIRED":
                alerts.append({
                    "code": i.code,
                    "name_en": i.name_en,
                    "name_ar": i.name_ar,
                    "status": "EXPIRED",
                    "expiry_date": i.expiry_date,
                    "message": f"CRITICAL: {i.name_en} has expired on {i.expiry_date[:10]}. Must be renewed before prequalification submission.",
                })
            elif i.document_status == "EXPIRING_SOON":
                alerts.append({
                    "code": i.code,
                    "name_en": i.name_en,
                    "name_ar": i.name_ar,
                    "status": "EXPIRING_SOON",
                    "expiry_date": i.expiry_date,
                    "message": f"WARNING: {i.name_en} expires soon ({i.expiry_date[:10]}). Prepare renewal.",
                })

        return {
            "total_documents": total,
            "valid_count": valid,
            "expiring_soon_count": expiring,
            "expired_count": expired,
            "missing_count": missing,
            "alerts": alerts,
            "last_audited": datetime.utcnow().isoformat(),
        }
