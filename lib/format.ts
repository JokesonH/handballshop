import type { Locale } from "@/lib/locales";

/** Canadian dollars. Products with no price yet pass null. */
export function formatPrice(cents: number | null, locale: Locale): string | null {
  if (cents === null) return null;
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function formatDate(date: string, locale: Locale): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(
    locale === "fr" ? "fr-CA" : "en-CA",
    { year: "numeric", month: "long", day: "numeric" }
  );
}
