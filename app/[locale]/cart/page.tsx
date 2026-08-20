import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CartView, { type CartCatalogEntry } from "@/components/CartView";
import { getProducts, productHref } from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.cart.title,
    alternates: alternates("/cart"),
    // A cart is per-visitor and has nothing to index.
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = await getDictionary(typed);

  /* The cart itself lives in localStorage, but names, prices and images must
     come from the server — the client is never the authority on price. */
  const catalog: CartCatalogEntry[] = getProducts()
    .filter((p) => p.status === "available" && typeof p.price === "number")
    .map((p) => ({
      slug: p.slug,
      name: p.name[typed],
      href: productHref(p, typed),
      image: p.images?.[0],
      priceCents: p.price as number,
    }));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <nav aria-label="Breadcrumb" className="code text-graphite">
        <Link href={`/${typed}`} className="hover:text-ink">
          {dict.nav.shop}
        </Link>
        <span className="mx-2">/</span>
        <span>{dict.cart.title}</span>
      </nav>
      <h1 className="display mt-6 text-4xl uppercase leading-none sm:text-6xl">
        {dict.cart.title}
      </h1>
      <div className="mt-10">
        <CartView catalog={catalog} locale={typed} labels={dict.cart} />
      </div>
    </div>
  );
}
