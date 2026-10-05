import type { TrendPoint } from "../../api/types";
import { useLocaleStore } from "../../store/localeStore";

interface TrendsChartProps {
  data: TrendPoint[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const { locale } = useLocaleStore();

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0]">
        {locale === "ar"
          ? "لا تتوفر بيانات اتجاهات زمنية كافية"
          : "No trend data available"}
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.total_amount), 1);

  return (
    <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4 text-start">
      <h3 className="text-xs font-semibold text-[#e8eaed] mb-3">
        {locale === "ar"
          ? "اتجاه حجم الترسيات والمنافسات عبر الفترات"
          : "Procurement Volume Trends by Period"}
      </h3>
      <div className="flex items-end gap-3 h-40 pt-4 px-2">
        {data.slice(-8).map((point, idx) => {
          const heightPct = Math.max(10, Math.round((point.total_amount / maxVal) * 100));
          return (
            <div
              key={`${point.period}-${idx}`}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
            >
              <div
                className="w-full rounded-t bg-[#c9a84c]/80 hover:bg-[#c9a84c] transition-all"
                style={{ height: `${heightPct}%` }}
                title={`${point.period}: ${(point.total_amount / 1000000).toFixed(1)}M (${point.award_count} awards)`}
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
