import Link from "next/link";
import type { Category, SiteConfig } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

type Props = {
  locale: Locale;
  dict: Dictionary;
  site: SiteConfig;
  categories: Category[];
};

export default function Footer({ locale, dict, site, categories }: Props) {
  const help: { href: string; label: string }[] = [
    { href: `/${locale}/shipping`, label: dict.footer.shipping },
    { href: `/${locale}/returns`, label: dict.footer.returns },
    { href: `/${locale}/warranty`, label: dict.footer.warranty },
    { href: `/${locale}/guides`, label: dict.footer.sizeGuides },
    { href: `/${locale}/faq`, label: dict.footer.faq },
  ];

  const company: { href: string; label: string }[] = [
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/fund`, label: dict.nav.fund },
    { href: `/${locale}/clubs`, label: dict.nav.clubs },
    { href: `/${locale}/contact`, label: dict.nav.contact },
    { href: `/${locale}/privacy`, label: dict.footer.privacy },
    { href: `/${locale}/terms`, label: dict.footer.terms },
  ];

  return (
    <footer className="mt-24 bg-nc-court-deep text-nc-paper">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="display-title text-2xl">{site.brandName}</p>
            <p className="mt-3 max-w-xs text-sm text-nc-paper/70">
              {dict.meta.tagline}
            </p>
            <p className="kicker mt-6 text-nc-resin">{dict.footer.builtIn}</p>
          </div>

          <div>
            <p className="kicker text-nc-paper/50">{dict.footer.shop}</p>
            <ul className="mt-4 space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/${locale}/${category.slug}`}
                    className="text-sm text-nc-paper/80 transition-colors hover:text-nc-resin"
                  >
                    {category.name[locale]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/${locale}/merch`}
                  className="text-sm text-nc-paper/80 transition-colors hover:text-nc-resin"
                >
                  {dict.nav.merch}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="kicker text-nc-paper/50">{dict.footer.help}</p>
            <ul className="mt-4 space-y-2">
              {help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-nc-paper/80 transition-colors hover:text-nc-resin"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="kicker text-nc-paper/50">{dict.footer.company}</p>
            <ul className="mt-4 space-y-2">
              {company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-nc-paper/80 transition-colors hover:text-nc-resin"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-nc-paper/15 pt-6">
          {/*
            Independence disclaimer. This stays on every page for as long as
            the Fund is an unaffiliated initiative — it is what keeps "10% to
            Canadian handball" from reading as a federation endorsement.
          */}
          <p className="max-w-3xl text-xs leading-relaxed text-nc-paper/50">
            {dict.footer.disclaimer}
          </p>
          <p className="mt-3 text-xs text-nc-paper/40">
            © {new Date().getFullYear()} {site.brandName}.{" "}
            {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
