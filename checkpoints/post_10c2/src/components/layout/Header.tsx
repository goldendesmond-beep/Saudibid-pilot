import { useState, useRef, useEffect } from "react";
import { Building2, Globe, Menu, X, ChevronDown, Check, Plus, AlertCircle } from "lucide-react";
import { useCompanyStore } from "../../store/companyStore";
import { useLocaleStore } from "../../store/localeStore";
import { useUiStore } from "../../store/uiStore";
import { companiesApi } from "../../api/companies";

export function Header() {
  const { profile, organizations, switchOrganization, fetchOrganizations, setCompany } = useCompanyStore();
  const { locale, toggleLocale, t } = useLocaleStore();
  const { isMobileNavOpen, toggleMobileNav } = useUiStore();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [newOrgNameEn, setNewOrgNameEn] = useState("");
  const [newOrgNameAr, setNewOrgNameAr] = useState("");
  const [newOrgSize, setNewOrgSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [newOrgActivities, setNewOrgActivities] = useState("Hospitality & Facilities Management");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOrg = async (orgId: string) => {
    await switchOrganization(orgId);
    setIsOrgDropdownOpen(false);
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgNameEn.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await companiesApi.create({
        name: newOrgNameEn.trim(),
        name_ar: newOrgNameAr.trim() || newOrgNameEn.trim(),
        company_size: newOrgSize,
        main_activities: [newOrgActivities],
        contractor_classification: newOrgActivities,
        classification_grade: 2,
        saudi_regions: ["Riyadh Region"],
        saudi_cities: ["Riyadh"],
      });
      setCompany(created);
      setIsAddOrgModalOpen(false);
      setNewOrgNameEn("");
      setNewOrgNameAr("");
      fetchOrganizations();
    } catch (err) {
      console.error("Failed to create organization:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = profile
    ? (locale === "ar" && profile.name_ar ? profile.name_ar : profile.name)
    : null;

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-[#1e2530] bg-[#161a22] px-3 md:px-6 z-30 shrink-0">
      {/* Left: Mobile Nav Toggle + Brand Logo & Title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={toggleMobileNav}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#1e2530] bg-[#0f1117] text-[#8b93a0] hover:text-[#e8eaed] md:hidden"
          aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
        >
          {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/bidpilot-logo.svg"
            alt="Tender Intelligence"
            className="h-7 md:h-8 w-auto shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm md:text-base font-bold tracking-tight text-[#f5f6f8]">
                {locale === "ar" ? "ذكاء المناقصات" : "Tender Intel"}
              </span>
              <span className="hidden sm:inline-block rounded bg-[#c9a84c]/20 px-1.5 py-0.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                KSA
              </span>
            </div>
            <span className="hidden lg:block text-[11px] text-[#8b93a0]">
              {t("tagline")}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Active Organization Selector + Language Toggle */}
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1 rounded-md border border-[#1e2530] bg-[#0f1117] px-2 md:px-2.5 py-1 md:py-1.5 text-xs font-semibold text-[#c9a84c] hover:border-[#c9a84c]/50 transition-colors"
          title={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
        >
          <Globe size={13} className="shrink-0" />
          <span>{locale === "ar" ? "EN" : "عربي"}</span>
        </button>

        {/* ACTIVE ORGANIZATION SELECTOR */}
        <div className="relative" ref={dropdownRef}>
          {profile ? (
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-1.5 md:gap-2 rounded-md border border-[#1e2530] bg-[#0f1117] hover:border-[#c9a84c]/50 px-2 md:px-3 py-1 md:py-1.5 text-xs text-[#8b93a0] transition-colors cursor-pointer text-start"
              title={locale === "ar" ? "تغيير المنشأة النشطة" : "Switch Active Organization"}
              aria-label="Active Organization Selector"
            >
              <Building2 size={13} className="text-[#c9a84c] shrink-0" />
              <div className="flex flex-col text-start max-w-[110px] sm:max-w-[170px] md:max-w-[210px]">
                <span className="truncate font-medium text-[#e8eaed] text-[11px] md:text-xs">
                  {displayName}
                </span>
                <div className="hidden sm:flex items-center gap-1 text-[9px] md:text-[10px] text-[#8b93a0]">
                  <span className="text-[#c9a84c] font-semibold">{profile.company_size || "Medium"}</span>
                  <span>·</span>
                  <span>
                    {profile.classification_grade
                      ? `${locale === "ar" ? "درجة" : "G"}${profile.classification_grade}`
                      : "Uncl"}
                  </span>
                </div>
              </div>
              <ChevronDown size={12} className={`text-[#8b93a0] transition-transform ${isOrgDropdownOpen ? "rotate-180" : ""}`} />
            </button>
          ) : (
            <button
              onClick={() => setIsAddOrgModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <AlertCircle size={13} />
              <span>{locale === "ar" ? "لم يتم تكوين منشأة / إضافة منشأة" : "NO ORGANIZATION CONFIGURED / ADD ORGANIZATION"}</span>
            </button>
          )}

          {/* Organization Dropdown Menu */}
          {isOrgDropdownOpen && (
            <div className={`absolute ${locale === "ar" ? "left-0" : "right-0"} mt-1.5 w-72 sm:w-80 rounded-lg border border-[#1e2530] bg-[#161a22] shadow-xl z-50 overflow-hidden text-start`}>
              <div className="px-3 py-2 border-b border-[#1e2530] bg-[#0f1117] flex items-center justify-between text-[11px] font-bold text-[#8b93a0]">
                <span>{locale === "ar" ? "المنشأة النشطة (Organization)" : "Active Organization"}</span>
                <span className="text-[#c9a84c] font-mono">{organizations.length}</span>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-[#1e2530]">
                {organizations.map((org) => {
                  const isActive = org.id === profile?.id;
                  const orgLabel = locale === "ar" && org.name_ar ? org.name_ar : org.name;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSelectOrg(org.id)}
                      className={`w-full text-start p-2.5 flex items-start justify-between gap-2 transition-colors hover:bg-[#1a202c] ${
                        isActive ? "bg-[#c9a84c]/10" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold truncate ${isActive ? "text-[#c9a84c]" : "text-[#e8eaed]"}`}>
                            {orgLabel}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8b93a0] flex items-center gap-1 mt-0.5">
                          <span className="text-[#c9a84c]">{org.company_size || "Medium"}</span>
                          <span>·</span>
                          <span>{org.classification_grade ? `Grade ${org.classification_grade}` : "Unclassified"}</span>
                          {org.cr_number && (
                            <>
                              <span>·</span>
                              <span className="font-mono">CR: {org.cr_number}</span>
                            </>
                          )}
                        </div>
                        {org.main_activities?.[0] && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {org.main_activities[0]}
                          </div>
                        )}
                      </div>
                      {isActive && <Check size={14} className="text-[#c9a84c] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Add Organization Button */}
              <div className="p-2 border-t border-[#1e2530] bg-[#0f1117]">
                <button
                  onClick={() => {
                    setIsOrgDropdownOpen(false);
                    setIsAddOrgModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#1e2530] hover:bg-[#283242] text-xs font-semibold text-[#c9a84c] transition-colors"
                >
                  <Plus size={13} />
                  <span>{locale === "ar" ? "إضافة منشأة جديدة" : "Add New Organization"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Organization */}
      {isAddOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e2530] bg-[#161a22] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2530]">
              <h3 className="text-sm font-bold text-[#e8eaed] flex items-center gap-2">
                <Building2 size={16} className="text-[#c9a84c]" />
                <span>{locale === "ar" ? "إضافة منشأة مقاولات جديدة" : "Add New Organization"}</span>
              </h3>
              <button
                onClick={() => setIsAddOrgModalOpen(false)}
                className="text-[#8b93a0] hover:text-[#e8eaed]"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {locale === "ar" ? "اسم الشركة بالإنجليزية:" : "Organization Name (English):"}
                </label>
                <input
                  type="text"
                  value={newOrgNameEn}
                  onChange={(e) => setNewOrgNameEn(e.target.value)}
                  placeholder="e.g. Al-Diyafa Hospitality Services"
                  required
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                />
              </div>

              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {locale === "ar" ? "اسم الشركة بالعربية:" : "Organization Name (Arabic):"}
                </label>
                <input
                  type="text"
                  value={newOrgNameAr}
                  onChange={(e) => setNewOrgNameAr(e.target.value)}
                  placeholder="مثال: شركة الضيافة لخدمات التشغيل الفندقي"
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8b93a0] mb-1 font-medium">
                    {locale === "ar" ? "حجم المنشأة:" : "Company Size:"}
                  </label>
                  <select
                    value={newOrgSize}
                    onChange={(e) => setNewOrgSize(e.target.value as "Small" | "Medium" | "Large")}
                    className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                  >
                    <option value="Small">Small (صغيرة)</option>
                    <option value="Medium">Medium (متوسطة)</option>
                    <option value="Large">Large (كبيرة)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8b93a0] mb-1 font-medium">
                    {locale === "ar" ? "النشاط الرئيسي:" : "Primary Activity:"}
                  </label>
                  <select
                    value={newOrgActivities}
                    onChange={(e) => setNewOrgActivities(e.target.value)}
                    className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                  >
                    <option value="Hospitality & Facilities Management">Hospitality & Facilities</option>
                    <option value="Technical Manpower & Staffing">Technical Manpower</option>
                    <option value="Roads, Bridges & Civil Infrastructure">Civil & Infrastructure</option>
                    <option value="Building Construction & Fit-out">Building & Fit-out</option>
                    <option value="Catering & Food Supply Services">Catering & Food Supply</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2530]">
                <button
                  type="button"
                  onClick={() => setIsAddOrgModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#8b93a0] hover:text-[#e8eaed]"
                >
                  {locale === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-[#c9a84c] text-black font-semibold text-xs hover:bg-[#c9a84c]/90 transition-colors"
                >
                  {isSubmitting ? (locale === "ar" ? "جاري الإنشاء..." : "Creating...") : (locale === "ar" ? "إنشاء وتفعيل المنشأة" : "Create & Activate")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
