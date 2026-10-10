import {
  BarChart3,
  BriefcaseBusiness,
  Compass,
  Calendar,
  Bookmark,
  ShieldCheck,
  Award,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocaleStore } from "../../store/localeStore";

interface SidebarProps {
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export function Sidebar({ onClose, isMobileDrawer }: SidebarProps) {
  const { t, direction, locale } = useLocaleStore();

  const links = [
    { to: "/", label: locale === "ar" ? "مستكشف الفرص" : "Opportunity Explorer", icon: Compass },
    { to: "/monitoring", label: locale === "ar" ? "المراقبة اليومية و PDF" : "Daily Monitoring & PDF", icon: Calendar },
    { to: "/awards", label: locale === "ar" ? "تتبع الترسيات" : "Award Tracking", icon: Award },
    { to: "/subcontract-radar", label: locale === "ar" ? "رادار مقاولي الباطن" : "Subcontract Radar", icon: Layers },
    { to: "/vendor-registration", label: locale === "ar" ? "تأهيل الموردين و BD" : "Vendor Registration & BD", icon: FileCheck2 },
    { to: "/proposals", label: locale === "ar" ? "عروض الأسعار و BOQ" : "Proposals & BOQ", icon: FileSpreadsheet },
    { to: "/saved-lists", label: locale === "ar" ? "القوائم المحفوظة" : "Saved Lists", icon: Bookmark },
    { to: "/source-health", label: locale === "ar" ? "صحة وحالة المصادر" : "Source Health", icon: ShieldCheck },
    { to: "/workspace", label: t("navWorkspace"), icon: BriefcaseBusiness },
    { to: "/analytics", label: t("navAnalytics"), icon: BarChart3 },
  ];

  return (
    <nav
      className={`flex h-full w-full flex-col bg-[#161a22] px-3 py-4 md:py-6 ${
        !isMobileDrawer
          ? direction === "rtl"
            ? "border-l border-[#1e2530]"
            : "border-r border-[#1e2530]"
          : ""
      }`}
    >
      {/* Mobile drawer header with close button */}
      {isMobileDrawer && (
        <div className="mb-4 flex items-center justify-between border-b border-[#1e2530] pb-3 px-1">
          <span className="text-xs font-bold text-[#e8eaed]">
            {locale === "ar" ? "قائمة التنقل" : "Navigation"}
          </span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1e2530] text-[#8b93a0] hover:text-[#e8eaed]"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="mb-3 px-2 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-[#8b93a0]">
        {direction === "rtl" ? "الأقسام الرئيسية" : "Main Sections"}
      </div>

      <div className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#c9a84c]/15 text-[#c9a84c]"
                  : "text-[#8b93a0] hover:bg-[#1e2530] hover:text-[#e8eaed]"
              }`
            }
          >
            <Icon size={17} className="shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
