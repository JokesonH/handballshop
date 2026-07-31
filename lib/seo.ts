import type { Metadata } from "next";
import { locales } from "@/lib/locales";

/**
 * Per-page hreflang cluster + canonical.
 *
 * `path` is the locale-less route ("" for home, "/resin/resin-wax" for a
 * subcategory). Every page must declare the *equivalent* page in the other
 * locale — declaring the homepage instead (the default if you set
 * alternates once in the layout) tells Google that /en/resin's French
 * counterpart is /fr, which is a broken cluster and gets the pair ignored.
 */
export function alternates(path: string): Metadata["alternates"] {
  const clean = path && !path.startsWith("/") ? `/${path}` : path;
  return {
    languages: Object.fromEntries(
      locales.map((locale) => [locale, `/${locale}${clean}`])
    ),
  };
}
