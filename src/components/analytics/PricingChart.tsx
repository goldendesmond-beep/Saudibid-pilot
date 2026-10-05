import type { PricingStats } from "../../api/types";
import { useLocaleStore } from "../../store/localeStore";

interface PricingChartProps {
  data: PricingStats | null;
}

export function PricingChart({ data }: PricingChartProps) {
  const { locale } = useLocaleStore();

  if (!data || data.count === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0]">
        {locale === "ar"
          ? "لا تتوفر إحصاءات أسعار كافية للفلاتر المحددة"
          : "No pricing statistics available for selected filters"}
      </div>
    );
  }

  const items = [
    { label: locale === "ar" ? "الحد الأدنى" : "Min", val: data.min },
    { label: locale === "ar" ? "الربيع الأدنى (P25)" : "25th %ile", val: data.p25 },
    { label: locale === "ar" ? "الوسيط (P50)" : "Median", val: data.median },
    { label: locale === "ar" ? "المتوسط" : "Mean", val: data.mean },
    { label: locale === "ar" ? "الربيع الأعلى (P75)" : "75th %ile", val: data.p75 },
    { label: locale === "ar" ? "الحد الأقصى" : "Max", val: data.max },
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
