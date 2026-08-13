import Link from "next/link";
import type { ContentPage } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

/**
 * Shared layout for the static prose pages. Content lives in
 * content/pages/<slug>.json so it stays bilingual and CMS-editable rather
 * than being buried in JSX.
 */
export default function ProsePage({
  page,
  dict,
  locale,
  children,
}: {
  page: ContentPage;
  dict: Dictionary;
  locale: Locale;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <nav aria-label="Breadcrumb" className="code text-graphite">
        <Link href={`/${locale}`} className="hover:text-ink">
          {dict.nav.shop}
        </Link>
        <span className="mx-2">/</span>
        <span>{page.title[locale]}</span>
      </nav>

      <header className="mt-6 max-w-3xl border-b border-rule pb-8">
        <h1 className="display text-4xl uppercase leading-none sm:text-6xl">
          {page.title[locale]}
        </h1>
        <p className="mt-3 text-lg text-graphite">{page.intro[locale]}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-9">
          {page.sections.map((section) => (
            <section key={section.heading.en}>
              <h2 className="display text-xl uppercase leading-none sm:text-2xl">
                {section.heading[locale]}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body[locale].map((paragraph, i) => (
                  <p key={i} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
        {children ? <aside className="lg:pt-1">{children}</aside> : null}
      </div>
    </div>
  );
}
