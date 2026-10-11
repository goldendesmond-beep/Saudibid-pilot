import React, { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import {
  ExternalLink,
  Copy,
  Check,
  Search,
  Building2,
  ShieldCheck,
  Globe,
  FileText,
  Info,
} from "lucide-react";
import {
  type SourceNavigationRecord,
  getNavigationStatusBadge,
  copyUrlToClipboard,
  openExternalUrl,
} from "../services/sourceNavigationService";

interface SourceNavigationLauncherProps {
  source: SourceNavigationRecord;
  compact?: boolean;
  onClose?: () => void;
}

export const SourceNavigationLauncher: React.FC<SourceNavigationLauncherProps> = ({
  source,
  compact = false,
}) => {
  const { isRTL } = useTranslation();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const badge = getNavigationStatusBadge(source.navigation_status);

  const handleCopy = async (url: string, label: string) => {
    const success = await copyUrlToClipboard(url);
    if (success) {
      setCopiedUrl(label);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  const handleCopyTerm = async (term: string) => {
    const success = await copyUrlToClipboard(term);
    if (success) {
      setCopiedTerm(term);
      setTimeout(() => setCopiedTerm(null), 2000);
    }
  };

  const primarySearchUrl =
    source.official_tenders_url ||
    source.official_search_url ||
    source.official_procurement_url ||
    source.official_supplier_portal_url ||
    source.official_home_url;

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 p-4 transition-all hover:border-slate-700/80 ${
        compact ? "space-y-3" : "space-y-4"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-100">
              {isRTL ? source.source_name_ar || source.source_name : source.source_name}
            </h4>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
              {isRTL ? badge.labelAr : badge.labelEn}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>{source.authority_type.replace(/_/g, " ")}</span>
            <span>•</span>
            <span className="text-slate-300 truncate max-w-[200px]">{source.official_domain}</span>
          </div>
        </div>

        {/* Manual search status badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800">
          {source.manual_search_available ? (
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isRTL ? "التصفح اليدوي: متاح" : "Manual Search: YES"}
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {isRTL ? "التصفح اليدوي: غير متاح" : "Manual Search: NO"}
            </span>
          )}
        </div>
      </div>

      {/* Description & Diagnostic Reason */}
      <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        <p className="text-slate-300">{isRTL ? source.description_ar : source.description_en}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
          <span className="text-slate-400 font-medium">
            {isRTL ? "سبب عدم الجلب الآلي:" : "Why automatic fetch is unavailable:"}
          </span>
          <span className="font-mono font-bold text-amber-400">{source.diagnostic_reason}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{source.access_requirement}</span>
        </div>
      </div>

      {/* Suggested Search Terms */}
      {source.suggested_search_terms && source.suggested_search_terms.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Search className="w-3 h-3 text-[#c9a84c]" />
              <span>{isRTL ? "كلمات بحث مقترحة للتصفح اليدوي:" : "SUGGESTED MANUAL SEARCH TERMS:"}</span>
            </span>
            {copiedTerm && (
              <span className="text-emerald-400 font-mono text-[10px] animate-fadeIn">
                {isRTL ? `تم نسخ: "${copiedTerm}"` : `Copied: "${copiedTerm}"`}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {source.suggested_search_terms.map((term, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopyTerm(term)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-500 transition-colors"
                title={isRTL ? "اضغط لنسخ الكلمة إلى الحافظة" : "Click to copy keyword to clipboard"}
              >
                <span>{term}</span>
                <Copy className="w-2.5 h-2.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* External Navigation Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>{isRTL ? "الروابط الرسمية الموثقة للمصدر:" : "Verified Official Source Destinations:"}</span>
          {copiedUrl && (
            <span className="text-emerald-400 font-mono text-[10px]">
              {isRTL ? `تم نسخ رابط: ${copiedUrl}` : `Copied ${copiedUrl} link`}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Official Homepage */}
          {source.official_home_url && (
            <a
              href={source.official_home_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                openExternalUrl(source.official_home_url);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white transition-colors"
              title={source.official_home_url}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{isRTL ? "فتح الموقع الرسمي" : "Open Official Website"}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {/* 2. Official Tenders / Search URL */}
          {(source.official_tenders_url || source.official_search_url) && (
            <a
              href={source.official_tenders_url || source.official_search_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
              title={source.official_tenders_url || source.official_search_url || ""}
            >
              <Search className="w-3.5 h-3.5 text-white" />
              <span>{isRTL ? "البحث يدويًا في المناقصات" : "Search Tenders Manually"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* 3. Official Procurement URL */}
          {source.official_procurement_url &&
            source.official_procurement_url !== source.official_tenders_url && (
              <a
                href={source.official_procurement_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title={source.official_procurement_url}
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>{isRTL ? "فتح صفحة المشتريات" : "Open Procurement"}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

          {/* 4. Official Supplier Portal */}
          {source.official_supplier_portal_url && (
            <a
              href={source.official_supplier_portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title={source.official_supplier_portal_url}
            >
              <Building2 className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span>{isRTL ? "فتح بوابة الموردين" : "Open Supplier Portal"}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {/* 5. Official Vendor Registration */}
          {source.official_vendor_registration_url &&
            source.official_vendor_registration_url !== source.official_supplier_portal_url && (
              <a
                href={source.official_vendor_registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title={source.official_vendor_registration_url}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRTL ? "تسجيل مورد" : "Vendor Registration"}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

          {/* 6. Copy URL Fallback Button */}
          {primarySearchUrl && (
            <button
              type="button"
              onClick={() => handleCopy(primarySearchUrl, isRTL ? source.source_name_ar || source.source_name : source.source_name)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
              title={isRTL ? "نسخ رابط المصدر" : "Copy Source URL"}
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isRTL ? "نسخ الرابط" : "Copy URL"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Transparency Notice & Mobile Handoff Guidance */}
      <div className="flex items-start gap-2 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isRTL
            ? "يفتح الرابط في تبويب منفصل بالمتصفح الخارجي خارج المنصة لضمان الأمان وتفادي قيود الحماية. يتم الحفاظ التلقائي على الفلاتر والمنشأة الحالية عند العودة."
            : "Opens in a new browser tab outside BidPilot to respect corporate security boundaries and avoid iframe restrictions. Your filters and organization context remain preserved upon return."}
        </p>
      </div>
    </div>
  );
};
