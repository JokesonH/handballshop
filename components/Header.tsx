"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

export type NavChild = { href: string; label: string };
export type NavItem = { href: string; label: string; children?: NavChild[] };

type Props = {
  locale: Locale;
  dict: Dictionary;
  brandName: string;
  /** Built from content/categories.json — see app/[locale]/layout.tsx */
  categoryNav: NavItem[];
};

export default function Header({
  locale,
  dict,
  brandName,
  categoryNav,
}: Props) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Menus close on the click that navigates — see closeMenus below. Doing it
  // in an effect keyed on pathname would cascade an extra render.
  function closeMenus() {
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const items: NavItem[] = [
    ...categoryNav,
    { href: `/${locale}/merch`, label: dict.nav.merch },
    { href: `/${locale}/fund`, label: dict.nav.fund },
    { href: `/${locale}/clubs`, label: dict.nav.clubs },
  ];

  // Swap locale while keeping the reader on the same page
  const otherLocale: Locale = locale === "en" ? "fr" : "en";
  const swapHref = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  return (
    <header className="sticky top-0 z-50 border-b border-nc-line bg-nc-paper/95 backdrop-blur">
      {/* Announcement bar — the Fund promise, on every page */}
      <div className="bg-nc-court text-nc-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center">
          <span className="kicker text-nc-resin">10%</span>
          <span className="text-xs text-nc-paper/85">
            {dict.merch.fundBadge}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <Link
          href={`/${locale}`}
          className="display-title shrink-0 text-2xl text-nc-court"
        >
          {brandName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.href)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  className={`block whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-nc-court"
                      : "text-nc-slate hover:text-nc-court"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && openMenu === item.href && (
                  <div className="absolute left-0 top-full min-w-56 border border-nc-line bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm text-nc-slate transition-colors hover:bg-nc-shell hover:text-nc-court"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            href={swapHref}
            hrefLang={otherLocale}
            className="hidden text-xs font-semibold uppercase tracking-wider text-nc-slate transition-colors hover:text-nc-court sm:block"
          >
            {dict.nav.language}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? dict.nav.close : dict.nav.menu}
            className="kicker border border-nc-court px-3 py-2 text-nc-court lg:hidden"
          >
            {mobileOpen ? dict.nav.close : dict.nav.menu}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-nc-line bg-nc-paper lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            {items.map((item) => (
              <div key={item.href} className="border-b border-nc-line py-3">
                <Link
                  href={item.href}
                  onClick={closeMenus}
                  className="display-title block text-lg text-nc-court"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMenus}
                        className="text-sm text-nc-slate"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href={swapHref}
              hrefLang={otherLocale}
              onClick={closeMenus}
              className="kicker mt-4 inline-block text-nc-court"
            >
              {dict.nav.language}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
