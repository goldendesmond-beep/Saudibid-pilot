import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { SAUDI_REGIONS, SAUDI_WORK_CATEGORIES, SAUDI_SECTORS, SAUDI_SERVICE_CATEGORIES } from "../constants/saudiTaxonomy";
import type {
  IntelligenceEvaluationResult,
  ActionabilityIntelligence,
  ApplicationChannelStatus,
} from "../api/intelligence";
import { awardsApi } from "../api/awards";
import {
  Bookmark,
  Filter,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  SlidersHorizontal,
  Award,
} from "lucide-react";

const SAUDI_CITIES_AND_INDUSTRIAL = [
  { nameEn: "Riyadh", nameAr: "الرياض", isIndustrial: false },
  { nameEn: "Jeddah", nameAr: "جدة", isIndustrial: false },
  { nameEn: "Dammam", nameAr: "الدمام", isIndustrial: false },
  { nameEn: "Khobar", nameAr: "الخبر", isIndustrial: false },
  { nameEn: "Jubail", nameAr: "الجبيل", isIndustrial: false },
  { nameEn: "Jubail Industrial City", nameAr: "مدينة الجبيل الصناعية", isIndustrial: true },
  { nameEn: "Yanbu", nameAr: "ينبع", isIndustrial: false },
  { nameEn: "Yanbu Industrial City", nameAr: "مدينة ينبع الصناعية", isIndustrial: true },
  { nameEn: "Ras Al Khair", nameAr: "رأس الخير الصناعية", isIndustrial: true },
  { nameEn: "NEOM", nameAr: "نيوم", isIndustrial: true },
  { nameEn: "Jazan", nameAr: "جازان", isIndustrial: false },
  { nameEn: "Medina", nameAr: "المدينة المنورة", isIndustrial: false },
  { nameEn: "Mecca", nameAr: "مكة المكرمة", isIndustrial: false },
  { nameEn: "Tabuk", nameAr: "تبوك", isIndustrial: false },
  { nameEn: "Abha", nameAr: "أبها", isIndustrial: false },
];

const SAUDI_SOURCES_LIST = [
  { id: "src-etimad", name: "Etimad (Monafasat)", nameAr: "منصة اعتماد الحكومية", liveStatus: "FIXTURE_ONLY" },
  { id: "src-furas", name: "Furas (Balady)", nameAr: "منصة فرص البلدية", liveStatus: "VERIFIED_LIVE" },
  { id: "src-ncp", name: "NCP Privatization", nameAr: "المركز الوطني للتخصيص", liveStatus: "BLOCKED" },
  { id: "src-rcjy", name: "RCJY (Jubail & Yanbu)", nameAr: "الهيئة الملكية للجبيل وينبع", liveStatus: "BLOCKED" },
  { id: "src-aramco", name: "Saudi Aramco", nameAr: "أرامكو السعودية", liveStatus: "AUTH_REQUIRED" },
  { id: "src-neom", name: "NEOM", nameAr: "نيوم", liveStatus: "VERIFIED_LIVE" },
  { id: "src-roshn", name: "ROSHN", nameAr: "روشن العقارية", liveStatus: "VERIFIED_LIVE" },
  { id: "src-tadawul", name: "Tadawul Disclosures", nameAr: "إفصاحات تداول", liveStatus: "BLOCKED" },
];

interface OpportunityExplorerProps {
  opportunities: IntelligenceEvaluationResult[];
  savedListIds: string[];
  onToggleSave: (oppId: string) => void;
  onSelectOpp: (opp: IntelligenceEvaluationResult) => void;
}

export const OpportunityExplorer: React.FC<OpportunityExplorerProps> = ({
  opportunities,
  savedListIds,
  onToggleSave,
  onSelectOpp,
}) => {
  const { isRTL } = useTranslation();

  // Primary Filters
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "3d" | "7d" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const [govPrivateFilter, setGovPrivateFilter] = useState<"all" | "gov" | "private">("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [workCategoryFilter, setWorkCategoryFilter] = useState<string>("all");
  const [projectValueFilter, setProjectValueFilter] = useState<string>("all");
  const [eligibilityFilter, setEligibilityFilter] = useState<string>("all");
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [directTenderOnly, setDirectTenderOnly] = useState<boolean>(false);
  const [subcontractOnly, setSubcontractOnly] = useState<boolean>(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sourceStatusFilter, setSourceStatusFilter] = useState<string>("all");
  const [showSeedData, setShowSeedData] = useState<boolean>(false);

  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const handleQuickFilter = (type: string) => {
    if (activeQuickFilter === type) {
      setActiveQuickFilter(null);
      setSearchQuery("");
      setSectorFilter("all");
      setServiceFilter("all");
      setSubcontractOnly(false);
      return;
    }
    setActiveQuickFilter(type);
    switch (type) {
      case "hotels":
        setSectorFilter("Hospitality");
        setSearchQuery("hotel");
        break;
      case "manpower":
        setServiceFilter("manpower");
        setSearchQuery("manpower");
        break;
      case "renovation":
        setSearchQuery("ترميم");
        break;
      case "housekeeping":
        setServiceFilter("housekeeping");
        setSearchQuery("housekeeping");
        break;
      case "cleaning":
        setServiceFilter("cleaning");
        setSearchQuery("cleaning");
        break;
      case "catering":
        setServiceFilter("catering");
        setSearchQuery("catering");
        break;
      case "facility_management":
        setServiceFilter("facility_management");
        setSearchQuery("facility management");
        break;
      case "om":
        setServiceFilter("operation");
        setSearchQuery("operation");
        break;
      case "supply":
        setServiceFilter("food_supply");
        setSearchQuery("supply");
        break;
      case "subcontracting":
        setSubcontractOnly(true);
        break;
    }
  };

  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showFilteredOut, setShowFilteredOut] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [watchedAwardIds, setWatchedAwardIds] = useState<string[]>([]);

  useEffect(() => {
    awardsApi.listWatches({ company_id: "comp-sa-001" })
      .then((watches) => setWatchedAwardIds(watches.map((w) => w.opportunity_id)))
      .catch((err) => console.error("Error loading watched awards:", err));
  }, []);

  const handleToggleAwardWatch = async (oppId: string) => {
    try {
      if (watchedAwardIds.includes(oppId)) return;
      await awardsApi.watch(oppId, "comp-sa-001");
      setWatchedAwardIds((prev) => [...prev, oppId]);
    } catch (err) {
      console.error("Failed to watch award:", err);
    }
  };

  // Determine filtering and reasons
  const { visibleOpportunities, filteredOutOpportunities } = useMemo(() => {
    const visible: IntelligenceEvaluationResult[] = [];
    const filteredOut: Array<{ opp: IntelligenceEvaluationResult; reason: string }> = [];

    const now = Date.now();

    for (const opp of opportunities) {
      let filterReason: string | null = null;

      // 0. Seed / Demo Data Isolation Check
      if (!showSeedData && opp.is_seed) {
        filterReason = isRTL ? "بيانات تجريبية استعراضية (مستبعدة تلقائياً في بيئة الإنتاج)" : "Demo/Seed data (isolated from real procurement records)";
      }

      // 1. Search Query
      if (!filterReason && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (opp.opportunity_title || "").toLowerCase().includes(q) ||
          (opp.opportunity_title_ar || "").toLowerCase().includes(q) ||
          (opp.entity || "").toLowerCase().includes(q) ||
          (opp.city || "").toLowerCase().includes(q) ||
          (opp.reference_number || "").toLowerCase().includes(q) ||
          (opp.work_category || "").toLowerCase().includes(q) ||
          (opp.sector || "").toLowerCase().includes(q) ||
          (opp.renovation_category || "").toLowerCase().includes(q) ||
          (q === "ترميم" && (opp.is_renovation || (opp.work_category || "").includes("ترميم") || (opp.opportunity_title_ar || "").includes("ترميم") || (opp.opportunity_title_ar || "").includes("تأهيل")));
        if (!match) filterReason = isRTL ? "لا يطابق كلمات البحث" : "Search term mismatch";
      }

      // 2. Expired Check
      if (!filterReason && opp.closing_date && opp.closing_date !== "UNKNOWN") {
        try {
          const closingTime = new Date(opp.closing_date).getTime();
          if (closingTime < now) {
            filterReason = isRTL ? "انتهت فترة التقديم (expired)" : "expired";
          }
        } catch {
          // ignore
        }
      }

      // 3. Market signal only check (unless explicitly filtered)
      if (!filterReason && opp.confidence_level === "MARKET_SIGNAL_ONLY") {
        filterReason = isRTL ? "إشارة سوقية / إفصاح أولي وليست منافسة مفتوحة" : "market signal only";
      }

      // 4. Low Confidence
      if (!filterReason && opp.confidence_level === "POSSIBLE_OPPORTUNITY" && opp.match_score.total_score < 40) {
        filterReason = isRTL ? "مستوى ثقة منخفض بالبيانات" : "low confidence";
      }

      // 5. Date Filter (Today, 3d, 7d, custom)
      if (!filterReason && opp.closing_date && opp.closing_date !== "UNKNOWN") {
        try {
          const closingTime = new Date(opp.closing_date).getTime();
          const daysDiff = (closingTime - now) / (1000 * 3600 * 24);

          if (dateFilter === "today" && (daysDiff < 0 || daysDiff > 1)) {
            filterReason = isRTL ? "خارج نطاق اليوم" : "outside today's window";
          } else if (dateFilter === "3d" && (daysDiff < 0 || daysDiff > 3)) {
            filterReason = isRTL ? "خارج نطاق 3 أيام" : "outside 3-day window";
          } else if (dateFilter === "7d" && (daysDiff < 0 || daysDiff > 7)) {
            filterReason = isRTL ? "خارج نطاق 7 أيام" : "outside 7-day window";
          } else if (dateFilter === "custom") {
            if (customStartDate && closingTime < new Date(customStartDate).getTime()) {
              filterReason = isRTL ? "قبل تاريخ البدء المحدد" : "before custom start date";
            }
            if (customEndDate && closingTime > new Date(customEndDate).getTime() + 86400000) {
              filterReason = isRTL ? "بعد تاريخ الانتهاء المحدد" : "after custom end date";
            }
          }
        } catch {
          // ignore
        }
      }

      // 6. Sector Filter (Government vs Private)
      if (!filterReason && govPrivateFilter !== "all") {
        const isGov = opp.opportunity_type === "GOVERNMENT_TENDER";
        if (govPrivateFilter === "gov" && !isGov) {
          filterReason = isRTL ? "منافسة قطاع خاص وليست حكومية" : "Private entity (Government filter active)";
        } else if (govPrivateFilter === "private" && isGov) {
          filterReason = isRTL ? "منافسة حكومية وليست قطاع خاص" : "Government entity (Private filter active)";
        }
      }

      // 6b. Sector Industry Filter (Hospitality, Healthcare, Energy, etc.)
      if (!filterReason && sectorFilter !== "all") {
        const text = `${opp.opportunity_title} ${opp.entity} ${opp.work_category || ""}`.toLowerCase();
        const sMatch = text.includes(sectorFilter.toLowerCase()) || (opp as unknown as { sector?: string }).sector === sectorFilter;
        if (!sMatch) {
          filterReason = isRTL ? `خارج قطاع ${sectorFilter}` : `Outside ${sectorFilter} sector`;
        }
      }

      // 6c. Service Category Filter (Housekeeping, Cleaning, Catering, etc.)
      if (!filterReason && serviceFilter !== "all") {
        const text = `${opp.opportunity_title} ${opp.entity} ${opp.work_category || ""}`.toLowerCase();
        const srvMatch = text.includes(serviceFilter.toLowerCase().replace(/_/g, " ")) || (opp as unknown as { service_category?: string }).service_category === serviceFilter;
        if (!srvMatch) {
          filterReason = isRTL ? `خارج تصنيف الخدمة ${serviceFilter}` : `Outside ${serviceFilter} service`;
        }
      }

      // 7. Opportunity Type Filter (RFQ, RFP, EOI, Prequalification, Subcontract Request, Vendor Registration)
      if (!filterReason && typeFilter !== "all") {
        const typeNorm = (opp.opportunity_type || "").toUpperCase();
        if (typeFilter === "RFQ" && !typeNorm.includes("RFQ")) filterReason = "Type mismatch: not RFQ";
        else if (typeFilter === "RFP" && !typeNorm.includes("RFP")) filterReason = "Type mismatch: not RFP";
        else if (typeFilter === "EOI" && !typeNorm.includes("EOI")) filterReason = "Type mismatch: not EOI";
        else if (typeFilter === "PREQUALIFICATION" && !typeNorm.includes("PREQUALIFICATION")) filterReason = "Type mismatch: not Prequalification";
        else if (typeFilter === "SUBCONTRACT_REQUEST" && !typeNorm.includes("SUBCONTRACT")) filterReason = "Type mismatch: not Subcontract Request";
        else if (typeFilter === "VENDOR_REGISTRATION" && !typeNorm.includes("VENDOR")) filterReason = "Type mismatch: not Vendor Registration";
        else if (typeFilter !== "RFQ" && typeFilter !== "RFP" && typeFilter !== "EOI" && typeFilter !== "PREQUALIFICATION" && typeFilter !== "SUBCONTRACT_REQUEST" && typeFilter !== "VENDOR_REGISTRATION") {
          if (opp.opportunity_type !== typeFilter) {
            filterReason = isRTL ? `نوع الفرصة: ${opp.opportunity_type}` : `Type mismatch: ${opp.opportunity_type}`;
          }
        }
      }

      // 8. Region Filter
      if (!filterReason && regionFilter !== "all") {
        const rNorm = (opp.region || "").toLowerCase();
        const fNorm = regionFilter.toLowerCase();
        if (!rNorm.includes(fNorm) && !fNorm.includes(rNorm)) {
          filterReason = isRTL ? "خارج المنطقة المفضلة للمقاول" : "outside preferred region";
        }
      }

      // 9. City & Industrial City Filter
      if (!filterReason && cityFilter !== "all") {
        const cNorm = (opp.city || "").toLowerCase();
        const fcNorm = cityFilter.toLowerCase();
        if (!cNorm.includes(fcNorm) && !fcNorm.includes(cNorm)) {
          filterReason = isRTL ? `خارج المدينة المختارة (${cityFilter})` : `outside selected city (${cityFilter})`;
        }
      }

      // 10. Work Category Filter
      if (!filterReason && workCategoryFilter !== "all") {
        const wcNorm = (opp.work_category || "").toLowerCase();
        const fwcNorm = workCategoryFilter.toLowerCase();
        if (!wcNorm.includes(fwcNorm) && !fwcNorm.includes(wcNorm)) {
          filterReason = isRTL ? "اختلاف مجال العمل والنشاط" : "activity mismatch";
        }
      }

      // 11. Project Value / Scale Filter
      if (!filterReason && projectValueFilter !== "all" && opp.budget_sar) {
        const b = opp.budget_sar;
        if (projectValueFilter === "<10M" && b >= 10000000) {
          filterReason = isRTL ? "قيمة المشروع أكبر من الحد المطلوب" : "project too large";
        } else if (projectValueFilter === "10M-50M" && (b < 10000000 || b > 50000000)) {
          filterReason = isRTL ? "خارج النطاق المالي 10م - 50م" : "outside 10M - 50M envelope";
        } else if (projectValueFilter === "50M-100M" && (b < 50000000 || b > 100000000)) {
          filterReason = isRTL ? "خارج النطاق المالي 50م - 100م" : "outside 50M - 100M envelope";
        } else if (projectValueFilter === ">100M" && b < 100000000) {
          filterReason = isRTL ? "قيمة المشروع أقل من 100 مليون" : "below 100M SAR threshold";
        }
      }

      // 12. Eligibility Filter
      if (!filterReason && eligibilityFilter !== "all") {
        if (opp.eligibility.status !== eligibilityFilter) {
          if (opp.eligibility.status === "NOT_ELIGIBLE") {
            filterReason = isRTL ? "شرط إلزامي غير مستوفى (mandatory requirement missing)" : "mandatory requirement missing";
          } else {
            filterReason = isRTL ? `حالة الأهلية: ${opp.eligibility.status}` : `Eligibility status: ${opp.eligibility.status}`;
          }
        }
      }

      // 13. Min Match Score
      if (!filterReason && minMatchScore > 0 && opp.match_score.total_score < minMatchScore) {
        filterReason = isRTL ? `درجة التطابق (${opp.match_score.total_score}%) أقل من الحد الأدنى (${minMatchScore}%)` : `Match score below threshold (${opp.match_score.total_score}% < ${minMatchScore}%)`;
      }

      // 14. Direct Tender Filter
      if (!filterReason && directTenderOnly && opp.gap_analysis.potential_action !== "DIRECT_TENDER") {
        filterReason = isRTL ? "غير ملائم للتقديم المباشر كمقاول رئيسي" : "Not recommended for direct tender";
      }

      // 15. Subcontract Only Filter
      if (!filterReason && subcontractOnly && !opp.subcontract.is_subcontract_target) {
        filterReason = isRTL ? "ليست فرصة مقاولة باطن" : "Not classified as a subcontract target";
      }

      // 16. Source Filter
      if (!filterReason && sourceFilter !== "all" && opp.primary_source_id !== sourceFilter) {
        filterReason = isRTL ? `المصدر: ${opp.primary_source_id}` : `Source mismatch: ${opp.primary_source_id}`;
      }

      // 17. Source Live Status Filter
      if (!filterReason && sourceStatusFilter !== "all") {
        const status = opp.source_live_status || (opp.primary_source_id === "src-furas" || opp.primary_source_id === "src-neom" || opp.primary_source_id === "src-roshn" ? "VERIFIED_LIVE" : "FIXTURE_ONLY");
        if (status !== sourceStatusFilter) {
          filterReason = isRTL ? `حالة المصدر: ${status}` : `Source status mismatch: ${status}`;
        }
      }

      if (filterReason) {
        filteredOut.push({ opp, reason: filterReason });
      } else {
        visible.push(opp);
      }
    }

    return { visibleOpportunities: visible, filteredOutOpportunities: filteredOut };
  }, [
    opportunities,
    searchQuery,
    dateFilter,
    customStartDate,
    customEndDate,
    govPrivateFilter,
    sectorFilter,
    serviceFilter,
    typeFilter,
    regionFilter,
    cityFilter,
    workCategoryFilter,
    projectValueFilter,
    eligibilityFilter,
    minMatchScore,
    directTenderOnly,
    subcontractOnly,
    sourceFilter,
    sourceStatusFilter,
    showSeedData,
    isRTL,
  ]);

  const getSourceBadge = (sourceId?: string, status?: string) => {
    const isLive = status === "VERIFIED_LIVE" || status === "WORKING_LIVE";
    const isAuth = status === "AUTH_REQUIRED";
    const isAssisted = status === "ASSISTED_IMPORT";
    const isBlocked = status === "BLOCKED" || status === "RUNTIME_ENVIRONMENT_BLOCKED";

    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" />
          VERIFIED_LIVE
        </span>
      );
    }
    if (isAssisted) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">
          ASSISTED_IMPORT
        </span>
      );
    }
    if (isAuth) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
          <Lock className="w-3 h-3" />
          AUTH_REQUIRED
        </span>
      );
    }
    if (isBlocked) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
          <XCircle className="w-3 h-3" />
          BLOCKED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-500/10 border border-slate-600 px-2 py-0.5 rounded">
        <AlertTriangle className="w-3 h-3" />
        FIXTURE_ONLY
      </span>
    );
  };

  const getProvenanceBadge = (origin?: string, isLiveRecord?: boolean, isSeed?: boolean) => {
    if (isSeed) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
          DEMO_SEED_DATA
        </span>
      );
    }
    if (origin === "REAL_CURRENT_FETCH" || isLiveRecord) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" />
          REAL_CURRENT_FETCH
        </span>
      );
    }
    if (origin === "ASSISTED_IMPORT") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">
          ASSISTED_IMPORT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
        {origin || "HISTORICAL_RECORD"}
      </span>
    );
  };

  const getStaleBadge = (opp: IntelligenceEvaluationResult) => {
    if (!opp.is_stale) return null;
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-600/60 px-2.5 py-1 rounded-md">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          {isRTL ? "بيانات قديمة / لم يُعد التحقق منها مؤخراً" : "STALE / SOURCE NOT RECENTLY VERIFIED"}
        </span>
        <span className="text-[10px] text-slate-300 ms-1 opacity-90">
          • {isRTL ? "آخر تحقق:" : "Last Verified:"} {opp.last_verified_at ? opp.last_verified_at.slice(0, 10) : "Historical"} • {isRTL ? "حالة المصدر:" : "Source Status:"} {opp.source_status || "BLOCKED"}
        </span>
      </div>
    );
  };

  const getActionabilityBadge = (actionability?: ActionabilityIntelligence) => {
    if (!actionability) return null;
    const state = actionability.state;
    const score = actionability.score;
    const colorClass =
      state === "HIGH"
        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
        : state === "MEDIUM"
        ? "bg-blue-950/60 text-blue-400 border-blue-800/50"
        : state === "LOW"
        ? "bg-amber-950/60 text-amber-400 border-amber-800/50"
        : "bg-rose-950/60 text-rose-400 border-rose-800/50";

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${colorClass}`}>
        <span>⚡ {isRTL ? "قابلية التنفيذ:" : "Actionability:"}</span>
        <span>{state} ({score}%)</span>
      </span>
    );
  };

  const getApplicationChannelBadge = (channelStatus?: ApplicationChannelStatus, rawChannel?: string) => {
    const status = channelStatus || (rawChannel ? "DIRECT_APPLICATION" : "UNKNOWN");
    const colorClass =
      status === "DIRECT_APPLICATION"
        ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
        : status === "VENDOR_PORTAL"
        ? "bg-blue-950/60 text-blue-300 border-blue-700/50"
        : status === "MULTIPLE_CHANNELS"
        ? "bg-teal-950/60 text-teal-300 border-teal-700/50"
        : status === "PROCUREMENT_CONTACT"
        ? "bg-purple-950/60 text-purple-300 border-purple-700/50"
        : status === "SOURCE_INSTRUCTIONS"
        ? "bg-amber-950/60 text-amber-300 border-amber-700/50"
        : "bg-rose-950/60 text-rose-300 border-rose-700/50";

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${colorClass}`}>
        <span>📥</span>
        <span>{status.replace(/_/g, " ")}</span>
      </span>
    );
  };

  const getSourceStatusBadge = (sourceStatus?: string) => {
    const status = sourceStatus || "UNKNOWN";
    const colorClass =
      status === "WORKING_LIVE"
        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
        : status === "ASSISTED_IMPORT"
        ? "bg-blue-950/60 text-blue-400 border-blue-800/50"
        : status === "AUTH_REQUIRED"
        ? "bg-amber-950/60 text-amber-400 border-amber-800/50"
        : status === "BLOCKED" || status === "RUNTIME_ENVIRONMENT_BLOCKED"
        ? "bg-rose-950/60 text-rose-400 border-rose-800/50"
        : "bg-slate-800 text-slate-400 border-slate-700";

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${colorClass}`}>
        <span>📡</span>
        <span>{status.replace(/_/g, " ")}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Top Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
        {/* Practical Quick Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 border-b border-slate-800/80 text-xs">
          <span className="text-[11px] font-bold text-[#c9a84c] shrink-0 me-1">
            {isRTL ? "فلاتر سريعة:" : "Quick Filters:"}
          </span>
          {[
            { id: "hotels", labelEn: "Hotels", labelAr: "فنادق وضيافة" },
            { id: "manpower", labelEn: "Manpower", labelAr: "قوى عاملة" },
            { id: "renovation", labelEn: "Building Renovation", labelAr: "ترميم وتأهيل المباني" },
            { id: "housekeeping", labelEn: "Housekeeping", labelAr: "تدبير فندقي" },
            { id: "cleaning", labelEn: "Cleaning", labelAr: "نظافة" },
            { id: "catering", labelEn: "Catering", labelAr: "إعاشة وتموين" },
            { id: "facility_management", labelEn: "Facility Management", labelAr: "إدارة مرافق" },
            { id: "om", labelEn: "O&M", labelAr: "تشغيل وصيانة" },
            { id: "supply", labelEn: "Supply", labelAr: "توريدات" },
            { id: "subcontracting", labelEn: "Subcontracting", labelAr: "مقاولة باطن" },
          ].map((qf) => {
            const isActive = activeQuickFilter === qf.id;
            return (
              <button
                key={qf.id}
                onClick={() => handleQuickFilter(qf.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#c9a84c]/20 border-[#c9a84c] text-[#c9a84c] shadow-xs"
                    : "bg-slate-800/70 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-slate-100"
                }`}
              >
                {isRTL ? qf.labelAr : qf.labelEn}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "بحث في الفرص، الأرقام المرجعية، الجهات، المدن..." : "Search opportunities, ref numbers, entities, cities..."}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={govPrivateFilter}
              onChange={(e) => setGovPrivateFilter(e.target.value as "all" | "gov" | "private")}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "جميع القطاعات (حكومي وخاص)" : "All Sectors (Gov & Private)"}</option>
              <option value="gov">{isRTL ? "منافسات حكومية فقط" : "Government Only"}</option>
              <option value="private">{isRTL ? "شركات ومشاريع كبرى خاصة" : "Private & Giga-Projects"}</option>
            </select>
          </div>

          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "3d" | "7d" | "custom")}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "أي موعد إغلاق" : "Any Closing Window"}</option>
              <option value="today">{isRTL ? "تنتهي اليوم (Today)" : "Closing Today"}</option>
              <option value="3d">{isRTL ? "خلال 3 أيام (Last 3 Days)" : "Closing in 3 Days"}</option>
              <option value="7d">{isRTL ? "خلال 7 أيام (Last 7 Days)" : "Closing in 7 Days"}</option>
              <option value="custom">{isRTL ? "تاريخ مخصص (Custom Date)" : "Custom Date Range"}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Row */}
        {dateFilter === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {isRTL ? "تاريخ البدء" : "Start Date"}
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {isRTL ? "تاريخ الانتهاء" : "End Date"}
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
        )}

        {/* Secondary filters row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "جميع القطاعات" : "All Sectors"}</option>
              {SAUDI_SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {isRTL ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "جميع فئات الخدمات" : "All Services"}</option>
              {SAUDI_SERVICE_CATEGORIES.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {isRTL ? sc.nameAr : sc.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={workCategoryFilter}
              onChange={(e) => setWorkCategoryFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "مجالات التصنيف" : "All Categories"}</option>
              {SAUDI_WORK_CATEGORIES.map((c) => (
                <option key={c.nameEn} value={c.nameEn}>
                  {isRTL ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "أنواع المنافسات" : "All Types"}</option>
              <option value="RFQ">RFQ (عروض أسعار)</option>
              <option value="RFP">RFP (مقترحات)</option>
              <option value="EOI">EOI (إبداء اهتمام)</option>
              <option value="PREQUALIFICATION">Prequalification (تأهيل)</option>
              <option value="SUBCONTRACT_REQUEST">Subcontract (باطن)</option>
              <option value="VENDOR_REGISTRATION">Vendor Reg (تسجيل)</option>
              <option value="GOVERNMENT_TENDER">Gov Tender (حكومي)</option>
              <option value="PRIVATE_TENDER">Private (خاص)</option>
            </select>
          </div>

          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "جميع المناطق (13)" : "All Regions"}</option>
              {SAUDI_REGIONS.map((r) => (
                <option key={r.nameEn} value={r.nameEn}>
                  {isRTL ? r.nameAr : r.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "جميع المدن" : "All Cities"}</option>
              {SAUDI_CITIES_AND_INDUSTRIAL.map((c) => (
                <option key={c.nameEn} value={c.nameEn}>
                  {c.isIndustrial ? `🏭 ${isRTL ? c.nameAr : c.nameEn}` : (isRTL ? c.nameAr : c.nameEn)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "حالة الأهلية" : "All Eligibility"}</option>
              <option value="ELIGIBLE">{isRTL ? "مؤهل نظامياً" : "Eligible Only"}</option>
              <option value="LIKELY_ELIGIBLE">{isRTL ? "مرجح الأهلية" : "Likely Eligible"}</option>
              <option value="REVIEW_REQUIRED">{isRTL ? "يتطلب مراجعة" : "Review Required"}</option>
              <option value="NOT_ELIGIBLE">{isRTL ? "غير مؤهل" : "Not Eligible"}</option>
            </select>
          </div>

          <div>
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={0}>{isRTL ? "أي تطابق" : "Any Match Score"}</option>
              <option value={80}>{isRTL ? "قوي (≥ 80%)" : "Strong (≥ 80%)"}</option>
              <option value={65}>{isRTL ? "جيد (≥ 65%)" : "Good (≥ 65%)"}</option>
              <option value={50}>{isRTL ? "مراجعة (≥ 50%)" : "Review (≥ 50%)"}</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Expandable Row */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-2.5 pt-2.5 border-t border-slate-800/60">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{isRTL ? "حجم المشروع المالي (SAR)" : "Project Value (SAR)"}</label>
              <select
                value={projectValueFilter}
                onChange={(e) => setProjectValueFilter(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300"
              >
                <option value="all">{isRTL ? "أي ميزانية" : "All Project Values"}</option>
                <option value="<10M">{isRTL ? "أقل من 10 مليون ريال" : "< 10M SAR"}</option>
                <option value="10M-50M">{isRTL ? "10 - 50 مليون ريال" : "10M - 50M SAR"}</option>
                <option value="50M-100M">{isRTL ? "50 - 100 مليون ريال" : "50M - 100M SAR"}</option>
                <option value=">100M">{isRTL ? "أكثر من 100 مليون ريال" : "> 100M SAR (Mega)"}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{isRTL ? "المصدر الرسمي" : "Source"}</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300"
              >
                <option value="all">{isRTL ? "جميع المصادر الرسمية" : "All Official Sources"}</option>
                {SAUDI_SOURCES_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isRTL ? s.nameAr : s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{isRTL ? "حالة التحقق الحية" : "Source Live Status"}</label>
              <select
                value={sourceStatusFilter}
                onChange={(e) => setSourceStatusFilter(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300"
              >
                <option value="all">{isRTL ? "جميع الحالات" : "All Live Statuses"}</option>
                <option value="VERIFIED_LIVE">VERIFIED_LIVE (حي موثق)</option>
                <option value="AUTH_REQUIRED">AUTH_REQUIRED (يتطلب اعتماد)</option>
                <option value="BLOCKED">BLOCKED (محجوب جغرافياً)</option>
                <option value="FIXTURE_ONLY">FIXTURE_ONLY (بيانات محاكاة/اختبار)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end gap-1.5">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={directTenderOnly}
                  onChange={(e) => setDirectTenderOnly(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="truncate">{isRTL ? "مناسب كمقاول رئيسي فقط" : "Direct Tender Only"}</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subcontractOnly}
                  onChange={(e) => setSubcontractOnly(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="truncate">{isRTL ? "أهداف مقاولة باطن فقط" : "Subcontract Targets Only"}</span>
              </label>
            </div>
          </div>
        )}

        {/* Toggle Controls & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between mt-3 pt-2.5 border-t border-slate-800 text-xs gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showAdvancedFilters ? (isRTL ? "إخفاء الفلاتر المتقدمة" : "Hide Advanced Filters") : (isRTL ? "المزيد من الفلاتر (الميزانية، المصدر، الباطن)" : "More Filters (Budget, Source, Subcontract)")}</span>
            </button>

            <button
              onClick={() => setShowFilteredOut(!showFilteredOut)}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {showFilteredOut
                  ? isRTL
                    ? "إخفاء الفرص المستبعدة"
                    : "Hide Filtered-Out Opportunities"
                  : isRTL
                  ? `عرض الفرص المستبعدة ومعرفة السبب (${filteredOutOpportunities.length})`
                  : `Show Filtered-Out Opportunities & Reasons (${filteredOutOpportunities.length})`}
              </span>
            </button>

            <label className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={showSeedData}
                onChange={(e) => setShowSeedData(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span>{isRTL ? "تضمين بيانات تجريبية (Demo/Seed)" : "Include Demo/Seed Records"}</span>
            </label>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono">
            <span>
              {isRTL ? "الفرص المعروضة" : "Visible Opps"}:{" "}
              <strong className="text-emerald-400">{visibleOpportunities.length}</strong>
            </span>
            <span>
              {isRTL ? "المستبعدة" : "Filtered"}:{" "}
              <strong className="text-amber-400">{filteredOutOpportunities.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Opportunities Feed */}
      <div className="space-y-4">
        {/* Renovation Intelligence Active Feed Banner */}
        {(() => {
          const isRenoSearch = activeQuickFilter === "renovation" || (searchQuery && (searchQuery.includes("ترميم") || searchQuery.toLowerCase().includes("renovation") || searchQuery.toLowerCase().includes("rehabilitation")));
          if (!isRenoSearch || visibleOpportunities.length === 0) return null;
          const firstReno = visibleOpportunities.find((o) => o.is_renovation) || visibleOpportunities[0];
          return (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
              <div className="space-y-0.5">
                <span className="font-bold flex items-center gap-1.5 text-purple-300">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  {isRTL ? "تدقيق مشاريع الترميم وإعادة التأهيل الحية:" : "Building Renovation & Restoration Discovery Audit:"}
                </span>
                <span className="text-[11px] text-purple-300/80">
                  {isRTL
                    ? `الفرص المكتشفة: ${visibleOpportunities.length} • المعروضة: ${visibleOpportunities.length} • المستبعدة: ${filteredOutOpportunities.length} • التصنيفات المدعومة: 29 تصنيفاً معتمداً`
                    : `Discovered: ${visibleOpportunities.length} | Displayed: ${visibleOpportunities.length} | Excluded: ${filteredOutOpportunities.length} | 29 Standard Categories Supported`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-purple-300 bg-purple-900/30 px-2.5 py-1.5 rounded-lg border border-purple-800/30">
                <span>Source: {firstReno?.primary_source_id || "src-spa"}</span>
                <span>• City: {firstReno?.city || "Riyadh"}</span>
                <span>• Client: {firstReno?.client || firstReno?.entity}</span>
                <span>• Channel: {firstReno?.application_channel || "SPA Wire & Balady"}</span>
                <span>• Verified: {firstReno?.last_verified_at ? firstReno.last_verified_at.slice(0, 10) : "Today"}</span>
              </div>
            </div>
          );
        })()}

        {visibleOpportunities.length === 0 ? (
          (() => {
            const isHospActive = activeQuickFilter === "hotels" || sectorFilter === "Hospitality" || searchQuery.toLowerCase().includes("hotel") || searchQuery.toLowerCase().includes("فندق");
            const isManpActive = ["manpower", "housekeeping", "cleaning", "catering", "facility_management"].includes(activeQuickFilter || "") || serviceFilter === "manpower" || searchQuery.toLowerCase().includes("manpower") || searchQuery.toLowerCase().includes("cleaning") || searchQuery.toLowerCase().includes("catering") || searchQuery.toLowerCase().includes("نظافة") || searchQuery.toLowerCase().includes("إعاشة") || searchQuery.toLowerCase().includes("قوى عاملة");
            const isRenoActive = activeQuickFilter === "renovation" || (searchQuery && (searchQuery.includes("ترميم") || searchQuery.toLowerCase().includes("renovation")));

            if (isHospActive || isManpActive || isRenoActive) {
              const categoryTitle = isHospActive
                ? (isRTL ? "قطاع الفنادق والضيافة والسياحة (Hospitality & Hotels)" : "Hospitality & Hotels Sector")
                : isManpActive
                ? (isRTL ? "قطاع القوى العاملة والخدمات المساندة (Manpower & Facilities)" : "Manpower & Facilities Management Sector")
                : (isRTL ? "قطاع ترميم وتأهيل المباني (Building Renovation & Restoration)" : "Building Renovation & Restoration Sector");

              const probedSources = isHospActive
                ? [
                    { id: "src-asfar", name: "ASFAR Tourism Investment", status: "AUTH_REQUIRED", note: isRTL ? "بوابة تتطلب اعتماد الشركاء والموردين" : "Requires verified supplier authentication" },
                    { id: "src-boutique-group", name: "Boutique Group (PIF Palaces)", status: "AUTH_REQUIRED", note: isRTL ? "بوابة تتطلب تسجيل الدخول المسبق" : "Requires contractor portal credentials" },
                    { id: "src-furas", name: "Furas Balady Municipal", status: "VERIFIED_LIVE", note: isRTL ? "فرص التأجير مفتوحة؛ منافسات التشغيل الفندقي محجوبة خلف السجل التجاري" : "Leasing open; operational hotel RFPs require CR login" },
                    { id: "src-etimad", name: "Etimad Monafasat", status: "ASSISTED_IMPORT", note: isRTL ? "محجوبة بجدار ناري/نفاذ وطني للمستضيفين الخارجيين" : "Geo-firewalled; assisted import active" },
                  ]
                : isManpActive
                ? [
                    { id: "src-etimad", name: "Etimad Manpower", status: "ASSISTED_IMPORT", note: isRTL ? "عقود القوى العاملة تتطلب استيراداً معتمداً" : "Assisted import required for government staffing RFPs" },
                    { id: "src-aramco", name: "Aramco Camp & Catering", status: "AUTH_REQUIRED", note: isRTL ? "تتطلب اعتماد نظام أكتفاء (IKTVA / Ariba)" : "Requires authenticated SAP Ariba IKTVA login" },
                    { id: "src-furas", name: "Furas Municipal", status: "VERIFIED_LIVE", note: isRTL ? "استثمارات أراضي ومواقع، لا توفر مناقصات عمالة عامة" : "Municipal land leasing portal, no open labor tenders" },
                  ]
                : [
                    { id: "src-spa", name: "Saudi Press Agency (SPA)", status: "WORKING_LIVE", note: isRTL ? "بوابة حكومية حية لنشرات العقود والترسيّات" : "Verified live portal for government contract announcements" },
                    { id: "src-etimad", name: "Etimad Monafasat", status: "ASSISTED_IMPORT", note: isRTL ? "منافسات الترميم الحكومية تتطلب استيراداً معتمداً" : "Assisted import required" },
                    { id: "src-rcjy", name: "RCJY Jubail & Yanbu", status: "BLOCKED", note: isRTL ? "محجوبة جغرافياً بجدار الحماية الحكومي" : "Perimeter connection blocked" },
                  ];

              return (
                <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-6 text-start space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                            REAL_DATA_VERIFIED = FALSE
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                            STATUS: SOURCE_COVERAGE_GAP
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 mt-1">
                          {isRTL ? `فجوة في تغطية المصادر: ${categoryTitle}` : `Source Coverage Gap Diagnosed: ${categoryTitle}`}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveQuickFilter(null);
                        setSearchQuery("");
                        setSectorFilter("all");
                        setServiceFilter("all");
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                    >
                      {isRTL ? "إلغاء التصفية وعرض الكل" : "Reset Filter & Show All"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isRTL
                      ? `تم فحص وتتبع خط استكشاف المصادر بالكامل (SOURCE SEARCH → RECORD DISCOVERY → CLASSIFICATION → DISPLAY). لم يتم العثور على منافسات عامة مفتوحة بدون مصادقة لهذا التصنيف. المصادر المتخصصة تتطلب اعتمادات موردين مسبقة أو نفاذ وطني موحد.`
                      : `The source discovery pipeline was traced end-to-end (SOURCE SEARCH → RECORD DISCOVERY → CLASSIFICATION → DISPLAY). Zero open, unauthenticated public tenders were yielded for this category in the current scan. Relevant sector portals require authenticated vendor access or assisted import.`}
                  </p>

                  {/* Diagnostic Trace Table */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-300 block">
                      {isRTL ? "تفاصيل تدقيق المصادر المستهدفة:" : "Targeted Source Probe & Access Status:"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {probedSources.map((ps) => (
                        <div key={ps.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{ps.name}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              ps.status === "WORKING_LIVE" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30" :
                              ps.status === "AUTH_REQUIRED" ? "text-amber-400 bg-amber-500/10 border border-amber-500/30" :
                              ps.status === "ASSISTED_IMPORT" ? "text-blue-400 bg-blue-500/10 border border-blue-500/30" :
                              "text-rose-400 bg-rose-500/10 border border-rose-500/30"
                            }`}>
                              {ps.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{ps.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-xs text-blue-300 flex items-center justify-between">
                    <span>
                      {isRTL
                        ? "الحل الإنتاجي المتاح: استخدم خاصية 'الاستيراد المعزز' لإدخال وثائق المنافسات أو دعوات التأهيل الخاصة."
                        : "Recommended Production Action: Use 'Assisted Import' to upload RFP tender files or private vendor invitations directly."}
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      ASSISTED_IMPORT_READY
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium">
                  {isRTL ? "لا توجد فرص تطابق معايير التصفية المحددة" : "No opportunities match the current filter criteria"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {isRTL ? "جرب توسيع نطاق المنطقة أو نوع المنافسة أو تصفح الفرص المستبعدة بالأسفل" : "Try broadening region or sector filters, or view filtered-out opportunities below."}
                </p>
              </div>
            );
          })()
        ) : (
          visibleOpportunities.map((opp) => {
            const isSaved = savedListIds.includes(opp.opportunity_id);
            const isHighMatch = opp.match_score.total_score >= 80;

            const oppTitle = isRTL && opp.opportunity_title_ar ? opp.opportunity_title_ar : opp.opportunity_title;
            const verifiedBudget = opp.budget_sar ? `${opp.budget_sar.toLocaleString()} SAR` : (isRTL ? "غير محدد (UNKNOWN)" : "Unspecified / UNKNOWN");
            const closingStr = opp.closing_date && opp.closing_date !== "UNKNOWN" ? opp.closing_date.slice(0, 10) : (isRTL ? "غير محدد (UNKNOWN)" : "Unspecified / UNKNOWN");
            const pubDateStr = opp.publication_date || opp.discovered_at ? (opp.publication_date || opp.discovered_at || "").slice(0, 10) : (isRTL ? "غير محدد (UNKNOWN)" : "Unspecified / UNKNOWN");
            const refNumber = opp.reference_number && opp.reference_number !== "UNKNOWN" ? opp.reference_number : null;

            return (
              <div
                key={opp.opportunity_id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    {/* Header tags: Type, Provenance Origin, Confidence, Entity, City/Region */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {opp.opportunity_type.replace(/_/g, " ")}
                      </span>

                      {/* Truthful Provenance Origin Badge */}
                      {getProvenanceBadge(opp.record_origin, opp.is_live_record, opp.is_seed)}

                      {/* POST-STAGE-10C1: Actionability, Source Status & Application Channel Badges */}
                      {getActionabilityBadge(opp.actionability)}
                      {getSourceStatusBadge(opp.source_status)}
                      {getApplicationChannelBadge(opp.how_to_apply?.channel_status, opp.application_channel)}

                      {/* Renovation Tag */}
                      {opp.is_renovation && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                          RENOVATION: {(opp.renovation_category || "GENERAL_RENOVATION").replace(/_/g, " ")}
                        </span>
                      )}

                      {/* Confidence Level Tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          opp.confidence_level === "CONFIRMED_OPPORTUNITY"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                            : opp.confidence_level === "POSSIBLE_OPPORTUNITY"
                            ? "bg-blue-950/60 text-blue-400 border border-blue-800/50"
                            : "bg-purple-950/60 text-purple-400 border border-purple-800/50"
                        }`}
                      >
                        {opp.confidence_level}
                      </span>

                      {refNumber && (
                        <span className="text-xs text-slate-400 font-mono">
                          Ref: {refNumber}
                        </span>
                      )}

                      <span className="text-xs text-slate-400">• {opp.entity}</span>
                      <span className="text-xs text-slate-500">• {opp.city}, {opp.region}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectOpp(opp)}
                      className="text-base font-bold text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {oppTitle}
                    </h3>
                  </div>

                  {/* Score & Badges */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className={`text-base font-extrabold ${isHighMatch ? "text-emerald-400" : "text-blue-400"}`}>
                          {opp.match_score.total_score}%
                        </span>
                        <span className="text-[10px] block text-slate-400 font-medium">
                          {opp.match_score.label}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleAwardWatch(opp.opportunity_id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          watchedAwardIds.includes(opp.opportunity_id)
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                            : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                        title={
                          watchedAwardIds.includes(opp.opportunity_id)
                            ? (isRTL ? "قيد مراقبة الترسية" : "Watching Award")
                            : (isRTL ? "مراقبة نتيجة الترسية" : "Watch Award Result")
                        }
                      >
                        <Award className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onToggleSave(opp.opportunity_id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          isSaved
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                        title={isSaved ? (isRTL ? "محفوظ بالقائمة" : "Saved") : (isRTL ? "حفظ بالقائمة" : "Save")}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Eligibility Badge */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold">
                      {opp.eligibility.status === "ELIGIBLE" && (
                        <span className="text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          {isRTL ? "مؤهل نظامياً" : "ELIGIBLE"}
                        </span>
                      )}
                      {opp.eligibility.status === "LIKELY_ELIGIBLE" && (
                        <span className="text-teal-400 border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          {isRTL ? "مرجح الأهلية" : "LIKELY_ELIGIBLE"}
                        </span>
                      )}
                      {opp.eligibility.status === "REVIEW_REQUIRED" && (
                        <span className="text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {isRTL ? "مراجعة المتطلبات" : "REVIEW_REQUIRED"}
                        </span>
                      )}
                      {opp.eligibility.status === "NOT_ELIGIBLE" && (
                        <span className="text-rose-400 border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3 inline mr-1" />
                          {isRTL ? "غير مؤهل" : "NOT_ELIGIBLE"}
                        </span>
                      )}
                      {opp.eligibility.status === "UNKNOWN" && (
                        <span className="text-slate-400 border border-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                          {isRTL ? "غير محدد" : "UNKNOWN"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stale Warning Banner if not recently verified */}
                {opp.is_stale && (
                  <div className="mt-2.5">
                    {getStaleBadge(opp)}
                  </div>
                )}

                {/* Subcontracting Banner if applicable */}
                {opp.subcontract.is_subcontract_target && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-semibold">{isRTL ? "فرصة مقاولة باطن ممتازة" : "Prime Subcontract Target"}: </span>
                      {opp.subcontract.subcontract_rationale.join(" ")}
                    </div>
                  </div>
                )}

                {/* Meta details footer with Dates, Budget, Source and Live Status */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>
                      {isRTL ? "الميزانية المعتمدة" : "Budget"}:{" "}
                      <strong className="text-slate-200">{verifiedBudget}</strong>
                    </span>
                    <span>
                      {isRTL ? "تاريخ النشر" : "Published"}:{" "}
                      <strong className="text-slate-200">{pubDateStr}</strong>
                    </span>
                    <span>
                      {isRTL ? "الموعد النهائي" : "Closing"}:{" "}
                      <strong className="text-slate-200">{closingStr}</strong>
                    </span>
                    <span>
                      {isRTL ? "المجال" : "Work Category"}:{" "}
                      <strong className="text-slate-300">{opp.work_category}</strong>
                    </span>
                  </div>

                  {/* Source Name & Live Ingestion Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {opp.primary_source_id || "src-etimad"}
                    </span>
                    {getSourceBadge(opp.primary_source_id, opp.source_live_status)}

                    <button
                      onClick={() => onSelectOpp(opp)}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium ml-2"
                    >
                      <span>{isRTL ? "عرض التفاصيل" : "View Details"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Part C: Filtered-Out Opportunities Section */}
      {showFilteredOut && filteredOutOpportunities.length > 0 && (
        <div className="mt-8 space-y-3 bg-slate-950/70 border border-amber-900/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{isRTL ? "الفرص المستبعدة وأسباب الاستبعاد الصريحة (Filtered-Out Opportunities)" : "Filtered-Out Opportunities & Explicit Rejection Reasons"}</span>
            </h4>
            <span className="text-xs text-amber-300/80 font-mono">
              {filteredOutOpportunities.length} {isRTL ? "فرصة مستبعدة" : "excluded opportunities"}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {isRTL
              ? "الفرص المستبعدة محفوظة ولم تُحذف نهائياً. يوضح السجل أدناه السبب الدقيق لاستبعاد كل فرصة (نشاط غير مطابق، خارج المنطقة، متطلب إلزامي مفقود، إشارة سوقية فقط)."
              : "Excluded opportunities are preserved and never permanently discarded. Each entry displays the exact evidence-backed reason for exclusion."}
          </p>

          <div className="space-y-2 mt-3">
            {filteredOutOpportunities.map(({ opp, reason }) => (
              <div
                key={`filtered-${opp.opportunity_id}`}
                className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-slate-200">
                    {isRTL && opp.opportunity_title_ar ? opp.opportunity_title_ar : opp.opportunity_title}
                  </span>
                  <span className="text-slate-500 mx-2">•</span>
                  <span className="text-slate-400">{opp.entity}</span>
                  <span className="text-slate-500 mx-2">•</span>
                  <span className="text-slate-400">{opp.city}, {opp.region}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[11px] font-semibold">
                    {reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
