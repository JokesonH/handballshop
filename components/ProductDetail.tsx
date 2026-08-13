import Link from "next/link";
import BuyPanel from "@/components/BuyPanel";
import ProductGallery from "@/components/ProductGallery";
import { partCode, type Product, type SiteConfig } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

export type Crumb = { href: string; label: string };

type Props = {
  product: Product;
  crumbs: Crumb[];
  site: SiteConfig;
  dict: Dictionary;
  locale: Locale;
};

/**
 * Shared product detail layout. Used by both the catalogue route
 * (/category/subcategory/slug) and the merch route (/merch/slug) so the two
 * URL shapes do not fork the template.
 */
export default function ProductDetail({
  product,
  crumbs,
  site,
  dict,
  locale,
}: Props) {

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <nav aria-label="Breadcrumb" className="code text-graphite">
        {crumbs.map((crumb, index) => (
          <span key={crumb.href}>
            {index > 0 && <span className="mx-2">/</span>}
            <Link href={crumb.href} className="hover:text-ink">
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery
          images={product.images ?? []}
          alt={product.name[locale]}
          pendingLabel={dict.catalog.imagePending}
          prevLabel={dict.catalog.prevImage}
          nextLabel={dict.catalog.nextImage}
        />

        {/* Detail */}
        <div>
          <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2">
            <span className="code text-resin-deep">
              {product.brand ?? "CAT."}
            </span>
            <span className="code text-graphite">{partCode(product)}</span>
          </div>
          <h1 className="display-title mt-4 text-4xl text-ink sm:text-5xl">
            {product.name[locale]}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            {product.summary[locale]}
          </p>

          <div className="mt-8">
            <BuyPanel
              product={product}
              site={site}
              dict={dict}
              locale={locale}
            />
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <p className="code text-ink-soft">{dict.catalog.size}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="border border-ink bg-paper px-3 py-1.5 text-sm text-ink"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.description[locale].length > 0 && (
            <div className="mt-8 space-y-4">
              {product.description[locale].map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {product.specs && product.specs.length > 0 && (
            <div className="mt-8">
              <p className="code text-ink-soft">{dict.catalog.specs}</p>
              <dl className="mt-3 divide-y divide-rule border-y border-rule">
                {product.specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between gap-4 py-2.5"
                  >
                    <dt className="text-sm text-ink-soft">
                      {spec.label[locale]}
                    </dt>
                    <dd className="text-sm font-medium text-ink">
                      {spec.value[locale]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
