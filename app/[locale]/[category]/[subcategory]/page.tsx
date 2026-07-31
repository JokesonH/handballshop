import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import {
  getCategories,
  getCategory,
  getProductsInSubcategory,
  getSite,
  getSubcategory,
} from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getCategories().flatMap((category) =>
      category.children.map((child) => ({
        locale,
        category: category.slug,
        subcategory: child.slug,
      }))
    )
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[category]/[subcategory]">): Promise<Metadata> {
  const { locale, category: catSlug, subcategory: subSlug } = await params;
  if (!isLocale(locale)) return {};
  const category = getCategory(catSlug);
  const sub = getSubcategory(catSlug, subSlug);
  if (!category || !sub) return {};
  return {
    title: `${sub.name[locale]} — ${category.name[locale]}`,
    description: category.tagline[locale],
    alternates: alternates(`/${category.slug}/${sub.slug}`),
  };
}

export default async function SubcategoryPage({
  params,
}: PageProps<"/[locale]/[category]/[subcategory]">) {
  const { locale, category: catSlug, subcategory: subSlug } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const category = getCategory(catSlug);
  const sub = getSubcategory(catSlug, subSlug);
  if (!category || !sub) notFound();

  const dict = await getDictionary(typed);
  const site = getSite();
  const products = getProductsInSubcategory(catSlug, subSlug);

  return (
    <>
      <section className="border-b border-nc-line bg-nc-court text-nc-paper">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <nav aria-label="Breadcrumb" className="kicker text-nc-paper/50">
            <Link href={`/${locale}`} className="hover:text-nc-resin">
              {site.brandName}
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/${locale}/${category.slug}`}
              className="hover:text-nc-resin"
            >
              {category.name[typed]}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-nc-resin">{sub.name[typed]}</span>
          </nav>
          <h1 className="display-title mt-4 text-4xl sm:text-5xl">
            {sub.name[typed]}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14">
        {/* Sibling subcategories */}
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          <Link
            href={`/${locale}/${category.slug}`}
            className="kicker shrink-0 border border-nc-line bg-white px-4 py-2.5 text-nc-slate transition-colors hover:border-nc-court hover:text-nc-court"
          >
            {dict.catalog.allProducts}
          </Link>
          {category.children.map((child) => {
            const active = child.slug === sub.slug;
            return (
              <Link
                key={child.slug}
                href={`/${locale}/${category.slug}/${child.slug}`}
                aria-current={active ? "page" : undefined}
                className={`kicker shrink-0 border px-4 py-2.5 transition-colors ${
                  active
                    ? "border-nc-court bg-nc-court text-nc-paper"
                    : "border-nc-line bg-white text-nc-slate hover:border-nc-court hover:text-nc-court"
                }`}
              >
                {child.name[typed]}
              </Link>
            );
          })}
        </nav>

        <div className="court-rule my-12" />

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
            <p className="kicker mt-6 text-nc-court">{dict.catalog.emptyCta}</p>
            <div className="mt-4 text-left">
              <LeadForm
                compact
                formId={site.forms.notifyMe}
                subject={`Interest — ${category.name.en} / ${sub.name.en}`}
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
