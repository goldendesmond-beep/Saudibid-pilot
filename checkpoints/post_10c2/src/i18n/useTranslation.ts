import { useLocaleStore } from "../store/localeStore";

export function useTranslation() {
  const { locale, direction, setLocale, toggleLocale, t } = useLocaleStore();
  const isRTL = direction === "rtl" || locale === "ar";

  return {
    locale,
    direction,
    isRTL,
    setLocale,
    toggleLocale,
    t,
  };
}
