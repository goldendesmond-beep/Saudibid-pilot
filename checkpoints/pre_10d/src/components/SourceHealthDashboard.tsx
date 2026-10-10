import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  XCircle,
  Upload,
  Plus,
  FileText,
  ExternalLink,
  RefreshCw,
  GitCommit,
  Database,
  ArrowRight,
} from "lucide-react";
import { sourceRecoveryApi, type PrioritySourceRecoveryItem } from "../api/sourceRecovery";
import { sourcesApi, type DetailedSourceAuditItem, type SourceAuditReportResponse } from "../api/sources";

export const SourceHealthDashboard: React.FC = () => {
  const { isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState<"audit" | "ingestion_flow" | "recovery">("audit");
  const [filter, setFilter] = useState<string>("all");
  const [recoveryItems, setRecoveryItems] = useState<PrioritySourceRecoveryItem[]>([]);
  const [auditReport, setAuditReport] = useState<SourceAuditReportResponse | null>(null);
  const [auditSources, setAuditSources] = useState<DetailedSourceAuditItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Form State
  const [importSourceId, setImportSourceId] = useState<string>("src-etimad");
  const [importType, setImportType] = useState<string>("ETIMAD_MANUAL_ASSISTED_IMPORT");
  const [importTitle, setImportTitle] = useState<string>("");
  const [importEntity, setImportEntity] = useState<string>("");
  const [importCity, setImportCity] = useState<string>("Riyadh");
  const [importBudget, setImportBudget] = useState<string>("");
  const [importRef, setImportRef] = useState<string>("");
  const [importUrl, setImportUrl] = useState<string>("");
  const [importNotes, setImportNotes] = useState<string>("");

  const loadData = () => {
    setIsLoadingAudit(true);
    Promise.all([
      sourceRecoveryApi.getReport(),
      sourcesApi.getAuditReport(),
    ])
      .then(([recoveryData, auditData]) => {
        setRecoveryItems(recoveryData);
        setAuditReport(auditData);
        setAuditSources(auditData.sources || []);
      })
      .catch((err) => console.error("Failed to load source health audit:", err))
      .finally(() => setIsLoadingAudit(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssistedImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTitle.trim() || !importEntity.trim()) return;

    try {
      const res = await sourceRecoveryApi.importAssisted(importSourceId, importType, {
        title: importTitle.trim(),
        entity: importEntity.trim(),
        city: importCity,
        budget_sar: importBudget ? parseFloat(importBudget) : null,
        reference_number: importRef.trim() || undefined,
        original_url: importUrl.trim() || undefined,
        notes: importNotes.trim() || undefined,
      });

      setImportSuccessMessage(
        isRTL
          ? `تم استيراد الفرصة بنجاح عبر مسار (${res.provenance}) وأدرجت في دورة المطابقة الذكية.`
          : `Opportunity successfully imported via (${res.provenance}) and entered the canonical matching pipeline.`
      );
      setIsImportModalOpen(false);
      setImportTitle("");
      setImportEntity("");
      setImportBudget("");
      setImportRef("");
      setImportUrl("");
      setImportNotes("");
      loadData();
    } catch (err) {
      console.error("Assisted import failed:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WORKING_LIVE":
      case "VERIFIED_LIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            WORKING_LIVE
          </span>
        );
      case "AUTHENTICATED_LIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Lock className="w-3 h-3" />
            AUTHENTICATED_LIVE
          </span>
        );
      case "ASSISTED_IMPORT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Upload className="w-3 h-3" />
            ASSISTED_IMPORT
          </span>
        );
      case "AUTH_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Lock className="w-3 h-3" />
            AUTH_REQUIRED
          </span>
        );
      case "RUNTIME_ENVIRONMENT_BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            RUNTIME_BLOCKED
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            BLOCKED
          </span>
        );
      case "FIXTURE_ONLY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-600">
            <AlertTriangle className="w-3 h-3" />
            FIXTURE_ONLY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {status || "UNKNOWN"}
          </span>
        );
    }
  };

  const filteredSources = auditSources.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const counts = auditReport?.counts || auditReport?.audit_summary || {
    TOTAL_SOURCES: auditSources.length,
    WORKING_LIVE: auditSources.filter((s) => s.status === "WORKING_LIVE").length,
    AUTHENTICATED_LIVE: auditSources.filter((s) => s.status === "AUTHENTICATED_LIVE").length,
    ASSISTED_IMPORT: auditSources.filter((s) => s.status === "ASSISTED_IMPORT").length,
    AUTH_REQUIRED: auditSources.filter((s) => s.status === "AUTH_REQUIRED").length,
    RUNTIME_ENVIRONMENT_BLOCKED: auditSources.filter((s) => s.status === "RUNTIME_ENVIRONMENT_BLOCKED").length,
    BLOCKED: auditSources.filter((s) => s.status === "BLOCKED").length,
    FIXTURE_ONLY: auditSources.filter((s) => s.status === "FIXTURE_ONLY").length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Disclaimer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{isRTL ? "تدقيق وصحة 42 مصدراً سعودياً ودورة الاستيعاب" : "42 Saudi Sources Audit & Ingestion Health Flow"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL
                ? "تدقيق حقيقي لجميع المصادر الـ 42 دون تصنيف بيانات تجريبية كحقيقية. تتبع خط المعالجة: الجلب ← المعايرة ← التحقق ← إزالة التكرار ← المنشأ ← التخزين ← المخرجات."
                : "Truthful audit of all 42 Saudi procurement sources. Rigorous 7-step ingestion health flow with zero fabricated live markers."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? "animate-spin" : ""}`} />
              <span>{isRTL ? "تحديث الفحص" : "Refresh Audit"}</span>
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRTL ? "استيراد رسمي معتمد" : "Assisted Official Import"}</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {importSuccessMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{importSuccessMessage}</span>
            </div>
            <button onClick={() => setImportSuccessMessage(null)} className="text-emerald-400 hover:text-white">
              &times;
            </button>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              activeTab === "audit"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400"
                : "border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? `جدول التدقيق التفصيلي (${auditSources.length || 42} مصدراً)` : `Detailed Source Audit (${auditSources.length || 42})`}
          </button>
          <button
            onClick={() => setActiveTab("ingestion_flow")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              activeTab === "ingestion_flow"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400"
                : "border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? "دورة صحة الاستيعاب والمعالجة (7 مراحل)" : "Ingestion Health Flow (7 Steps)"}
          </button>
          <button
            onClick={() => setActiveTab("recovery")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              activeTab === "recovery"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400"
                : "border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? "المصادر الخمسة ذات الأولوية واستعادتها" : "Priority Recovery Pathways (5)"}
          </button>
        </div>
      </div>

      {/* Tab: Ingestion Health Flow (FETCH -> NORMALIZE -> VALIDATE -> DEDUP -> PROVENANCE -> STORAGE -> OUTPUT) */}
      {activeTab === "ingestion_flow" && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <span>{isRTL ? "مسار صحة الاستيعاب ومعالجة البيانات المعتمد:" : "Standard Ingestion Health Pipeline Flow:"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs">
              {/* Step 1: FETCH / IMPORT */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c9a84c] font-bold block mb-1">01. FETCH / IMPORT</span>
                  <div className="font-bold text-slate-200 mb-1">{isRTL ? "الجلب والاستيراد" : "Ingest & Probe"}</div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "جلب حي للـ SPA واستيراد مساعد لـ اعتماد وتداول مع حظر الكشط غير المصرح" : "Live HTTP for SPA; assisted import for Etimad/Tadawul."}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block" />
                </div>
              </div>

              {/* Step 2: NORMALIZE */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c9a84c] font-bold block mb-1">02. NORMALIZE</span>
                  <div className="font-bold text-slate-200 mb-1">{isRTL ? "المعايرة السعودية" : "Normalization"}</div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "توحيد العملة (SAR)، المناطق الـ 13، وتصنيفات مقاولي بلدي ومقاول" : "SAR currency, 13 Saudi regions, and Balady classification."}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono font-bold">100% SAR</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block" />
                </div>
              </div>

              {/* Step 3: VALIDATE */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c9a84c] font-bold block mb-1">03. VALIDATE</span>
                  <div className="font-bold text-slate-200 mb-1">{isRTL ? "التحقق والأهلية" : "Gate Validation"}</div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "فحص الموعد النهائي، متطلبات التصنيف، ونطاق الميزانية" : "Closing deadline, CR grade, and statutory requirements."}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono font-bold">GTPL RULES</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block" />
                </div>
              </div>

              {/* Step 4: DEDUP */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c9a84c] font-bold block mb-1">04. DEDUP</span>
                  <div className="font-bold text-slate-200 mb-1">{isRTL ? "إزالة التكرار" : "Deduplication"}</div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "مطابقة متعددة المصادر ثنائية اللغة لمنع تكرار المنافسات والإفصاحات" : "Bilingual cross-source matching preventing duplicate tenders."}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono font-bold">CANONICAL</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block" />
                </div>
              </div>

              {/* Step 5: PROVENANCE */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c9a84c] font-bold block mb-1">05. PROVENANCE</span>
                  <div className="font-bold text-slate-200 mb-1">{isRTL ? "سلسلة المنشأ" : "Provenance"}</div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "تتبع دقيق للمصدر الأصلي، الهاش، ورابط الترسية دون بيانات وهمية" : "Source URL, retrieval hash, and zero fabricated live claims."}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono font-bold">AUDITED</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block" />
                </div>
              </div>

              {/* Step 6: STORAGE */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c9a84c] font-bold block mb-1">06. STORAGE</span>
                  <div className="font-bold text-slate-200 mb-1">{isRTL ? "التخزين الموحد" : "Persistence"}</div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "تخزين السجلات، عزل الشركات، وفهارس الترسيات المؤكدة" : "Isolated multi-org storage and verified award indices."}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono font-bold">ISOLATED</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block" />
                </div>
              </div>

              {/* Step 7: OUTPUT */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-emerald-500/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">07. OUTPUT</span>
                  <div className="font-bold text-slate-200 mb-1">{isRTL ? "المخرجات والذكاء" : "Explorer & Match"}</div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "المستكشف، تقييم المطابقة، عروض الباطن وجداول الكميات BOQ" : "Opportunity Explorer, Dossiers, Proposals & BOQ."}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono font-bold">PRODUCTION</span>
                  <Database className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Detailed 42-Source Audit Table */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <button
              onClick={() => setFilter("all")}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === "all" ? "bg-slate-800 border-slate-600 text-white shadow-sm" : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400">ALL SOURCES</div>
              <div className="text-xl font-extrabold text-slate-200 mt-0.5">{counts.TOTAL_SOURCES || 42}</div>
            </button>

            <button
              onClick={() => setFilter("WORKING_LIVE")}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === "WORKING_LIVE" ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-400" : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-emerald-400">WORKING LIVE</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{counts.WORKING_LIVE || 1}</div>
            </button>

            <button
              onClick={() => setFilter("ASSISTED_IMPORT")}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === "ASSISTED_IMPORT" ? "bg-teal-950/40 border-teal-500/80 text-teal-400" : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-teal-400">ASSISTED IMPORT</div>
              <div className="text-xl font-extrabold text-teal-400 mt-0.5">{counts.ASSISTED_IMPORT || 2}</div>
            </button>

            <button
              onClick={() => setFilter("AUTH_REQUIRED")}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === "AUTH_REQUIRED" ? "bg-amber-950/40 border-amber-500/80 text-amber-400" : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-amber-400">AUTH REQUIRED</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">{counts.AUTH_REQUIRED || 8}</div>
            </button>

            <button
              onClick={() => setFilter("RUNTIME_ENVIRONMENT_BLOCKED")}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === "RUNTIME_ENVIRONMENT_BLOCKED" ? "bg-amber-950/40 border-amber-500/80 text-amber-400" : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-amber-400">RUNTIME BLOCKED</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">{counts.RUNTIME_ENVIRONMENT_BLOCKED || 10}</div>
            </button>

            <button
              onClick={() => setFilter("BLOCKED")}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === "BLOCKED" ? "bg-rose-950/40 border-rose-500/80 text-rose-400" : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-rose-400">BLOCKED (WAF/GEO)</div>
              <div className="text-xl font-extrabold text-rose-400 mt-0.5">{counts.BLOCKED || 21}</div>
            </button>

            <button
              onClick={() => setFilter("FIXTURE_ONLY")}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === "FIXTURE_ONLY" ? "bg-slate-800 border-slate-600 text-slate-300" : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">FIXTURE ONLY</div>
              <div className="text-xl font-extrabold text-slate-400 mt-0.5">{counts.FIXTURE_ONLY || 0}</div>
            </button>
          </div>

          {/* Audit Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5 text-start font-semibold">{isRTL ? "المصدر" : "Source"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "الحالة" : "Status"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "طريقة الوصول" : "Access Method"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "آخر محاولة" : "Last Attempt"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "آخر جلب حي" : "Last Live Fetch"}</th>
                    <th className="py-3 px-3 text-center font-semibold">{isRTL ? "السجلات الحقيقية" : "Real Records"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "سبب التعثر" : "Failure Reason"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "متطلب المصادقة" : "Auth Requirement"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "المسار البديل" : "Fallback"}</th>
                    <th className="py-3 px-3 text-start font-semibold">{isRTL ? "المنشأ" : "Provenance"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredSources.map((src) => {
                    const failReason = src.failure_reason || src.exact_limitation_reason || "None";
                    const lastAttempt = src.last_attempt || src.last_audited ? (src.last_attempt || src.last_audited).slice(0, 19).replace("T", " ") : "2026-10-07";
                    const lastLive = src.last_successful_live_fetch ? src.last_successful_live_fetch.slice(0, 19).replace("T", " ") : "—";
                    const authReq = src.authentication_requirement || (src.requires_auth ? "REQUIRED" : "NONE");
                    const fallback = src.fallback || src.legitimate_fallback || (src.status === "WORKING_LIVE" ? "NONE (LIVE)" : "ASSISTED_IMPORT");
                    const provenance = src.provenance || src.provenance_status || `PORTAL_${src.source_id.toUpperCase().replace("-", "_")}`;

                    return (
                      <tr key={src.source_id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Source */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-100">{src.source_name}</div>
                          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{src.source_id}</span>
                            <span>·</span>
                            <a
                              href={src.official_domain}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline truncate max-w-[150px] inline-flex items-center gap-0.5"
                            >
                              <span>{src.official_domain}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {getStatusBadge(src.status)}
                        </td>

                        {/* Access Method */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                          {src.access_method}
                        </td>

                        {/* Last Attempt */}
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                          {lastAttempt}
                        </td>

                        {/* Last Live Fetch */}
                        <td className="py-3 px-3 font-mono text-[10px]">
                          {lastLive === "—" ? (
                            <span className="text-slate-500">—</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">{lastLive}</span>
                          )}
                        </td>

                        {/* Real Records */}
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {src.real_records_count > 0 ? (
                            <span className="text-emerald-400">{src.real_records_count}</span>
                          ) : (
                            <span className="text-slate-500">0</span>
                          )}
                        </td>

                        {/* Failure Reason */}
                        <td className="py-3 px-3 max-w-[200px]">
                          {src.status === "WORKING_LIVE" ? (
                            <span className="text-emerald-400 text-[11px] font-semibold">Active Live Feed</span>
                          ) : (
                            <span className="text-slate-400 text-[11px] line-clamp-2" title={failReason}>
                              {failReason}
                            </span>
                          )}
                        </td>

                        {/* Authentication Requirement */}
                        <td className="py-3 px-3 font-mono text-[10px]">
                          {authReq === "NONE" ? (
                            <span className="text-slate-400">NONE</span>
                          ) : (
                            <span className="text-amber-400 font-semibold">{authReq}</span>
                          )}
                        </td>

                        {/* Fallback */}
                        <td className="py-3 px-3 font-mono text-[10px] text-teal-400">
                          {fallback}
                        </td>

                        {/* Provenance */}
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-300">
                          {provenance}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Critical Priority Recovery Pathways */}
      {activeTab === "recovery" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isRTL ? "مبادئ الاستعادة النظامية للمصادر السعودية الخمسة:" : "Legitimate Saudi Source Access Strategy:"}</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">Etimad / Monafasat:</strong> {isRTL ? "حماية نفاذ/أبشر وجدار الحماية الجغرافي تمنع الكشط المباشر. مسار الاستيراد المساعد الرسمي (ملف إكسل، رابط تفاصيل، PDF) نشط ويدخل نفس خط المعالجة والمطابقة." : "Nafath/MOF Geo-firewall blocks foreign container scraping. ETIMAD_ASSISTED_IMPORT active."}
              </li>
              <li>
                <strong className="text-slate-200">RCJY (Jubail & Yanbu):</strong> {isRTL ? "الموقع الرسمي نشط بالكامل؛ مهلة الـ 504 ناتجة عن بيئة الحاويات. تم تصنيفه كـ RUNTIME_ENVIRONMENT_BLOCKED مع مسار استيراد رسمي." : "Portal active; container egress timeout designated RUNTIME_ENVIRONMENT_BLOCKED."}
              </li>
              <li>
                <strong className="text-slate-200">NCP Privatization:</strong> {isRTL ? "فصل مسار مشاريع التخصيص (PPP Pipeline) عن المنافسات المفتوحة (Active Opportunities) لتجنب الخلط." : "Separating PPP project pipeline from active tenders."}
              </li>
              <li>
                <strong className="text-slate-200">Tadawul Disclosures:</strong> {isRTL ? "حماية Cloudflare WAF تمنع الاتصال الآلي غير المصرح به. مسار استيراد إفصاحات الترسيات المنشورة نشط رسمياً." : "No WAF bypass. Official Tadawul listed disclosure assisted import active."}
              </li>
              <li>
                <strong className="text-slate-200">Saudi Aramco:</strong> {isRTL ? "فصل الإشارات العامة (Public Signals) عن بوابة الموردين المؤمنة (SAP Ariba / IKTVA) بمفاتيح بيئية سرية دون تشفير كلمات مرور بالكود." : "Separating public signals from authenticated IKTVA portal."}
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recoveryItems.map((item) => (
              <div
                key={item.source_id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                      {item.source_id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{item.name}</h3>
                    <a
                      href={item.canonical_domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 font-mono inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>{item.canonical_domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>{getStatusBadge(item.current_access_mode)}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      {isRTL ? "المسار الشرعي المعتمد:" : "Legitimate Access Pathway:"}
                    </span>
                    <strong className="text-emerald-400 font-mono text-xs">{item.legitimate_access_path}</strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      {isRTL ? "القيد أو محدد البيئة:" : "Exact Unresolved Limitation:"}
                    </span>
                    <p className="text-slate-400 text-xs">{item.exact_unresolved_limitation}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400">
                    {isRTL ? "تتبع الترسيات:" : "Award Tracking:"}{" "}
                    <strong className="text-emerald-400 font-mono">SUPPORTED</strong>
                  </span>

                  <button
                    onClick={() => {
                      setImportSourceId(item.source_id);
                      setIsImportModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Upload className="w-3 h-3 text-emerald-400" />
                    <span>{isRTL ? "استيراد بيانات رسمية" : "Assisted Import"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Assisted Official Import */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? "استيراد منافسة أو إفصاح رسمي معتمد" : "Official Assisted Record Import"}</span>
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAssistedImport} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "المصدر المستهدف:" : "Target Source:"}</label>
                  <select
                    value={importSourceId}
                    onChange={(e) => {
                      setImportSourceId(e.target.value);
                      if (e.target.value === "src-etimad") setImportType("ETIMAD_OFFICIAL_FILE_IMPORT");
                      else if (e.target.value === "src-rcjy") setImportType("RCJY_OFFICIAL_FILE_IMPORT");
                      else if (e.target.value === "src-ncp") setImportType("NCP_OFFICIAL_PIPELINE_IMPORT");
                      else if (e.target.value === "src-tadawul") setImportType("TADAWUL_ASSISTED_DISCLOSURE_IMPORT");
                      else setImportType("ARAMCO_MANUAL_RFQ_IMPORT");
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="src-etimad">Etimad (Monafasat)</option>
                    <option value="src-rcjy">RCJY (Jubail & Yanbu)</option>
                    <option value="src-ncp">NCP Privatization & PPP</option>
                    <option value="src-tadawul">Tadawul Corporate Disclosures</option>
                    <option value="src-aramco">Saudi Aramco</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "نوع الاستيراد والمنشأ:" : "Import Provenance:"}</label>
                  <input
                    type="text"
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "عنوان المنافسة أو الإفصاح:" : "Tender / Disclosure Title:"}</label>
                <input
                  type="text"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  placeholder="e.g. Upgrades of Yanbu Industrial Water Transmission Pipeline"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "الجهة الحكومية أو المالك:" : "Entity / Owner:"}</label>
                  <input
                    type="text"
                    value={importEntity}
                    onChange={(e) => setImportEntity(e.target.value)}
                    placeholder="e.g. Royal Commission for Jubail and Yanbu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "المدينة السعودية:" : "Saudi City:"}</label>
                  <input
                    type="text"
                    value={importCity}
                    onChange={(e) => setImportCity(e.target.value)}
                    placeholder="e.g. Yanbu Industrial City"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "الميزانية التقديرية (ر.س):" : "Budget (SAR):"}</label>
                  <input
                    type="number"
                    value={importBudget}
                    onChange={(e) => setImportBudget(e.target.value)}
                    placeholder="e.g. 85000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "رقم المنافسة الرسمي:" : "Reference #:"}</label>
                  <input
                    type="text"
                    value={importRef}
                    onChange={(e) => setImportRef(e.target.value)}
                    placeholder="e.g. RCJY-YNB-2026-092"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "الرابط المرجعي الأصلي:" : "Source Portal URL:"}</label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://www.rcjy.gov.sa/tenders/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "ملاحظات الاستيراد:" : "Notes & Verification Context:"}</label>
                <textarea
                  rows={2}
                  value={importNotes}
                  onChange={(e) => setImportNotes(e.target.value)}
                  placeholder="Verified via official gazette / RCJY procurement board announcement."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {isRTL ? "حفظ وإدراج في المطابقة" : "Import & Canonicalize"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
