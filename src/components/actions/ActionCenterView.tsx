import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n/useTranslation";
import {
  actionCenterApi,
  type ActionCenterItemModel,
  type ActionCenterSummary,
} from "../../api/actionCenter";
import {
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export function ActionCenterView() {
  const { isAr } = useTranslation();

  const [actions, setActions] = useState<ActionCenterItemModel[]>([]);
  const [summary, setSummary] = useState<ActionCenterSummary | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const loadActions = useCallback(async () => {
    setLoading(true);
    try {
      const [items, sum] = await Promise.all([
        actionCenterApi.getActionItems(priorityFilter),
        actionCenterApi.getActionSummary(),
      ]);
      setActions(items);
      setSummary(sum);
    } catch (err) {
      console.error("Error loading action center:", err);
    } finally {
      setLoading(false);
    }
  }, [priorityFilter]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "ACTION_NOW":
        return {
          border: "border-red-900/40 bg-red-950/20",
          badge: "bg-red-500/20 text-red-400 border border-red-500/30",
          icon: ShieldAlert,
        };
      case "ACTION_THIS_WEEK":
        return {
          border: "border-amber-900/40 bg-amber-950/20",
          badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          icon: Clock,
        };
      case "MONITOR":
        return {
          border: "border-blue-900/40 bg-blue-950/20",
          badge: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
          icon: AlertCircle,
        };
      default:
        return {
          border: "border-[#1e2530] bg-[#161a22]",
          badge: "bg-gray-800 text-gray-300",
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2530] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e8eaed]">
            {isAr ? "مركز الإجراءات الموحد للفرص والمقاولات" : "Unified Contractor Action Center"}
          </h2>
          <p className="text-xs text-[#8b93a0] mt-1">
            {isAr
              ? "طابور أولويات موحد يجمع الوثائق المنتهية، البنود غير المسعرة، المواعيد النهائية، وتسجيلات الموردين عبر كافة مراحل النظام"
              : "Unified priority queue prioritizing expired certificates, unpriced BOQs, approaching deadlines, and portal onboarding"}
          </p>
        </div>

        <button
          onClick={loadActions}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0] hover:text-[#e8eaed] transition-colors self-start md:self-auto"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>{isAr ? "تحديث الإجراءات" : "Refresh Actions"}</span>
        </button>
      </div>

      {/* KPI Summary Tiles */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-red-900/30 bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-red-400">{isAr ? "إجراء فوري مطلوب" : "ACTION NOW"}</div>
            <div className="text-2xl font-extrabold text-red-400 mt-1">{summary.action_now_count}</div>
          </div>
          <div className="rounded-lg border border-amber-900/30 bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-amber-400">{isAr ? "إجراء هذا الأسبوع" : "ACTION THIS WEEK"}</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{summary.action_this_week_count}</div>
          </div>
          <div className="rounded-lg border border-blue-900/30 bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-blue-400">{isAr ? "مراقبة ومتابعة" : "MONITOR"}</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">{summary.monitor_count}</div>
          </div>
          <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-[#8b93a0]">{isAr ? "مهام متأخرة" : "Overdue Tasks"}</div>
            <div className="text-2xl font-extrabold text-[#e8eaed] mt-1">{summary.overdue_count}</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#12151b] rounded-lg border border-[#1e2530]">
        {[
          { id: "ALL", en: "All Actions", ar: "كافة الإجراءات" },
          { id: "ACTION_NOW", en: "Action Now", ar: "إجراء فوري" },
          { id: "ACTION_THIS_WEEK", en: "This Week", ar: "خلال الأسبوع" },
          { id: "MONITOR", en: "Monitor", ar: "قيد المراقبة" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPriorityFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              priorityFilter === tab.id
                ? "bg-[#c9a84c] text-black shadow-sm"
                : "text-[#8b93a0] hover:text-[#e8eaed]"
            }`}
          >
            {isAr ? tab.ar : tab.en}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#8b93a0]">
            <RefreshCw size={16} className="animate-spin text-[#c9a84c] mx-auto mb-2" />
            <span>{isAr ? "جاري تحميل مركز الإجراءات..." : "Loading Action Center..."}</span>
          </div>
        ) : actions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8b93a0] rounded-xl border border-[#1e2530] bg-[#161a22]">
            {isAr ? "لا توجد مهام أو إجراءات معلقة في هذا التصنيف." : "No pending action items for this priority level."}
          </div>
        ) : (
          actions.map((act) => {
            const style = getPriorityStyle(act.priority);
            const Icon = style.icon;

            return (
              <div
                key={act.id}
                className={`p-4 rounded-xl border transition-all ${style.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#12151b] border border-[#1e2530] text-[#c9a84c] shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${style.badge}`}>
                        {act.priority}
                      </span>
                      <span className="text-[11px] font-mono text-[#8b93a0]">
                        {act.category}
                      </span>
                      {act.is_overdue && (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-900 text-red-400 text-[10px] font-bold">
                          {isAr ? "متأخر" : "OVERDUE"}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-[#e8eaed]">
                      {isAr ? act.title_ar : act.title_en}
                    </h4>

                    <p className="text-[11px] text-[#8b93a0]">
                      {isAr ? act.description_ar : act.description_en}
                    </p>

                    {act.due_date && (
                      <div className="text-[10px] text-[#8b93a0] font-mono pt-1">
                        {isAr ? "تاريخ الاستحقاق:" : "Due Date:"} {act.due_date.slice(0, 10)}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to={act.deep_link}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#c9a84c] text-black font-semibold text-xs hover:bg-[#c9a84c]/90 transition-colors shrink-0 self-stretch sm:self-auto"
                >
                  <span>{isAr ? act.action_cta_ar : act.action_cta_en}</span>
                  <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
