import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/lib/locales";

function detectLocale(request: NextRequest): string {
  // Allow ?lang=fr / ?lang=fr-CA to force a locale from campaign links.
  const langParam = request.nextUrl.searchParams.get("lang");
  if (langParam) {
    return langParam.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  const header = request.headers.get("accept-language") ?? "";
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("fr")) return "fr";
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${detectLocale(request)}${pathname === "/" ? "" : pathname}`;
  url.searchParams.delete("lang");
  return NextResponse.redirect(url);
}

export const config = {
  // Skip static assets, API routes and files with extensions
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
