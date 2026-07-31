import Link from "next/link";
import BuyPanel from "@/components/BuyPanel";
import type { Product, SiteConfig } from "@/lib/catalog";
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
  const image = product.images?.[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="kicker text-nc-mute">
        {crumbs.map((crumb, index) => (
          <span key={crumb.href}>
            {index > 0 && <span className="mx-2">/</span>}
            <Link href={crumb.href} className="hover:text-nc-court">
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden border border-nc-line bg-nc-shell">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={product.name[locale]}
                className="h-full w-full object-cover"
              />
            ) : (
              /* Branded placeholder — real photography drops in later. */
              <div className="flex h-full w-full items-center justify-center bg-nc-court">
                <span className="display-title px-8 text-center text-2xl text-nc-paper/25">
                  {product.brand ?? site.brandName}
                </span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="aspect-square w-full border border-nc-line object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          {product.brand && (
            <p className="kicker text-nc-resin-deep">{product.brand}</p>
          )}
          <h1 className="display-title mt-2 text-3xl text-nc-court sm:text-4xl">
            {product.name[locale]}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-nc-slate">
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
              <p className="kicker text-nc-slate">{dict.catalog.size}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="border border-nc-line bg-white px-3 py-1.5 text-sm text-nc-ink"
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
                <p key={index} className="text-sm leading-relaxed text-nc-slate">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {product.specs && product.specs.length > 0 && (
            <div className="mt-8">
              <p className="kicker text-nc-slate">{dict.catalog.specs}</p>
              <dl className="mt-3 divide-y divide-nc-line border-y border-nc-line">
                {product.specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between gap-4 py-2.5"
                  >
                    <dt className="text-sm text-nc-slate">
                      {spec.label[locale]}
                    </dt>
                    <dd className="text-sm font-medium text-nc-ink">
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
