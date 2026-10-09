import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { OpportunityExplorer } from "../components/OpportunityExplorer";
import { OpportunityDetailModal } from "../components/OpportunityDetailModal";
import { intelligenceApi, type IntelligenceEvaluationResult } from "../api/intelligence";
import { savedListsApi, type SavedListModel } from "../api/savedLists";
import { actionCenterApi, type ActionCenterSummary } from "../api/actionCenter";
import { prequalApi, type VaultSummary } from "../api/prequalification";
import { proposalApi } from "../api/proposals";
import { monitoringApi } from "../api/monitoring";
import { useCompanyStore } from "../store/companyStore";
import { useTranslation } from "../i18n/useTranslation";
import {
  Compass,
  RefreshCw,
  Award,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  AlertCircle,
  ArrowUpRight,
  Play,
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
  const [isRefreshingSources, setIsRefreshingSources] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<IntelligenceEvaluationResult | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const currentCompanyId = profile?.id || "comp-001";
      const [opps, lists, actSum, vltSum, props] = await Promise.all([
        intelligenceApi.evaluate(currentCompanyId),
        savedListsApi.list(currentCompanyId),
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

  const handleLiveRefresh = async () => {
    try {
      setIsRefreshingSources(true);
      await monitoringApi.runDailyMonitoring();
      await loadData();
    } catch (err) {
      console.error("Failed during live source refresh:", err);
      await loadData();
    } finally {
      setIsRefreshingSources(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allSavedOppIds = savedLists.flatMap((l) => l.opportunity_ids || []);

  const handleToggleSave = async (oppId: string) => {
    const currentCompanyId = profile?.id || "comp-001";
    if (savedLists.length === 0) {
      const created = await savedListsApi.create({
        name: "My Saved Opportunities",
        opportunity_ids: [oppId],
        company_id: currentCompanyId,
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleLiveRefresh}
            disabled={isRefreshingSources || loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-xs"
            title={isRTL ? "تشغيل خط فحص المصادر الحية والتحديث الفوري" : "Execute Live Source Refresh Pipeline"}
          >
            <Play className={`w-3.5 h-3.5 ${isRefreshingSources ? "animate-spin" : ""}`} />
            <span>{isRefreshingSources ? (isRTL ? "جارٍ فحص المصادر..." : "Scanning Sources...") : (isRTL ? "تحديث وفحص المصادر الحية" : "Live Source Scan & Refresh")}</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{isRTL ? "إعادة تحميل" : "Reload"}</span>
          </button>
        </div>
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
        <OpportunityDetailModal
          opp={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onSubmissionRecorded={(oppId, updatedFlow) => {
            setOpportunities((prev) =>
              prev.map((o) =>
                o.opportunity_id === oppId
                  ? { ...o, application_flow: updatedFlow }
                  : o
              )
            );
            if (selectedOpp && selectedOpp.opportunity_id === oppId) {
              setSelectedOpp({ ...selectedOpp, application_flow: updatedFlow });
            }
          }}
        />
      )}
    </div>
  );
}
