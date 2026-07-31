import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail, { type Crumb } from "@/components/ProductDetail";
import {
  getCategory,
  getProduct,
  getProducts,
  getSite,
  getSubcategory,
} from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getProducts().map((product) => ({
        locale,
        category: product.category,
        subcategory: product.subcategory,
      product: product.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[category]/[subcategory]/[product]">): Promise<Metadata> {
  const { locale, category: catSlug, product: slug } = await params;
  if (!isLocale(locale)) return {};
  const product = getProduct(catSlug, slug);
  if (!product) return {};
  return {
    title: product.name[locale],
    description: product.summary[locale],
    alternates: alternates(
      `/${product.category}/${product.subcategory}/${product.slug}`
    ),
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/[category]/[subcategory]/[product]">) {
  const {
    locale,
    category: catSlug,
    subcategory: subSlug,
    product: slug,
  } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const category = getCategory(catSlug);
  const sub = getSubcategory(catSlug, subSlug);
  const product = getProduct(catSlug, slug);
  if (!category || !sub || !product) notFound();

  const dict = await getDictionary(typed);
  const site = getSite();

  const crumbs: Crumb[] = [
    { href: `/${locale}`, label: site.brandName },
    { href: `/${locale}/${category.slug}`, label: category.name[typed] },
    {
      href: `/${locale}/${category.slug}/${sub.slug}`,
      label: sub.name[typed],
    },
  ];

  return (
    <ProductDetail
      product={product}
      crumbs={crumbs}
      site={site}
      dict={dict}
      locale={typed}
    />
  );
}
