import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  getCollection,
  getCollections,
  getProductsInCollection,
} from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getCollections().map((collection) => ({
      locale,
      collection: collection.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/collections/[collection]">): Promise<Metadata> {
  const { locale, collection: slug } = await params;
  if (!isLocale(locale)) return {};
  const collection = getCollection(slug);
  if (!collection) return {};
  return {
    title: collection.name[locale],
    description: collection.tagline[locale],
    alternates: alternates(`/collections/${collection.slug}`),
  };
}

export default async function CollectionPage({
  params,
}: PageProps<"/[locale]/collections/[collection]">) {
  const { locale, collection: slug } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const dict = await getDictionary(typed);
  const products = getProductsInCollection(slug);
  const others = getCollections().filter((c) => c.slug !== slug);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <nav aria-label="Breadcrumb" className="code text-graphite">
        <Link href={`/${typed}`} className="hover:text-ink">
          {dict.nav.shop}
        </Link>
        <span className="mx-2">/</span>
        <span>{collection.name[typed]}</span>
      </nav>

      <header className="mt-6 max-w-3xl border-b border-rule pb-8">
        <h1 className="display text-4xl uppercase leading-none sm:text-6xl">
          {collection.name[typed]}
        </h1>
        <p className="mt-3 text-lg text-graphite">
          {collection.tagline[typed]}
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed">
          {collection.intro[typed]}
        </p>
      </header>

      {products.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={`${product.category}/${product.slug}`}
              product={product}
              dict={dict}
              locale={typed}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 code text-graphite">
          {dict.catalog.empty}
        </p>
      )}

      {others.length > 0 && (
        <div className="mt-14 border-t border-rule pt-6">
          <p className="code text-graphite">OTHER COLLECTIONS</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                href={`/${typed}/collections/${c.slug}`}
                className="plate plate-hover px-4 py-2 display uppercase"
              >
                {c.name[typed]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
