import type { WinRates } from "../../api/types";
import { useLocaleStore } from "../../store/localeStore";

interface WinRatesChartProps {
  data: WinRates | null;
}

export function WinRatesChart({ data }: WinRatesChartProps) {
  const { locale } = useLocaleStore();

  if (!data || data.suppliers.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0]">
        {locale === "ar"
          ? "لا تتوفر بيانات ترسيات كافية لحساب نسب الفوز"
          : "No award data available for win rate calculations"}
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
        {data.suppliers.slice(0, 5).map((sup, idx) => {
          const pct = Math.round(sup.win_rate * 100);
          return (
            <div key={`${sup.supplier_name}-${idx}`} className="text-xs">
              <div className="flex items-center justify-between text-[#e8eaed] mb-1">
                <span className="font-medium truncate max-w-[200px]">
                  {sup.supplier_name}
                </span>
                <span className="text-[#c9a84c] font-semibold">
                  {pct}% ({sup.win_count} {locale === "ar" ? "ترسية" : "awards"})
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
