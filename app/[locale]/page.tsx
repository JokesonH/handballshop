import Link from "next/link";
import { notFound } from "next/navigation";
import CourtDrawing from "@/components/CourtDrawing";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import {
  categoryCode,
  getCategories,
  getFeaturedProducts,
  getSite,
} from "@/lib/catalog";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const dict = await getDictionary(typed);
  const site = getSite();
  const categories = getCategories();
  const featured = getFeaturedProducts(4);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="rule-b relative grain overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] items-center gap-8 px-5 py-14 lg:grid-cols-[1fr_1.05fr] lg:py-20">
          <div className="relative z-[2]">
            <p
              className="code rise-in text-resin-deep"
              style={{ animationDelay: "60ms" }}
            >
              {dict.home.heroKicker} — ED. 01
            </p>
            <h1
              className="display-title rise-in mt-5 text-[clamp(2.75rem,8vw,5.75rem)] text-ink"
              style={{ animationDelay: "140ms" }}
            >
              {dict.home.heroTitle}
            </h1>
            <p
              className="rise-in mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-ink-soft"
              style={{ animationDelay: "220ms" }}
            >
              {dict.home.heroBody}
            </p>

            <div
              className="rise-in mt-9 flex flex-wrap gap-3"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                href={`/${locale}/tops`}
                className="code border border-ink bg-resin px-7 py-4 text-ink shadow-[3px_3px_0_var(--color-ink)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-ink)]"
              >
                {dict.home.heroCta} →
              </Link>
              <Link
                href={`/${locale}/about`}
                className="code border border-ink px-7 py-4 text-ink transition-colors hover:bg-ink hover:text-bone"
              >
                {dict.home.heroCtaSecondary}
              </Link>
            </div>
          </div>

          {/* Fig. 1 */}
          <div className="relative">
            <CourtDrawing className="w-full text-ink" />
          </div>
        </div>
      </section>

      {/* ================= INDEX ================= */}
      <section className="rule-b bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 py-14">
          <div className="rule-b flex items-baseline justify-between gap-4 pb-3">
            <h2 className="display-title text-2xl text-ink">
              {dict.home.shopByCategory}
            </h2>
            <span className="marginalia">
              {categories.length} SECTIONS
            </span>
          </div>

          {/* Catalogue index — a list, not a card grid. Denser, and it
              actually tells you what's inside each section. */}
          <ul>
            {categories.map((category, i) => (
              <li key={category.slug}>
                <Link
                  href={`/${locale}/${category.slug}`}
                  className="reveal group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 border-b border-rule py-5 transition-colors hover:bg-resin-wash md:grid-cols-[auto_minmax(0,20rem)_1fr_auto]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="code text-graphite group-hover:text-resin-deep">
                    {categoryCode(category)}
                  </span>
                  <span className="display-title text-2xl text-ink md:text-[1.75rem]">
                    {category.name[typed]}
                  </span>
                  <span className="col-span-2 text-sm leading-relaxed text-ink-soft md:col-span-1 md:pl-6">
                    {category.tagline[typed]}
                  </span>
                  <span className="code hidden text-graphite md:block">
                    {String(category.children.length).padStart(2, "0")} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= THE GAP ================= */}
      <section className="rule-b relative grain bg-ink text-bone">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 lg:grid-cols-[auto_1fr] lg:gap-16">
          <p className="marginalia text-bone/40">§ NOTE</p>
          <div className="max-w-3xl">
            <h2 className="display-title text-[clamp(2rem,5vw,3.5rem)] text-bone">
              {dict.home.gapTitle}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-bone/70">
              {dict.home.gapBody}
            </p>
            <Link
              href={`/${locale}/tops`}
              className="code mt-8 inline-block border-b-2 border-resin pb-1 text-resin transition-colors hover:text-bone"
            >
              {dict.home.gapCta} →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      {featured.length > 0 && (
        <section className="rule-b">
          <div className="mx-auto max-w-[1400px] px-5 py-14">
            <div className="rule-b flex items-baseline justify-between gap-4 pb-3">
              <h2 className="display-title text-2xl text-ink">
                {dict.home.featuredTitle}
              </h2>
              <span className="marginalia">FIG. 1—{featured.length}</span>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  dict={dict}
                  locale={typed}
                />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ================= LIST ================= */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="display-title text-3xl text-ink">
            {dict.home.newsletterTitle}
          </h2>
          <p className="mt-3 text-ink-soft">{dict.home.newsletterBody}</p>
          <div className="mt-8 text-left">
            <LeadForm
              compact
              formId={site.forms.newsletter}
              subject="Launch list signup"
              fields={[
                {
                  name: "email",
                  label: dict.status.notifyPlaceholder,
                  type: "email",
                  required: true,
                },
              ]}
              submitLabel={dict.home.newsletterCta}
              sentLabel={dict.clubs.formSent}
              errorLabel={dict.clubs.formError}
            />
          </div>
        </div>
      </section>
    </>
  );
}
