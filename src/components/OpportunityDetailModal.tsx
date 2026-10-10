import React, { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import {
  type IntelligenceEvaluationResult,
  type ApplicationFlowRecord,
  intelligenceApi,
} from "../api/intelligence";
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Send,
  Lock,
  Layers,
  Info,
} from "lucide-react";

interface OpportunityDetailModalProps {
  opp: IntelligenceEvaluationResult | null;
  onClose: () => void;
  onSubmissionRecorded?: (opportunityId: string, updatedFlow: ApplicationFlowRecord) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opp,
  onClose,
  onSubmissionRecorded,
}) => {
  const { isRTL } = useTranslation();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionRef, setSubmissionRef] = useState("");
  const [commercialBidSar, setCommercialBidSar] = useState<string>("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [localFlow, setLocalFlow] = useState<ApplicationFlowRecord | null>(
    opp?.application_flow || null
  );

  if (!opp) return null;

  const howToApply = opp.how_to_apply || {
    channel_status: "UNKNOWN" as const,
    where_to_apply: "NO VERIFIED APPLICATION CHANNEL FOUND",
    who_to_contact: "UNKNOWN",
    what_to_do_next: ["Review opportunity details and assemble corporate credentials."],
    direct_tender_url: opp.original_url || null,
    official_application_url: null,
    supplier_portal: null,
    vendor_registration_url: null,
    procurement_email: null,
    procurement_phone: null,
    official_contact_page: null,
    source_instructions: null,
    main_contractor_contact: null,
    provenance: {
      source: opp.primary_source_id || "src-etimad",
      source_url: opp.original_url || "https://monafasat.etimad.sa",
      verification_status: "NO_CHANNEL_FOUND" as const,
      verified_at: opp.last_verified_at || new Date().toISOString(),
      notes: "Default fallback provenance.",
    },
  };
  const actionability = opp.actionability || {
    score: 30,
    state: "LOW" as const,
    factors: {
      has_application_url: Boolean(opp.original_url),
      has_procurement_contact: false,
      has_supplier_portal: false,
      has_vendor_registration: false,
      has_deadline: Boolean(opp.closing_date && opp.closing_date !== "UNKNOWN"),
      has_submission_instructions: true,
      is_source_accessible: true,
      document_readiness_pct: 70,
    },
    rationale: ["Opportunity ingested from source feed."],
    missing_for_action: ["Verified procurement contact person missing."],
  };
  const applyingAs = opp.applying_as || {
    organization_id: "comp-001",
    organization_name: "Active Contractor Organization",
    organization_name_ar: "المنظمة المقاولة النشطة",
    company_size: "Medium",
    classification_grade: 2,
  };
  const flow = localFlow || opp.application_flow || {
    current_step: 1,
    submission_status: "NOT_STARTED" as const,
    portal_opened_at: null,
    submitted_at: null,
    submission_ref: null,
    commercial_bid_sar: null,
    notes: null,
  };

  const isSubcontract =
    opp.opportunity_type === "SUBCONTRACT_REQUEST" ||
    opp.opportunity_type === "AWARDED_PROJECT_SIGNAL" ||
    Boolean(opp.subcontract?.is_subcontract_target);

  const oppTitle = isRTL && opp.opportunity_title_ar ? opp.opportunity_title_ar : opp.opportunity_title;

  const handleOpenPortal = async () => {
    const targetUrl =
      howToApply.direct_tender_url ||
      howToApply.official_application_url ||
      howToApply.supplier_portal ||
      opp.original_url;

    if (!targetUrl) return;

    try {
      await intelligenceApi.openPortalEvent(opp.opportunity_id);
      setLocalFlow((prev) => ({
        current_step: Math.max(prev?.current_step || 1, 8),
        submission_status: prev?.submission_status === "SUBMITTED" ? "SUBMITTED" : "PORTAL_OPENED",
        portal_opened_at: new Date().toISOString(),
      }));
    } catch (e) {
      console.error("Portal open event error:", e);
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleRecordSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRecord(true);
    try {
      const result = await intelligenceApi.recordSubmission(opp.opportunity_id, {
        organization_id: applyingAs.organization_id,
        submission_ref: submissionRef || `SUB-${Date.now().toString().slice(-6)}`,
        commercial_bid_sar: commercialBidSar ? Number(commercialBidSar) : undefined,
        notes: submissionNotes,
      });
      setLocalFlow(result);
      if (onSubmissionRecorded) {
        onSubmissionRecorded(opp.opportunity_id, result);
      }
      setShowSubmissionForm(false);
    } catch (err) {
      console.error("Failed to record submission:", err);
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const applicationSteps = [
    { num: 1, labelEn: "Discover", labelAr: "استكشاف" },
    { num: 2, labelEn: "Analyze", labelAr: "تحليل" },
    { num: 3, labelEn: "Bid/No-Bid", labelAr: "قرار التقديم" },
    { num: 4, labelEn: "Documents", labelAr: "الوثائق" },
    { num: 5, labelEn: "Prequal", labelAr: "التأهيل" },
    { num: 6, labelEn: "BOQ / Bid", labelAr: "التسعير" },
    { num: 7, labelEn: "Readiness", labelAr: "الجاهزية" },
    { num: 8, labelEn: "Open Portal", labelAr: "فتح البوابة" },
    { num: 9, labelEn: "User Submits", labelAr: "التقديم الفعلي" },
    { num: 10, labelEn: "Recorded", labelAr: "التوثيق" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-6 shadow-2xl text-start">
        {/* Header with Active Organization & Title */}
        <div className="pb-4 border-b border-slate-800 space-y-2">
          {/* APPLYING AS Active Organization Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-200">
                  {isRTL ? "التقديم بصفتك المنظمة:" : "APPLYING AS:"}{" "}
                </strong>
                <span className="font-semibold text-emerald-100">
                  {isRTL && applyingAs.organization_name_ar
                    ? applyingAs.organization_name_ar
                    : applyingAs.organization_name}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono ms-2">
                  (ID: {applyingAs.organization_id} • Grade: {applyingAs.classification_grade || "Grade 2"} • {applyingAs.company_size || "Medium"})
                </span>
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
              TENANT_ISOLATED
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">
                  {isRTL ? "الجهة المستفيدة:" : "Client:"} {opp.client || opp.entity}
                </span>
                {opp.main_contractor || howToApply.main_contractor_contact?.name ? (
                  <>
                    <span>•</span>
                    <span className="text-purple-400 font-bold">
                      {isRTL ? "المقاول الرئيسي:" : "Main Contractor:"} {opp.main_contractor || howToApply.main_contractor_contact?.name}
                    </span>
                  </>
                ) : isSubcontract ? (
                  <>
                    <span>•</span>
                    <span className="text-purple-400/80 font-mono">
                      {isRTL ? "المقاول الرئيسي:" : "Main Contractor:"} UNKNOWN
                    </span>
                  </>
                ) : null}
                <span>•</span>
                <span>{opp.city}, {opp.region}</span>
                {opp.reference_number && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300">Ref: {opp.reference_number}</span>
                  </>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 leading-snug">
                {oppTitle}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title={isRTL ? "إغلاق" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dual Score Matrix: MATCH SCORE vs ACTIONABILITY SCORE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Match Score */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-xs text-slate-400 block font-medium">
              {isRTL ? "درجة التطابق الفني" : "Match Score"}
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {opp.match_score.total_score}%
            </span>
            <span className="text-[10px] block text-slate-400 font-semibold uppercase">
              {opp.match_score.label.replace(/_/g, " ")}
            </span>
          </div>

          {/* Actionability Score */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-xs text-slate-400 block font-medium">
              {isRTL ? "درجة قابلية التنفيذ" : "Actionability Score"}
            </span>
            <span
              className={`text-2xl font-black font-mono ${
                actionability.state === "HIGH"
                  ? "text-emerald-400"
                  : actionability.state === "MEDIUM"
                  ? "text-blue-400"
                  : actionability.state === "LOW"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {actionability.score}%
            </span>
            <span
              className={`text-[10px] font-bold block uppercase ${
                actionability.state === "HIGH"
                  ? "text-emerald-400"
                  : actionability.state === "MEDIUM"
                  ? "text-blue-400"
                  : actionability.state === "LOW"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {actionability.state} ACTIONABILITY
            </span>
          </div>

          {/* Application Channel Status */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-xs text-slate-400 block font-medium">
              {isRTL ? "قناة التقديم الرسمية" : "Application Channel"}
            </span>
            <span className="text-xs font-bold text-slate-200 mt-2 block font-mono">
              {howToApply.channel_status}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {opp.source_status || "VERIFIED"}
            </span>
          </div>

          {/* Deadline */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-xs text-slate-400 block font-medium">
              {isRTL ? "الموعد النهائي للتقديم" : "Closing Deadline"}
            </span>
            <span className="text-xs font-bold text-slate-200 mt-2 block font-mono">
              {opp.closing_date && opp.closing_date !== "UNKNOWN"
                ? opp.closing_date.slice(0, 10)
                : (isRTL ? "غير محدد" : "UNKNOWN")}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {opp.budget_sar ? `${opp.budget_sar.toLocaleString()} SAR` : "SAR UNKNOWN"}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Core Section: HOW TO APPLY & CONTACT INTELLIGENCE (The 3 Questions) */}
        {/* ============================================================== */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Send className="w-4 h-4 text-emerald-400" />
            <span>
              {isRTL
                ? "دليل التقديم والتواصل الرسمي (How to Apply & Contact Intelligence)"
                : "How to Apply & Contact Intelligence"}
            </span>
          </h3>

          {/* 1. WHERE DO I APPLY? */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                <span>📍 {isRTL ? "أين أقدم؟" : "WHERE DO I APPLY?"}</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {howToApply.channel_status}
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {howToApply.where_to_apply}
            </p>

            {/* Clickable Action Buttons for Verified Destinations ONLY */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {howToApply.direct_tender_url && (
                <button
                  onClick={handleOpenPortal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isRTL ? "فتح صفحة المنافسة المباشرة" : "Open Direct Tender Page"}</span>
                </button>
              )}

              {howToApply.official_application_url && howToApply.official_application_url !== howToApply.direct_tender_url && (
                <a
                  href={howToApply.official_application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isRTL ? "بوابة التقديم الرسمية" : "Official Application Portal"}</span>
                </a>
              )}

              {howToApply.supplier_portal && (
                <a
                  href={howToApply.supplier_portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isRTL ? "بوابة الموردين" : "Supplier Portal"}</span>
                </a>
              )}

              {howToApply.vendor_registration_url && (
                <a
                  href={howToApply.vendor_registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isRTL ? "تسجيل وتأهيل مورد" : "Vendor Registration"}</span>
                </a>
              )}

              {howToApply.official_contact_page && (
                <a
                  href={howToApply.official_contact_page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isRTL ? "صفحة التواصل الرسمية" : "Official Contact Page"}</span>
                </a>
              )}

              {!howToApply.direct_tender_url &&
                !howToApply.official_application_url &&
                !howToApply.supplier_portal && (
                  <span className="text-xs text-rose-400 font-mono flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    NO_VERIFIED_APPLICATION_CHANNEL_FOUND
                  </span>
                )}
            </div>

            {/* Source Instructions if applicable */}
            {howToApply.source_instructions && (
              <div className="mt-2 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                <span>{howToApply.source_instructions}</span>
              </div>
            )}
          </div>

          {/* 2. WHO DO I CONTACT? */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase font-mono">
              <span>👤 {isRTL ? "بمن أتواصل؟" : "WHO DO I CONTACT?"}</span>
            </span>

            <p className="text-xs text-slate-200 font-medium">
              {howToApply.who_to_contact}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
              {howToApply.procurement_email ? (
                <a
                  href={`mailto:${howToApply.procurement_email}`}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{howToApply.procurement_email}</span>
                </a>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {isRTL ? "البريد الإلكتروني: غير محدد" : "Email: UNKNOWN"}
                </span>
              )}

              {howToApply.procurement_phone ? (
                <a
                  href={`tel:${howToApply.procurement_phone}`}
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{howToApply.procurement_phone}</span>
                </a>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {isRTL ? "الهاتف: غير محدد" : "Phone: UNKNOWN"}
                </span>
              )}
            </div>
          </div>

          {/* 3. WHAT SHOULD I DO NEXT? */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono">
              <span>📋 {isRTL ? "ما الإجراء التالي الواجب اتخاذه؟" : "WHAT SHOULD I DO NEXT?"}</span>
            </span>

            <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              {howToApply.what_to_do_next.map((step, idx) => (
                <li key={idx} className="ps-1">
                  <span className="text-slate-200 font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Subcontract Opportunities Intelligence Card (if subcontract target) */}
        {isSubcontract && howToApply.main_contractor_contact && (
          <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
              <span className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{isRTL ? "معلومات المقاول الرئيسي وبدائل مقاولة الباطن" : "Main Contractor & Subcontracting Intelligence"}</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
                SUBCONTRACT_TARGET
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-purple-900/30 space-y-1">
                <span className="text-slate-400 block text-[11px]">{isRTL ? "المقاول الرئيسي الفائز:" : "Who won the main contract?"}</span>
                <span className="font-bold text-purple-200 block text-sm">
                  {howToApply.main_contractor_contact.name || "Tier-1 Contractor Consortium"}
                </span>
                {howToApply.main_contractor_contact.award_evidence && (
                  <span className="text-[11px] text-slate-400 block font-mono">
                    Evidence: {howToApply.main_contractor_contact.award_evidence}
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-purple-900/30 space-y-1">
                <span className="text-slate-400 block text-[11px]">{isRTL ? "كيف تسجل معهم وتعبر عن اهتمامك؟" : "How to register & express interest?"}</span>
                <p className="text-slate-300 text-xs">
                  {opp.subcontract?.subcontract_rationale?.[0] || "Register on their vendor portal and submit an EOI referencing the main contract award."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {howToApply.main_contractor_contact.portal_url && (
                <a
                  href={howToApply.main_contractor_contact.portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/50 hover:bg-purple-900/80 text-purple-200 border border-purple-700/60 rounded-lg text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
                  <span>{isRTL ? "بوابة المقاول الرئيسي" : "Main Contractor Portal"}</span>
                </a>
              )}

              {howToApply.main_contractor_contact.registration_url && (
                <a
                  href={howToApply.main_contractor_contact.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isRTL ? "تسجيل مقاولي الباطن" : "Subcontractor Registration"}</span>
                </a>
              )}

              {howToApply.main_contractor_contact.eoi_contact && (
                <a
                  href={`mailto:${howToApply.main_contractor_contact.eoi_contact}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition-colors font-mono"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>EOI: {howToApply.main_contractor_contact.eoi_contact}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* End-to-End Application Flow Stepper (10 Steps) */}
        {/* ============================================================== */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? "مسار التقديم والتنفيذ المعتمد (10 مراحل)" : "Verified 10-Step Application Pipeline"}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRTL
                  ? "تتبع خطوات التقديم من الاستكشاف وحتى التوثيق النهائي"
                  : "Track progress from discovery through prequalification, BOQ, portal submission, and record keeping."}
              </p>
            </div>

            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
              flow.submission_status === "SUBMITTED"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : flow.submission_status === "PORTAL_OPENED"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                : "bg-slate-800 text-slate-400"
            }`}>
              STATUS: {flow.submission_status}
            </span>
          </div>

          {/* Stepper bubbles */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[620px] gap-1 text-[11px]">
              {applicationSteps.map((s) => {
                const isPassed = (flow.current_step || 1) >= s.num;
                const isCurrent = (flow.current_step || 1) === s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center flex-1 text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs mb-1 transition-all ${
                        isPassed
                          ? "bg-emerald-500 text-slate-950 shadow-xs"
                          : isCurrent
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {s.num}
                    </div>
                    <span className={`text-[10px] leading-tight ${isPassed ? "text-slate-200 font-semibold" : "text-slate-500"}`}>
                      {isRTL ? s.labelAr : s.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer on external portal navigation */}
          <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-lg text-xs text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
            <p>
              {isRTL
                ? "تنبيه الشفافية: فتح البوابة الرسمية لا يعني إتمام التقديم تلقائياً. يتطلب التقديم الحكومي والمؤسسي مصادقة نفاذ موحد أو تسجيل دخول رسمي على بوابة المشتريات. بعد الانتهاء، قم بتوثيق رقم المرجع هنا."
                : "Integrity Notice: Opening the official portal does NOT automatically submit the tender. Government portals require corporate Nafath/Absher MFA or verified supplier portal login. After completing submission externally, record your official reference here."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {howToApply.channel_status !== "NO_VERIFIED_APPLICATION_CHANNEL" ? (
              <button
                onClick={handleOpenPortal}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isRTL ? "8. فتح البوابة الرسمية للتقديم" : "8. Open Official Portal"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold border border-slate-700">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>{isRTL ? "لا توجد بوابة تقديم معتمدة حالياً" : "No Verified Application Portal"}</span>
              </div>
            )}

            {flow.submission_status !== "SUBMITTED" ? (
              <button
                onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isRTL ? "10. توثيق رقم التقديم النهائي" : "10. Record Official Submission"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono font-bold bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isRTL ? "تم التوثيق:" : "SUBMISSION RECORDED:"} {flow.submission_ref || "N/A"} ({flow.submitted_at?.slice(0, 10)})
                </span>
              </div>
            )}
          </div>

          {/* Submission Record Form Drawer */}
          {showSubmissionForm && (
            <form onSubmit={handleRecordSubmission} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 pt-3">
              <span className="text-xs font-bold text-slate-200 block">
                {isRTL ? "توثيق تفاصيل التقديم الفعلي على البوابة الرسمية:" : "Record Official Portal Submission Details:"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {isRTL ? "رقم المرجع / إشعار الاستلام من المنصة" : "Portal Reference / Receipt Number"}
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionRef}
                    onChange={(e) => setSubmissionRef(e.target.value)}
                    placeholder="e.g. ETM-SUB-2026-9901"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {isRTL ? "قيمة العرض المالي المقدم (SAR)" : "Submitted Commercial Bid (SAR)"}
                  </label>
                  <input
                    type="number"
                    value={commercialBidSar}
                    onChange={(e) => setCommercialBidSar(e.target.value)}
                    placeholder="e.g. 42000000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {isRTL ? "ملاحظات التقديم والضمانات البنكية" : "Submission Notes & Bank Guarantee Reference"}
                </label>
                <input
                  type="text"
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder={isRTL ? "تم تسليم الضمان البنكي ورفع الملف الفني..." : "Bank guarantee submitted, technical envelope uploaded..."}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmissionForm(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRecord}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {isSubmittingRecord ? (isRTL ? "جارٍ الحفظ..." : "Saving...") : (isRTL ? "حفظ وتوثيق التقديم" : "Save Submission Record")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Actionability Breakdown & Missing Factors */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-bold text-slate-300">
              {isRTL ? "تفكيك قابلية التنفيذ ومعوقات التقديم (Actionability Factors):" : "Actionability Factors & Operational Readiness:"}
            </span>
            <span className="text-slate-400 font-mono">
              Score: <strong className="text-emerald-400">{actionability.score}/100</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 block">{isRTL ? "العوامل الإيجابية:" : "Positive Factors:"}</span>
              <ul className="space-y-1 text-slate-300">
                {actionability.rationale.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-amber-400 block">{isRTL ? "المتطلبات أو الفجوات:" : "Missing / Gaps:"}</span>
              {actionability.missing_for_action.length > 0 ? (
                <ul className="space-y-1 text-slate-400">
                  {actionability.missing_for_action.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400">✕</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-500 text-xs">{isRTL ? "لا توجد متطلبات ناقصة" : "No operational gaps identified."}</span>
              )}
            </div>
          </div>
        </div>

        {/* Truthful Provenance & Lifecycle Audit */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isRTL ? "سجل التحقق ومصدر البيانات الصريح:" : "Truthful Provenance & Source Audit:"}</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {opp.record_origin || "UNKNOWN"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-400">
            <div>
              <span className="text-slate-500 block">source_id:</span>
              <strong className="text-slate-300">{opp.primary_source_id || "src-etimad"}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">source_status:</span>
              <strong className={opp.source_status === "WORKING_LIVE" ? "text-emerald-400" : opp.source_status === "AUTH_REQUIRED" ? "text-amber-400" : "text-rose-400"}>
                {opp.source_status || "UNKNOWN"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">last_verified_at:</span>
              <strong className="text-slate-300">{opp.last_verified_at ? opp.last_verified_at.slice(0, 10) : "N/A"}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">is_stale:</span>
              <strong className={opp.is_stale ? "text-amber-400" : "text-emerald-400"}>
                {opp.is_stale ? "TRUE (STALE)" : "FALSE (CURRENT)"}
              </strong>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            {isRTL ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
