import { Building2, Globe, Menu, X } from "lucide-react";
import { useCompanyStore } from "../../store/companyStore";
import { useLocaleStore } from "../../store/localeStore";
import { useUiStore } from "../../store/uiStore";

export function Header() {
  const profile = useCompanyStore((s) => s.profile);
  const { locale, toggleLocale, t } = useLocaleStore();
  const { isMobileNavOpen, toggleMobileNav } = useUiStore();

  const displayName = locale === "ar" && profile?.name_ar ? profile.name_ar : (profile?.name ?? "Al-Fanar Co.");

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

      {/* Right Controls: Contractor Identity + Language Toggle */}
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

        {/* Selected Contractor Badge */}
        <div className="flex items-center gap-1.5 md:gap-2 rounded-md border border-[#1e2530] bg-[#0f1117] px-2 md:px-3 py-1 md:py-1.5 text-xs text-[#8b93a0]">
          <Building2 size={13} className="text-[#c9a84c] shrink-0" />
          <div className="flex flex-col text-start max-w-[90px] sm:max-w-[140px] md:max-w-[180px]">
            <span className="truncate font-medium text-[#e8eaed] text-[11px] md:text-xs">
              {displayName}
            </span>
            {profile && (
              <div className="hidden sm:flex items-center gap-1 text-[9px] md:text-[10px] text-[#8b93a0]">
                <span className="text-[#c9a84c] font-semibold">{profile.company_size || "Medium"}</span>
                <span>·</span>
                <span>
                  {profile.classification_grade
                    ? `${locale === "ar" ? "درجة" : "G"}${profile.classification_grade}`
                    : "Uncl"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
