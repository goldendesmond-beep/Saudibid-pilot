import type { TrendPoint } from "../../api/types";
import { useLocaleStore } from "../../store/localeStore";

interface TrendsChartProps {
  data?: TrendPoint[] | { points?: TrendPoint[] } | null;
  series?: TrendPoint[] | { points?: TrendPoint[] } | null;
}

export function TrendsChart({ data, series }: TrendsChartProps) {
  const { locale } = useLocaleStore();
  const effectiveData = data || series;

  const points = Array.isArray(effectiveData)
    ? effectiveData
    : (effectiveData?.points || []);

  if (!points || points.length === 0 || (effectiveData as { status?: string })?.status === "INSUFFICIENT_VERIFIED_DATA") {
    return (
      <div className="flex flex-col h-56 items-center justify-center rounded-lg border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0] p-4 text-center">
        <span className="px-2.5 py-1 mb-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold">
          INSUFFICIENT_VERIFIED_DATA
        </span>
        <span>
          {locale === "ar"
            ? "لا تتوفر بيانات اتجاهات زمنية كافية للفلاتر المحددة من الترسيات المؤكدة"
            : "No verified trend data available for selected filters"}
        </span>
      </div>
    );
  }

  const maxVal = Math.max(...points.map((d: TrendPoint) => d.total_amount ?? d.total_value ?? 0), 1);

  return (
    <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4 text-start">
      <h3 className="text-xs font-semibold text-[#e8eaed] mb-3">
        {locale === "ar"
          ? "اتجاه حجم الترسيات والمنافسات عبر الفترات"
          : "Procurement Volume Trends by Period"}
      </h3>
      <div className="flex items-end gap-3 h-40 pt-4 px-2">
        {points.slice(-8).map((point: TrendPoint, idx: number) => {
          const val = point.total_amount ?? point.total_value ?? 0;
          const count = point.award_count ?? point.count ?? 0;
          const heightPct = Math.max(10, Math.round((val / maxVal) * 100));
          return (
            <div
              key={`${point.period}-${idx}`}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
            >
              <div
                className="w-full rounded-t bg-[#c9a84c]/80 hover:bg-[#c9a84c] transition-all"
                style={{ height: `${heightPct}%` }}
                title={`${point.period}: ${(val / 1000000).toFixed(1)}M (${count} awards)`}
              />
              <span className="text-[10px] text-[#8b93a0] truncate w-full text-center">
                {point.period}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
