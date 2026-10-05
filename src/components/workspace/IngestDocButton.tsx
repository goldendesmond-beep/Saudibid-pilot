import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { tendersApi } from "../../api/tenders";
import { useLocaleStore } from "../../store/localeStore";
import { useDraftStore } from "../../store/draftStore";

interface IngestDocButtonProps {
  tenderId: string;
}

export function IngestDocButton({ tenderId }: IngestDocButtonProps) {
  const [loading, setLoading] = useState(false);
  const { locale } = useLocaleStore();
  const selectedTender = useDraftStore((s) => s.selectedTender);
  const setSelectedTender = useDraftStore((s) => s.setSelectedTender);

  async function handleIngest() {
    setLoading(true);
    try {
      await tendersApi.ingestDoc(tenderId);
      if (selectedTender) {
        setSelectedTender({
          ...selectedTender,
          raw_doc_uri: `https://monafasat.etimad.sa/tenders/${tenderId}`,
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleIngest}
      disabled={loading}
      className="flex items-center gap-2 rounded-md bg-[#1e2530] px-4 py-2 text-xs font-semibold text-[#c9a84c] hover:bg-[#283241] disabled:opacity-50 transition-colors cursor-pointer"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
      <span>{locale === "ar" ? "معالجة واستخراج كراسة الشروط" : "Ingest & Parse RFP Document"}</span>
    </button>
  );
}
