import type en from "@/dictionaries/en.json";
import type { Locale } from "@/lib/locales";

export { locales, defaultLocale, isLocale, type Locale } from "@/lib/locales";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  fr: () =>
    import("@/dictionaries/fr.json").then((m) => m.default as Dictionary),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
