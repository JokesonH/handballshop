import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail, { type Crumb } from "@/components/ProductDetail";
import { getProduct, getProducts, getSite } from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getProducts("merch").map((product) => ({
      locale,
      product: product.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/merch/[product]">): Promise<Metadata> {
  const { locale, product: slug } = await params;
  if (!isLocale(locale)) return {};
  const product = getProduct("merch", slug);
  if (!product) return {};
  return {
    title: product.name[locale],
    description: product.summary[locale],
    alternates: alternates(`/merch/${product.slug}`),
  };
}

export default async function MerchProductPage({
  params,
}: PageProps<"/[locale]/merch/[product]">) {
  const { locale, product: slug } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const product = getProduct("merch", slug);
  if (!product) notFound();

  const dict = await getDictionary(typed);
  const site = getSite();

  const crumbs: Crumb[] = [
    { href: `/${locale}`, label: site.brandName },
    { href: `/${locale}/merch`, label: site.merch.brand },
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
