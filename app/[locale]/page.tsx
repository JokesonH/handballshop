import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { getCategories, getFeaturedProducts, getSite } from "@/lib/catalog";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

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
      {/* ---------------- Hero ---------------- */}
      <section className="border-b border-nc-line bg-nc-court text-nc-paper">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <p className="kicker rise-in text-nc-resin">{dict.home.heroKicker}</p>
          <h1
            className="display-title rise-in mt-4 max-w-4xl text-4xl sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            {dict.home.heroTitle}
          </h1>
          <p
            className="rise-in mt-6 max-w-2xl text-lg leading-relaxed text-nc-paper/75"
            style={{ animationDelay: "160ms" }}
          >
            {dict.home.heroBody}
          </p>
          <div
            className="rise-in mt-10 flex flex-wrap gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href={`/${locale}/${categories[0]?.slug ?? "shoes"}`}
              className="kicker bg-nc-resin px-7 py-4 text-nc-court-deep transition-colors hover:bg-nc-paper"
            >
              {dict.home.heroCta}
            </Link>
            <Link
              href={`/${locale}/fund`}
              className="kicker border border-nc-paper/40 px-7 py-4 text-nc-paper transition-colors hover:border-nc-resin hover:text-nc-resin"
            >
              {dict.home.heroCtaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading
          kicker={dict.nav.shop}
          title={dict.home.shopByCategory}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${locale}/${category.slug}`}
              className="card card-hover reveal group flex flex-col p-6"
            >
              <h3 className="display-title text-xl text-nc-court">
                {category.name[typed]}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-nc-slate">
                {category.tagline[typed]}
              </p>
              <p className="kicker mt-5 text-nc-resin-deep">
                {category.children.length} {dict.catalog.browse.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- The gap: court equipment ---------------- */}
      <section className="bg-nc-shell">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <SectionHeading
            kicker={dict.home.differenceTitle}
            title={dict.home.gapTitle}
            body={dict.home.gapBody}
            action={{
              href: `/${locale}/equipment`,
              label: dict.home.gapCta,
            }}
          />
        </div>
      </section>

      {/* ---------------- Featured ---------------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20">
          <SectionHeading title={dict.home.featuredTitle} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                dict={dict}
                locale={typed}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- The Fund ---------------- */}
      <section className="bg-nc-court-deep text-nc-paper">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <SectionHeading
            tone="dark"
            kicker={dict.fund.kicker}
            title={dict.home.fundTitle}
            body={site.fund.commitment[typed]}
            action={{ href: `/${locale}/fund`, label: dict.home.fundCta }}
          />
        </div>
      </section>

      {/* ---------------- Newsletter ---------------- */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="display-title text-3xl text-nc-court">
          {dict.home.newsletterTitle}
        </h2>
        <p className="mt-3 text-nc-slate">{dict.home.newsletterBody}</p>
        <div className="mx-auto mt-8 max-w-md text-left">
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
      </section>
    </>
  );
}
