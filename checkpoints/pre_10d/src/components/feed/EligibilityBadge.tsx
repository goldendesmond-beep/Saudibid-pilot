import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useLocaleStore } from "../../store/localeStore";

interface EligibilityBadgeProps {
  passed: boolean;
  failedCriteria: string[];
  warnings: string[];
}

export function EligibilityBadge({ passed, failedCriteria, warnings }: EligibilityBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { locale } = useLocaleStore();

  if (passed && warnings.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-800/40">
        <CheckCircle size={13} />
        <span>{locale === "ar" ? "مؤهل" : "Passed"}</span>
      </span>
    );
  }

  if (!passed) {
    return (
      <div className="relative inline-block">
        <button
          className="inline-flex items-center gap-1 rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-800/40 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={`Eligibility failed: ${failedCriteria.join(", ")}`}
        >
          <XCircle size={13} />
          <span>{locale === "ar" ? "غير مؤهل" : "Failed"}</span>
        </button>
        {showTooltip && failedCriteria.length > 0 && (
          <div className="absolute bottom-full start-0 mb-1.5 w-64 rounded-md border border-[#1e2530] bg-[#161a22] p-2.5 text-xs text-[#8b93a0] shadow-2xl z-20">
            <span className="block font-semibold text-rose-400 mb-1">
              {locale === "ar" ? "معايير عدم التأهيل:" : "Disqualification Reasons:"}
            </span>
            {failedCriteria.map((c) => (
              <div key={c} className="py-0.5 text-rose-200/90 text-start">
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1 rounded-full bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-800/40 cursor-help"
      >
        <AlertTriangle size={13} />
        <span>{locale === "ar" ? "تنبيهات" : "Warnings"}</span>
      </span>
      {showTooltip && warnings.length > 0 && (
        <div className="absolute bottom-full start-0 mb-1.5 w-64 rounded-md border border-[#1e2530] bg-[#161a22] p-2.5 text-xs text-[#8b93a0] shadow-2xl z-20">
          <span className="block font-semibold text-amber-400 mb-1">
            {locale === "ar" ? "التنبيهات والملاحظات:" : "Eligibility Warnings:"}
          </span>
          {warnings.map((w) => (
            <div key={w} className="py-0.5 text-amber-200/90 text-start">
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
