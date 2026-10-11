import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useLocaleStore } from "../../store/localeStore";
import { useUiStore } from "../../store/uiStore";
import { useCompanyStore } from "../../store/companyStore";

export function AppShell() {
  const location = useLocation();
  const { direction, locale } = useLocaleStore();
  const { isMobileNavOpen, closeMobileNav } = useUiStore();
  const fetchCurrentCompany = useCompanyStore((s) => s.fetchCurrentCompany);

  useEffect(() => {
    fetchCurrentCompany();
  }, [fetchCurrentCompany]);

  // Close mobile nav on route change
  useEffect(() => {
    closeMobileNav();
  }, [location.pathname, closeMobileNav]);

  return (
    <div
      dir={direction}
      lang={locale}
      className={`flex h-screen flex-col bg-[#0f1117] text-[#e8eaed] ${
        locale === "ar" ? "font-sans selection:bg-[#c9a84c]/30" : "font-sans"
      }`}
    >
      <Header />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden md:flex md:w-56 shrink-0 h-full">
          <Sidebar />
        </aside>

        {/* Mobile Slide-Over Drawer Navigation */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileNav}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: direction === "rtl" ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: direction === "rtl" ? "100%" : "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 start-0 z-50 w-64 max-w-[80vw] bg-[#161a22] shadow-2xl md:hidden"
              >
                <Sidebar isMobileDrawer onClose={closeMobileNav} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area - Full width on mobile, fluid on desktop */}
        <main className="flex-1 w-full min-w-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full min-w-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
