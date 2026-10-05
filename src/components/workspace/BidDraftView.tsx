import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";
import type { BidDraft } from "../../api/types";
import { useLocaleStore } from "../../store/localeStore";

interface BidDraftViewProps {
  draft: BidDraft;
}

export function BidDraftView({ draft }: BidDraftViewProps) {
  const { locale } = useLocaleStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    executive_summary: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {/* Decision-Support Human Review Banner */}
      <div className="rounded-lg border border-amber-800/60 bg-amber-950/20 p-3.5 text-start">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90">
            <span className="font-semibold block text-amber-300 mb-0.5">
              {locale === "ar"
                ? "تنبيه نظام دعم القرار (مراجعة بشرية إلزامية):"
                : "Decision-Support Notice (Mandatory Human Review):"}
            </span>
            {draft.review_notice ||
              (locale === "ar"
                ? "مخرجات هذا النظام مخصصة لدعم القرار الفني والتأهيلي. تتطلب كراسات الشروط مراجعة بشرية متخصصة ومصادقة نهائية قبل تقديم العطاء رسميًا."
                : "This output is generated for technical decision-support. All tender dossiers require mandatory human review and authorized engineering approval prior to official bid submission.")}
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {draft.sections.map((section, idx) => {
          const isOpen = openSections[section.title] ?? (idx === 0);
          return (
            <div
              key={`${section.title}-${idx}`}
              className="rounded-lg border border-[#1e2530] bg-[#161a22] overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between p-3.5 text-start hover:bg-[#1e2530]/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-[#c9a84c]" />
                  <span className="text-sm font-semibold text-[#e8eaed]">
                    {section.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {section.self_check_passed && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 size={12} />
                      <span>{locale === "ar" ? "مفحوص آلياً" : "Self-Checked"}</span>
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown size={14} className="text-[#8b93a0]" />
                  ) : (
                    <ChevronRight size={14} className="text-[#8b93a0]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#1e2530] p-4 text-xs leading-relaxed text-[#c7cad1] whitespace-pre-wrap text-start bg-[#0f1117]/60">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
