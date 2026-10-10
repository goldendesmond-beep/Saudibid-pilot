import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { useCompanyStore } from "../../store/companyStore";
import {
  prequalApi,
  type CompanyVaultItem,
  type VaultSummary,
} from "../../api/prequalification";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  RefreshCw,
  Search,
  X,
  ShieldAlert,
} from "lucide-react";

export function CompanyDocumentVault() {
  const { isAr } = useTranslation();
  const { profile } = useCompanyStore();

  const [documents, setDocuments] = useState<CompanyVaultItem[]>([]);
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<CompanyVaultItem | null>(null);

  // Edit / Renewal form
  const [renewFilename, setRenewFilename] = useState("");
  const [renewExpiryDate, setRenewExpiryDate] = useState("");
  const [renewVersion, setRenewVersion] = useState("");
  const [renewNotes, setRenewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadVaultData = useCallback(async () => {
    setLoading(true);
    try {
      const [docs, sum] = await Promise.all([
        prequalApi.getVaultDocuments(categoryFilter),
        prequalApi.getVaultSummary(),
      ]);
      setDocuments(docs);
      setSummary(sum);
    } catch (err) {
      console.error("Error loading document vault:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadVaultData();
  }, [loadVaultData, profile?.id]);

  const handleOpenRenew = (doc: CompanyVaultItem) => {
    setSelectedDoc(doc);
    setRenewFilename(doc.filename || "");
    setRenewExpiryDate(doc.expiry_date ? doc.expiry_date.slice(0, 10) : "");
    setRenewVersion(doc.version || "2026.1");
    setRenewNotes(doc.notes || "");
  };

  const handleSaveRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setIsSubmitting(true);
    try {
      const updated = await prequalApi.updateVaultDocument(selectedDoc.id, {
        filename: renewFilename,
        expiry_date: renewExpiryDate ? `${renewExpiryDate}T00:00:00Z` : undefined,
        version: renewVersion,
        notes: renewNotes,
      });
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDoc(null);
      // Reload summary
      const sum = await prequalApi.getVaultSummary();
      setSummary(sum);
    } catch (err) {
      console.error("Error updating vault document:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.code.toLowerCase().includes(q) ||
      doc.name_en.toLowerCase().includes(q) ||
      doc.name_ar.toLowerCase().includes(q) ||
      (doc.issuing_authority && doc.issuing_authority.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2530] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e8eaed]">
            {isAr ? "خزينة الوثائق والمؤهلات المعتمدة" : "Master Company Document Vault"}
          </h2>
          <p className="text-xs text-[#8b93a0] mt-1">
            {isAr
              ? "مستودع الوثائق القانونية والفنية والمالية للشركة مع التتبع الدقيق لتواريخ الصلاحية والتنبيهات النظامية"
              : "Central repository of contractor statutory, technical, financial, and HSE documents with strict expiry tracking"}
          </p>
        </div>

        <button
          onClick={loadVaultData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e2530] bg-[#161a22] text-xs text-[#8b93a0] hover:text-[#e8eaed] transition-colors self-start md:self-auto"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>{isAr ? "تحديث الخزينة" : "Refresh Vault"}</span>
        </button>
      </div>

      {/* Expiry Alerts Banner */}
      {summary && summary.alerts && summary.alerts.length > 0 && (
        <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <ShieldAlert size={16} />
            <span>
              {isAr
                ? `تنبيهات الصلاحية النظامية (${summary.alerts.length})`
                : `Document Expiry Alerts (${summary.alerts.length})`}
            </span>
          </div>
          <div className="space-y-1.5">
            {summary.alerts.map((al, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-red-300/90">
                <span className="font-mono font-bold text-red-400">[{al.code}]</span>
                <span>{al.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-[#8b93a0]">{isAr ? "إجمالي الوثائق" : "Total Documents"}</div>
            <div className="text-xl font-bold text-[#e8eaed] mt-1">{summary.total_documents}</div>
          </div>
          <div className="rounded-lg border border-emerald-900/30 bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-emerald-400">{isAr ? "سارية وصالحة" : "Valid"}</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{summary.valid_count}</div>
          </div>
          <div className="rounded-lg border border-amber-900/30 bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-amber-400">{isAr ? "تشرف على الانتهاء" : "Expiring Soon"}</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{summary.expiring_soon_count}</div>
          </div>
          <div className="rounded-lg border border-red-900/30 bg-[#161a22] p-3 text-center">
            <div className="text-[11px] font-medium text-red-400">{isAr ? "منتهية الصلاحية" : "Expired"}</div>
            <div className="text-xl font-bold text-red-400 mt-1">{summary.expired_count}</div>
          </div>
          <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-3 text-center col-span-2 sm:col-span-1">
            <div className="text-[11px] font-medium text-[#8b93a0]">{isAr ? "غير مرفوعة" : "Missing"}</div>
            <div className="text-xl font-bold text-[#8b93a0] mt-1">{summary.missing_count}</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#12151b] rounded-lg border border-[#1e2530]">
          {[
            { id: "ALL", en: "All", ar: "الكل" },
            { id: "STATUTORY", en: "Statutory", ar: "النظامية" },
            { id: "TECHNICAL", en: "Technical", ar: "الفنية" },
            { id: "FINANCIAL", en: "Financial", ar: "المالية" },
            { id: "QUALITY_HSE", en: "Quality & HSE", ar: "الجودة والسلامة" },
            { id: "LOCAL_CONTENT", en: "Local Content", ar: "المحتوى المحلي" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40"
                  : "text-[#8b93a0] hover:text-[#e8eaed]"
              }`}
            >
              {isAr ? cat.ar : cat.en}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-2.5 text-[#8b93a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث بالرمز أو اسم الوثيقة..." : "Search by code or title..."}
            className="w-full bg-[#12151b] border border-[#1e2530] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#e8eaed] placeholder-[#8b93a0] focus:outline-none focus:border-[#c9a84c]"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-lg border border-[#1e2530] bg-[#161a22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#12151b] text-[#8b93a0] border-b border-[#1e2530]">
              <tr>
                <th className="py-2.5 px-4 text-start font-semibold">{isAr ? "الرمز والوثيقة" : "Document & Code"}</th>
                <th className="py-2.5 px-4 text-start font-semibold">{isAr ? "التصنيف" : "Category"}</th>
                <th className="py-2.5 px-4 text-start font-semibold">{isAr ? "جهة الإصدار" : "Authority"}</th>
                <th className="py-2.5 px-4 text-start font-semibold">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</th>
                <th className="py-2.5 px-4 text-start font-semibold">{isAr ? "الحالة" : "Status"}</th>
                <th className="py-2.5 px-4 text-end font-semibold">{isAr ? "الإجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2530] text-[#e8eaed]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8b93a0]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-[#c9a84c]" />
                      <span>{isAr ? "جاري تحميل مستندات الخزينة..." : "Loading document vault..."}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8b93a0]">
                    {isAr ? "لا توجد وثائق مطابقة لمعايير البحث" : "No documents match search criteria."}
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isExp = doc.document_status === "EXPIRED";
                  const isSoon = doc.document_status === "EXPIRING_SOON";
                  const isValid = doc.document_status === "VALID";

                  return (
                    <tr key={doc.id} className="hover:bg-[#1a202c]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#e8eaed]">{isAr ? doc.name_ar : doc.name_en}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8b93a0]">
                          <span className="font-mono text-[#c9a84c]">{doc.code}</span>
                          <span>·</span>
                          <span>{doc.filename || "No file uploaded"}</span>
                          <span>·</span>
                          <span>v{doc.version}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#8b93a0] text-[11px]">
                        {doc.category}
                      </td>
                      <td className="py-3 px-4 text-[#8b93a0] text-[11px]">
                        {isAr ? doc.issuing_authority_ar || doc.issuing_authority : doc.issuing_authority || "—"}
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        {doc.expiry_date ? (
                          <div className={`flex items-center gap-1 font-mono ${isExp ? "text-red-400 font-bold" : isSoon ? "text-amber-400 font-semibold" : "text-[#8b93a0]"}`}>
                            <Calendar size={12} />
                            <span>{doc.expiry_date.slice(0, 10)}</span>
                          </div>
                        ) : (
                          <span className="text-[#8b93a0]">{isAr ? "دائمة (بدون انتهاء)" : "Permanent"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        {isExp && (
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <AlertTriangle size={12} />
                            {isAr ? "منتهية" : "EXPIRED"}
                          </span>
                        )}
                        {isSoon && (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Clock size={12} />
                            {isAr ? "قريبة الانتهاء" : "EXPIRING SOON"}
                          </span>
                        )}
                        {isValid && (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            {isAr ? "صالحة" : "VALID"}
                          </span>
                        )}
                        {!isExp && !isSoon && !isValid && (
                          <span className="text-[#8b93a0]">{doc.document_status}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          onClick={() => handleOpenRenew(doc)}
                          className="px-2.5 py-1 rounded border border-[#1e2530] bg-[#12151b] text-[11px] text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                        >
                          {isAr ? "تحديث / تجديد" : "Update / Renew"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal / Edit Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e2530] bg-[#161a22] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#e8eaed]">
                  {isAr ? "تجديد أو تحديث وثيقة" : "Update Document Record"}
                </h3>
                <div className="text-xs text-[#c9a84c] font-mono mt-0.5">{selectedDoc.code}</div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-[#8b93a0] hover:text-[#e8eaed]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRenewal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "اسم الوثيقة" : "Document Title"}
                </label>
                <div className="text-[#e8eaed] font-medium p-2 bg-[#12151b] rounded border border-[#1e2530]">
                  {isAr ? selectedDoc.name_ar : selectedDoc.name_en}
                </div>
              </div>

              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "اسم الملف المرفوع" : "Uploaded Filename"}
                </label>
                <input
                  type="text"
                  required
                  value={renewFilename}
                  onChange={(e) => setRenewFilename(e.target.value)}
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                  placeholder="e.g. ZATCA_Certificate_1447_Renewed.pdf"
                />
              </div>

              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "تاريخ الانتهاء الجديد" : "New Expiry Date"}
                </label>
                <input
                  type="date"
                  value={renewExpiryDate}
                  onChange={(e) => setRenewExpiryDate(e.target.value)}
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                />
                <span className="text-[10px] text-[#8b93a0] mt-1 block">
                  {isAr
                    ? "اتركه فارغاً إذا كانت الوثيقة دائمة بدون تاريخ انتهاء"
                    : "Leave blank if permanent document with no expiry date"}
                </span>
              </div>

              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "رقم الإصدار / النسخة" : "Version / Revision"}
                </label>
                <input
                  type="text"
                  value={renewVersion}
                  onChange={(e) => setRenewVersion(e.target.value)}
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                  placeholder="e.g. 2026.2 or 1447-H"
                />
              </div>

              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "ملاحظات التجديد والتحقق" : "Renewal Notes & Verification"}
                </label>
                <textarea
                  rows={2}
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                  placeholder={isAr ? "مثال: تم التجديد عبر البوابة الإلكترونية..." : "Notes on verification source..."}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2530]">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1.5 rounded text-xs text-[#8b93a0] hover:text-[#e8eaed]"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-[#c9a84c] text-black font-semibold text-xs hover:bg-[#c9a84c]/90 transition-colors"
                >
                  {isSubmitting ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التجديد" : "Save Renewal")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
