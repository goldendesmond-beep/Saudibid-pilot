import { create } from "zustand";

interface UiState {
  isMobileNavOpen: boolean;
  isMobileFilterOpen: boolean;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
  closeMobileNav: () => void;
  toggleMobileFilter: () => void;
  setMobileFilterOpen: (open: boolean) => void;
  closeMobileFilter: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileNavOpen: false,
  isMobileFilterOpen: false,
  toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileFilter: () => set((s) => ({ isMobileFilterOpen: !s.isMobileFilterOpen })),
  setMobileFilterOpen: (open) => set({ isMobileFilterOpen: open }),
  closeMobileFilter: () => set({ isMobileFilterOpen: false }),
}));
