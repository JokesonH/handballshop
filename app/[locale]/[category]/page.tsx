import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import {
  getCategories,
  getCategory,
  getProducts,
  getSite,
} from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getCategories().map((category) => ({ locale, category: category.slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[category]">): Promise<Metadata> {
  const { locale, category: slug } = await params;
  if (!isLocale(locale)) return {};
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.name[locale],
    description: category.tagline[locale],
    alternates: alternates(`/${category.slug}`),
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[locale]/[category]">) {
  const { locale, category: slug } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const category = getCategory(slug);
  if (!category) notFound();

  const dict = await getDictionary(typed);
  const site = getSite();
  const products = getProducts(slug);
  const crossCategory = category.crossLink
    ? getCategory(category.crossLink.split("/")[0])
    : undefined;

  return (
    <>
      {/* Category hero */}
      <section className="border-b border-nc-line bg-nc-court text-nc-paper">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <nav aria-label="Breadcrumb" className="kicker text-nc-paper/50">
            <Link href={`/${locale}`} className="hover:text-nc-resin">
              {site.brandName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-nc-resin">{category.name[typed]}</span>
          </nav>
          <h1 className="display-title mt-4 max-w-3xl text-4xl sm:text-5xl">
            {category.name[typed]}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-nc-paper/75">
            {category.tagline[typed]}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14">
        {/* Subcategory rail */}
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          <Link
            href={`/${locale}/${category.slug}`}
            className="kicker shrink-0 border border-nc-court bg-nc-court px-4 py-2.5 text-nc-paper"
          >
            {dict.catalog.allProducts}
          </Link>
          {category.children.map((child) => (
            <Link
              key={child.slug}
              href={`/${locale}/${category.slug}/${child.slug}`}
              className="kicker shrink-0 border border-nc-line bg-white px-4 py-2.5 text-nc-slate transition-colors hover:border-nc-court hover:text-nc-court"
            >
              {child.name[typed]}
            </Link>
          ))}
        </nav>

        {/* Category intro — the SEO body copy */}
        <p className="mt-10 max-w-3xl text-base leading-relaxed text-nc-slate">
          {category.intro[typed]}
        </p>

        {crossCategory && category.crossLink && (
          <p className="mt-5">
            <Link
              href={`/${locale}/${category.crossLink}`}
              className="kicker border-b-2 border-nc-resin pb-1 text-nc-court transition-colors hover:text-nc-resin-deep"
            >
              {dict.catalog.relatedCategory} — {crossCategory.name[typed]}
            </Link>
          </p>
        )}

        <div className="court-rule my-12" />

        {/* Products, or an honest empty state */}
        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                dict={dict}
                locale={typed}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl border border-nc-line bg-white p-8 text-center">
            <p className="text-base leading-relaxed text-nc-slate">
              {dict.catalog.empty}
            </p>
            <p className="kicker mt-6 text-nc-court">
              {dict.catalog.emptyCta}
            </p>
            <div className="mt-4 text-left">
              <LeadForm
                compact
                formId={site.forms.notifyMe}
                subject={`Category interest — ${category.name.en}`}
                fields={[
                  {
                    name: "email",
                    label: dict.status.notifyPlaceholder,
                    type: "email",
                    required: true,
                  },
                ]}
                submitLabel={dict.status.notifyCta}
                sentLabel={dict.clubs.formSent}
                errorLabel={dict.clubs.formError}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
