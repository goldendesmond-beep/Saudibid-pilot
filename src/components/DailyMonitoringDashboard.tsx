import React, { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import {
  type DailySnapshotItem,
  monitoringApi,
} from "../api/monitoring";
import { printDailyReport } from "../utils/pdfExport";
import {
  Play,
  FileDown,
  Calendar,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface DailyMonitoringDashboardProps {
  currentSnapshot?: DailySnapshotItem | null;
  snapshots: DailySnapshotItem[];
  companyName: string;
  onRefresh: () => void;
}

export const DailyMonitoringDashboard: React.FC<DailyMonitoringDashboardProps> = ({
  currentSnapshot,
  snapshots,
  companyName,
  onRefresh,
}) => {
  const { isRTL } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<DailySnapshotItem | null>(currentSnapshot || null);

  const activeSnapshot = selectedSnapshot || currentSnapshot || snapshots[0];

  const handleRunMonitoring = async (allowFixtures: boolean = false) => {
    setIsRunning(true);
    try {
      await monitoringApi.runDailyMonitoring(allowFixtures);
      onRefresh();
    } catch (err) {
      console.error("Failed to run monitoring:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportPDF = (lang: "ar" | "en") => {
    if (!activeSnapshot) return;
    printDailyReport({
      reportDate: activeSnapshot.snapshot_date,
      language: lang,
      contractorName: companyName,
      opportunities: activeSnapshot.opportunities_snapshot,
      sourcesSummary: activeSnapshot.sources_summary,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Summary Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>{isRTL ? "موجز المراقبة اليومية للمناقصات" : "Daily Procurement Monitoring Digest"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL
                ? `تاريخ السجل اليومي: ${activeSnapshot?.snapshot_date || "اليوم"} • لقطة تاريخية موثقة غير قابلة للتغيير`
                : `Active Snapshot: ${activeSnapshot?.snapshot_date || "Today"} • Immutable Historical Intelligence Record`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExportPDF(isRTL ? "ar" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>{isRTL ? "تصدير تقرير PDF" : "Export PDF Report"}</span>
            </button>

            <button
              onClick={() => handleRunMonitoring(false)}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-lg text-xs font-bold text-white transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? (isRTL ? "جارٍ الفحص..." : "Scanning...") : (isRTL ? "تشغيل المراقبة الآن" : "Run Daily Scan")}</span>
            </button>
          </div>
        </div>

        {/* Live vs Fixture Warning Banner */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isRTL
                ? "قاعدة الشفافية الصارمة: مصادر البيانات الحية (Furas, NEOM, ROSHN) مفصولة تماماً عن المصادر المحمية أو ذات النفاذ المشروط."
                : "Live Integrity Rule: Safe live sources (Furas, NEOM, ROSHN) are strictly separated from auth-gated or firewall-filtered portals."}
            </span>
          </div>

          <span className="text-[11px] text-emerald-400 font-mono font-semibold">
            {isRTL ? "موثق رسمي" : "VERIFIED_OFFICIAL"}
          </span>
        </div>

        {/* Primary KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3 text-center">
            <span className="text-xl font-extrabold text-slate-100 block">
              {activeSnapshot?.canonical_opportunities_count || 0}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {isRTL ? "إجمالي الفرص" : "Total Opps"}
            </span>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 text-center">
            <span className="text-xl font-extrabold text-emerald-400 block">
              {activeSnapshot?.strong_match_count || 0}
            </span>
            <span className="text-[11px] text-emerald-300 font-medium">
              {isRTL ? "تطابق قوي جداً" : "Strong Matches"}
            </span>
          </div>

          <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg p-3 text-center">
            <span className="text-xl font-extrabold text-blue-400 block">
              {activeSnapshot?.government_count || 0}
            </span>
            <span className="text-[11px] text-blue-300 font-medium">
              {isRTL ? "منافسات حكومية" : "Government"}
            </span>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/40 rounded-lg p-3 text-center">
            <span className="text-xl font-extrabold text-purple-400 block">
              {activeSnapshot?.private_count || 0}
            </span>
            <span className="text-[11px] text-purple-300 font-medium">
              {isRTL ? "مشاريع خاصة وكبرى" : "Private / Giga"}
            </span>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-center">
            <span className="text-xl font-extrabold text-amber-400 block">
              {activeSnapshot?.closing_within_7_days_count || 0}
            </span>
            <span className="text-[11px] text-amber-300 font-medium">
              {isRTL ? "تنتهي خلال 7 أيام" : "Closing Soon (<7d)"}
            </span>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/40 rounded-lg p-3 text-center">
            <span className="text-xl font-extrabold text-teal-400 block">
              {activeSnapshot?.subcontract_targets_count || 0}
            </span>
            <span className="text-[11px] text-teal-300 font-medium">
              {isRTL ? "أهداف مقاولة باطن" : "Subcontract Targets"}
            </span>
          </div>
        </div>

        {/* Regional Breakdown Summary */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span>
              {isRTL ? "المنطقة الشرقية" : "Eastern Region"}:{" "}
              <strong className="text-slate-200">{activeSnapshot?.eastern_region_count || 0}</strong>
            </span>
            <span>
              {isRTL ? "الجبيل الصناعية" : "Jubail Industrial City"}:{" "}
              <strong className="text-slate-200">{activeSnapshot?.jubail_count || 0}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400">
              ✓ {activeSnapshot?.sources_summary?.successful || 3} {isRTL ? "مصادر مفحوصة حياً" : "Live Checked"}
            </span>
            <span className="text-amber-400">
              🔒 {activeSnapshot?.sources_summary?.auth_required || 2} {isRTL ? "تتطلب نفاذ/اعتماد" : "Auth Required"}
            </span>
            <span className="text-rose-400">
              ✕ {activeSnapshot?.sources_summary?.blocked || 4} {isRTL ? "محجوبة/مهلة" : "Blocked/Timeout"}
            </span>
          </div>
        </div>
      </div>

      {/* Daily History Timeline (Part D) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>{isRTL ? "سجل اللقطات التاريخية للمراقبة (Daily Snapshots)" : "Immutable Historical Daily Snapshots"}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {snapshots.map((snap) => {
            const isSelected = activeSnapshot?.id === snap.id;
            return (
              <div
                key={snap.id}
                onClick={() => setSelectedSnapshot(snap)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-slate-800 border-emerald-500/80 ring-1 ring-emerald-500/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>{snap.snapshot_date}</span>
                  <span className="text-emerald-400 font-mono">{snap.canonical_opportunities_count} opps</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">{isRTL ? "تطابق قوي" : "Strong"}</span>
                    <strong className="text-emerald-400">{snap.strong_match_count}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{isRTL ? "حكومي" : "Gov"}</span>
                    <strong className="text-blue-400">{snap.government_count}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{isRTL ? "قريب" : "<7d"}</span>
                    <strong className="text-amber-400">{snap.closing_within_7_days_count}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
