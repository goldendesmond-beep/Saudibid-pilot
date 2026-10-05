import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { OpportunityExplorer } from "../components/OpportunityExplorer";
import { intelligenceApi, type IntelligenceEvaluationResult } from "../api/intelligence";
import { savedListsApi, type SavedListModel } from "../api/savedLists";
import { actionCenterApi, type ActionCenterSummary } from "../api/actionCenter";
import { prequalApi, type VaultSummary } from "../api/prequalification";
import { proposalApi } from "../api/proposals";
import { useCompanyStore } from "../store/companyStore";
import { useTranslation } from "../i18n/useTranslation";
import {
  Compass,
  RefreshCw,
  X,
  Award,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

export function OpportunityExplorerPage() {
  const { profile } = useCompanyStore();
  const { isRTL } = useTranslation();
  const [opportunities, setOpportunities] = useState<IntelligenceEvaluationResult[]>([]);
  const [savedLists, setSavedLists] = useState<SavedListModel[]>([]);
  const [actionSummary, setActionSummary] = useState<ActionCenterSummary | null>(null);
  const [vaultSummary, setVaultSummary] = useState<VaultSummary | null>(null);
  const [activeProposalsCount, setActiveProposalsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<IntelligenceEvaluationResult | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [opps, lists, actSum, vltSum, props] = await Promise.all([
        intelligenceApi.evaluate(profile?.id || "comp-sa-001"),
        savedListsApi.list("comp-sa-001"),
        actionCenterApi.getActionSummary().catch(() => null),
        prequalApi.getVaultSummary().catch(() => null),
        proposalApi.getProposals().catch(() => []),
      ]);
      setOpportunities(opps);
      setSavedLists(lists);
      if (actSum) setActionSummary(actSum);
      if (vltSum) setVaultSummary(vltSum);
      if (props) setActiveProposalsCount(props.length);
    } catch (err) {
      console.error("Failed to load explorer data:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allSavedOppIds = savedLists.flatMap((l) => l.opportunity_ids || []);

  const handleToggleSave = async (oppId: string) => {
    if (savedLists.length === 0) {
      const created = await savedListsApi.create({
        name: "My Saved Opportunities",
        opportunity_ids: [oppId],
        company_id: "comp-sa-001",
      });
      setSavedLists([created]);
      return;
    }

    const defaultList = savedLists[0];
    const isSaved = defaultList.opportunity_ids.includes(oppId);
    const updatedIds = isSaved
      ? defaultList.opportunity_ids.filter((id) => id !== oppId)
      : [...defaultList.opportunity_ids, oppId];

    await savedListsApi.update(defaultList.id, {
      opportunity_ids: updatedIds,
    });
    setSavedLists(savedLists.map((l) => (l.id === defaultList.id ? { ...l, opportunity_ids: updatedIds } : l)));
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>{isRTL ? "مستكشف الفرص والمنافسات المتقدم" : "Saudi Opportunity Explorer"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isRTL
              ? "استكشاف وتقييم الفرص الحكومية والخاصة مع حساب درجات التطابق، فحص الأهلية الصارم، وتحليل بدائل مقاولات الباطن"
              : "Discover verified government and private tenders with explainable Match Scores, evidence-backed eligibility, and subcontracting alternatives."}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isRTL ? "تحديث الفرص" : "Refresh Opportunities"}</span>
        </button>
      </div>

      {/* Stage 1-10 End-to-End Intelligence & Action Command Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Active Tenders */}
        <div className="p-3 rounded-xl bg-[#161a22] border border-[#1e2530] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b93a0] text-xs">
            <span>{isRTL ? "المنافسات النشطة" : "Active Tenders"}</span>
            <Compass size={14} className="text-[#388bfd]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#e8eaed]">{opportunities.length}</span>
            <span className="text-[10px] text-emerald-400 font-mono">Stage 1-6</span>
          </div>
        </div>

        {/* Verified Awards & Primes */}
        <Link
          to="/awards"
          className="p-3 rounded-xl bg-[#161a22] border border-[#1e2530] hover:border-[#c9a84c]/50 transition-colors flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#8b93a0] text-xs">
            <span>{isRTL ? "الترسيات المؤكدة" : "Verified Awards"}</span>
            <Award size={14} className="text-[#c9a84c] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#e8eaed]">12</span>
            <span className="text-[10px] text-[#c9a84c] flex items-center gap-0.5">
              <span>{isRTL ? "تتبع" : "Track"}</span>
              <ArrowUpRight size={10} />
            </span>
          </div>
        </Link>

        {/* Subcontract Opportunities */}
        <Link
          to="/subcontract-radar"
          className="p-3 rounded-xl bg-[#161a22] border border-[#1e2530] hover:border-purple-500/50 transition-colors flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#8b93a0] text-xs">
            <span>{isRTL ? "فرص مقاولي الباطن" : "Subcontracts"}</span>
            <Layers size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#e8eaed]">18</span>
            <span className="text-[10px] text-purple-400 flex items-center gap-0.5">
              <span>{isRTL ? "رادار" : "Radar"}</span>
              <ArrowUpRight size={10} />
            </span>
          </div>
        </Link>

        {/* Vendor Registrations & Dossier */}
        <Link
          to="/vendor-registration"
          className="p-3 rounded-xl bg-[#161a22] border border-[#1e2530] hover:border-emerald-500/50 transition-colors flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#8b93a0] text-xs">
            <span>{isRTL ? "التأهيل وملفات المقاولين" : "Vendor Portals"}</span>
            <FileCheck2 size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#e8eaed]">8</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              <span>85% {isRTL ? "جاهزية" : "Ready"}</span>
              <ArrowUpRight size={10} />
            </span>
          </div>
        </Link>

        {/* Proposals & BOQ */}
        <Link
          to="/proposals"
          className="p-3 rounded-xl bg-[#161a22] border border-[#1e2530] hover:border-cyan-500/50 transition-colors flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#8b93a0] text-xs">
            <span>{isRTL ? "عروض الأسعار و BOQ" : "Proposals & BOQ"}</span>
            <FileSpreadsheet size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#e8eaed]">{activeProposalsCount || 1}</span>
            <span className="text-[10px] text-cyan-400 flex items-center gap-0.5">
              <span>{isRTL ? "إدارة" : "Manage"}</span>
              <ArrowUpRight size={10} />
            </span>
          </div>
        </Link>

        {/* Action Center - ACTION_NOW */}
        <Link
          to="/vendor-registration?tab=actions"
          className={`p-3 rounded-xl border transition-colors flex flex-col justify-between group ${
            actionSummary && actionSummary.action_now_count > 0
              ? "bg-red-950/20 border-red-900/40 hover:border-red-500/50"
              : "bg-[#161a22] border-[#1e2530] hover:border-[#c9a84c]/50"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={actionSummary && actionSummary.action_now_count > 0 ? "text-red-300 font-semibold" : "text-[#8b93a0]"}>
              {isRTL ? "إجراءات عاجلة" : "ACTION NOW"}
            </span>
            <AlertCircle size={14} className={actionSummary && actionSummary.action_now_count > 0 ? "text-red-400 animate-pulse" : "text-[#8b93a0]"} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-bold ${actionSummary && actionSummary.action_now_count > 0 ? "text-red-400" : "text-[#e8eaed]"}`}>
              {actionSummary ? actionSummary.action_now_count : 2}
            </span>
            <span className="text-[10px] text-red-400 flex items-center gap-0.5">
              <span>{isRTL ? "مركز الإجراءات" : "Action Center"}</span>
              <ArrowUpRight size={10} />
            </span>
          </div>
        </Link>
      </div>

      {/* Expiry Alert Strip if any document in Vault is expired */}
      {vaultSummary && vaultSummary.expired_count > 0 && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>
              {isRTL
                ? `تنبيه وثائق المقاول: يوجد (${vaultSummary.expired_count}) وثيقة منتهية الصلاحية في خزينة الوثائق تمنع اكتمال حزم التأهيل إلى 100%.`
                : `Contractor Vault Alert: ${vaultSummary.expired_count} document(s) expired in the vault, preventing 100% prequalification readiness.`}
            </span>
          </div>
          <Link
            to="/vendor-registration?tab=vault"
            className="px-2.5 py-1 bg-red-900/50 text-red-200 hover:bg-red-900/80 rounded-md font-semibold shrink-0 transition-colors"
          >
            {isRTL ? "تحديث في الخزينة" : "Update in Vault"}
          </Link>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
          <p>{isRTL ? "جارٍ تحليل وتقييم الفرص ومطابقتها مع ملف المقاول..." : "Evaluating and matching opportunities with contractor capability profile..."}</p>
        </div>
      ) : (
        <OpportunityExplorer
          opportunities={opportunities}
          savedListIds={allSavedOppIds}
          onToggleSave={handleToggleSave}
          onSelectOpp={(opp) => setSelectedOpp(opp)}
        />
      )}

      {/* Selected Opportunity Intelligence Modal / Drawer */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-start">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-mono text-emerald-400">{selectedOpp.entity} • {selectedOpp.city}</span>
                <h3 className="text-base font-bold text-slate-100">
                  {isRTL && selectedOpp.opportunity_title_ar ? selectedOpp.opportunity_title_ar : selectedOpp.opportunity_title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Eligibility Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">{isRTL ? "درجة التطابق" : "Match Score"}</span>
                <span className="text-xl font-extrabold text-emerald-400">{selectedOpp.match_score.total_score}%</span>
                <span className="text-[10px] block text-slate-400">{selectedOpp.match_score.label}</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">{isRTL ? "الأهلية النظامية" : "Eligibility"}</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">{selectedOpp.eligibility.status}</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">{isRTL ? "الميزانية المعتمدة" : "Budget"}</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {selectedOpp.budget_sar ? `${selectedOpp.budget_sar.toLocaleString()} SAR` : "UNKNOWN"}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">{isRTL ? "الموعد النهائي" : "Closing"}</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {selectedOpp.closing_date ? selectedOpp.closing_date.slice(0, 10) : "UNKNOWN"}
                </span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-2 p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs">
              <span className="font-bold text-slate-300 block">{isRTL ? "تفكيك درجة التطابق الحسابية:" : "Match Score Component Breakdown:"}</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
                <div>Activity Fit: <strong className="text-slate-200">{selectedOpp.match_score.components.activity_fit}/25</strong></div>
                <div>Geographic Fit: <strong className="text-slate-200">{selectedOpp.match_score.components.geographic_fit}/20</strong></div>
                <div>Scale Fit: <strong className="text-slate-200">{selectedOpp.match_score.components.project_scale_fit}/20</strong></div>
                <div>Capacity: <strong className="text-slate-200">{selectedOpp.match_score.components.capacity_fit}/15</strong></div>
                <div>Preference: <strong className="text-slate-200">{selectedOpp.match_score.components.preference_fit}/10</strong></div>
                <div>Semantic Fit: <strong className="text-slate-200">{selectedOpp.match_score.components.semantic_fit}/10</strong></div>
              </div>
            </div>

            {/* Subcontracting Potential */}
            {selectedOpp.subcontract.is_subcontract_target && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isRTL ? "بديل مقاولة الباطن الموصى به" : "Subcontracting Alternative Target"}</span>
                </div>
                <p>{selectedOpp.subcontract.subcontract_rationale.join(" ")}</p>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  {isRTL ? "الموقع التنافسي الموصى به:" : "Recommended Positioning:"} {selectedOpp.subcontract.recommended_positioning}
                </div>
              </div>
            )}

            {/* Gap Analysis */}
            <div className="space-y-2 p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs">
              <span className="font-bold text-slate-300 block">{isRTL ? "تحليل الفجوات والقدرات المتاحة:" : "Capability Gap Analysis:"}</span>
              <div className="space-y-1">
                <div className="text-emerald-400">
                  ✓ {isRTL ? "القدرات المتوفرة:" : "Available:"} {selectedOpp.gap_analysis.available_capabilities.join(", ") || "None"}
                </div>
                {selectedOpp.gap_analysis.missing_capabilities.length > 0 && (
                  <div className="text-rose-400">
                    ✕ {isRTL ? "المتطلبات المفقودة:" : "Missing:"} {selectedOpp.gap_analysis.missing_capabilities.join(", ")}
                  </div>
                )}
                {selectedOpp.gap_analysis.unknown_capabilities.length > 0 && (
                  <div className="text-amber-400">
                    ? {isRTL ? "غير محدد / يتطلب مراجعة:" : "Unknown:"} {selectedOpp.gap_analysis.unknown_capabilities.join(", ")}
                  </div>
                )}
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                {selectedOpp.gap_analysis.disclaimer}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                {isRTL ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
