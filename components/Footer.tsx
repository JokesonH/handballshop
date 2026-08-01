import Link from "next/link";
import Mark from "@/components/Mark";
import { categoryCode, type Category, type SiteConfig } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

type Props = {
  locale: Locale;
  dict: Dictionary;
  site: SiteConfig;
  categories: Category[];
};

export default function Footer({ locale, dict, site, categories }: Props) {
  const help = [
    { href: `/${locale}/shipping`, label: dict.footer.shipping },
    { href: `/${locale}/returns`, label: dict.footer.returns },
    { href: `/${locale}/warranty`, label: dict.footer.warranty },
    { href: `/${locale}/guides`, label: dict.footer.sizeGuides },
    { href: `/${locale}/faq`, label: dict.footer.faq },
  ];

  const company = [
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/fund`, label: dict.nav.fund },
    { href: `/${locale}/clubs`, label: dict.nav.clubs },
    { href: `/${locale}/contact`, label: dict.nav.contact },
    { href: `/${locale}/privacy`, label: dict.footer.privacy },
    { href: `/${locale}/terms`, label: dict.footer.terms },
  ];

  return (
    <footer className="relative grain bg-ink text-bone">
      {/* Court sideline as the top edge */}
      <div className="court-line opacity-30" />

      <div className="mx-auto max-w-[1400px] px-5 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Mark className="h-9 w-9" />
              <p className="display-title text-4xl text-bone">
                {site.brandName}
              </p>
            </div>
            <p className="code-sm mt-3 text-court">{dict.meta.tagline}</p>
          </div>

          <div>
            <p className="code text-bone/35">{dict.footer.shop}</p>
            <ul className="mt-4 space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/${locale}/${category.slug}`}
                    className="group flex items-baseline gap-2 text-sm text-bone/75 transition-colors hover:text-resin"
                  >
                    <span className="code-sm text-bone/30 group-hover:text-resin">
                      {categoryCode(category)}
                    </span>
                    {category.name[locale]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/${locale}/merch`}
                  className="text-sm text-bone/75 transition-colors hover:text-resin"
                >
                  {dict.nav.merch}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="code text-bone/35">{dict.footer.help}</p>
            <ul className="mt-4 space-y-2">
              {help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/75 transition-colors hover:text-resin"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="code text-bone/35">{dict.footer.company}</p>
            <ul className="mt-4 space-y-2">
              {company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/75 transition-colors hover:text-resin"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-bone/15 pt-6">
          {/*
            Independence disclaimer. Stays on every page for as long as the
            Fund is an unaffiliated initiative — it is what keeps "10% to
            Canadian handball" from reading as a federation endorsement.
          */}
          <p className="code-sm max-w-3xl leading-relaxed text-bone/40">
            {dict.footer.disclaimer}
          </p>
          <p className="code-sm mt-3 text-bone/30">
            © {new Date().getFullYear()} {site.brandName} · {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
