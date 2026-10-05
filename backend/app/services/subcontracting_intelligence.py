"""Subcontracting Intelligence & Matchmaking Engine (Stage 8 Parts 6 & 7).

Evaluates subcontract packages against Saudi contractor capability profiles,
computes explainable match scores and eligibility, and generates structured Action Plans.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

from backend.app.models.schemas import (
    CompanyProfile,
    MainContractorRecord,
    SubcontractPackage,
    SubcontractMatch,
    SubcontractActionPlan,
)
from backend.app.db.mongodb import MongoRepository


class SubcontractingIntelligenceService:
    """Evaluates subcontract opportunities and generates actionable engagement workflows."""

    @classmethod
    def evaluate_subcontract_match(
        cls,
        package: SubcontractPackage,
        company: CompanyProfile,
    ) -> SubcontractMatch:
        """Match a subcontract package to a contractor's capability profile (Part 6).
        
        Weighting:
        - Activity / Trade Alignment: 35 points
        - Geographic Presence: 25 points
        - Scale & Financial Envelope: 20 points
        - Classification Grade: 10 points
        - Equipment Fleet & Certifications: 10 points
        """
        score = 0.0
        fit_reasons: List[str] = []
        gap_warnings: List[str] = []
        eligibility = "ELIGIBLE"

        # 1. Activity / Trade Alignment (35 pts)
        pkg_cat = (package.package_category or "").upper()
        comp_activities = [a.upper() for a in (company.main_activities + company.secondary_activities)]
        category_matched = False

        category_aliases = {
            "MEP": ["ELECTROMECHANICAL", "MEP", "HVAC", "ELECTRICAL", "PLUMBING"],
            "CIVIL": ["BUILDINGS", "ROADS_INFRASTRUCTURE", "EARTHWORKS", "CIVIL"],
            "BUILDINGS": ["BUILDINGS", "FINISHING", "FITOUT"],
            "WATER_SEWAGE": ["WATER_SEWAGE", "UTILITIES", "PIPELINES"],
            "TELECOM_IT": ["TELECOM_IT", "LOW_VOLTAGE", "SECURITY_SYSTEMS"],
            "ROADS": ["ROADS_INFRASTRUCTURE", "ASPHALTING", "PAVING"],
        }

        aliases = category_aliases.get(pkg_cat, [pkg_cat])
        for act in comp_activities:
            if any(alias in act for alias in aliases) or pkg_cat in act:
                category_matched = True
                break

        if category_matched:
            score += 35.0
            fit_reasons.append(f"Trade capability confirmed in {package.package_category}")
        else:
            score += 10.0  # partial credit for general contracting
            gap_warnings.append(f"Direct activity specialization in {package.package_category} not explicitly listed")

        # 2. Geographic Presence (25 pts)
        loc = package.project_location.lower()
        comp_regions = [r.lower() for r in (getattr(company, "saudi_regions", None) or getattr(company, "regions", None) or [])]
        comp_cities = [c.lower() for c in (getattr(company, "saudi_cities", None) or getattr(company, "key_cities", None) or [])]

        geo_matched = False
        if any(reg in loc for reg in comp_regions) or any(city in loc for city in comp_cities):
            geo_matched = True
            score += 25.0
            fit_reasons.append(f"Active operating presence in {package.project_location}")
        elif not comp_regions or "all" in comp_regions:
            score += 15.0
            fit_reasons.append("National geographic coverage")
        else:
            score += 5.0
            gap_warnings.append(f"Project location ({package.project_location}) is outside primary operating regions")

        # 3. Scale & Financial Envelope (20 pts)
        pkg_val = package.estimated_value_sar or 5_000_000.0
        pref_val = company.preferred_project_value_sar or 20_000_000.0

        if pkg_val <= pref_val * 1.5:
            score += 20.0
            fit_reasons.append(f"Package budget ({pkg_val:,.0f} SAR) fits within contractor financial envelope")
        elif pkg_val <= pref_val * 3.0:
            score += 12.0
            fit_reasons.append(f"Package budget ({pkg_val:,.0f} SAR) is manageable via subcontract progress billing")
        else:
            score += 5.0
            gap_warnings.append(f"Package value ({pkg_val:,.0f} SAR) significantly exceeds preferred project size")
            eligibility = "REVIEW_REQUIRED"

        # 4. Classification Grade (10 pts)
        grade = company.classification_grade
        if grade in [1, 2, 3]:
            score += 10.0
            fit_reasons.append(f"Contractor classification (Grade {grade}) exceeds prime prequalification threshold")
        elif grade in [4, 5]:
            score += 7.0
            fit_reasons.append(f"Classification Grade {grade} is suitable for specialized subcontracting")
        else:
            score += 4.0
            gap_warnings.append("Classification unverified or unclassified; prime contractor prequalification required")
            if eligibility == "ELIGIBLE":
                eligibility = "LIKELY_ELIGIBLE"

        # 5. Equipment Fleet & Certifications (10 pts)
        equip_list = getattr(company, "equipment_tags", None) or getattr(company, "equipment_fleet", None) or []
        if equip_list and len(equip_list) > 0:
            score += 5.0
            fit_reasons.append(f"Equipment fleet available ({len(equip_list)} equipment types)")
        if company.certifications and len(company.certifications) > 0:
            score += 5.0
            fit_reasons.append(f"Certified quality systems ({', '.join(company.certifications[:2])})")
        else:
            score += 3.0

        score = min(100.0, max(0.0, round(score, 1)))

        # Determine approach and competitiveness
        if score >= 80:
            competitiveness = "HIGH"
            approach = "DIRECT_VENDOR_REGISTRATION"
            eligibility = "ELIGIBLE"
        elif score >= 65:
            competitiveness = "MEDIUM"
            approach = "TARGETED_SUBCONTRACT_INQUIRY"
            if eligibility == "ELIGIBLE":
                eligibility = "LIKELY_ELIGIBLE"
        else:
            competitiveness = "LOW"
            approach = "CAPABILITY_REVIEW_REQUIRED"
            eligibility = "REVIEW_REQUIRED"

        return SubcontractMatch(
            package_id=package.id,
            company_id=company.id,
            match_score=score,
            eligibility_status=eligibility,
            fit_reasons=fit_reasons,
            gap_warnings=gap_warnings,
            recommended_approach=approach,
            estimated_competitiveness=competitiveness,
        )

    @classmethod
    def generate_subcontract_action_plan(
        cls,
        repo: MongoRepository,
        package: SubcontractPackage,
        contractor: MainContractorRecord,
        company: CompanyProfile,
    ) -> SubcontractActionPlan:
        """Create actionable 5-step subcontract engagement plan (Part 7)."""
        plan_id = f"plan-{uuid.uuid4().hex[:8]}"

        # Identify best registration portal URL
        portal_url = contractor.official_website or "https://www.saudicontractors.org"
        portal_type = "COMPANY_WEBSITE"
        for link in contractor.portal_links:
            if link.get("link_type") in ["VENDOR_REGISTRATION", "SUBCONTRACTOR_REGISTRATION", "PREQUALIFICATION"]:
                portal_url = link.get("url", portal_url)
                portal_type = link.get("link_type", portal_type)
                break

        # Best outreach contact
        outreach_contact: Dict[str, Any] = {}
        for c in contractor.contacts:
            if c.get("contact_type") in ["PROCUREMENT_OFFICE", "SUBCONTRACT_MANAGEMENT", "VENDOR_RELATIONS"]:
                outreach_contact = c
                break
        if not outreach_contact and contractor.contacts:
            outreach_contact = contractor.contacts[0]

        # Email draft
        email_subj = f"Subcontracting Prequalification & Expression of Interest — {package.package_name} [{package.project_name}]"
        email_body_en = (
            f"Dear Procurement Directorate at {contractor.contractor_name},\n\n"
            f"Following your verified contract award for '{package.project_name}', we are formally submitting "
            f"our expression of interest as an approved Saudi subcontractor for the '{package.package_name}'.\n\n"
            f"Company: {company.name}\n"
            f"Commercial Registration (CR): {company.cr_number or 'Saudi CR'}\n"
            f"Classification Grade: Grade {company.classification_grade or 'SCA Registered'}\n"
            f"Primary Specialization: {', '.join(company.main_activities[:2])}\n"
            f"Operating Base: {', '.join(company.regions[:2])}\n\n"
            f"We have attached our comprehensive prequalification dossier, audited financial standing, and "
            f"certified references of similar executed Saudi projects. We look forward to receiving the RFP package.\n\n"
            f"Sincerely,\nBusiness Development Directorate\n{company.name}"
        )
        email_body_ar = (
            f"السادة إدارة المشتريات والعقود في {contractor.contractor_name_ar or contractor.contractor_name} المحترمين،\n\n"
            f"تحية طيبة وبعد،\n"
            f"إلحاقاً بترسية مشروع '{package.project_name}'، نود إبداء رغبتنا واعتمادنا كمقاول باطن متخصص لتنفيذ "
            f"'{package.package_name_ar or package.package_name}'.\n\n"
            f"اسم الشركة: {company.name_ar or company.name}\n"
            f"السجل التجاري: {company.cr_number or 'سجل ساري المفعول'}\n"
            f"درجة التصنيف: الدرجة {company.classification_grade or 'معتمد لدى هيئة المقاولين'}\n"
            f"النشاط الرئيسي: {', '.join(company.main_activities[:2])}\n\n"
            f"مرفق طيه ملف التأهيل المسبق وشهادات إنجاز المشاريع المماثلة. نتطلع لاستلام وثائق المنافسة الخاصة بالحزمة.\n\n"
            f"وتفضلوا بقبول فائق الاحترام والتقدير،\nإدارة تطوير الأعمال"
        )

        plan = SubcontractActionPlan(
            id=plan_id,
            package_id=package.id,
            main_contractor_id=contractor.id,
            tenant_id=company.id,
            portal_registration_url=portal_url,
            registration_portal_type=portal_type,
            required_documents=[
                {"document_name": "Commercial Registration (CR)", "is_mandatory": True, "status": "READY"},
                {"document_name": "Zakat, Tax and Customs Authority (ZATCA) Certificate", "is_mandatory": True, "status": "READY"},
                {"document_name": "GOSI Compliance Certificate", "is_mandatory": True, "status": "READY"},
                {"document_name": "Chamber of Commerce Membership", "is_mandatory": True, "status": "READY"},
                {"document_name": "Saudi Contractors Authority (Muqawil) Classification", "is_mandatory": True, "status": "READY"},
                {"document_name": "Company Capability Profile & Reference Projects", "is_mandatory": True, "status": "READY"},
                {"document_name": "Audited Financial Statements (Last 2 Years)", "is_mandatory": False, "status": "READY"},
                {"document_name": "ISO 9001 / ISO 45001 Quality & Safety Certifications", "is_mandatory": False, "status": "READY"},
            ],
            outreach_contact=outreach_contact,
            outreach_email_draft={
                "subject": email_subj,
                "body_en": email_body_en,
                "body_ar": email_body_ar,
            },
            steps=[
                {
                    "step": 1,
                    "title": "Main Contractor Portal Registration",
                    "description": f"Complete online registration on {contractor.contractor_name} portal",
                    "status": "NOT_STARTED",
                },
                {
                    "step": 2,
                    "title": "Prequalification Dossier Upload",
                    "description": "Upload verified CR, ZATCA, GOSI, and Muqawil classification certificates",
                    "status": "NOT_STARTED",
                },
                {
                    "step": 3,
                    "title": "Targeted Procurement Outreach",
                    "description": f"Dispatch package inquiry email to {outreach_contact.get('email', 'procurement office')}",
                    "status": "NOT_STARTED",
                },
                {
                    "step": 4,
                    "title": "Scope & Commercial Alignment",
                    "description": "Conduct technical alignment on bills of quantities (BOQ) and specs",
                    "status": "NOT_STARTED",
                },
                {
                    "step": 5,
                    "title": "Subcontract Proposal & Pricing",
                    "description": "Submit competitive subcontract bid before procurement closing",
                    "status": "NOT_STARTED",
                },
            ],
            status="NOT_STARTED",
            notes=f"Created for package '{package.package_name}' under project '{package.project_name}'.",
        )

        repo.save_action_plan(plan)
        return plan
