"""Business Development CRM & Action Priority Service (Stage 9 Parts D, E, F).

Manages targeted subcontracting business development pipelines, computes explainable
action priority scores (ACTION_NOW, ACTION_THIS_WEEK, MONITOR, LOW_PRIORITY), and generates
bilingual (Arabic & English) outreach templates.
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple

from backend.app.models.schemas import (
    BDPipelineItem,
    SubcontractPackage,
    MainContractorRecord,
    VendorRegistrationRecord,
)
from backend.app.db.mongodb import MongoRepository

CRM_STAGES = [
    "TARGET_IDENTIFIED",
    "VENDOR_PORTAL_FOUND",
    "REGISTRATION_IN_PROGRESS",
    "REGISTERED",
    "PROCUREMENT_CONTACT_FOUND",
    "EOI_PREPARED",
    "EOI_SENT",
    "FOLLOW_UP",
    "PREQUALIFICATION",
    "RFQ_RECEIVED",
    "BID_SUBMITTED",
    "WON",
    "LOST",
    "ON_HOLD",
]

OUTREACH_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "EOI": {
        "title_en": "Expression of Interest (EOI) for Subcontracting",
        "title_ar": "إبداء رغبة للتعاقد من الباطن (EOI)",
        "subject_en": "Expression of Interest: {package_name} - {project_name} | {company_name}",
        "subject_ar": "إبداء رغبة لتنفيذ حزمة {package_name} - مشروع {project_name} | {company_name}",
        "body_en": """Dear Procurement Directorate,
{contractor_name},

Regarding the verified award of {project_name} by {project_owner}, we are writing to submit our formal Expression of Interest (EOI) for the subcontract execution of:

- Package: {package_name}
- Category: {work_category}
- Project Location: {location}

About Us:
{company_name} is a licensed Saudi contracting firm (CR: {company_cr}) with proven experience across the Kingdom. We hold active Commercial Registration, ZATCA tax clearance, GOSI compliance, and valid Saudi Contractors Authority (Muqawil) certification.

We have reviewed your project requirements and confirm our full technical and mobilization readiness. We kindly request the RFQ documents or prequalification link for this package.

Official Contact:
- Company: {company_name}
- Representative: {contact_person}
- Phone: {contact_phone}
- Email: {contact_email}

Looking forward to collaborating with {contractor_name}.

Sincerely,
Business Development Directorate
{company_name}""",
        "body_ar": """السادة / إدارة المشتريات والعقود المحترمين،
شركة {contractor_name}،

السلام عليكم ورحمة الله وبركاته،،،

بالإشارة إلى ترسية مشروع "{project_name}" المعتمد من قبل {project_owner}، يسرنا في شركة {company_name} أن نتقدم بإبداء الرغبة الرسمي (Expression of Interest - EOI) للتعاقد من الباطن لتنفيذ:

- اسم الحزمة: {package_name}
- التصنيف الفني: {work_category}
- موقع المشروع: {location}

نبذة عن الشركة:
شركة {company_name} هي شركة مقاولات سعودية مرخصة ومصنفة، وتمتلك سجلاً حافلاً في تنفيذ الأعمال المتخصصة بالمملكة. نحن حاصلون على شهادات سارية من هيئة الزكاة والضريبة والجمارك (ZATCA)، والتأمينات الاجتماعية (GOSI)، وشهادة تصنيف المقاولين (مقاول)، والعضوية بالغرفة التجارية.

نؤكد جاهزيتنا الفنية والتشغيلية الكاملة للبدء في إجراءات التأهيل وتسليم العروض الفنية والمالية فور تزويدنا بكرّاسة الشروط والمواصفات (RFQ).

بيانات التواصل:
- اسم المنشأة: {company_name}
- مسؤول التواصل: {contact_person}
- الهاتف: {contact_phone}
- البريد الإلكتروني: {contact_email}

شاكرين ومقدرين تعاونكم، ونتطلع إلى شراكة استراتيجية مثمرة مع شركتكم الموقرة.

وتفضلوا بقبول خالص التحية والتقدير،،،
إدارة تطوير الأعمال
{company_name}""",
    },

    "VENDOR_REGISTRATION_INQUIRY": {
        "title_en": "Vendor Registration Inquiry & Portal Credentials",
        "title_ar": "طلب اعتماد وتسجيل مورد / مقاول باطن في البوابة",
        "subject_en": "Vendor Registration & Supplier Onboarding Inquiry - {company_name}",
        "subject_ar": "طلب تسجيل واعتماد مقاول باطن معتمد - {company_name}",
        "body_en": """Dear Supplier Relations Department,
{contractor_name},

We are reaching out to verify our supplier registration with {contractor_name} to participate in current and upcoming construction packages across the Kingdom.

We have gathered our verified statutory prequalification docket:
- Valid Saudi Commercial Registration
- ZATCA Tax & VAT Clearance
- GOSI Certificate & High Green Saudization Tier
- Saudi Contractors Authority (Muqawil) Classification
- Audited Financial Statements & HSE Manual

Kindly provide confirmation of the official supplier portal URL or vendor prequalification requirements.

Company Details:
- Legal Name: {company_name}
- CR Number: {company_cr}
- Location: {location}
- Procurement Contact: {contact_email} | {contact_phone}

Best regards,
Procurement & Tendering Team
{company_name}""",
        "body_ar": """السادة / إدارة علاقات الموردين والمقاولين المحترمين،
شركة {contractor_name}،

السلام عليكم ورحمة الله وبركاته،،،

نود الإحاطة برغبتنا في اعتماد وتسجيل شركة {company_name} كمقاول باطن معتمد ومؤهل لدى شركتكم الموقرة للمشاركة في حزم الأعمال الجارية والمستقبلية.

نحيطكم علماً بأننا قمنا بإعداد وتجهيز ملف التأهيل المسبق شاملاً كافة الوثائق النظامية:
- السجل التجاري الساري والشهادة الضريبية (ZATCA)
- شهادة التأمينات الاجتماعية ونطاقات (أخضر مرتفع)
- شهادة تصنيف المقاولين (مقاول)
- القوائم المالية المدققة ودليل السلامة والصحة المهنية (HSE)

نرجو التكرم بتزويدنا برابط بوابة تسجيل الموردين الرسمية أو توجيهنا لمتطلبات التسجيل المعتمدة لديكم.

شاكرين لكم حسن تعاونكم.

فريق المشتريات والمناقصات
{company_name}""",
    },

    "FOLLOW_UP": {
        "title_en": "Outreach Follow-up & Clarification Request",
        "title_ar": "متابعة إبداء الرغبة والتأهيل المسبق",
        "subject_en": "Follow-up: Subcontract Inquiry - {package_name} | {company_name}",
        "subject_ar": "متابعة طلب التعاقد من الباطن لحزمة {package_name} | {company_name}",
        "body_en": """Dear Procurement Team,
{contractor_name},

Following up on our Expression of Interest regarding {package_name} for the {project_name} project.

We would appreciate an update on the subcontract tendering timeline and whether additional prequalification documentation is required at this stage.

Thank you for your time and guidance.

Sincerely,
{contact_person}
{company_name}""",
        "body_ar": """السادة / فريق المشتريات والعقود المحترمين،
شركة {contractor_name}،

السلام عليكم ورحمة الله وبركاته،،،

متابعةً لطلب إبداء الرغبة المقدّم سابقاً بخصوص حزمة أعمال "{package_name}" ضمن مشروع {project_name}.

نرجو التكرم بإفادتنا حول الجدول الزمني لطرح كراسة الأسعار (RFQ) لحزمة الأعمال المذكورة، وفي حال وجود أي متطلبات تأهيلية إضافية متبقية.

شاكرين ومقدرين اهتمامكم الدائم.

وتفضلوا بقبول فائق الاحترام،،،
{contact_person}
{company_name}""",
    },
}


class BusinessDevelopmentService:
    """Service handling CRM pipeline lifecycle, action prioritization, and outreach templates."""

    @classmethod
    def calculate_priority_score(
        cls,
        package: Optional[SubcontractPackage] = None,
        contractor: Optional[MainContractorRecord] = None,
        vreg: Optional[VendorRegistrationRecord] = None,
        sme_fit_score: float = 75.0,
    ) -> Tuple[str, float, List[str]]:
        """Calculate explainable priority score and category."""
        score = 0.0
        reasons: List[str] = []

        # 1. SME Fit Contribution (0–35 points)
        fit_points = min(35.0, max(0.0, (sme_fit_score / 100.0) * 35.0))
        score += fit_points
        if sme_fit_score >= 80:
            reasons.append(f"High SME Trade & Capacity Fit ({sme_fit_score:.0f}%)")
        elif sme_fit_score >= 60:
            reasons.append(f"Moderate SME Capability Fit ({sme_fit_score:.0f}%)")

        # 2. Main Contractor Verification & Award Certainty (0–20 points)
        if contractor and contractor.verification_status in ["VERIFIED_MAIN_CONTRACTOR", "OFFICIAL_SINGLE_SOURCE"]:
            score += 20.0
            reasons.append("Verified Prime Contractor Award (Official Source)")
        else:
            score += 10.0
            reasons.append("Main Contractor Confirmed via Tender Handoff")

        # 3. Vendor Portal Availability (0–15 points)
        if vreg and vreg.vendor_portal_url:
            if vreg.portal_status == "PUBLIC":
                score += 15.0
                reasons.append("Public Vendor Onboarding Portal Discovered")
            elif vreg.portal_status in ["REGISTRATION_REQUIRED", "AUTH_REQUIRED"]:
                score += 12.0
                reasons.append("Official Enterprise Supplier Portal Identified")
        elif contractor and contractor.portal_links:
            score += 10.0
            reasons.append("Procurement / Registration Links Available")
        else:
            score += 3.0
            reasons.append("Portal Discovery Pending")

        # 4. Direct Procurement Contact Availability (0–15 points)
        c_contacts = getattr(contractor, "contacts", None) or getattr(contractor, "official_contacts", None)
        c_email = None
        c_phone = None
        if isinstance(c_contacts, list) and len(c_contacts) > 0:
            c_email = c_contacts[0].get("email")
            c_phone = c_contacts[0].get("phone")
        elif isinstance(c_contacts, dict):
            c_email = c_contacts.get("email")
            c_phone = c_contacts.get("phone")

        if c_email and "@" in c_email:
            score += 15.0
            reasons.append("Verified Corporate Procurement Email Available")
        elif c_phone:
            score += 10.0
            reasons.append("Official Directorate Business Phone Available")
        else:
            score += 2.0

        # 5. Package Scope & Small Contractor Friendliness (0–15 points)
        if package and package.small_contractor_friendly:
            score += 15.0
            reasons.append("Package Scale Suitable for Small/Medium Contractor Execution")
        elif package:
            score += 8.0
            reasons.append("Specialist Technical Package Scope")
        else:
            score += 5.0

        # Final Priority Tier Determination
        total_score = min(100.0, max(0.0, score))
        if total_score >= 78.0:
            tier = "ACTION_NOW"
        elif total_score >= 55.0:
            tier = "ACTION_THIS_WEEK"
        elif total_score >= 35.0:
            tier = "MONITOR"
        else:
            tier = "LOW_PRIORITY"

        return tier, round(total_score, 1), reasons

    @classmethod
    def generate_outreach_templates(
        cls,
        package_name: str,
        project_name: str,
        project_owner: str,
        contractor_name: str,
        location: str = "Saudi Arabia",
        work_category: str = "General Contracting",
        company_name: str = "Saudi Specialist Contracting Co.",
        contact_person: str = "Eng. Tariq Al-Ghamdi (BD Director)",
        contact_phone: str = "+966 11 200 4500",
        contact_email: str = "tendering@saudicontractor.com.sa",
        company_cr: str = "1010189421",
        contractor_name_ar: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate ready-to-use bilingual outreach templates auto-filled with verified data."""
        results = {}
        c_name_ar = contractor_name_ar or contractor_name
        for tkey, tdata in OUTREACH_TEMPLATES.items():
            sub_en = tdata["subject_en"].format(
                package_name=package_name,
                project_name=project_name,
                company_name=company_name,
            )
            sub_ar = tdata["subject_ar"].format(
                package_name=package_name,
                project_name=project_name,
                company_name=company_name,
            )
            body_en = tdata["body_en"].format(
                package_name=package_name,
                project_name=project_name,
                project_owner=project_owner,
                contractor_name=contractor_name,
                location=location,
                work_category=work_category,
                company_name=company_name,
                contact_person=contact_person,
                contact_phone=contact_phone,
                contact_email=contact_email,
                company_cr=company_cr,
            )
            body_ar = tdata["body_ar"].format(
                package_name=package_name,
                project_name=project_name,
                project_owner=project_owner,
                contractor_name=c_name_ar,
                location=location,
                work_category=work_category,
                company_name=company_name,
                contact_person=contact_person,
                contact_phone=contact_phone,
                contact_email=contact_email,
                company_cr=company_cr,
            )
            results[tkey] = {
                "title_en": tdata["title_en"],
                "title_ar": tdata["title_ar"],
                "subject_en": sub_en,
                "subject_ar": sub_ar,
                "body_en": body_en,
                "body_ar": body_ar,
            }
        return results

    @classmethod
    def create_or_sync_pipeline_item(
        cls,
        package_id: str,
        repo: MongoRepository,
        tenant_id: str = "comp-sa-001",
    ) -> BDPipelineItem:
        """Create or update a pipeline opportunity connecting award, contractor, and subcontract package."""
        existing = repo.get_bd_pipeline_item_by_package(package_id, tenant_id=tenant_id)
        if existing:
            return existing

        package = repo.get_subcontract_package(package_id)
        if not package:
            raise ValueError(f"SubcontractPackage {package_id} not found")

        contractor = repo.get_main_contractor(package.main_contractor_id)
        vreg = repo.get_vendor_registration(package.main_contractor_id, tenant_id=tenant_id)

        c_name = (
            getattr(contractor, "commercial_brand_name", None)
            or getattr(contractor, "contractor_name", None)
            or getattr(contractor, "legal_name_en", None)
            or package.main_contractor_id
        ) if contractor else package.main_contractor_id
        c_name_ar = (
            getattr(contractor, "contractor_name_ar", None)
            or getattr(contractor, "legal_name_ar", None)
            or c_name
        ) if contractor else c_name
        p_name = package.project_name or "Saudi Infrastructure Project"
        p_owner = package.project_owner or "Saudi Project Authority"

        # Calculate Priority
        priority, p_score, reasons = cls.calculate_priority_score(
            package=package,
            contractor=contractor,
            vreg=vreg,
            sme_fit_score=package.match_score or 75.0,
        )

        # Generate Bilingual Templates
        templates = cls.generate_outreach_templates(
            package_name=package.package_name,
            project_name=p_name,
            project_owner=p_owner,
            contractor_name=c_name,
            location=getattr(package, "project_location", "") or getattr(package, "location", "") or "Saudi Arabia",
            work_category=package.package_category,
        )

        opp_id = getattr(package, "project_id", "") or getattr(package, "awarded_project_id", "")
        proc_contact = {}
        if vreg and vreg.procurement_contact:
            proc_contact = vreg.procurement_contact
        elif contractor:
            c_contacts = getattr(contractor, "contacts", None) or getattr(contractor, "official_contacts", None)
            if isinstance(c_contacts, list) and len(c_contacts) > 0:
                proc_contact = c_contacts[0]
            elif isinstance(c_contacts, dict):
                proc_contact = c_contacts

        item = BDPipelineItem(
            id=f"bd-{package.id}-{uuid.uuid4().hex[:6]}",
            tenant_id=tenant_id,
            project_name=p_name,
            project_owner=p_owner,
            contractor_id=package.main_contractor_id,
            contractor_name=c_name,
            contractor_name_ar=c_name_ar,
            package_name=package.package_name,
            work_category=package.package_category,
            stage="TARGET_IDENTIFIED",
            priority=priority,
            priority_score=p_score,
            priority_reasons=reasons,
            opportunity_id=opp_id,
            package_id=package.id,
            estimated_value_sar=package.estimated_value_sar,
            registration_id=vreg.id if vreg else None,
            portal_url=vreg.vendor_portal_url if vreg else None,
            procurement_contact=proc_contact,
            eoi_template_ar=templates.get("EOI", {}).get("body_ar", ""),
            eoi_template_en=templates.get("EOI", {}).get("body_en", ""),
            next_follow_up_date=(datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d"),
            provenance={
                "source_award": opp_id,
                "evidence_level": package.evidence_level,
                "is_inferred": package.is_inferred,
                "evidence_source": package.evidence_source,
            },
        )

        repo.save_bd_pipeline_item(item)
        return item

    @classmethod
    def update_stage(
        cls,
        pipeline_id: str,
        new_stage: str,
        repo: MongoRepository,
        tenant_id: str = "comp-sa-001",
        notes: Optional[str] = None,
        next_follow_up: Optional[str] = None,
    ) -> BDPipelineItem:
        """Advance BD pipeline stage with audit trail."""
        if new_stage not in CRM_STAGES:
            raise ValueError(f"Invalid CRM stage: {new_stage}. Allowed: {CRM_STAGES}")

        item = repo.get_bd_pipeline_item(pipeline_id, tenant_id=tenant_id)
        if not item:
            raise ValueError(f"BD Pipeline item {pipeline_id} not found")

        old_stage = item.stage
        item.stage = new_stage
        item.last_activity_date = datetime.utcnow().isoformat()
        item.updated_at = datetime.utcnow().isoformat()
        if next_follow_up:
            item.next_follow_up_date = next_follow_up
        if notes:
            item.notes = f"{item.notes}\n[{datetime.utcnow().strftime('%Y-%m-%d')}] Stage transition {old_stage} -> {new_stage}: {notes}".strip()

        repo.save_bd_pipeline_item(item)
        return item
