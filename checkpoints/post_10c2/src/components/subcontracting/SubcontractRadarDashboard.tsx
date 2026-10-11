import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  subcontractApi,
  type MainContractorProfile,
  type SubcontractPackage,
  type SubcontractMatchItem,
  type SubcontractActionPlan,
} from "../../api/subcontracting";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  Layers,
  Clock,
  FileText,
  Mail,
  Phone,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  MapPin,
  Lock,
  Globe,
  AlertCircle,
  X,
  FileCheck2,
} from "lucide-react";

export function SubcontractRadarDashboard() {
  const { isRTL } = useTranslation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"packages" | "contractors" | "action_plans">("packages");

  // Data states
  const [contractors, setContractors] = useState<MainContractorProfile[]>([]);
  const [packages, setPackages] = useState<SubcontractPackage[]>([]);
  const [matches, setMatches] = useState<SubcontractMatchItem[]>([]);
  const [actionPlans, setActionPlans] = useState<SubcontractActionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedContractor, setSelectedContractor] = useState<string>("ALL");
  const [onlySmallFriendly, setOnlySmallFriendly] = useState<boolean>(false);
  const [onlyConfirmed, setOnlyConfirmed] = useState<boolean>(false);

  // Modal / Detail state
  const [selectedMatch, setSelectedMatch] = useState<SubcontractMatchItem | null>(null);
  const [copyEmailSuccess, setCopyEmailSuccess] = useState<boolean>(false);
  const [creatingPlanForId, setCreatingPlanForId] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cList, pList, mList, aList] = await Promise.all([
        subcontractApi.listMainContractors(),
        subcontractApi.listSubcontractPackages(),
        subcontractApi.getSubcontractMatches(),
        subcontractApi.listActionPlans(),
      ]);
      setContractors(cList);
      setPackages(pList);
      setMatches(mList);
      setActionPlans(aList);
    } catch (err) {
      console.error("Failed to load subcontracting intelligence data:", err);
      setError(isRTL ? "فشل تحميل بيانات رادار مقاولي الباطن" : "Failed to load subcontracting radar data");
    } finally {
      setLoading(false);
    }
  }, [isRTL]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle plan creation
  const handleCreateActionPlan = async (packageId: string) => {
    try {
      setCreatingPlanForId(packageId);
      const plan = await subcontractApi.createActionPlan(packageId);
      setActionPlans((prev) => [plan, ...prev.filter((p) => p.id !== plan.id)]);
      setActiveTab("action_plans");
      setSelectedMatch(null);
    } catch (err) {
      console.error("Failed to create action plan:", err);
    } finally {
      setCreatingPlanForId(null);
    }
  };

  // Handle step completion
  const handleCompleteStep = async (planId: string, stepNumber: number) => {
    try {
      const updated = await subcontractApi.updateActionPlanStatus(planId, "IN_PROGRESS", undefined, stepNumber);
      setActionPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    } catch (err) {
      console.error("Failed to update step status:", err);
    }
  };

  // Copy email draft
  const handleCopyEmail = (body: string) => {
    navigator.clipboard.writeText(body);
    setCopyEmailSuccess(true);
    setTimeout(() => setCopyEmailSuccess(false), 2000);
  };

  // Filter packages
  const filteredMatches = matches.filter((item) => {
    const pkg = item.package;
    if (selectedCategory !== "ALL" && pkg.package_category !== selectedCategory) {
      return false;
    }
    if (selectedContractor !== "ALL" && pkg.main_contractor_id !== selectedContractor) {
      return false;
    }
    if (onlySmallFriendly && !pkg.small_contractor_friendly) {
      return false;
    }
    if (onlyConfirmed && pkg.is_inferred) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (pkg.package_name || "").toLowerCase().includes(q);
      const matchNameAr = (pkg.package_name_ar || "").toLowerCase().includes(q);
      const matchProj = (pkg.project_name || "").toLowerCase().includes(q);
      const matchCont = (pkg.main_contractor_name || "").toLowerCase().includes(q);
      if (!matchName && !matchNameAr && !matchProj && !matchCont) return false;
    }
    return true;
  });

  // Unique categories for filter pills
  const categories = ["ALL", "MEP", "CIVIL", "BUILDINGS", "WATER_SEWAGE", "TELECOM_IT"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BriefcaseBusiness className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">
              {isRTL ? "رادار مقاولي الباطن والفرص التخصصية" : "Subcontract Radar & Prime Contractor Intelligence"}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {isRTL
              ? "تحويل عقود الترسية المؤكدة إلى حزم مقاولات باطن، بوابات تأهيل معتمدة، وخطة استهداف مباشرة."
              : "Turn verified Saudi tender awards into actionable subcontract packages, official vendor portals, and outreach plans."}
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isRTL ? "بوابة الإدخال المؤكد فقط — مرحلة 8" : "Verified Award Input Gate Active"}
          </span>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-medium transition-colors"
          >
            {isRTL ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{isRTL ? "المقاولون الرئيسيون" : "Prime Contractors"}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{contractors.length}</span>
            <span className="text-xs text-emerald-400 font-medium">{isRTL ? "معتمدين" : "Verified"}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{isRTL ? "حزم مقاولات الباطن" : "Subcontract Packages"}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{packages.length}</span>
            <span className="text-xs text-slate-500">{isRTL ? "متاحة" : "Total"}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{isRTL ? "حزم مؤكدة رسمياً" : "Confirmed Packages"}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">
              {packages.filter((p) => !p.is_inferred).length}
            </span>
            <span className="text-xs text-slate-500">{isRTL ? "غير مشتقة" : "Direct"}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{isRTL ? "تطابق عالي للشركة" : "Strong Fit Matches"}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">
              {matches.filter((m) => m.match.match_score >= 80).length}
            </span>
            <span className="text-xs text-emerald-500">≥80%</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400">{isRTL ? "خطط الاستهداف النشطة" : "Active Action Plans"}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400">{actionPlans.length}</span>
            <span className="text-xs text-purple-400">{isRTL ? "قيد المتابعة" : "In BD"}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 rtl:space-x-reverse">
        <button
          onClick={() => setActiveTab("packages")}
          className={`pb-3 px-3 text-xs md:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "packages"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          {isRTL ? "فرص وحزم مقاولات الباطن" : "Subcontract Packages"}
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
            {filteredMatches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("contractors")}
          className={`pb-3 px-3 text-xs md:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "contractors"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          {isRTL ? "دليل المقاولين الرئيسيين والبوابات" : "Prime Contractors & Portals"}
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
            {contractors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("action_plans")}
          className={`pb-3 px-3 text-xs md:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "action_plans"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {isRTL ? "خطط الاستهداف والتواصل (BD)" : "Action Plans & BD Pipeline"}
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
            {actionPlans.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Subcontract Packages Feed */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute top-3 left-3 rtl:left-auto rtl:right-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    isRTL
                      ? "البحث عن حزمة، مشروع، أو مقاول رئيسي..."
                      : "Search by package name, project, or prime contractor..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-xs md:text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Prime contractor filter */}
              <select
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
                className="py-2 px-3 text-xs md:text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">{isRTL ? "جميع المقاولين الرئيسيين" : "All Prime Contractors"}</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isRTL ? c.contractor_name_ar || c.contractor_name : c.contractor_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Pills & Checkbox Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlySmallFriendly}
                    onChange={(e) => setOnlySmallFriendly(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>{isRTL ? "مناسب للمقاولين الصغار والمتوسطين" : "Small/Mid Contractor Friendly"}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyConfirmed}
                    onChange={(e) => setOnlyConfirmed(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>{isRTL ? "حزم مؤكدة رسمياً فقط" : "Confirmed Only (Non-inferred)"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Packages List */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-2"></div>
              <p>{isRTL ? "جارٍ تحميل حزم مقاولات الباطن وتحليل التطابق..." : "Loading packages and analyzing match..."}</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">
                {isRTL ? "لم يتم العثور على حزم مطابقة لمعايير البحث" : "No subcontract packages match current filters"}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedContractor("ALL");
                  setSearchQuery("");
                  setOnlySmallFriendly(false);
                  setOnlyConfirmed(false);
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                {isRTL ? "إعادة ضبط المرشحات" : "Reset filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMatches.map(({ package: pkg, match }) => {
                const isConfirmed = !pkg.is_inferred;
                const scoreColor =
                  match.match_score >= 80
                    ? "text-emerald-400 bg-emerald-950/60 border-emerald-800"
                    : match.match_score >= 65
                    ? "text-amber-400 bg-amber-950/60 border-amber-800"
                    : "text-slate-400 bg-slate-900 border-slate-800";

                return (
                  <div
                    key={pkg.id}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {pkg.package_category}
                          </span>
                          {isConfirmed ? (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-800">
                              {isRTL ? "حزمة مؤكدة" : "Confirmed Package"}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              {isRTL ? "مشتقة من نطاق العقد" : "Inferred from Prime Scope"}
                            </span>
                          )}
                          {pkg.small_contractor_friendly && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                              {isRTL ? "مناسب للشركات المتوسطة" : "SME Friendly"}
                            </span>
                          )}
                        </div>

                        {/* Match score badge */}
                        <div
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${scoreColor}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{match.match_score}%</span>
                          <span className="text-[10px] uppercase font-normal">{match.eligibility_status}</span>
                        </div>
                      </div>

                      {/* Package Title */}
                      <div>
                        <h3 className="text-base font-semibold text-slate-100 leading-snug">
                          {isRTL ? pkg.package_name_ar || pkg.package_name : pkg.package_name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pkg.description}</p>
                      </div>

                      {/* Prime Award & Owner Context */}
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">{isRTL ? "المقاول الرئيسي:" : "Prime Contractor:"}</span>
                          <span className="font-medium text-amber-400">
                            {isRTL ? pkg.main_contractor_name_ar || pkg.main_contractor_name : pkg.main_contractor_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">{isRTL ? "المشروع التابع له:" : "Awarded Project:"}</span>
                          <span className="truncate max-w-[240px] text-slate-300" title={pkg.project_name}>
                            {pkg.project_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">{isRTL ? "الجهة المالكة:" : "Project Owner:"}</span>
                          <span className="text-slate-400">{pkg.project_owner}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500">{isRTL ? "الموقع الجغرافي:" : "Location:"}</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {pkg.project_location}
                          </span>
                        </div>
                      </div>

                      {/* Value and timing */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <span className="text-slate-500 block text-[11px]">{isRTL ? "القيمة التقديرية للحزمة:" : "Estimated Value:"}</span>
                          <span className="font-semibold text-slate-200">
                            {pkg.estimated_value_sar
                              ? `${pkg.estimated_value_sar.toLocaleString()} SAR`
                              : isRTL ? "غير معلنة" : "TBD / Envelope"}
                          </span>
                        </div>
                        <div className="text-right rtl:text-left">
                          <span className="text-slate-500 block text-[11px]">{isRTL ? "التوقيت المتوقع:" : "Likely Timing:"}</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {pkg.likely_timing}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                      <button
                        onClick={() => setSelectedMatch({ package: pkg, match })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {isRTL ? "تحليل الملاءمة" : "Match Rationale"}
                      </button>

                      <button
                        onClick={() => handleCreateActionPlan(pkg.id)}
                        disabled={creatingPlanForId === pkg.id}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {creatingPlanForId === pkg.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5" />
                        )}
                        {isRTL ? "بدء خطة الاستهداف" : "Create Action Plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Prime Contractors Directory & Portals */}
      {activeTab === "contractors" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractors.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Contractor Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        {isRTL ? c.contractor_name_ar || c.contractor_name : c.contractor_name}
                      </h3>
                      {c.commercial_brand_name && (
                        <span className="text-xs text-amber-400 font-medium">{c.commercial_brand_name}</span>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {isRTL ? "مقاول رئيسي معتمد" : "Verified Prime"}
                    </span>
                  </div>

                  {/* Metadata tags */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">{isRTL ? "المقر الرئيسي:" : "Headquarters:"}</span>
                      <span className="text-slate-200 font-medium">{c.headquarters || "Saudi Arabia"}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">{isRTL ? "السجل التجاري:" : "CR Number:"}</span>
                      <span className="text-slate-200 font-medium">{c.cr_number || "Verified"}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/50 border border-slate-800 col-span-2">
                      <span className="text-slate-500 block text-[10px]">{isRTL ? "تصنيف المقاولين (مقاول):" : "Classification:"}</span>
                      <span className="text-slate-200">{c.contractor_classification || "Grade 1 Prime Contractor"}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  {c.specialties && c.specialties.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 block">{isRTL ? "التخصصات الرئيسية:" : "Specialties:"}</span>
                      <div className="flex flex-wrap gap-1">
                        {c.specialties.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discovered Official Portals */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      {isRTL ? "بوابات الموردين ومقاولي الباطن المكتشفة:" : "Discovered Vendor & Subcontractor Portals:"}
                    </span>

                    {c.portal_links && c.portal_links.length > 0 ? (
                      <div className="space-y-2">
                        {c.portal_links.map((link, idx) => {
                          const isAuth = link.authentication_required || link.registration_status === "AUTH_REQUIRED";
                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5 truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-slate-200 truncate">{link.link_type}</span>
                                  {isAuth ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-0.5">
                                      <Lock className="w-2.5 h-2.5" />
                                      {isRTL ? "تسجيل مطلوب" : "Auth Required"}
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                                      {isRTL ? "متاح عامة" : "Public"}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{link.notes}</p>
                              </div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                                title="Open portal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        {isRTL ? "لا توجد روابط مسجلة حالياً." : "No portal links discovered yet."}
                      </p>
                    )}
                  </div>

                  {/* Public Business Contacts */}
                  {c.contacts && c.contacts.length > 0 && (
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                      <span className="text-slate-400 font-semibold block text-[11px]">
                        {isRTL ? "بيانات التواصل الرسمية للمشتريات:" : "Public Procurement Contacts:"}
                      </span>
                      {c.contacts.map((contact, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5 text-slate-300">
                          {contact.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-amber-500" />
                              <a href={`mailto:${contact.email}`} className="text-amber-400 hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer link to active projects */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {isRTL
                      ? `${c.active_saudi_projects?.length || 1} مشاريع معتمدة قيد التنفيذ`
                      : `${c.active_saudi_projects?.length || 1} Active Projects in KSA`}
                  </span>
                  {c.official_website && (
                    <a
                      href={c.official_website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {isRTL ? "الموقع الرسمي" : "Official Website"}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Action Plans & BD Pipeline */}
      {activeTab === "action_plans" && (
        <div className="space-y-4">
          {actionPlans.length === 0 ? (
            <div className="p-12 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">
                {isRTL ? "لا توجد خطط استهداف نشطة حالياً" : "No Active Action Plans"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isRTL
                  ? "اختر أي حزمة مقاولة باطن من تبويب الحزم واضغط على 'بدء خطة الاستهداف' لإنشاء ملف التأهيل ومسودة التواصل."
                  : "Select any subcontract package from the Packages tab and click 'Create Action Plan' to initiate structured outreach."}
              </p>
              <button
                onClick={() => setActiveTab("packages")}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors"
              >
                {isRTL ? "استعراض حزم مقاولات الباطن" : "Browse Subcontract Packages"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {actionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5"
                >
                  {/* Plan Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">
                        {isRTL ? `معرف الخطة: ${plan.id}` : `Action Plan ID: ${plan.id}`}
                      </span>
                      <h3 className="text-base font-bold text-slate-100 mt-0.5">
                        {plan.outreach_email_draft?.subject || "Subcontract Engagement Plan"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isRTL ? `المقاول المستهدف: ${plan.main_contractor_id}` : `Target Contractor: ${plan.main_contractor_id}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {plan.status}
                      </span>
                      {plan.portal_registration_url && (
                        <a
                          href={plan.portal_registration_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {isRTL ? "بوابة التسجيل" : "Registration Portal"}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 5-Step Progress Timeline */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block">
                      {isRTL ? "مراحل خطة الاستهداف الخمس:" : "5-Step Subcontract Engagement Workflow:"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {plan.steps.map((st) => {
                        const isDone = st.status === "COMPLETED";
                        return (
                          <div
                            key={st.step}
                            onClick={() => !isDone && handleCompleteStep(plan.id, st.step)}
                            className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                              isDone
                                ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[11px] text-amber-500">{`Step ${st.step}`}</span>
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                              )}
                            </div>
                            <p className="font-medium text-slate-200 text-xs truncate">{st.title}</p>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              {isDone ? (isRTL ? "مكتمل" : "Completed") : isRTL ? "اضغط للإكمال" : "Click to complete"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Two columns: Required Documents & Outreach Email */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                    {/* Required Documents Checklist */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        {isRTL ? "ملف التأهيل والوثائق النظامية المطلوبة:" : "Prequalification Dossier Checklist:"}
                      </span>
                      <div className="space-y-1.5">
                        {plan.required_documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs p-2 rounded bg-slate-900/60 border border-slate-800/80"
                          >
                            <span className="text-slate-300 truncate max-w-[280px]">{doc.document_name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                doc.status === "READY"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : "bg-amber-950 text-amber-400 border border-amber-800"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Outreach Email Draft */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-amber-400" />
                            {isRTL ? "مسودة خطاب إبداء الرغبة والتأهيل:" : "Outreach Email / EOI Draft:"}
                          </span>
                          <button
                            onClick={() =>
                              handleCopyEmail(
                                isRTL
                                  ? plan.outreach_email_draft?.body_ar || ""
                                  : plan.outreach_email_draft?.body_en || ""
                              )
                            }
                            className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                          >
                            {copyEmailSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copyEmailSuccess ? (isRTL ? "تم النسخ" : "Copied") : isRTL ? "نسخ المسودة" : "Copy Draft"}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                          {isRTL ? plan.outreach_email_draft?.body_ar : plan.outreach_email_draft?.body_en}
                        </div>
                      </div>

                      {/* Contact Route */}
                      {plan.outreach_contact?.email && (
                        <div className="pt-2 text-xs flex items-center justify-between text-slate-400">
                          <span>{isRTL ? "البريد الإلكتروني المعتمد للمشتريات:" : "Target Procurement Email:"}</span>
                          <a
                            href={`mailto:${plan.outreach_contact.email}?subject=${encodeURIComponent(
                              plan.outreach_email_draft?.subject || ""
                            )}`}
                            className="text-amber-400 hover:underline font-mono"
                          >
                            {plan.outreach_contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match Rationale / Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {selectedMatch.package.package_category}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-2">
                  {isRTL ? selectedMatch.package.package_name_ar || selectedMatch.package.package_name : selectedMatch.package.package_name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedMatch.package.main_contractor_name} &bull; {selectedMatch.package.project_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Fit Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isRTL ? "درجة التوافق مع قدرات شركتك" : "Subcontract Match Score"}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-amber-400">
                    {selectedMatch.match.match_score}%
                  </span>
                  <span className="text-xs font-medium text-emerald-400 uppercase">
                    {selectedMatch.match.eligibility_status}
                  </span>
                </div>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-xs text-slate-400 block">{isRTL ? "التنافسية المتوقعة" : "Competitiveness"}</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">
                  {selectedMatch.match.estimated_competitiveness}
                </span>
              </div>
            </div>

            {/* Fit Factors & Gaps */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {isRTL ? "عوامل القوة والمطابقة المؤكدة:" : "Confirmed Fit Factors:"}
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedMatch.match.fit_reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedMatch.match.gap_warnings.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    {isRTL ? "نقاط المراجعة والمتطلبات الإضافية:" : "Review Items & Additional Gaps:"}
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {selectedMatch.match.gap_warnings.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">&bull;</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommended Approach */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 block">{isRTL ? "مسار التقديم الموصى به:" : "Recommended Strategic Approach:"}</span>
              <p className="font-semibold text-amber-400">{selectedMatch.match.recommended_approach}</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                {isRTL ? "إغلاق" : "Close"}
              </button>
              <button
                onClick={() => handleCreateActionPlan(selectedMatch.package.id)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {isRTL ? "إنشاء خطة الاستهداف الآن" : "Generate Action Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
