import { Loader2 } from "lucide-react";
import { useLocaleStore } from "../../store/localeStore";

export function AgentWorking() {
  const { locale } = useLocaleStore();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 size={28} className="animate-spin text-[#c9a84c]" />
      <div className="text-sm font-semibold text-[#e8eaed]">
        {locale === "ar"
          ? "وكيل الصياغة الذكي يحلل متطلبات الكراسة..."
          : "Drafting Agent Analyzing Tender Specs..."}
      </div>
      <p className="text-xs text-[#8b93a0] max-w-sm">
        {locale === "ar"
          ? "يتم الآن استرجاع الأدلة وتدقيق بنود الامتثال ومطابقة القدرات الفنية مع الاشتراطات السعودية."
          : "Retrieving RAG document chunks, validating GTPL compliance clauses, and structuring technical proposal sections."}
      </p>
    </div>
  );
}
