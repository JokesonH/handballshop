"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

export type NavChild = { href: string; label: string; code?: string };
export type NavItem = {
  href: string;
  label: string;
  code?: string;
  children?: NavChild[];
};

type Props = {
  locale: Locale;
  dict: Dictionary;
  brandName: string;
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

  const otherLocale: Locale = locale === "en" ? "fr" : "en";
  const swapHref =
    pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  return (
    <header className="sticky top-0 z-50 bg-bone/97 backdrop-blur-sm">
      {/* Ledger strip — reads like the header of a printed order form */}
      <div className="rule-b bg-ink text-bone">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-1.5">
          <p className="code-sm text-resin">
            10% · {dict.merch.fundBadge}
          </p>
          <p className="code-sm hidden text-bone/45 sm:block">
            SHIPPED EX-CANADA · CAD
          </p>
        </div>
      </div>

      {/* Masthead */}
      <div className="rule-b">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between gap-6 px-5 pb-3 pt-4">
          <Link href={`/${locale}`} className="group flex items-end gap-3">
            <span className="display-title text-4xl leading-none text-ink sm:text-5xl">
              {brandName}
            </span>
            <span className="code-sm mb-1 hidden text-graphite group-hover:text-resin-deep sm:block">
              EQUIP.&nbsp;CAT.
              <br />
              ED.&nbsp;01
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href={swapHref}
              hrefLang={otherLocale}
              onClick={closeMenus}
              className="code hidden text-graphite transition-colors hover:text-ink sm:block"
            >
              {dict.nav.language}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? dict.nav.close : dict.nav.menu}
              className="code border border-ink px-3 py-2 text-ink transition-colors hover:bg-ink hover:text-bone lg:hidden"
            >
              {mobileOpen ? dict.nav.close : dict.nav.menu}
            </button>
          </div>
        </div>
      </div>

      {/* Index row — desktop */}
      <nav className="rule-b hidden bg-paper lg:block">
        <div className="mx-auto flex max-w-[1400px] items-stretch px-5">
          {items.map((item, i) => {
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
                  onClick={closeMenus}
                  className={`code flex h-full items-center gap-1.5 whitespace-nowrap border-r border-rule px-4 py-3 transition-colors ${
                    active
                      ? "bg-ink text-bone"
                      : "text-ink-soft hover:bg-resin hover:text-ink"
                  } ${i === 0 ? "border-l border-rule" : ""}`}
                >
                  {item.code && (
                    <span className="opacity-45">{item.code}</span>
                  )}
                  {item.label}
                </Link>

                {item.children && openMenu === item.href && (
                  <div className="absolute left-0 top-full z-10 min-w-64 border border-ink bg-paper shadow-[4px_4px_0_var(--color-rule)]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMenus}
                        className="code flex items-center justify-between gap-4 border-b border-rule px-4 py-2.5 text-ink-soft transition-colors last:border-b-0 hover:bg-resin-wash hover:text-ink"
                      >
                        <span>{child.label}</span>
                        {child.code && (
                          <span className="text-graphite">{child.code}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile index */}
      {mobileOpen && (
        <div className="rule-b max-h-[calc(100vh-9rem)] overflow-y-auto bg-paper lg:hidden">
          <nav className="mx-auto max-w-[1400px] px-5 py-2">
            {items.map((item) => (
              <div key={item.href} className="rule-b py-3 last:border-b-0">
                <Link
                  href={item.href}
                  onClick={closeMenus}
                  className="display-title flex items-baseline gap-2 text-2xl text-ink"
                >
                  {item.code && (
                    <span className="code text-graphite">{item.code}</span>
                  )}
                  {item.label}
                </Link>
                {item.children && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMenus}
                        className="code text-ink-soft"
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
              className="code mt-4 inline-block text-resin-deep"
            >
              {dict.nav.language}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
