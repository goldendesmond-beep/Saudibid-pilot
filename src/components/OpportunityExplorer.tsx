import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { SAUDI_REGIONS, SAUDI_WORK_CATEGORIES } from "../constants/saudiTaxonomy";
import type { IntelligenceEvaluationResult } from "../api/intelligence";
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

      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (opp.opportunity_title || "").toLowerCase().includes(q) ||
          (opp.opportunity_title_ar || "").toLowerCase().includes(q) ||
          (opp.entity || "").toLowerCase().includes(q) ||
          (opp.city || "").toLowerCase().includes(q) ||
          (opp.reference_number || "").toLowerCase().includes(q);
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
    isRTL,
  ]);

  const getSourceBadge = (sourceId?: string, status?: string) => {
    const isLive = status === "VERIFIED_LIVE" || sourceId === "src-furas" || sourceId === "src-neom" || sourceId === "src-roshn";
    const isAuth = status === "AUTH_REQUIRED" || sourceId === "src-aramco";
    const isBlocked = status === "BLOCKED" || sourceId === "src-ncp" || sourceId === "src-rcjy" || sourceId === "src-tadawul";

    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" />
          VERIFIED_LIVE
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

  return (
    <div className="space-y-6">
      {/* Search & Top Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "جميع أنواع المنافسات" : "All Types (RFQ, RFP, EOI...)"}</option>
              <option value="RFQ">RFQ (طلب عروض أسعار)</option>
              <option value="RFP">RFP (طلب مقترحات)</option>
              <option value="EOI">EOI (إبداء اهتمام)</option>
              <option value="PREQUALIFICATION">Prequalification (تأهيل مسبق)</option>
              <option value="SUBCONTRACT_REQUEST">Subcontract Request (طلب باطن)</option>
              <option value="VENDOR_REGISTRATION">Vendor Registration (تسجيل موردين)</option>
              <option value="GOVERNMENT_TENDER">Government Tender (منافسة حكومية)</option>
              <option value="PRIVATE_TENDER">Private Tender (منافسة خاصة)</option>
            </select>
          </div>

          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isRTL ? "جميع المناطق (13 منطقة)" : "All Regions"}</option>
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
              <option value="all">{isRTL ? "جميع المدن والصناعية" : "All Cities & Industrial"}</option>
              {SAUDI_CITIES_AND_INDUSTRIAL.map((c) => (
                <option key={c.nameEn} value={c.nameEn}>
                  {c.isIndustrial ? `🏭 ${isRTL ? c.nameAr : c.nameEn}` : (isRTL ? c.nameAr : c.nameEn)}
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
              <option value="all">{isRTL ? "جميع مجالات التصنيف" : "All Work Categories"}</option>
              {SAUDI_WORK_CATEGORIES.map((c) => (
                <option key={c.nameEn} value={c.nameEn}>
                  {isRTL ? c.nameAr : c.nameEn}
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
              <option value="all">{isRTL ? "جميع حالات الأهلية" : "All Eligibility"}</option>
              <option value="ELIGIBLE">{isRTL ? "مؤهل نظامياً (ELIGIBLE)" : "Eligible Only"}</option>
              <option value="LIKELY_ELIGIBLE">{isRTL ? "مرجح الأهلية (LIKELY)" : "Likely Eligible"}</option>
              <option value="REVIEW_REQUIRED">{isRTL ? "يتطلب مراجعة (REVIEW_REQUIRED)" : "Review Required"}</option>
              <option value="NOT_ELIGIBLE">{isRTL ? "غير مؤهل (NOT_ELIGIBLE)" : "Not Eligible"}</option>
            </select>
          </div>

          <div>
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={0}>{isRTL ? "أي نسبة تطابق" : "Any Match Score"}</option>
              <option value={80}>{isRTL ? "تطابق قوي (≥ 80%)" : "Strong (≥ 80%)"}</option>
              <option value={65}>{isRTL ? "تطابق جيد (≥ 65%)" : "Good (≥ 65%)"}</option>
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
        {visibleOpportunities.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium">
              {isRTL ? "لا توجد فرص تطابق معايير التصفية المحددة" : "No opportunities match the current filter criteria"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isRTL ? "جرب توسيع نطاق المنطقة أو نوع المنافسة أو تصفح الفرص المستبعدة بالأسفل" : "Try broadening region or sector filters, or view filtered-out opportunities below."}
            </p>
          </div>
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
                    {/* Header tags: Type, Confidence, Entity, City/Region */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {opp.opportunity_type.replace(/_/g, " ")}
                      </span>

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
                      <span>{isRTL ? "عرض التفاصيل" : "View Intelligence"}</span>
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
