import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, type Locale, type Direction, type TranslationKey } from "../i18n/translations";

interface LocaleState {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "en",
      direction: "ltr",

      setLocale: (locale: Locale) => {
        const direction: Direction = locale === "ar" ? "rtl" : "ltr";
        if (typeof document !== "undefined") {
          document.documentElement.dir = direction;
          document.documentElement.lang = locale;
        }
        set({ locale, direction });
      },

      toggleLocale: () => {
        const current = get().locale;
        const next: Locale = current === "ar" ? "en" : "ar";
        get().setLocale(next);
      },

      t: (key: TranslationKey) => {
        const currentLocale = get().locale;
        const dict = translations[currentLocale] || translations.en;
        return dict[key] || translations.en[key] || key;
      },
    }),
    {
      name: "tender-saudi-locale",
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.documentElement.dir = state.direction;
          document.documentElement.lang = state.locale;
        }
      },
    },
  ),
);
