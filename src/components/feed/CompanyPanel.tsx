import { useState } from "react";
import { Building, ShieldCheck, Wrench, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { companiesApi } from "../../api/companies";
import { useCompanyStore } from "../../store/companyStore";
import { useLocaleStore } from "../../store/localeStore";
import type { CompanyProfile, CompanySize, ClassificationGrade } from "../../api/types";
import {
  SAUDI_REGIONS,
  SAUDI_WORK_CATEGORIES,
  CONTRACTOR_CLASSIFICATIONS,
  CLASSIFICATION_GRADES,
  COMPANY_SIZES,
  COMMON_EQUIPMENT_TAGS,
  COMMON_CERTIFICATIONS,
} from "../../constants/saudiTaxonomy";

export function CompanyPanel() {
  const { profile, setCompany } = useCompanyStore();
  const { t, locale } = useLocaleStore();
  const [showForm, setShowForm] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "scope" | "capacity" | "financial">("general");

  // Form state
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    name_ar: profile?.name_ar ?? "",
    cr_number: profile?.cr_number ?? "",
    company_size: (profile?.company_size ?? "Medium") as CompanySize,
    contractor_classification: profile?.contractor_classification ?? "Roads & Buildings",
    classification_grade: (profile?.classification_grade ?? 2) as ClassificationGrade,
    saudi_regions: profile?.saudi_regions ?? ["Riyadh Region"],
    saudi_cities: profile?.saudi_cities?.join(", ") ?? "Riyadh",
    main_activities: profile?.main_activities ?? ["Roads, Bridges & Civil Infrastructure"],
    secondary_activities: profile?.secondary_activities ?? [],
    experience_years: profile?.experience_years?.toString() ?? "10",
    manpower_count: profile?.manpower_count?.toString() ?? "100",
    equipment_tags: profile?.equipment_tags ?? [],
    comfortable_project_size: profile?.comfortable_project_size ?? "10M - 50M SAR",
    preferred_project_value_sar: profile?.preferred_project_value_sar?.toString() ?? "30000000",
    guarantee_capability_sar: profile?.guarantee_capability_sar?.toString() ?? "15000000",
    certifications: profile?.certifications ?? ["SCA_MUQAWIL", "ISO_9001"],
    direct_tender_interest: profile?.direct_tender_interest ?? true,
    subcontracting_interest: profile?.subcontracting_interest ?? true,
    vendor_registration_interest: profile?.vendor_registration_interest ?? true,
    excluded_project_types: profile?.excluded_project_types?.join(", ") ?? "",
  });

  // Re-sync form state when active organization profile changes
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        name_ar: profile.name_ar || "",
        cr_number: profile.cr_number || "",
        company_size: (profile.company_size || "Medium") as CompanySize,
        contractor_classification: profile.contractor_classification || "General Contracting",
        classification_grade: (profile.classification_grade || 2) as ClassificationGrade,
        saudi_regions: profile.saudi_regions || ["Riyadh Region"],
        saudi_cities: profile.saudi_cities?.join(", ") || "Riyadh",
        main_activities: profile.main_activities || [],
        secondary_activities: profile.secondary_activities || [],
        experience_years: profile.experience_years?.toString() || "10",
        manpower_count: profile.manpower_count?.toString() || "100",
        equipment_tags: profile.equipment_tags || [],
        comfortable_project_size: profile.comfortable_project_size || "10M - 50M SAR",
        preferred_project_value_sar: profile.preferred_project_value_sar?.toString() || "30000000",
        guarantee_capability_sar: profile.guarantee_capability_sar?.toString() || "15000000",
        certifications: profile.certifications || ["SCA_MUQAWIL"],
        direct_tender_interest: profile.direct_tender_interest ?? true,
        subcontracting_interest: profile.subcontracting_interest ?? true,
        vendor_registration_interest: profile.vendor_registration_interest ?? true,
        excluded_project_types: profile.excluded_project_types?.join(", ") || "",
      });
    }
  }, [profile]);

  const [expandedDetails, setExpandedDetails] = useState(false);

  function split(v: string): string[] {
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function toggleArrayItem(currentList: string[], item: string): string[] {
    if (currentList.includes(item)) {
      return currentList.filter((x) => x !== item);
    }
    return [...currentList, item];
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      // Map Saudi work categories to CPV codes for internal backward compatibility
      const derivedCpvCodes = form.main_activities
        .map((act) => SAUDI_WORK_CATEGORIES.find((cat) => cat.nameEn === act || cat.nameAr === act)?.cpvFallback)
        .filter(Boolean) as string[];

      // Map regions to internal NUTS fallbacks
      const derivedNuts = form.saudi_regions
        .map((reg) => SAUDI_REGIONS.find((r) => r.nameEn === reg || r.nameAr === reg)?.nutsFallback)
        .filter(Boolean) as string[];

      const preferredVal = parseFloat(form.preferred_project_value_sar) || 30000000;

      const payload: Partial<CompanyProfile> & { name: string } = {
        name: form.name,
        name_ar: form.name_ar,
        cr_number: form.cr_number,
        company_size: form.company_size,
        contractor_classification: form.contractor_classification,
        classification_grade: form.classification_grade,
        saudi_regions: form.saudi_regions,
        saudi_cities: split(form.saudi_cities),
        main_activities: form.main_activities,
        secondary_activities: form.secondary_activities,
        experience_years: parseInt(form.experience_years, 10) || 10,
        manpower_count: parseInt(form.manpower_count, 10) || 100,
        equipment_tags: form.equipment_tags,
        comfortable_project_size: form.comfortable_project_size,
        preferred_project_value_sar: preferredVal,
        guarantee_capability_sar: parseFloat(form.guarantee_capability_sar) || 15000000,
        certifications: form.certifications,
        direct_tender_interest: form.direct_tender_interest,
        subcontracting_interest: form.subcontracting_interest,
        vendor_registration_interest: form.vendor_registration_interest,
        excluded_project_types: split(form.excluded_project_types),

        // Backwards compatibility
        annual_turnover: preferredVal * 2,
        cpv_codes: derivedCpvCodes.length > 0 ? derivedCpvCodes : ["45000000", "45233000"],
        regions: derivedNuts.length > 0 ? derivedNuts : ["EL30"],
        capacity_tags: [...form.main_activities, ...form.equipment_tags],
        exclusion_flags: [],
      };

      const saved = await companiesApi.create(payload);
      setCompany(saved);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // View Mode
  if (!showForm && profile) {
    const displayName = locale === "ar" && profile.name_ar ? profile.name_ar : profile.name;

    return (
      <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4 text-start">
        {/* Header summary */}
        <div className="flex items-start justify-between gap-2 border-b border-[#1e2530] pb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#e8eaed]">{displayName}</h3>
              <span className="rounded bg-[#c9a84c]/20 px-2 py-0.5 text-[11px] font-semibold text-[#c9a84c]">
                {profile.company_size}
              </span>
              <span className="rounded bg-[#1e2530] px-2 py-0.5 text-[11px] text-[#8b93a0]">
                {locale === "ar" ? `درجة ${profile.classification_grade}` : `Grade ${profile.classification_grade}`}
              </span>
            </div>
            {profile.cr_number && (
              <p className="text-[11px] text-[#8b93a0]">
                {t("commercialRegistration")}: <span className="font-mono text-[#e8eaed]">{profile.cr_number}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded border border-[#1e2530] px-2.5 py-1 text-xs font-medium text-[#c9a84c] hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/10 transition-colors"
          >
            {t("editProfile")}
          </button>
        </div>

        {/* Quick capacity highlights */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-[#0f1117] p-2 border border-[#1e2530]">
            <span className="block text-[10px] text-[#8b93a0]">{t("preferredProjectValue")}</span>
            <span className="font-semibold text-[#e8eaed]">
              {profile.preferred_project_value_sar
                ? `${(profile.preferred_project_value_sar / 1000000).toFixed(1)}M ${t("currency")}`
                : "—"}
            </span>
          </div>
          <div className="rounded bg-[#0f1117] p-2 border border-[#1e2530]">
            <span className="block text-[10px] text-[#8b93a0]">{t("guaranteeCapability")}</span>
            <span className="font-semibold text-[#e8eaed]">
              {profile.guarantee_capability_sar
                ? `${(profile.guarantee_capability_sar / 1000000).toFixed(1)}M ${t("currency")}`
                : "—"}
            </span>
          </div>
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setExpandedDetails(!expandedDetails)}
          className="mt-3 flex w-full items-center justify-between py-1 text-[11px] text-[#8b93a0] hover:text-[#e8eaed]"
        >
          <span>{expandedDetails ? (locale === "ar" ? "إخفاء التفاصيل" : "Hide details") : (locale === "ar" ? "عرض تفاصيل القدرات" : "View capability details")}</span>
          {expandedDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expandedDetails && (
          <div className="mt-2 space-y-2 border-t border-[#1e2530] pt-2 text-xs">
            <div>
              <span className="text-[10px] text-[#8b93a0] block">{t("mainActivities")}</span>
              <p className="text-[#e8eaed]">
                {(profile.main_activities || []).join(", ") || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-[#8b93a0] block">{t("saudiRegions")}</span>
              <p className="text-[#e8eaed]">
                {(profile.saudi_regions || []).join(", ") || "—"}
              </p>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-[10px] text-[#8b93a0] block">{t("experienceYears")}</span>
                <span className="font-medium text-[#e8eaed]">{profile.experience_years ?? "—"} {locale === "ar" ? "سنوات" : "yrs"}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8b93a0] block">{t("manpowerCount")}</span>
                <span className="font-medium text-[#e8eaed]">{profile.manpower_count ?? "—"}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#8b93a0] block">{t("procurementInterests")}</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {profile.direct_tender_interest && (
                  <span className="rounded bg-[#1e2530] px-1.5 py-0.5 text-[10px] text-emerald-400">
                    {t("interestDirectTender")}
                  </span>
                )}
                {profile.subcontracting_interest && (
                  <span className="rounded bg-[#1e2530] px-1.5 py-0.5 text-[10px] text-cyan-400">
                    {t("interestSubcontracting")}
                  </span>
                )}
                {profile.vendor_registration_interest && (
                  <span className="rounded bg-[#1e2530] px-1.5 py-0.5 text-[10px] text-amber-400">
                    {t("interestVendorRegistration")}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit / Form Mode
  return (
    <div className="rounded-lg border border-[#1e2530] bg-[#161a22] p-4 text-start">
      <div className="mb-3 flex items-center justify-between border-b border-[#1e2530] pb-2">
        <h3 className="text-sm font-bold text-[#e8eaed]">{t("companyProfile")}</h3>
        <span className="rounded bg-[#c9a84c]/10 px-2 py-0.5 text-[10px] text-[#c9a84c]">
          {locale === "ar" ? "تأهيل المقاول" : "Contractor Qualification"}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex border-b border-[#1e2530] text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1 border-b-2 px-2.5 py-1.5 transition-colors ${
            activeTab === "general"
              ? "border-[#c9a84c] text-[#c9a84c] font-medium"
              : "border-transparent text-[#8b93a0] hover:text-[#e8eaed]"
          }`}
        >
          <Building size={13} />
          <span>{locale === "ar" ? "المنشأة والتصنيف" : "Profile & Size"}</span>
        </button>
        <button
          onClick={() => setActiveTab("scope")}
          className={`flex items-center gap-1 border-b-2 px-2.5 py-1.5 transition-colors ${
            activeTab === "scope"
              ? "border-[#c9a84c] text-[#c9a84c] font-medium"
              : "border-transparent text-[#8b93a0] hover:text-[#e8eaed]"
          }`}
        >
          <Briefcase size={13} />
          <span>{locale === "ar" ? "الأنشطة والمناطق" : "Activities & Regions"}</span>
        </button>
        <button
          onClick={() => setActiveTab("capacity")}
          className={`flex items-center gap-1 border-b-2 px-2.5 py-1.5 transition-colors ${
            activeTab === "capacity"
              ? "border-[#c9a84c] text-[#c9a84c] font-medium"
              : "border-transparent text-[#8b93a0] hover:text-[#e8eaed]"
          }`}
        >
          <Wrench size={13} />
          <span>{locale === "ar" ? "المعدات والكوادر" : "Capacity"}</span>
        </button>
        <button
          onClick={() => setActiveTab("financial")}
          className={`flex items-center gap-1 border-b-2 px-2.5 py-1.5 transition-colors ${
            activeTab === "financial"
              ? "border-[#c9a84c] text-[#c9a84c] font-medium"
              : "border-transparent text-[#8b93a0] hover:text-[#e8eaed]"
          }`}
        >
          <ShieldCheck size={13} />
          <span>{locale === "ar" ? "الضمان والاهتمامات" : "Financial"}</span>
        </button>
      </div>

      {/* Tab 1: General & Size */}
      {activeTab === "general" && (
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("companyName")}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("companyNameAr")}</label>
            <input
              type="text"
              value={form.name_ar}
              onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
              placeholder="مثال: شركة الفنار للمقاولات العامة"
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("commercialRegistration")}</label>
            <input
              type="text"
              value={form.cr_number}
              onChange={(e) => setForm((f) => ({ ...f, cr_number: e.target.value }))}
              placeholder="1010XXXXXX"
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm font-mono text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">
              {t("companySize")} <span className="text-[10px] text-[#c9a84c]">(Affects ranking, not eligibility)</span>
            </label>
            <select
              value={form.company_size}
              onChange={(e) => setForm((f) => ({ ...f, company_size: e.target.value as CompanySize }))}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed]"
            >
              {COMPANY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {locale === "ar" ? s.labelAr : s.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("classificationGrade")}</label>
            <select
              value={form.classification_grade}
              onChange={(e) => {
                const val = e.target.value === "Unclassified" ? "Unclassified" : (parseInt(e.target.value, 10) as ClassificationGrade);
                setForm((f) => ({ ...f, classification_grade: val }));
              }}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed]"
            >
              {CLASSIFICATION_GRADES.map((g) => (
                <option key={g.grade} value={g.grade}>
                  {locale === "ar" ? g.labelAr : g.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("contractorClassification")}</label>
            <select
              value={form.contractor_classification}
              onChange={(e) => setForm((f) => ({ ...f, contractor_classification: e.target.value }))}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed]"
            >
              {CONTRACTOR_CLASSIFICATIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {locale === "ar" ? c.labelAr : c.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tab 2: Scope & Regions */}
      {activeTab === "scope" && (
        <div className="space-y-3 text-xs">
          <div>
            <label className="mb-1 block text-[11px] text-[#8b93a0]">{t("mainActivities")}</label>
            <div className="max-h-36 overflow-y-auto space-y-1 rounded border border-[#1e2530] bg-[#0f1117] p-2">
              {SAUDI_WORK_CATEGORIES.map((cat) => {
                const isSelected = form.main_activities.includes(cat.nameEn);
                return (
                  <label key={cat.id} className="flex items-center gap-2 text-xs text-[#e8eaed] cursor-pointer hover:bg-[#161a22] p-1 rounded">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          main_activities: toggleArrayItem(f.main_activities, cat.nameEn),
                        }))
                      }
                      className="accent-[#c9a84c]"
                    />
                    <span>{locale === "ar" ? cat.nameAr : cat.nameEn}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#8b93a0]">{t("saudiRegions")}</label>
            <div className="max-h-32 overflow-y-auto space-y-1 rounded border border-[#1e2530] bg-[#0f1117] p-2">
              {SAUDI_REGIONS.map((reg) => {
                const isSelected = form.saudi_regions.includes(reg.nameEn);
                return (
                  <label key={reg.id} className="flex items-center gap-2 text-xs text-[#e8eaed] cursor-pointer hover:bg-[#161a22] p-1 rounded">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          saudi_regions: toggleArrayItem(f.saudi_regions, reg.nameEn),
                        }))
                      }
                      className="accent-[#c9a84c]"
                    />
                    <span>{locale === "ar" ? reg.nameAr : reg.nameEn}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("saudiCities")}</label>
            <input
              type="text"
              value={form.saudi_cities}
              onChange={(e) => setForm((f) => ({ ...f, saudi_cities: e.target.value }))}
              placeholder="Riyadh, Jeddah, Dammam, NEOM"
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("excludedProjectTypes")}</label>
            <input
              type="text"
              value={form.excluded_project_types}
              onChange={(e) => setForm((f) => ({ ...f, excluded_project_types: e.target.value }))}
              placeholder="e.g. Residential villas, Retail kiosks"
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Capacity & Equipment */}
      {activeTab === "capacity" && (
        <div className="space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("experienceYears")}</label>
              <input
                type="number"
                value={form.experience_years}
                onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value }))}
                className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("manpowerCount")}</label>
              <input
                type="number"
                value={form.manpower_count}
                onChange={(e) => setForm((f) => ({ ...f, manpower_count: e.target.value }))}
                className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#8b93a0]">{t("equipmentTags")}</label>
            <div className="max-h-36 overflow-y-auto space-y-1 rounded border border-[#1e2530] bg-[#0f1117] p-2">
              {COMMON_EQUIPMENT_TAGS.map((eq) => {
                const isSelected = form.equipment_tags.includes(eq.value);
                return (
                  <label key={eq.value} className="flex items-center gap-2 text-xs text-[#e8eaed] cursor-pointer hover:bg-[#161a22] p-1 rounded">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          equipment_tags: toggleArrayItem(f.equipment_tags, eq.value),
                        }))
                      }
                      className="accent-[#c9a84c]"
                    />
                    <span>{locale === "ar" ? eq.labelAr : eq.labelEn}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#8b93a0]">{t("certifications")}</label>
            <div className="max-h-36 overflow-y-auto space-y-1 rounded border border-[#1e2530] bg-[#0f1117] p-2">
              {COMMON_CERTIFICATIONS.map((cert) => {
                const isSelected = form.certifications.includes(cert.value);
                return (
                  <label key={cert.value} className="flex items-center gap-2 text-xs text-[#e8eaed] cursor-pointer hover:bg-[#161a22] p-1 rounded">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          certifications: toggleArrayItem(f.certifications, cert.value),
                        }))
                      }
                      className="accent-[#c9a84c]"
                    />
                    <span>{locale === "ar" ? cert.labelAr : cert.labelEn}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Financial & Interests */}
      {activeTab === "financial" && (
        <div className="space-y-3 text-xs">
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("preferredProjectValue")}</label>
            <input
              type="number"
              value={form.preferred_project_value_sar}
              onChange={(e) => setForm((f) => ({ ...f, preferred_project_value_sar: e.target.value }))}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("guaranteeCapability")}</label>
            <input
              type="number"
              value={form.guarantee_capability_sar}
              onChange={(e) => setForm((f) => ({ ...f, guarantee_capability_sar: e.target.value }))}
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[11px] text-[#8b93a0]">{t("comfortableProjectSize")}</label>
            <input
              type="text"
              value={form.comfortable_project_size}
              onChange={(e) => setForm((f) => ({ ...f, comfortable_project_size: e.target.value }))}
              placeholder="e.g. 10M - 50M SAR"
              className="w-full rounded-md border border-[#1e2530] bg-[#0f1117] px-3 py-1.5 text-sm text-[#e8eaed] outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <div className="rounded border border-[#1e2530] bg-[#0f1117] p-2 space-y-2">
            <span className="block text-[11px] font-semibold text-[#8b93a0]">{t("procurementInterests")}</span>
            <label className="flex items-center gap-2 text-xs text-[#e8eaed] cursor-pointer">
              <input
                type="checkbox"
                checked={form.direct_tender_interest}
                onChange={(e) => setForm((f) => ({ ...f, direct_tender_interest: e.target.checked }))}
                className="accent-[#c9a84c]"
              />
              <span>{t("interestDirectTender")}</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#e8eaed] cursor-pointer">
              <input
                type="checkbox"
                checked={form.subcontracting_interest}
                onChange={(e) => setForm((f) => ({ ...f, subcontracting_interest: e.target.checked }))}
                className="accent-[#c9a84c]"
              />
              <span>{t("interestSubcontracting")}</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#e8eaed] cursor-pointer">
              <input
                type="checkbox"
                checked={form.vendor_registration_interest}
                onChange={(e) => setForm((f) => ({ ...f, vendor_registration_interest: e.target.checked }))}
                className="accent-[#c9a84c]"
              />
              <span>{t("interestVendorRegistration")}</span>
            </label>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.name}
          className="rounded-md bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#0f1117] hover:bg-[#a07c34] disabled:opacity-50 transition-colors"
        >
          {saving ? t("saving") : t("saveProfile")}
        </button>
        {profile && (
          <button
            onClick={() => setShowForm(false)}
            className="rounded-md border border-[#1e2530] px-3 py-2 text-sm text-[#8b93a0] hover:text-[#e8eaed]"
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
