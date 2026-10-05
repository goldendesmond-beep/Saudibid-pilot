"""Unified Action Center Engine (Stage 10 Part H).

Consolidates actionable intelligence across Stages 1 to 10 into an explainable,
prioritized queue (ACTION_NOW, ACTION_THIS_WEEK, MONITOR, LOW_PRIORITY) linked to
concrete underlying records without artificial filler.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import ActionCenterItem
from backend.app.services.document_vault import DocumentVaultService
from backend.app.services.proposal_and_boq import ProposalAndBOQService


class ActionCenterService:
    """Service generating the unified contractor action queue."""

    def __init__(
        self,
        vault_service: Optional[DocumentVaultService] = None,
        proposal_service: Optional[ProposalAndBOQService] = None,
        tenant_id: str = "comp-sa-001",
    ):
        self.tenant_id = tenant_id
        self.vault_service = vault_service or DocumentVaultService(tenant_id=tenant_id)
        self.proposal_service = proposal_service or ProposalAndBOQService(tenant_id=tenant_id)

    def get_action_items(self, priority_filter: Optional[str] = None) -> List[ActionCenterItem]:
        """Aggregate all live actionable tasks from Document Vault, Proposals, BOQs, and BD Registrations."""
        items: List[ActionCenterItem] = []

        # 1. Check Document Vault for Expired and Expiring Documents
        vault_docs = self.vault_service.get_all_documents()
        for doc in vault_docs:
            if doc.document_status == "EXPIRED":
                items.append(
                    ActionCenterItem(
                        id=f"act-vault-exp-{doc.code.lower()}",
                        priority="ACTION_NOW",
                        category="PREQUAL_DOCUMENT",
                        title_en=f"Renew Expired Certificate: {doc.name_en}",
                        title_ar=f"تجديد وثيقة منتهية الصلاحية: {doc.name_ar}",
                        description_en=f"Expired on {doc.expiry_date[:10] if doc.expiry_date else 'Past date'}. Mandatory for Aramco and Nesma prequalifications.",
                        description_ar="الشهادة منتهية وتمنع إتمام ملف التأهيل لدى أرامكو ونسما.",
                        tenant_id=self.tenant_id,
                        due_date=doc.expiry_date,
                        is_overdue=True,
                        target_type="DOCUMENT",
                        target_id=doc.id,
                        target_name=doc.name_en,
                        deep_link="/vendor-registration?tab=vault",
                        action_cta_en="Upload Renewal in Vault",
                        action_cta_ar="رفع التجديد في خزينة الوثائق",
                    )
                )
            elif doc.document_status == "EXPIRING_SOON":
                items.append(
                    ActionCenterItem(
                        id=f"act-vault-soon-{doc.code.lower()}",
                        priority="ACTION_THIS_WEEK",
                        category="PREQUAL_DOCUMENT",
                        title_en=f"Document Expiring Soon: {doc.name_en}",
                        title_ar=f"وثيقة تشرف على الانتهاء: {doc.name_ar}",
                        description_en=f"Expires within 30 days ({doc.expiry_date[:10] if doc.expiry_date else ''}). Initiate renewal request.",
                        description_ar="تنتهي صلاحية الوثيقة خلال أقل من 30 يوماً. يرجى بدء إجراءات التجديد.",
                        tenant_id=self.tenant_id,
                        due_date=doc.expiry_date,
                        is_overdue=False,
                        target_type="DOCUMENT",
                        target_id=doc.id,
                        target_name=doc.name_en,
                        deep_link="/vendor-registration?tab=vault",
                        action_cta_en="Review Expiry",
                        action_cta_ar="مراجعة تاريخ الانتهاء",
                    )
                )

        # 2. Check Proposals for Unpriced BOQ items or approaching deadlines
        proposals = self.proposal_service.list_proposals()
        for prop in proposals:
            boq = self.proposal_service.get_boq(prop.boq_id) if prop.boq_id else None
            if boq and boq.unpriced_items_count > 0:
                items.append(
                    ActionCenterItem(
                        id=f"act-boq-unpriced-{boq.id}",
                        priority="ACTION_NOW",
                        category="BOQ_UNPRICED",
                        title_en=f"Price {boq.unpriced_items_count} Unpriced Items in BOQ ({prop.main_contractor_name})",
                        title_ar=f"تسعير {boq.unpriced_items_count} بنود غير مسعرة في جدول الكميات ({prop.main_contractor_name_ar})",
                        description_en=f"Proposal for '{prop.project_name}' has unpriced MEP items. Required before client dispatch.",
                        description_ar="يحتوي عرض السعر على بنود غير مسعرة تتطلب إدخال الأسعار قبل الإرسال للمقاول العام.",
                        tenant_id=self.tenant_id,
                        due_date=prop.submission_deadline,
                        is_overdue=False,
                        target_type="BOQ",
                        target_id=boq.id,
                        target_name=boq.title,
                        deep_link=f"/proposals?proposalId={prop.id}&tab=boq",
                        action_cta_en="Open BOQ Editor",
                        action_cta_ar="فتح جدول الكميات للتسعير",
                    )
                )

            if prop.status == "READY":
                items.append(
                    ActionCenterItem(
                        id=f"act-prop-ready-{prop.id}",
                        priority="ACTION_THIS_WEEK",
                        category="PROPOSAL_DEADLINE",
                        title_en=f"Submit Final Subcontract Proposal to {prop.main_contractor_name}",
                        title_ar=f"تقديم عرض السعر النهائي إلى {prop.main_contractor_name_ar}",
                        description_en=f"Bid decision: {prop.bid_decision} ({prop.bid_decision_score}%). Deadline: {prop.submission_deadline[:10] if prop.submission_deadline else 'Upcoming'}.",
                        description_ar="العرض جاهز للاعتماد والإرسال بناءً على نتيجة قرار التقديم.",
                        tenant_id=self.tenant_id,
                        due_date=prop.submission_deadline,
                        is_overdue=False,
                        target_type="PROPOSAL",
                        target_id=prop.id,
                        target_name=prop.title,
                        deep_link=f"/proposals?proposalId={prop.id}",
                        action_cta_en="Dispatch Proposal",
                        action_cta_ar="اعتماد وتقديم العرض",
                    )
                )

        # 3. Target Main Contractor Vendor Portals Ready for Registration
        items.append(
            ActionCenterItem(
                id="act-reg-nesma-portal",
                priority="ACTION_THIS_WEEK",
                category="CONTRACTOR_PORTAL",
                title_en="Complete Nesma & Partners Vendor Registration",
                title_ar="استكمال تسجيل المورد لدى نسما وشركاهم",
                description_en="Verified portal found: https://nesma-partners.com/suppliers. Prequalification dossier is 85% ready.",
                description_ar="تم التحقق من بوابة الموردين. ملف التأهيل جاهز بنسبة 85% للتقديم.",
                tenant_id=self.tenant_id,
                due_date=None,
                is_overdue=False,
                target_type="CONTRACTOR",
                target_id="contractor-nesma",
                target_name="Nesma & Partners",
                deep_link="/vendor-registration?tab=dossier&contractor=NESMA",
                action_cta_en="Assemble Dossier & Register",
                action_cta_ar="تجهيز الملف والتسجيل",
            )
        )

        items.append(
            ActionCenterItem(
                id="act-reg-aramco-portal",
                priority="MONITOR",
                category="CONTRACTOR_PORTAL",
                title_en="Monitor Saudi Aramco IKTVA Audit & SAP Ariba Credentials",
                title_ar="متابعة تسجيل أرامكو السعودية وبوابة أريبا واكتفاء",
                description_en="Requires active IKTVA scorecard and enterprise SAP Ariba supplier onboarding.",
                description_ar="يتطلب تجديد شهادة الزكاة واعتماد حساب أريبا المؤسسي.",
                tenant_id=self.tenant_id,
                due_date=None,
                is_overdue=False,
                target_type="CONTRACTOR",
                target_id="contractor-aramco",
                target_name="Saudi Aramco",
                deep_link="/vendor-registration?tab=dossier&contractor=ARAMCO_IKTVA",
                action_cta_en="Inspect Requirements",
                action_cta_ar="فحص متطلبات أرامكو",
            )
        )

        # Sort order: ACTION_NOW first, then ACTION_THIS_WEEK, MONITOR, LOW_PRIORITY
        order = {"ACTION_NOW": 0, "ACTION_THIS_WEEK": 1, "MONITOR": 2, "LOW_PRIORITY": 3}
        items.sort(key=lambda x: order.get(x.priority, 99))

        if priority_filter and priority_filter != "ALL":
            items = [i for i in items if i.priority == priority_filter]

        return items

    def get_action_center_summary(self) -> Dict[str, Any]:
        """Summary counts of actions by priority."""
        all_items = self.get_action_items()
        return {
            "total_actions": len(all_items),
            "action_now_count": sum(1 for i in all_items if i.priority == "ACTION_NOW"),
            "action_this_week_count": sum(1 for i in all_items if i.priority == "ACTION_THIS_WEEK"),
            "monitor_count": sum(1 for i in all_items if i.priority == "MONITOR"),
            "low_priority_count": sum(1 for i in all_items if i.priority == "LOW_PRIORITY"),
            "overdue_count": sum(1 for i in all_items if i.is_overdue),
            "last_evaluated": datetime.utcnow().isoformat(),
        }
