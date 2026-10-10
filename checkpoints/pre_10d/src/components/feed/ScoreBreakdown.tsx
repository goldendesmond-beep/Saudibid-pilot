import { Sparkles, Gauge } from "lucide-react";
import { useLocaleStore } from "../../store/localeStore";

interface ScoreBreakdownProps {
  semanticScore: number;
  ruleScore: number;
  finalScore: number;
}

export function ScoreBreakdown({ semanticScore, ruleScore, finalScore }: ScoreBreakdownProps) {
  const { locale } = useLocaleStore();

  const finalPct = Math.round(finalScore * 100);
  const rulePct = Math.round(ruleScore * 100);
  const semanticPct = Math.round(semanticScore * 100);

  return (
    <div className="rounded-md border border-[#1e2530] bg-[#0f1117] p-2.5 text-xs text-start">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-[#e8eaed] flex items-center gap-1.5">
          <Gauge size={13} className="text-[#c9a84c]" />
          <span>{locale === "ar" ? "درجة المطابقة الإجمالية:" : "Overall Match Score:"}</span>
        </span>
        <span className="font-bold text-sm text-[#c9a84c]">{finalPct}%</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Rule Score */}
        <div className="rounded bg-[#161a22] p-1.5 border border-[#1e2530]">
          <div className="flex items-center justify-between text-[#8b93a0] mb-1">
            <span>{locale === "ar" ? "مطابقة المعايير (60%)" : "Rule Score (60%)"}</span>
            <span className="font-medium text-[#e8eaed]">{rulePct}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-[#0f1117] overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${rulePct}%` }}
            />
          </div>
        </div>

        {/* Semantic Score */}
        <div className="rounded bg-[#161a22] p-1.5 border border-[#1e2530]">
          <div className="flex items-center justify-between text-[#8b93a0] mb-1">
            <span className="flex items-center gap-1">
              <Sparkles size={10} className="text-cyan-400" />
              <span>{locale === "ar" ? "مطابقة النطاق (40%)" : "Semantic (40%)"}</span>
            </span>
            <span className="font-medium text-[#e8eaed]">{semanticPct}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-[#0f1117] overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${semanticPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
