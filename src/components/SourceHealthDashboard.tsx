import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Globe,
  CheckCircle2,
  XCircle,
  Upload,
  Plus,
  FileText,
  ExternalLink,
} from "lucide-react";
import { sourceRecoveryApi, type PrioritySourceRecoveryItem } from "../api/sourceRecovery";

interface SourceHealthRecord {
  id: string;
  name: string;
  name_ar?: string;
  canonical_domain: string;
  live_status: "VERIFIED_LIVE" | "AUTH_REQUIRED" | "BLOCKED" | "FIXTURE_ONLY" | "DISCOVERY_REQUIRED" | "TEMPORARILY_UNAVAILABLE";
  http_code?: number | null;
  last_checked: string;
  last_successful_fetch?: string | null;
  records_discovered: number;
  limitation: string;
  authority_type: string;
}

const DEFAULT_SOURCES_HEALTH: SourceHealthRecord[] = [
  {
    id: "src-furas",
    name: "Furas (Balady / MOMRAH)",
    name_ar: "منصة فرص (وزارة البلديات والإسكان)",
    canonical_domain: "https://furas.balady.gov.sa",
    live_status: "VERIFIED_LIVE",
    http_code: 200,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: "2026-10-02 04:30 UTC",
    records_discovered: 5,
    limitation: "Public Balady municipal portal open; commercial leasing bids require CR login.",
    authority_type: "MUNICIPAL_INVESTMENT",
  },
  {
    id: "src-neom",
    name: "NEOM",
    name_ar: "شركة نيوم",
    canonical_domain: "https://www.neom.com",
    live_status: "VERIFIED_LIVE",
    http_code: 200,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: "2026-10-02 04:30 UTC",
    records_discovered: 5,
    limitation: "Public project releases accessible; direct RFP bidding requires NEOM Supplier Portal credential.",
    authority_type: "GIGA_PROJECT",
  },
  {
    id: "src-roshn",
    name: "ROSHN Real Estate",
    name_ar: "شركة روشن العقارية",
    canonical_domain: "https://www.roshn.sa",
    live_status: "VERIFIED_LIVE",
    http_code: 200,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: "2026-10-02 04:30 UTC",
    records_discovered: 5,
    limitation: "Public developer sourcing packages accessible; direct bidding requires contractor onboarding with Saudi CR.",
    authority_type: "SOE_DEVELOPER",
  },
  {
    id: "src-etimad",
    name: "Etimad (Monafasat)",
    name_ar: "منصة اعتماد (منافسات الحكومية)",
    canonical_domain: "https://monafasat.etimad.sa",
    live_status: "FIXTURE_ONLY",
    http_code: null,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: null,
    records_discovered: 0,
    limitation: "Absher/Nafath 2FA authentication and Ministry of Finance Geo-firewall blocks automated queries from outside Saudi Arabia.",
    authority_type: "GOVERNMENT_PORTAL",
  },
  {
    id: "src-ncp",
    name: "National Center for Privatization & PPP (NCP)",
    name_ar: "المركز الوطني للتخصيص والشراكة",
    canonical_domain: "https://www.ncp.gov.sa",
    live_status: "BLOCKED",
    http_code: 504,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: null,
    records_discovered: 0,
    limitation: "Government network perimeter filtering / connection timed out on international Cloud Run container IPs.",
    authority_type: "PPP_PRIVATIZATION",
  },
  {
    id: "src-rcjy",
    name: "Royal Commission for Jubail & Yanbu (RCJY)",
    name_ar: "الهيئة الملكية للجبيل وينبع",
    canonical_domain: "https://www.rcjy.gov.sa",
    live_status: "BLOCKED",
    http_code: 504,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: null,
    records_discovered: 0,
    limitation: "Government network perimeter filtering / connection timed out on international Cloud Run container IPs.",
    authority_type: "GOVERNMENT_AUTHORITY",
  },
  {
    id: "src-aramco",
    name: "Saudi Aramco",
    name_ar: "أرامكو السعودية",
    canonical_domain: "https://supplier.aramco.com",
    live_status: "AUTH_REQUIRED",
    http_code: 504,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: null,
    records_discovered: 0,
    limitation: "Enterprise SAP Ariba corporate supplier gateway requires authenticated IKTVA contractor credentials.",
    authority_type: "SEMI_GOV_SOE",
  },
  {
    id: "src-tadawul",
    name: "Tadawul Listed Corporate Disclosures",
    name_ar: "تداول السعودية (إفصاحات عقود الشركات المدرجة)",
    canonical_domain: "https://www.saudiexchange.sa",
    live_status: "BLOCKED",
    http_code: 403,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: null,
    records_discovered: 0,
    limitation: "WAF / Cloudflare Bot Management blocks automated requests with HTTP 403 Forbidden.",
    authority_type: "FINANCIAL_DISCLOSURES",
  },
  {
    id: "src-kap",
    name: "King Abdullah Port",
    name_ar: "ميناء الملك عبدالله",
    canonical_domain: "https://www.kingabdullahport.com.sa",
    live_status: "DISCOVERY_REQUIRED",
    http_code: null,
    last_checked: "2026-10-02 04:30 UTC",
    last_successful_fetch: null,
    records_discovered: 0,
    limitation: "Discovery candidate endpoint quarantined pending official domain validation.",
    authority_type: "PRIVATE_PORTS",
  },
];

export const SourceHealthDashboard: React.FC = () => {
  const { isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState<"all" | "recovery">("recovery");
  const [filter, setFilter] = useState<string>("all");
  const [recoveryItems, setRecoveryItems] = useState<PrioritySourceRecoveryItem[]>([]);
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

  useEffect(() => {
    sourceRecoveryApi
      .getReport()
      .then((items) => setRecoveryItems(items))
      .catch((err) => console.error("Failed to load recovery report:", err));
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
    } catch (err) {
      console.error("Assisted import failed:", err);
    }
  };

  const filteredSources = DEFAULT_SOURCES_HEALTH.filter((s) => {
    if (filter === "all") return true;
    return s.live_status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED_LIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED_LIVE
          </span>
        );
      case "ASSISTED_IMPORT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Upload className="w-3 h-3" />
            ASSISTED_IMPORT
          </span>
        );
      case "RUNTIME_ENVIRONMENT_BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            RUNTIME_BLOCKED
          </span>
        );
      case "AUTHENTICATED_LIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Lock className="w-3 h-3" />
            AUTHENTICATED_LIVE
          </span>
        );
      case "AUTH_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Lock className="w-3 h-3" />
            AUTH_REQUIRED
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
      case "DISCOVERY_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Globe className="w-3 h-3" />
            DISCOVERY_REQUIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Disclaimer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{isRTL ? "لوحة شفافية وصحة المصادر الرسمية واستعادتها" : "Source Health & Critical Recovery"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL
                ? "المرحلة 7: استعادة مصادر المشتريات السعودية ذات الأولوية عبر المسارات الرسمية والشرعية فقط."
                : "Stage 7: Legitimate access pathways for priority Saudi sources (Etimad, RCJY, NCP, Tadawul, Aramco)."}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("recovery")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              activeTab === "recovery"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400"
                : "border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? "المصادر الخمسة ذات الأولوية (Stage 7 Recovery)" : "Priority Recovery Pathways (5)"}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              activeTab === "all"
                ? "bg-slate-800 border-emerald-500/80 text-emerald-400"
                : "border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isRTL ? "جميع المصادر وسجل الصحة" : "Full Ingestion Smoke Table (9)"}
          </button>
        </div>
      </div>

      {/* Tab: Critical Priority Recovery Pathways */}
      {activeTab === "recovery" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isRTL ? "مبادئ الاستعادة النظامية للمصادر السعودية:" : "Legitimate Saudi Source Access Strategy:"}</span>
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

      {/* Tab: Full Ingestion Smoke Table */}
      {activeTab === "all" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                filter === "all" ? "bg-slate-800 border-slate-600 text-white" : "border-slate-800 text-slate-400"
              }`}
            >
              All ({DEFAULT_SOURCES_HEALTH.length})
            </button>
            <button
              onClick={() => setFilter("VERIFIED_LIVE")}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                filter === "VERIFIED_LIVE" ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400" : "border-slate-800 text-slate-400"
              }`}
            >
              Live (3)
            </button>
            <button
              onClick={() => setFilter("BLOCKED")}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                filter === "BLOCKED" ? "bg-rose-950/40 border-rose-500/50 text-rose-400" : "border-slate-800 text-slate-400"
              }`}
            >
              Blocked (3)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((src) => (
              <div
                key={src.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                      {src.authority_type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {isRTL && src.name_ar ? src.name_ar : src.name}
                    </h3>
                    <a
                      href={src.canonical_domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 font-mono mt-0.5 inline-block"
                    >
                      {src.canonical_domain} &rarr;
                    </a>
                  </div>

                  <div>{getStatusBadge(src.live_status)}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <div className="text-slate-400">
                    <strong className="text-slate-300">{isRTL ? "السبب / القيد النظامي:" : "Limitation / Gate:"}</strong>{" "}
                    {src.limitation}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>
                    {isRTL ? "آخر فحص:" : "Last Checked:"} <strong className="text-slate-400">{src.last_checked}</strong>
                  </span>
                  <span>
                    {isRTL ? "السجلات الحية:" : "Live Records:"}{" "}
                    <strong className="text-emerald-400 font-mono">{src.records_discovered}</strong>
                  </span>
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
                  <label className="block text-slate-400 mb-1">{isRTL ? "الجهة الحكومية أو المنشأة:" : "Entity:"}</label>
                  <input
                    type="text"
                    value={importEntity}
                    onChange={(e) => setImportEntity(e.target.value)}
                    placeholder="Royal Commission for Jubail and Yanbu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "المدينة أو المحافظة:" : "City:"}</label>
                  <input
                    type="text"
                    value={importCity}
                    onChange={(e) => setImportCity(e.target.value)}
                    placeholder="Yanbu Industrial City"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "الميزانية المعتمدة (ر.س):" : "Budget (SAR):"}</label>
                  <input
                    type="number"
                    value={importBudget}
                    onChange={(e) => setImportBudget(e.target.value)}
                    placeholder="45000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{isRTL ? "رقم المنافسة أو الإفصاح:" : "Reference Number:"}</label>
                  <input
                    type="text"
                    value={importRef}
                    onChange={(e) => setImportRef(e.target.value)}
                    placeholder="RCJY-YNB-2026-09"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "رابط المنافسة الرسمي:" : "Official URL:"}</label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://www.rcjy.gov.sa/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isRTL ? "ملاحظات أو نص كراسة الشروط:" : "Notice / RFP Text:"}</label>
                <textarea
                  value={importNotes}
                  onChange={(e) => setImportNotes(e.target.value)}
                  placeholder="Copy and paste official notice or specification excerpt..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 h-16"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold"
                >
                  {isRTL ? "إدخال في خط المعالجة والمطابقة" : "Ingest & Normalize"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
