import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../i18n/useTranslation";
import {
  Award,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Bell,
  Building2,
  Calendar,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  awardsApi,
  type AwardWatchModel,
  type AwardResultModel,
  type AwardNotificationModel,
  type AwardStatus,
} from "../api/awards";

export const AwardTrackingDashboard: React.FC = () => {
  const { isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState<"watches" | "results" | "conflicts" | "notifications">("watches");
  const [watches, setWatches] = useState<AwardWatchModel[]>([]);
  const [results, setResults] = useState<AwardResultModel[]>([]);
  const [notifications, setNotifications] = useState<AwardNotificationModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningChecks, setRunningChecks] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Record Result Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [recordOpportunityId, setRecordOpportunityId] = useState<string>("");
  const [recordWinner, setRecordWinner] = useState<string>("");
  const [recordValue, setRecordValue] = useState<string>("");
  const [recordAwardDate, setRecordAwardDate] = useState<string>("");
  const [recordSourceType, setRecordSourceType] = useState<string>("ORIGINAL_TENDER_PORTAL");
  const [recordSourceUrl, setRecordSourceUrl] = useState<string>("");
  const [recordEvidence, setRecordEvidence] = useState<string>("");
  const [recordStatus, setRecordStatus] = useState<AwardStatus>("AWARDED_VERIFIED");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedWatches, fetchedResults, fetchedNotifs] = await Promise.all([
        awardsApi.listWatches({ company_id: "comp-sa-001" }),
        awardsApi.listResults(),
        awardsApi.listNotifications("comp-sa-001"),
      ]);
      setWatches(fetchedWatches);
      setResults(fetchedResults);
      setNotifications(fetchedNotifs);
    } catch (err) {
      console.error("Failed to load award tracking data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTriggerChecks = async () => {
    try {
      setRunningChecks(true);
      await awardsApi.triggerCheckRun();
      await loadData();
    } catch (err) {
      console.error("Error triggering adaptive checks:", err);
    } finally {
      setRunningChecks(false);
    }
  };

  const handleDeleteWatch = async (watchId: string) => {
    if (!window.confirm(isRTL ? "هل أنت متأكد من إلغاء متابعة هذه المنافسة؟" : "Are you sure you want to stop watching this award?")) {
      return;
    }
    try {
      await awardsApi.deleteWatch(watchId);
      setWatches((prev) => prev.filter((w) => w.id !== watchId));
    } catch (err) {
      console.error("Failed to delete watch:", err);
    }
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await awardsApi.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleCreateAwardResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordOpportunityId.trim()) return;

    try {
      await awardsApi.recordResult({
        opportunity_id: recordOpportunityId.trim(),
        winner_legal_name: recordWinner.trim() || "UNKNOWN",
        contract_value_sar: recordValue ? parseFloat(recordValue) : null,
        award_date: recordAwardDate || new Date().toISOString().slice(0, 10),
        source_type: recordSourceType,
        source_url: recordSourceUrl.trim(),
        evidence_text: recordEvidence.trim(),
        status: recordStatus,
      });

      setIsRecordModalOpen(false);
      setRecordOpportunityId("");
      setRecordWinner("");
      setRecordValue("");
      setRecordAwardDate("");
      setRecordEvidence("");
      setRecordSourceUrl("");
      await loadData();
    } catch (err) {
      console.error("Failed to record award result:", err);
    }
  };

  // KPIs
  const totalWatched = watches.length;
  const verifiedAwardsCount = results.filter((r) => r.status.startsWith("AWARDED")).length;
  const pendingCount = watches.filter((w) => w.current_award_status === "AWARD_PENDING").length;
  const resultNotPublicCount = results.filter((r) => r.status === "RESULT_NOT_PUBLIC").length;
  const conflictsCount = results.filter((r) => r.status === "CONFLICTING_SOURCES").length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const getStatusBadge = (status: AwardStatus) => {
    switch (status) {
      case "AWARDED_VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isRTL ? "ترسية مؤكدة" : "AWARDED_VERIFIED"}
          </span>
        );
      case "AWARDED_SINGLE_OFFICIAL_SOURCE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isRTL ? "ترسية بمصدر رسمي فردي" : "SINGLE_OFFICIAL_SOURCE"}
          </span>
        );
      case "AWARD_PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            {isRTL ? "قيد التقييم والترسية" : "AWARD_PENDING"}
          </span>
        );
      case "RESULT_NOT_PUBLIC":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-600">
            <Eye className="w-3.5 h-3.5" />
            {isRTL ? "النتيجة غير معلنة رسمياً" : "RESULT_NOT_PUBLIC"}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            {isRTL ? "منافسة ملغاة" : "CANCELLED"}
          </span>
        );
      case "RE_TENDERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <RefreshCw className="w-3.5 h-3.5" />
            {isRTL ? "أعيد طرحها" : "RE_TENDERED"}
          </span>
        );
      case "CONFLICTING_SOURCES":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600/20 text-amber-300 border border-amber-500/50 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            {isRTL ? "تعارض بين المصادر" : "CONFLICTING_SOURCES"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const filteredWatches = watches.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.opportunity_id.toLowerCase().includes(q) ||
      w.current_award_status.toLowerCase().includes(q) ||
      w.source_ids.some((s) => s.toLowerCase().includes(q))
    );
  });

  const filteredResults = results.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.project_title.toLowerCase().includes(q) ||
      r.winner_legal_name.toLowerCase().includes(q) ||
      r.owner_entity.toLowerCase().includes(q) ||
      r.official_tender_number.toLowerCase().includes(q)
    );
  });

  const conflictResults = results.filter((r) => r.status === "CONFLICTING_SOURCES");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">
                  {isRTL ? "نظام تتبع وترسية المناقصات الموثق" : "Verified Tender Award Tracking"}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRTL
                    ? "المرحلة السابعة: تتبع نتائج الترسيات، التحقق من الفائزين بالأدلة، وتجهيز عقود المقاول الرئيسي"
                    : "Stage 7: Evidence-backed award tracking, winner verification, and Main Contractor handoff."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerChecks}
              disabled={runningChecks}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${runningChecks ? "animate-spin" : ""}`} />
              <span>{isRTL ? "فحص الترسيات التكيفي" : "Run Adaptive Checks"}</span>
            </button>

            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRTL ? "تسجيل إفصاح ترسية" : "Record Award Disclosure"}</span>
            </button>
          </div>
        </div>

        {/* Verification Rule Notice */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>{isRTL ? "مبدأ النزاهة المؤسسية:" : "Evidence-First Award Verification Rule:"}</strong>{" "}
            {isRTL
              ? "لا يتم افتراض أو اختراع اسم الفائز أو قيمة العقد نهائياً دون دليل رسمي قاطع من الجهة المالكة، أو محضر الترسية الرسمي، أو إفصاح تداول المنشور. في حال عدم إعلان النتيجة تُسجل كـ (RESULT_NOT_PUBLIC)."
              : "Winner legal identity and contract values are NEVER invented. If unconfirmed or not yet announced, status is marked RESULT_NOT_PUBLIC. Discrepancies between sources trigger CONFLICTING_SOURCES."}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isRTL ? "المنافسات المراقبة" : "Total Watched"}</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">{totalWatched}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isRTL ? "قائمة مراقبة الترسيات" : "Active award watches"}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isRTL ? "الترسيات المؤكدة" : "Verified Awards"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{verifiedAwardsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isRTL ? "فائز مثبت بالأدلة" : "Winner & value verified"}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isRTL ? "قيد التقييم" : "Pending Awards"}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isRTL ? "فحص دوري متكيف" : "Adaptive scheduler polling"}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isRTL ? "غير معلنة للعموم" : "Result Not Public"}</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-300 mt-1">{resultNotPublicCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isRTL ? "بدون اسم فائز مزيف" : "Zero hallucinated winners"}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isRTL ? "تضارب بالأدلة" : "Conflicting Reports"}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{conflictsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isRTL ? "يتطلب مراجعة بشرية" : "Multi-source divergence"}</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab("watches")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === "watches"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400 shadow-sm"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? "سجل المراقبة النشطة" : "Watched Opportunities"} ({watches.length})
          </button>

          <button
            onClick={() => setActiveTab("results")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === "results"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400 shadow-sm"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? "نتائج الترسيات الموثقة" : "Verified Award Results"} ({results.length})
          </button>

          <button
            onClick={() => setActiveTab("conflicts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === "conflicts"
                ? "bg-amber-950/40 border-amber-500/80 text-amber-300 shadow-sm"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? "تنبيهات التضارب" : "Conflicting Reports"} ({conflictResults.length})
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === "notifications"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400 shadow-sm"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isRTL ? "الإشعارات" : "Notifications"}</span>
            {unreadNotificationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-black font-bold font-mono">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? "بحث في المشاريع أو الفائزين..." : "Filter projects, winners..."}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg ps-8 pe-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tab 1: Watched Opportunities */}
      {activeTab === "watches" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {isRTL ? "جاري تحميل سجل المراقبة..." : "Loading award watches..."}
            </div>
          ) : filteredWatches.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
              <Award className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                {isRTL ? "لا توجد منافسات في سجل المراقبة" : "No opportunities currently on award watch"}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isRTL
                  ? "يمكنك تفعيل مراقبة الترسية لأي فرصة من شاشة 'مستكشف الفرص' أو 'القوائم المحفوظة' لمتابعة صدور الترسية آلياً."
                  : "Click 'Watch Award' on any opportunity in the Explorer or Saved Lists to track award announcements."}
              </p>
            </div>
          ) : (
            filteredWatches.map((w) => (
              <div
                key={w.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{w.opportunity_id}</span>
                      {getStatusBadge(w.current_award_status)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isRTL ? "مصادر الفحص:" : "Checked Sources:"}{" "}
                      <span className="font-mono text-slate-300">{w.source_ids.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteWatch(w.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title={isRTL ? "إلغاء المراقبة" : "Stop Watching"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Adaptive Scheduler Progress Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">{isRTL ? "موعد الإغلاق:" : "Closing Date:"}</span>
                    <strong className="text-slate-300 font-mono">
                      {w.closing_date ? w.closing_date.slice(0, 10) : "UNKNOWN"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{isRTL ? "عدد الفحوصات المنفذة:" : "Checks Executed:"}</span>
                    <strong className="text-emerald-400 font-mono">{w.checks_count}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{isRTL ? "آخر فحص:" : "Last Checked:"}</span>
                    <strong className="text-slate-300">
                      {w.last_checked_at ? w.last_checked_at.slice(0, 16).replace("T", " ") : "Pending"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{isRTL ? "الفحص التكيفي القادم:" : "Next Adaptive Check:"}</span>
                    <strong className="text-blue-400">
                      {w.next_check_at ? w.next_check_at.slice(0, 16).replace("T", " ") : "Scheduled"}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Verified Award Results */}
      {activeTab === "results" && (
        <div className="space-y-3">
          {filteredResults.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
              <Award className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                {isRTL ? "لا توجد نتائج ترسيات مسجلة تطابق البحث" : "No award results found"}
              </div>
            </div>
          ) : (
            filteredResults.map((res) => (
              <div
                key={res.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">#{res.official_tender_number}</span>
                      {getStatusBadge(res.status)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {res.source_type}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">{res.project_title || res.opportunity_id}</h3>
                    <p className="text-xs text-slate-400">{res.owner_entity}</p>
                  </div>

                  {res.source_url && (
                    <a
                      href={res.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 shrink-0 font-medium"
                    >
                      <span>{isRTL ? "المصدر الرسمي" : "Official Source"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Winner & Value Highlight Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">{isRTL ? "المقاول الفائز المعتمد:" : "Verified Winner:"}</span>
                    <strong className="text-slate-200 text-sm flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{res.winner_legal_name}</span>
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">{isRTL ? "قيمة العقد المعتمدة:" : "Contract Value:"}</span>
                    <strong className="text-emerald-400 font-mono text-sm mt-0.5 block">
                      {res.contract_value_sar ? `${res.contract_value_sar.toLocaleString()} SAR` : "Not Disclosed (UNKNOWN)"}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">{isRTL ? "تاريخ الترسية الرسمي:" : "Award Date:"}</span>
                    <strong className="text-slate-300 text-xs flex items-center gap-1.5 mt-0.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{res.award_date || "UNKNOWN"}</span>
                    </strong>
                  </div>
                </div>

                {/* Evidence & Confidence */}
                {res.evidence_text && (
                  <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    <strong className="text-slate-300">{isRTL ? "دليل الترسية والتحقق:" : "Evidence & Gazette Ref:"}</strong>{" "}
                    {res.evidence_text}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Conflicting Reports */}
      {activeTab === "conflicts" && (
        <div className="space-y-3">
          {conflictResults.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                {isRTL ? "لا يوجد أي تضارب بين مصادر الترسيات حالياً" : "Zero conflicting award reports detected"}
              </div>
              <p className="text-xs text-slate-500">
                {isRTL
                  ? "جميع الترسيات المكتشفة إما مؤكدة من مصادر متطابقة أو فردية رسمية."
                  : "All discovered awards have reconciled cleanly across official gazettes and listed disclosures."}
              </p>
            </div>
          ) : (
            conflictResults.map((conf) => (
              <div
                key={conf.id}
                className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{conf.project_title || conf.opportunity_id}</h3>
                    <p className="text-xs text-amber-300">
                      {isRTL
                        ? "تم اكتشاف اختلاف في اسم المقاول الفائز أو قيمة العقد (>15%) بين مصدرين معتمدين."
                        : "Discrepancy detected in winner identity or contract value (>15%) between reporting sources."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {conf.conflicting_details?.map((detail, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block font-mono">
                        Source {idx + 1}: {detail.source}
                      </span>
                      <div>
                        {isRTL ? "الفائز المعلن:" : "Reported Winner:"} <strong className="text-slate-200">{detail.winner}</strong>
                      </div>
                      <div>
                        {isRTL ? "القيمة:" : "Reported Value:"}{" "}
                        <strong className="text-slate-300 font-mono">
                          {detail.value ? `${detail.value.toLocaleString()} SAR` : "N/A"}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Notifications Feed */}
      {activeTab === "notifications" && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              {isRTL ? "لا توجد إشعارات ترسيات جديدة" : "No award notifications"}
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                  n.read
                    ? "bg-slate-900/40 border-slate-800 text-slate-400"
                    : "bg-slate-900/90 border-emerald-500/40 text-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      n.event_type === "AWARD_RESULT_FOUND"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : n.event_type === "CONFLICTING_AWARD_RESULT"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {n.timestamp ? n.timestamp.slice(0, 16).replace("T", " ") : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{n.message}</p>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkNotificationRead(n.id)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium shrink-0 px-2 py-1 rounded bg-slate-800"
                  >
                    {isRTL ? "تحديد كمقروء" : "Mark read"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Record Official Award Notice */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? "تسجيل نتيجة ترسية أو إفصاح رسمي" : "Record Verified Award Disclosure"}</span>
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAwardResult} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "معرف المنافسة:" : "Opportunity ID / Ref:"}</label>
                <input
                  type="text"
                  value={recordOpportunityId}
                  onChange={(e) => setRecordOpportunityId(e.target.value)}
                  placeholder="e.g. opp-src-rcjy-002"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    {isRTL ? "اسم المقاول الفائز (النظامي):" : "Winner Legal Name:"}
                  </label>
                  <input
                    type="text"
                    value={recordWinner}
                    onChange={(e) => setRecordWinner(e.target.value)}
                    placeholder="Al-Rashid Trading & Contracting"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {isRTL ? "اتركه فارغاً إذا كانت النتيجة غير معلنة" : "Leave empty if not publicly disclosed"}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    {isRTL ? "قيمة العقد (ر.س):" : "Contract Value (SAR):"}
                  </label>
                  <input
                    type="number"
                    value={recordValue}
                    onChange={(e) => setRecordValue(e.target.value)}
                    placeholder="125000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "تاريخ الترسية:" : "Award Date:"}</label>
                  <input
                    type="date"
                    value={recordAwardDate}
                    onChange={(e) => setRecordAwardDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "نوع المصدر:" : "Source Type:"}</label>
                  <select
                    value={recordSourceType}
                    onChange={(e) => setRecordSourceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="ORIGINAL_TENDER_PORTAL">Original Tender Portal</option>
                    <option value="OFFICIAL_OWNER_ANNOUNCEMENT">Official Owner Announcement</option>
                    <option value="GOVERNMENT_AUTHORITY_NOTICE">Government Authority Notice</option>
                    <option value="TADAWUL_DISCLOSURE">Tadawul Listed Corporate Disclosure</option>
                    <option value="OFFICIAL_CONTRACTOR_DISCLOSURE">Contractor Formal Disclosure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "حالة الترسية:" : "Award Status:"}</label>
                <select
                  value={recordStatus}
                  onChange={(e) => setRecordStatus(e.target.value as AwardStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="AWARDED_VERIFIED">AWARDED_VERIFIED (Verified Winner & Contract)</option>
                  <option value="AWARDED_SINGLE_OFFICIAL_SOURCE">AWARDED_SINGLE_OFFICIAL_SOURCE (Single Official Notice)</option>
                  <option value="RESULT_NOT_PUBLIC">RESULT_NOT_PUBLIC (Awarded but Winner Not Disclosed)</option>
                  <option value="CANCELLED">CANCELLED (Officially Cancelled Tender)</option>
                  <option value="RE_TENDERED">RE_TENDERED (Cancelled & Re-tendered)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "رابط المصدر الرسمي:" : "Official Source URL:"}</label>
                <input
                  type="url"
                  value={recordSourceUrl}
                  onChange={(e) => setRecordSourceUrl(e.target.value)}
                  placeholder="https://www.saudiexchange.sa/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {isRTL ? "نص الدليل أو رقم الجريدة الرسمية:" : "Evidence Text / Gazette Ref:"}
                </label>
                <textarea
                  value={recordEvidence}
                  onChange={(e) => setRecordEvidence(e.target.value)}
                  placeholder="Officially awarded under GTPL Article 52 by Procurement Committee..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 h-16"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold"
                >
                  {isRTL ? "حفظ وتوثيق الترسية" : "Verify & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
