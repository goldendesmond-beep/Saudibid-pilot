import { useCompanyStore } from "../store/companyStore";
import { useDraftStore } from "../store/draftStore";
import { useLocaleStore } from "../store/localeStore";
import { AgentWorking } from "../components/workspace/AgentWorking";
import { BidDraftView } from "../components/workspace/BidDraftView";
import { IngestDocButton } from "../components/workspace/IngestDocButton";

export function WorkspacePage() {
  const profile = useCompanyStore((s) => s.profile);
  const { selectedTender, isDrafting, draft, draftError, runDraft } = useDraftStore();
  const { t, locale } = useLocaleStore();

  if (!selectedTender) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-[#8b93a0]">
          {locale === "ar"
            ? "اختر منافسة من موجز الفرص لفتحها والبدء في إعداد العرض الفني"
            : "Select an opportunity from the Feed to open it in the Workspace"}
        </p>
      </div>
    );
  }

  const hasDoc = Boolean(selectedTender.raw_doc_uri);
  const title = locale === "ar" && selectedTender.title_ar ? selectedTender.title_ar : selectedTender.title;
  const budget = selectedTender.budget_sar ?? selectedTender.budget;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 text-start">
      {/* Tender header */}
      <div className="mb-6 rounded-lg border border-[#1e2530] bg-[#161a22] p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-[#c9a84c]/20 px-2 py-0.5 text-xs font-semibold text-[#c9a84c]">
            {selectedTender.source}
          </span>
          {selectedTender.work_category && (
            <span className="rounded bg-[#0f1117] px-2 py-0.5 text-xs text-[#8b93a0] border border-[#1e2530]">
              {selectedTender.work_category}
            </span>
          )}
          {selectedTender.city && (
            <span className="text-xs text-[#8b93a0]">
              📍 {selectedTender.city}
            </span>
          )}
        </div>
        <h1 className="text-lg font-bold text-[#e8eaed]">{title}</h1>
        <p className="mt-2 text-xs text-[#8b93a0]">
          {selectedTender.entity && <span>{selectedTender.entity} · </span>}
          {budget && (
            <span className="font-semibold text-[#e8eaed]">
              {t("budget")}: {(budget / 1000000).toFixed(1)}M {t("currency")}
            </span>
          )}
        </p>
      </div>

      {/* Ingest or draft */}
      {!hasDoc ? (
        <IngestDocButton tenderId={selectedTender.id} />
      ) : isDrafting ? (
        <AgentWorking />
      ) : draft ? (
        <BidDraftView draft={draft} />
      ) : (
        <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-8 text-center">
          {draftError && (
            <p className="mb-4 text-sm text-red-400">{draftError}</p>
          )}
          <h3 className="mb-2 text-base font-semibold text-[#e8eaed]">
            {locale === "ar" ? "جاهز لتوليد مسودة العرض الفني" : "Ready to Draft Proposal"}
          </h3>
          <p className="mb-5 text-xs text-[#8b93a0] max-w-md mx-auto">
            {locale === "ar"
              ? "سيقوم وكيل الذكاء الاصطناعي باستخراج كراسة الشروط وتحليل فجوات الامتثال وتوليد فصول العرض مع توثيق أرقام المواد والفقرات"
              : "The AI agent will extract tender requirements, perform gap analysis against your contractor profile, and synthesize compliant bid sections with citations."}
          </p>
          <button
            onClick={() => profile && runDraft(profile.id, selectedTender.id)}
            disabled={!profile}
            className="rounded-md bg-[#c9a84c] px-6 py-2.5 text-sm font-semibold text-[#0f1117] hover:bg-[#a07c34] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            {t("generateDraft")}
          </button>
          {!profile && (
            <p className="mt-2 text-xs text-[#8b93a0]">
              {locale === "ar" ? "يرجى تعيين ملف المقاول أولاً" : "Set a company profile first"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
