import { FileText, MapPin, Building, Coins, Calendar } from "lucide-react";
import { useDraftStore } from "../../store/draftStore";
import { useFeedStore } from "../../store/feedStore";
import { useLocaleStore } from "../../store/localeStore";
import type { MatchResult } from "../../api/types";
import { EligibilityBadge } from "./EligibilityBadge";
import { ScoreBreakdown } from "./ScoreBreakdown";

interface MatchCardProps {
  match: MatchResult;
  onOpen: () => void;
}

export function MatchCard({ match, onOpen }: MatchCardProps) {
  const tender = useFeedStore((s) => s.getTender(match.tender_id));
  const selectTender = useDraftStore((s) => s.selectTender);
  const { t, locale } = useLocaleStore();
  const dimmed = !match.eligibility.passed;

  function handleOpen() {
    if (tender) selectTender(tender);
    onOpen();
  }

  const title = locale === "ar" && tender?.title_ar ? tender.title_ar : (tender?.title ?? match.tender_id);
  const entity = locale === "ar" && tender?.entity_ar ? tender.entity_ar : tender?.entity;
  const budget = tender?.budget_sar ?? tender?.budget;

  // Source badge colors
  const getSourceBadgeColor = (source?: string) => {
    switch (source) {
      case "Etimad":
        return "bg-emerald-950 text-emerald-400 border-emerald-800/50";
      case "NEOM":
        return "bg-purple-950 text-purple-300 border-purple-800/50";
      case "Aramco":
        return "bg-blue-950 text-blue-400 border-blue-800/50";
      case "Furas":
        return "bg-amber-950 text-amber-300 border-amber-800/50";
      default:
        return "bg-[#1e2530] text-[#c9a84c] border-[#1e2530]";
    }
  };

  return (
    <div
      className={`rounded-lg border bg-[#161a22] p-4 text-start transition-all hover:border-[#c9a84c]/40 ${
        dimmed ? "border-[#1e2530] opacity-75" : "border-[#1e2530] shadow-sm"
      }`}
    >
      {/* Top Header: Title, Source, Entity & Eligibility Badge */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${getSourceBadgeColor(
                tender?.source,
              )}`}
            >
              {tender?.source ?? "Etimad"}
            </span>
            {tender?.opportunity_type && (
              <span className="rounded bg-[#1e2530] px-2 py-0.5 text-[10px] text-[#8b93a0]">
                {tender.opportunity_type}
              </span>
            )}
            {tender?.reference_number && (
              <span className="font-mono text-[10px] text-[#8b93a0]">
                {tender.reference_number}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-[#e8eaed] leading-snug">
            {title}
          </h3>

          {entity && (
            <div className="flex items-center gap-1.5 text-xs text-[#8b93a0]">
              <Building size={13} className="text-[#c9a84c]" />
              <span>{entity}</span>
            </div>
          )}
        </div>

        <EligibilityBadge
          passed={match.eligibility.passed}
          failedCriteria={match.eligibility.failed_criteria}
          warnings={match.eligibility.warnings}
        />
      </div>

      {/* Meta tags: Category, Location, Value */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#8b93a0]">
        {(tender?.city || tender?.region) && (
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-[#c9a84c]" />
            <span>
              {tender.city ? `${tender.city}, ` : ""}
              {tender.region || ""}
            </span>
          </div>
        )}

        {tender?.work_category && (
          <span className="rounded bg-[#0f1117] px-2 py-0.5 text-[11px] border border-[#1e2530] text-[#e8eaed]">
            {tender.work_category}
          </span>
        )}

        {budget && (
          <div className="flex items-center gap-1 text-[#e8eaed] font-medium">
            <Coins size={12} className="text-[#c9a84c]" />
            <span>
              {(budget / 1000000).toFixed(1)}M {t("currency")}
            </span>
          </div>
        )}

        {tender?.deadline && (
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar size={12} className="text-[#8b93a0]" />
            <span>
              {t("deadline")}: {new Date(tender.deadline).toISOString().split("T")[0]}
            </span>
          </div>
        )}
      </div>

      {/* Transparent Match Score vs Eligibility Breakdown */}
      <ScoreBreakdown
        semanticScore={match.semantic_score}
        ruleScore={match.rule_score}
        finalScore={match.score}
      />

      {/* Reasons for match */}
      {match.reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {match.reasons.map((r, i) => (
            <span
              key={i}
              className="rounded bg-[#0f1117] border border-[#1e2530] px-2 py-0.5 text-[11px] text-[#8b93a0]"
            >
              ✓ {r}
            </span>
          ))}
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-3 flex items-center justify-between border-t border-[#1e2530] pt-2.5">
        <span className="text-[11px] text-[#8b93a0]">
          {match.eligibility.passed
            ? (locale === "ar" ? "مطابق لمعايير التأهيل المبدئي" : "Meets baseline qualification criteria")
            : (locale === "ar" ? "يتطلب استيفاء متطلبات إضافية" : "Requirements gap identified")}
        </span>
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 rounded bg-[#c9a84c]/10 px-3 py-1 text-xs font-semibold text-[#c9a84c] hover:bg-[#c9a84c]/20 hover:text-white transition-colors cursor-pointer"
        >
          <FileText size={13} />
          <span>{t("viewInWorkspace")}</span>
        </button>
      </div>
    </div>
  );
}
