import type { PricingStats } from "../../api/types";
import { useLocaleStore } from "../../store/localeStore";

interface PricingChartProps {
  data?: PricingStats | null;
  stats?: PricingStats | null;
}

export function PricingChart({ data, stats }: PricingChartProps) {
  const { locale } = useLocaleStore();
  const effectiveData = data || stats;

  if (!effectiveData || effectiveData.count === 0 || effectiveData.status === "INSUFFICIENT_VERIFIED_DATA" || effectiveData.min === null) {
    return (
      <div className="flex flex-col h-56 items-center justify-center rounded-lg border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0] p-4 text-center">
        <span className="px-2.5 py-1 mb-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold">
          INSUFFICIENT_VERIFIED_DATA
        </span>
        <span>
          {locale === "ar"
            ? "لا تتوفر إحصاءات أسعار كافية للفلاتر المحددة من الترسيات المؤكدة"
            : "No verified pricing statistics available for the selected filters"}
        </span>
      </div>
    );
  }

  const items = [
    { label: locale === "ar" ? "الحد الأدنى" : "Min", val: effectiveData.min },
    { label: locale === "ar" ? "الربيع الأدنى (P25)" : "25th %ile", val: effectiveData.p25 },
    { label: locale === "ar" ? "الوسيط (P50)" : "Median", val: effectiveData.median },
    { label: locale === "ar" ? "المتوسط" : "Mean", val: effectiveData.mean },
    { label: locale === "ar" ? "الربيع الأعلى (P75)" : "75th %ile", val: effectiveData.p75 },
    { label: locale === "ar" ? "الحد الأقصى" : "Max", val: effectiveData.max },
  ];

  return (
    <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4 text-start">
      <h3 className="text-xs font-semibold text-[#e8eaed] mb-3">
        {locale === "ar"
          ? "توزيع أسعار العقود والترسيات (بالريال السعودي)"
          : "Contract Award Value Distribution (SAR)"}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((it) => (
          <div key={it.label} className="rounded bg-[#0f1117] p-2.5 border border-[#1e2530]">
            <span className="block text-[10px] text-[#8b93a0]">{it.label}</span>
            <span className="font-semibold text-xs text-[#c9a84c]">
              {(it.val / 1000000).toFixed(1)}M ر.س
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
