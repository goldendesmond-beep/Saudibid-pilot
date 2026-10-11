import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { useCompanyStore } from "../../store/companyStore";
import {
  prequalApi,
  type DossierProfile,
  type PrequalificationDossierRecord,
} from "../../api/prequalification";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Layers,
  ShieldAlert,
} from "lucide-react";

export function PrequalificationDossierWorkspace() {
  const { isAr } = useTranslation();
  const { profile } = useCompanyStore();

  const [profiles, setProfiles] = useState<DossierProfile[]>([]);
  const [selectedProfileKey, setSelectedProfileKey] = useState<string>("NESMA");
  const [dossier, setDossier] = useState<PrequalificationDossierRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "01": true,
    "03": true,
  });
  const [copiedManifest, setCopiedManifest] = useState(false);

  useEffect(() => {
    prequalApi.getProfiles().then((p) => {
      setProfiles(p);
    });
  }, []);

  const handleAssemble = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prequalApi.assembleDossier({
        profile_key: selectedProfileKey,
      });
      setDossier(res);
      // Expand sections with items
      const newExpanded: Record<string, boolean> = {};
      res.sections.forEach((s) => {
        if (s.total_items > 0) newExpanded[s.index] = true;
      });
      setExpandedSections(newExpanded);
    } catch (err) {
      console.error("Error assembling dossier:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProfileKey]);

  useEffect(() => {
    handleAssemble();
  }, [handleAssemble, profile?.id]);

  const toggleSection = (idx: string) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyManifest = () => {
    if (!dossier) return;
    navigator.clipboard.writeText(JSON.stringify(dossier.package_manifest, null, 2));
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const activeProfile = profiles.find((p) => p.profile_key === selectedProfileKey);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2530] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e8eaed]">
            {isAr ? "مجمع ملفات التأهيل المسبق الذكي" : "Smart Prequalification Dossier Generator"}
          </h2>
          <p className="text-xs text-[#8b93a0] mt-1">
            {isAr
              ? "تجميع ملفات التأهيل المخصصة لمقاولي العموم (أرامكو، نسما، البواني، السيف، الرشيد) مع الفحص الآلي للوثائق المعتمدة"
              : "Generates tailored contractor submission packages matched against verified Master Vault credentials"}
          </p>
        </div>

        <button
          onClick={handleAssemble}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#c9a84c] text-black font-semibold text-xs hover:bg-[#c9a84c]/90 transition-colors self-start md:self-auto"
        >
          <Layers size={14} />
          <span>{loading ? (isAr ? "جاري التجميع..." : "Assembling...") : (isAr ? "إعادة تجميع الملف" : "Re-assemble Dossier")}</span>
        </button>
      </div>

      {/* Contractor Profile Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#8b93a0] uppercase tracking-wider">
          {isAr ? "اختر مقاول العموم المستهدف للتأهيل" : "Target Main Contractor Profile"}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {profiles.map((prof) => {
            const isSelected = selectedProfileKey === prof.profile_key;
            return (
              <button
                key={prof.profile_key}
                onClick={() => setSelectedProfileKey(prof.profile_key)}
                className={`flex flex-col items-start p-3 rounded-lg border text-start transition-all ${
                  isSelected
                    ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#e8eaed]"
                    : "border-[#1e2530] bg-[#161a22] text-[#8b93a0] hover:text-[#e8eaed] hover:border-[#2d3748]"
                }`}
              >
                <div className="text-xs font-bold truncate w-full">
                  {isAr ? prof.contractor_name_ar : prof.contractor_name}
                </div>
                <div className="text-[10px] text-[#8b93a0] mt-1">
                  {prof.required_count} {isAr ? "متطلب" : "Requirements"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Profile Info & Notes */}
      {activeProfile && (
        <div className="rounded-lg border border-[#1e2530] bg-[#12151b] p-3 flex items-start gap-3 text-xs text-[#8b93a0]">
          <Building2 size={16} className="text-[#c9a84c] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#e8eaed]">
              {isAr ? activeProfile.profile_name_ar : activeProfile.profile_name_en}
            </span>
            <span className="mx-2">·</span>
            <span>{activeProfile.notes}</span>
          </div>
        </div>
      )}

      {/* Readiness & Unresolved Issues Banner */}
      {dossier && (
        <div className="rounded-xl border border-[#1e2530] bg-[#161a22] p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#8b93a0] uppercase tracking-wider">
                {isAr ? "جاهزية ملف التقديم" : "Submission Package Readiness"}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#e8eaed]">
                  {dossier.readiness_percentage}%
                </span>
                <span className={`text-xs font-bold ${dossier.status === "READY_FOR_EXPORT" ? "text-emerald-400" : "text-amber-400"}`}>
                  {dossier.status === "READY_FOR_EXPORT"
                    ? isAr
                      ? "جاهز للتقديم والتصدير"
                      : "READY FOR EXPORT"
                    : isAr
                    ? "مسودة - متطلبات غير مكتملة"
                    : "DRAFT (MANDATORY ITEMS UNRESOLVED)"}
                </span>
              </div>
            </div>

            {/* Quick Readiness Counter Badges */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={14} />
                <span>{dossier.readiness_breakdown.ready_count} {isAr ? "جاهز" : "Ready"}</span>
              </div>
              <span className="text-[#8b93a0]">·</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Clock size={14} />
                <span>{dossier.readiness_breakdown.missing_count} {isAr ? "ناقص" : "Missing"}</span>
              </div>
              <span className="text-[#8b93a0]">·</span>
              <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                <AlertTriangle size={14} />
                <span>{dossier.readiness_breakdown.expired_count} {isAr ? "منتهي الصلاحية" : "Expired"}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#12151b] rounded-full h-2 overflow-hidden border border-[#1e2530]">
            <div
              className={`h-full transition-all duration-500 ${
                dossier.readiness_percentage >= 100
                  ? "bg-emerald-500"
                  : dossier.readiness_percentage >= 80
                  ? "bg-[#c9a84c]"
                  : "bg-amber-500"
              }`}
              style={{ width: `${dossier.readiness_percentage}%` }}
            />
          </div>

          {/* Strict Mandatory Rule Notice */}
          {dossier.readiness_breakdown.unresolved_mandatory_reasons &&
            dossier.readiness_breakdown.unresolved_mandatory_reasons.length > 0 && (
              <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <ShieldAlert size={14} />
                  <span>
                    {isAr
                      ? "تنبيه نظامي: لا يمكن اعتماد الملف كـ مكتمل بسبب وثائق إلزامية غير صالحة"
                      : "Strict Compliance Rule: Package cannot be marked complete or exported due to unresolved mandatory items"}
                  </span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-red-300 space-y-0.5">
                  {dossier.readiness_breakdown.unresolved_mandatory_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* 13-Section Dossier Structure */}
      {dossier && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#e8eaed]">
              {isAr ? "هيكل ملف التأهيل الموحد (13 قسماً)" : "Unified Dossier Package Structure (13 Standard Sections)"}
            </h3>
            <span className="text-xs text-[#8b93a0]">
              {isAr ? "اضغط على القسم لمعاينة الوثائق المدرجة" : "Click section to expand documents"}
            </span>
          </div>

          <div className="space-y-2">
            {dossier.sections.map((sec) => {
              const isExpanded = !!expandedSections[sec.index];
              const hasDocs = sec.documents.length > 0;
              const hasMissing = sec.missing_documents.length > 0;
              const hasExpired = sec.expired_documents.length > 0;

              return (
                <div
                  key={sec.index}
                  className="rounded-lg border border-[#1e2530] bg-[#161a22] overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(sec.index)}
                    className="w-full flex items-center justify-between p-3.5 text-start hover:bg-[#1a202c]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#c9a84c]">
                        {sec.index}
                      </span>
                      <div className="text-xs font-semibold text-[#e8eaed]">
                        {isAr ? sec.name_ar : sec.name_en}
                      </div>
                      <span className="text-[11px] text-[#8b93a0] font-mono">
                        ({sec.folder_name})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasDocs && (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {sec.documents.length} {isAr ? "مرفق" : "Attached"}
                        </span>
                      )}
                      {hasExpired && (
                        <span className="text-[10px] text-red-400 font-bold">
                          {sec.expired_documents.length} {isAr ? "منتهي" : "Expired"}
                        </span>
                      )}
                      {hasMissing && (
                        <span className="text-[10px] text-amber-400">
                          {sec.missing_documents.length} {isAr ? "ناقص" : "Missing"}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={14} className="text-[#8b93a0]" /> : <ChevronDown size={14} className="text-[#8b93a0]" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#1e2530] p-3 bg-[#12151b]/50 space-y-2 text-xs">
                      {/* Attached Valid Documents */}
                      {sec.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-[#161a22] border border-[#1e2530]"
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck2 size={14} className="text-emerald-400 shrink-0" />
                            <div>
                              <div className="font-medium text-[#e8eaed]">{isAr ? doc.name_ar : doc.name_en}</div>
                              <div className="text-[10px] text-[#8b93a0] font-mono">
                                {doc.filename} · v{doc.version}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="text-[10px] text-emerald-400 font-medium">
                              {doc.match_status}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Expired Documents */}
                      {sec.expired_documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-red-950/20 border border-red-900/40"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-400 shrink-0" />
                            <div>
                              <div className="font-medium text-red-300">{isAr ? doc.name_ar : doc.name_en}</div>
                              <div className="text-[10px] text-red-400 font-mono">
                                {doc.reason}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="text-[10px] text-red-400 font-bold uppercase">
                              {doc.match_status}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Missing Documents */}
                      {sec.missing_documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-amber-950/15 border border-amber-900/30"
                        >
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-amber-400 shrink-0" />
                            <div>
                              <div className="font-medium text-amber-300">{isAr ? doc.name_ar : doc.name_en}</div>
                              <div className="text-[10px] text-[#8b93a0]">
                                {doc.reason}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="text-[10px] text-amber-400 font-semibold uppercase">
                              {doc.match_status}
                            </span>
                          </div>
                        </div>
                      ))}

                      {sec.total_items === 0 && (
                        <div className="text-center py-2 text-[11px] text-[#8b93a0]">
                          {isAr ? "لا توجد مستندات مطلوبة في هذا القسم لهذا المقاول" : "No specific documents required in this section for this contractor"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Package Manifest & Cover Sheet Export Card */}
      {dossier && (
        <div className="rounded-xl border border-[#1e2530] bg-[#161a22] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2530] pb-3">
            <div>
              <h4 className="text-sm font-bold text-[#e8eaed]">
                {isAr ? "بيانات غلاف التقديم والمانيفست الرسمي" : "Official Package Manifest & Submission Cover"}
              </h4>
              <p className="text-xs text-[#8b93a0]">
                {isAr
                  ? "خطاب التقديم والبيانات التعاقدية لتقديمه لمقاول العموم"
                  : "Cover sheet data and JSON manifest ready for procurement transmittal"}
              </p>
            </div>

            <button
              onClick={handleCopyManifest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1e2530] bg-[#12151b] text-xs text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
            >
              {copiedManifest ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedManifest ? (isAr ? "تم النسخ" : "Copied!") : (isAr ? "نسخ المانيفست" : "Copy Manifest JSON")}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#12151b] rounded-lg border border-[#1e2530] space-y-2">
              <div className="font-semibold text-[#c9a84c]">{isAr ? "بيانات مقدم العرض (المقاول)" : "Contractor Transmittal"}</div>
              <div className="text-[#e8eaed] font-medium">{dossier.package_manifest.submission_cover_sheet.contractor_legal_name}</div>
              <div className="text-[#8b93a0]">
                CR: <span className="font-mono text-[#e8eaed]">{dossier.package_manifest.submission_cover_sheet.cr_number}</span>
              </div>
              <div className="text-[#8b93a0]">
                {isAr ? "المسؤول:" : "Contact:"} <span className="text-[#e8eaed]">{dossier.package_manifest.submission_cover_sheet.contact_person}</span>
              </div>
              <div className="text-[#8b93a0]">
                {isAr ? "البريد:" : "Email:"} <span className="text-[#e8eaed]">{dossier.package_manifest.submission_cover_sheet.contact_email}</span>
              </div>
            </div>

            <div className="p-3 bg-[#12151b] rounded-lg border border-[#1e2530] space-y-2">
              <div className="font-semibold text-[#c9a84c]">{isAr ? "بيانات المقاول العام المستهدف" : "Target Client & Scope"}</div>
              <div className="text-[#e8eaed] font-medium">{dossier.package_manifest.submission_cover_sheet.intended_client}</div>
              <div className="text-[#8b93a0]">
                {isAr ? "النطاق المستهدف:" : "Intended Scope:"} <span className="text-[#e8eaed]">{dossier.package_manifest.submission_cover_sheet.intended_scope}</span>
              </div>
              <div className="text-[#8b93a0]">
                {isAr ? "تاريخ التقديم:" : "Date:"} <span className="font-mono text-[#e8eaed]">{dossier.package_manifest.submission_cover_sheet.transmittal_date}</span>
              </div>
              <div className="text-[#8b93a0]">
                {isAr ? "الملفات المرفقة:" : "Files Attached:"} <span className="text-[#e8eaed]">{dossier.package_manifest.total_documents_included} verified files</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
