import type { WinRates } from "../../api/types";
import { useLocaleStore } from "../../store/localeStore";

interface WinRatesChartProps {
  data?: WinRates | null;
  rates?: WinRates | null;
}

export function WinRatesChart({ data, rates }: WinRatesChartProps) {
  const { locale } = useLocaleStore();
  const effectiveData = data || rates;

  const suppliers = effectiveData?.suppliers || (Array.isArray(effectiveData) ? (effectiveData as unknown as SupplierWinRate[]) : []);

  if (!effectiveData || suppliers.length === 0 || effectiveData.status === "INSUFFICIENT_VERIFIED_DATA") {
    return (
      <div className="flex flex-col h-56 items-center justify-center rounded-lg border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0] p-4 text-center">
        <span className="px-2.5 py-1 mb-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold">
          INSUFFICIENT_VERIFIED_DATA
        </span>
        <span>
          {locale === "ar"
            ? "لا تتوفر بيانات ترسيات كافية لحساب نسب الفوز"
            : "No verified award data available for win rate calculations"}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4 text-start">
      <h3 className="text-xs font-semibold text-[#e8eaed] mb-3">
        {locale === "ar"
          ? "أبرز المقاولين الفائزين وحصص الترسية"
          : "Top Winning Contractors & Market Share"}
      </h3>
      <div className="space-y-2.5">
        {suppliers.slice(0, 5).map((sup, idx) => {
          const rateVal = sup.win_rate ?? sup.win_share ?? 0;
          const countVal = sup.win_count ?? sup.awards_won ?? 0;
          const pct = Math.round(rateVal * 100);
          return (
            <div key={`${sup.supplier_name}-${idx}`} className="text-xs">
              <div className="flex items-center justify-between text-[#e8eaed] mb-1">
                <span className="font-medium truncate max-w-[200px]">
                  {sup.supplier_name}
                </span>
                <span className="text-[#c9a84c] font-semibold">
                  {pct}% ({countVal} {locale === "ar" ? "ترسية" : "awards"})
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#0f1117] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c9a84c]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
