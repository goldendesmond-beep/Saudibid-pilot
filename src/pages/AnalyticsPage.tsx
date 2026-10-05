import { useEffect } from "react";
import { PricingChart } from "../components/analytics/PricingChart";
import { TrendsChart } from "../components/analytics/TrendsChart";
import { WinRatesChart } from "../components/analytics/WinRatesChart";
import { Skeleton } from "../components/ui/Skeleton";
import { useAnalyticsStore } from "../store/analyticsStore";
import { useLocaleStore } from "../store/localeStore";
import { SAUDI_WORK_CATEGORIES } from "../constants/saudiTaxonomy";

const INTERVALS = ["month", "quarter", "year"] as const;

export function AnalyticsPage() {
  const { cpv, authority, from, to, interval, pricing, winRates, trends, isLoading, error, setFilter, fetchAll } =
    useAnalyticsStore();
  const { locale } = useLocaleStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    fetchAll();
  }

  return (
    <div className="p-4 md:p-6 text-start">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2530] pb-4">
        <div>
          <h1 className="text-lg font-bold text-[#e8eaed]">
            {locale === "ar" ? "تحليلات عقود وترسيات السوق السعودي" : "Saudi Procurement & Award Analytics"}
          </h1>
          <p className="text-xs text-[#8b93a0]">
            {locale === "ar"
              ? "تحليل نطاقات الأسعار، نسب فوز المقاولين، واتجاهات الإنفاق الحكومي بالريال السعودي (SAR)"
              : "Historical award pricing quartiles, contractor win shares, and procurement expenditure in SAR"}
          </p>
        </div>
        <span className="rounded bg-[#c9a84c]/20 px-2.5 py-1 text-xs font-semibold text-[#c9a84c]">
          {locale === "ar" ? "العملة: ر.س (SAR)" : "Currency: SAR (ر.س)"}
        </span>
      </div>

      {/* Filters */}
      <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-[#1e2530] bg-[#161a22] p-4">
        {/* Work Category / CPV */}
        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs text-[#8b93a0]">
            {locale === "ar" ? "مجال العمل" : "Work Category"}
          </label>
          <select
            value={cpv}
            onChange={(e) => setFilter("cpv", e.target.value)}
            className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-xs text-[#e8eaed]"
          >
            <option value="">{locale === "ar" ? "جميع مجالات العمل" : "All Work Categories"}</option>
            {SAUDI_WORK_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.cpvFallback}>
                {locale === "ar" ? cat.nameAr : cat.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Contracting Authority */}
        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs text-[#8b93a0]">
            {locale === "ar" ? "الجهة الحكومية / المالك" : "Contracting Authority"}
          </label>
          <input
            type="text"
            value={authority}
            placeholder={locale === "ar" ? "مثال: أمانة الرياض، أرامكو" : "e.g. Riyadh Municipality, Aramco"}
            onChange={(e) => setFilter("authority", e.target.value)}
            className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-xs text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
          />
        </div>

        {/* From Date */}
        <div>
          <label className="mb-1 block text-xs text-[#8b93a0]">
            {locale === "ar" ? "من تاريخ" : "From Date"}
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFilter("from", e.target.value)}
            className="rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-xs text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="mb-1 block text-xs text-[#8b93a0]">
            {locale === "ar" ? "إلى تاريخ" : "To Date"}
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setFilter("to", e.target.value)}
            className="rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-xs text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
          />
        </div>

        {/* Interval */}
        <div>
          <label className="mb-1 block text-xs text-[#8b93a0]">
            {locale === "ar" ? "التكرار الزمني" : "Interval"}
          </label>
          <select
            value={interval}
            onChange={(e) => setFilter("interval", e.target.value as typeof interval)}
            className="rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-xs text-[#e8eaed]"
          >
            {INTERVALS.map((i) => (
              <option key={i} value={i}>
                {i === "month" ? (locale === "ar" ? "شهري" : "Monthly") : i === "quarter" ? (locale === "ar" ? "ربعي" : "Quarterly") : (locale === "ar" ? "سنوي" : "Yearly")}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-[#c9a84c] px-5 py-2 text-xs font-bold text-[#0f1117] hover:bg-[#a07c34] transition-colors cursor-pointer"
        >
          {locale === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-900/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing */}
        <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4">
          <h2 className="mb-4 text-sm font-bold text-[#e8eaed]">
            {locale === "ar" ? "توزيع أسعار العقود (بالريال السعودي)" : "Contract Value Distribution (SAR)"}
          </h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : pricing ? <PricingChart stats={pricing} /> : null}
        </div>

        {/* Win rates */}
        <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4">
          <h2 className="mb-4 text-sm font-bold text-[#e8eaed]">
            {locale === "ar" ? "المقاولون الأكثر فوزاً بالعقود" : "Top Winning Contractors (Win Share)"}
          </h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <WinRatesChart rates={winRates} />}
        </div>

        {/* Trends — full width */}
        <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-[#e8eaed]">
            {locale === "ar" ? `حجم الإنفاق والترسيات الزمني (${interval})` : `Procurement Volume Timeline (${interval})`}
          </h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <TrendsChart series={trends} />}
        </div>
      </div>
    </div>
  );
}
