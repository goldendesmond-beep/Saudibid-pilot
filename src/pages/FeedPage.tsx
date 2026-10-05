import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Play,
  RefreshCw,
  AlertTriangle,
  Inbox,
  X,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { CompanyPanel } from "../components/feed/CompanyPanel";
import { MatchCard } from "../components/feed/MatchCard";
import { Skeleton } from "../components/ui/Skeleton";
import { useCompanyStore } from "../store/companyStore";
import { useFeedStore } from "../store/feedStore";
import { useLocaleStore } from "../store/localeStore";
import { SAUDI_WORK_CATEGORIES, SAUDI_REGIONS } from "../constants/saudiTaxonomy";

export function FeedPage() {
  const { profile } = useCompanyStore();
  const { t, locale } = useLocaleStore();
  const {
    tenders,
    matches,
    isLoadingTenders,
    isRunningMatch,
    error,
    statusFilter,
    workCategoryFilter,
    regionFilter,
    setStatusFilter,
    setWorkCategoryFilter,
    setRegionFilter,
    fetchTenders,
    runMatch,
    fetchMatches,
  } = useFeedStore();

  const navigate = useNavigate();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders, statusFilter, workCategoryFilter, regionFilter]);

  useEffect(() => {
    if (profile) fetchMatches(profile.id);
  }, [profile, fetchMatches]);

  const activeFiltersCount =
    (statusFilter ? 1 : 0) + (workCategoryFilter ? 1 : 0) + (regionFilter ? 1 : 0);

  async function handleRetry() {
    setRetrying(true);
    await fetchTenders();
    if (profile) await fetchMatches(profile.id);
    setRetrying(false);
  }

  function handleResetFilters() {
    setStatusFilter("");
    setWorkCategoryFilter("");
    setRegionFilter("");
  }

  return (
    <div className="flex h-full flex-col md:flex-row gap-0 min-w-0 overflow-x-hidden">
      {/* Mobile Top Controls Bar (< md) */}
      <div className="flex md:hidden items-center justify-between border-b border-[#1e2530] bg-[#161a22] px-3 py-2.5 shrink-0 z-10">
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[#1e2530] bg-[#0f1117] px-2.5 py-1.5 text-xs font-medium text-[#e8eaed] hover:border-[#c9a84c]/50"
        >
          <SlidersHorizontal size={13} className="text-[#c9a84c]" />
          <span>{locale === "ar" ? "الفلاتر وملف المقاول" : "Filters & Profile"}</span>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-[#c9a84c] px-1.5 py-0.2 text-[10px] font-bold text-[#0f1117]">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown size={12} className="text-[#8b93a0]" />
        </button>

        {profile && (
          <button
            onClick={() => runMatch(profile.id)}
            disabled={isRunningMatch}
            className="flex items-center gap-1.5 rounded-md bg-[#c9a84c] px-3 py-1.5 text-xs font-bold text-[#0f1117] hover:bg-[#a07c34] disabled:opacity-50"
          >
            {isRunningMatch ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            <span>{t("runMatch")}</span>
          </button>
        )}
      </div>

      {/* Desktop Sidebar (md:flex) */}
      <aside className="hidden md:flex w-80 lg:w-88 shrink-0 flex-col gap-4 border-inline-end border-[#1e2530] bg-[#0f1117] p-4 overflow-y-auto">
        <CompanyPanel />

        {/* Filters Box */}
        <div className="space-y-3 rounded-lg border border-[#1e2530] bg-[#161a22] p-3.5 text-start">
          <div className="flex items-center justify-between pb-1 border-b border-[#1e2530]">
            <span className="text-xs font-semibold text-[#e8eaed]">
              {locale === "ar" ? "تصفية المنافسات" : "Opportunity Filters"}
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#8b93a0] hover:text-[#c9a84c]"
              >
                {locale === "ar" ? "إعادة تعيين" : "Reset"}
              </button>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-[11px] text-[#8b93a0]">{t("statusFilter")}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-2.5 py-1.5 text-xs text-[#e8eaed]"
            >
              <option value="">{t("allStatuses")}</option>
              <option value="open">{t("statusOpen")}</option>
              <option value="closed">{t("statusClosed")}</option>
              <option value="awarded">{t("statusAwarded")}</option>
            </select>
          </div>

          {/* Saudi Work Category */}
          <div>
            <label className="mb-1 block text-[11px] text-[#8b93a0]">{t("categoryFilter")}</label>
            <select
              value={workCategoryFilter}
              onChange={(e) => setWorkCategoryFilter(e.target.value)}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-2.5 py-1.5 text-xs text-[#e8eaed]"
            >
              <option value="">{t("allCategories")}</option>
              {SAUDI_WORK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.nameEn}>
                  {locale === "ar" ? cat.nameAr : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Saudi Region */}
          <div>
            <label className="mb-1 block text-[11px] text-[#8b93a0]">{t("regionFilter")}</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-2.5 py-1.5 text-xs text-[#e8eaed]"
            >
              <option value="">{t("allRegions")}</option>
              {SAUDI_REGIONS.map((reg) => (
                <option key={reg.id} value={reg.nameEn}>
                  {locale === "ar" ? reg.nameAr : reg.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Run Match Button */}
        {profile && (
          <button
            onClick={() => runMatch(profile.id)}
            disabled={isRunningMatch}
            className="flex items-center justify-center gap-2 rounded-md bg-[#c9a84c] px-4 py-2.5 text-sm font-bold text-[#0f1117] hover:bg-[#a07c34] disabled:opacity-50 transition-colors shadow-sm"
          >
            {isRunningMatch ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>{t("runningMatch")}</span>
              </>
            ) : (
              <>
                <Play size={15} />
                <span>{t("runMatch")}</span>
              </>
            )}
          </button>
        )}

        <p className="text-center text-xs text-[#8b93a0]">
          {tenders.length} {t("tendersCount")} · {matches.length} {t("matchesCount")}
        </p>
      </aside>

      {/* Mobile Slide-Up Modal / Drawer for Filters & Profile */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs md:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl border-t border-[#1e2530] bg-[#161a22] p-4 text-start shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#1e2530] pb-2">
              <span className="text-sm font-bold text-[#e8eaed]">
                {locale === "ar" ? "إعدادات الفلاتر وملف المقاول" : "Contractor Profile & Filters"}
              </span>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1e2530] text-[#8b93a0]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <CompanyPanel />

              {/* Mobile Filter Controls */}
              <div className="space-y-2 rounded-lg border border-[#1e2530] bg-[#0f1117] p-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#1e2530]">
                  <span className="text-xs font-semibold text-[#e8eaed]">
                    {locale === "ar" ? "تصفية المنافسات" : "Filters"}
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] text-[#8b93a0] hover:text-[#c9a84c]"
                    >
                      {locale === "ar" ? "إعادة تعيين" : "Reset"}
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("statusFilter")}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-md border border-[#1e2530] bg-[#161a22] px-2.5 py-1.5 text-xs text-[#e8eaed]"
                  >
                    <option value="">{t("allStatuses")}</option>
                    <option value="open">{t("statusOpen")}</option>
                    <option value="closed">{t("statusClosed")}</option>
                    <option value="awarded">{t("statusAwarded")}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("categoryFilter")}</label>
                  <select
                    value={workCategoryFilter}
                    onChange={(e) => setWorkCategoryFilter(e.target.value)}
                    className="w-full rounded-md border border-[#1e2530] bg-[#161a22] px-2.5 py-1.5 text-xs text-[#e8eaed]"
                  >
                    <option value="">{t("allCategories")}</option>
                    {SAUDI_WORK_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.nameEn}>
                        {locale === "ar" ? cat.nameAr : cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("regionFilter")}</label>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full rounded-md border border-[#1e2530] bg-[#161a22] px-2.5 py-1.5 text-xs text-[#e8eaed]"
                  >
                    <option value="">{t("allRegions")}</option>
                    {SAUDI_REGIONS.map((reg) => (
                      <option key={reg.id} value={reg.nameEn}>
                        {locale === "ar" ? reg.nameAr : reg.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileSheetOpen(false);
                  if (profile) runMatch(profile.id);
                }}
                className="w-full rounded-md bg-[#c9a84c] py-2 text-xs font-bold text-[#0f1117]"
              >
                {locale === "ar" ? "تطبيق وعرض الفرص" : "Apply & Show Opportunities"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Opportunity Feed */}
      <main className="flex-1 w-full min-w-0 overflow-y-auto p-3 sm:p-4 md:p-6 text-start">
        {/* Marketplace Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#e8eaed]">
              {locale === "ar" ? "فرص ومنافسات السوق السعودي" : "Saudi Opportunity Marketplace"}
            </h1>
            <p className="text-xs text-[#8b93a0]">
              {locale === "ar"
                ? "تحليل ومطابقة فورية مع اشتراطات منصة اعتماد وبوابة فرص والمشاريع الكبرى"
                : "Real-time matching against Etimad, Furas, and Giga-Project specifications"}
            </p>
          </div>
          {profile && (
            <span className="rounded bg-[#161a22] border border-[#1e2530] px-2.5 py-1 text-xs text-[#c9a84c] font-medium">
              {profile.company_size || "Medium"} · {locale === "ar" ? "تأهيل نشط" : "Active Profile"}
            </span>
          )}
        </div>

        {/* 1. API / BACKEND ERROR STATE (Clearly separated) */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-800/80 bg-red-950/20 p-4 text-start">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-300">
                  {locale === "ar" ? "تعذر الاتصال بخادم المناقصات" : "Procurement API Connection Error"}
                </h3>
                <p className="mt-1 text-xs text-red-200/80">
                  {error}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="flex items-center gap-1.5 rounded-md bg-red-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw size={12} className={retrying ? "animate-spin" : ""} />
                    <span>{locale === "ar" ? "إعادة المحاولة" : "Retry Connection"}</span>
                  </button>
                  <span className="text-[11px] text-red-300/70">
                    {locale === "ar" ? "الحالة: غير متصل" : "Status: Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoadingTenders && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* 2. NO OPPORTUNITIES FOUND (Empty State, clearly separated from Error) */}
        {!isLoadingTenders && !error && matches.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#1e2530] p-6 text-center text-sm text-[#8b93a0]">
            <Inbox size={32} className="text-[#8b93a0] mb-2 opacity-60" />
            <h3 className="font-medium text-[#e8eaed] mb-1">
              {activeFiltersCount > 0
                ? (locale === "ar" ? "لا توجد منافسات تطابق الفلاتر المحددة" : "No opportunities match the current filters")
                : (locale === "ar" ? "لم يتم تشغيل المطابقة بعد" : "No matches computed yet")}
            </h3>
            <p className="text-xs text-[#8b93a0] max-w-sm mb-3">
              {activeFiltersCount > 0
                ? (locale === "ar" ? "جرب توسيع مجال العمل أو مسح تصفية المناطق لعرض فرص أكثر" : "Try broadening the work category or clearing region filters to discover more tenders")
                : (locale === "ar" ? "اضغط على زر 'تشغيل المطابقة' لتحليل ومطابقة كراسات الشروط" : "Click 'Run Match' to evaluate tender requirements against your contractor profile")}
            </p>
            {activeFiltersCount > 0 ? (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 rounded-md border border-[#1e2530] bg-[#161a22] px-3 py-1.5 text-xs font-medium text-[#c9a84c] hover:bg-[#1e2530]"
              >
                <Filter size={12} />
                <span>{locale === "ar" ? "مسح كافة الفلاتر" : "Clear All Filters"}</span>
              </button>
            ) : profile ? (
              <button
                onClick={() => runMatch(profile.id)}
                className="rounded-md bg-[#c9a84c] px-4 py-1.5 text-xs font-bold text-[#0f1117] hover:bg-[#a07c34]"
              >
                {t("runMatch")}
              </button>
            ) : null}
          </div>
        )}

        {/* Opportunity Match Cards List */}
        {!error && matches.length > 0 && (
          <div className="space-y-3.5">
            {matches.map((m, i) => (
              <MatchCard
                key={`${m.tender_id}-${i}`}
                match={m}
                onOpen={() => navigate("/workspace")}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
