import Link from "next/link";
import { productHref, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

type Props = {
  product: Product;
  dict: Dictionary;
  locale: Locale;
};

function statusLabel(product: Product, dict: Dictionary): string {
  if (product.status === "coming-soon") return dict.status.comingSoon;
  if (product.status === "enquire" || product.fulfillment === "freight")
    return dict.status.enquire;
  return dict.status.available;
}

export default function ProductCard({ product, dict, locale }: Props) {
  const price = formatPrice(product.price, locale);
  const href = productHref(product, locale);
  const image = product.images?.[0];

  return (
    <Link href={href} className="card card-hover group block overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-nc-shell">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* No photo yet — a branded court-line panel beats a grey box. */
          <div className="flex h-full w-full items-center justify-center bg-nc-court">
            <span className="display-title px-4 text-center text-lg text-nc-paper/25">
              {product.brand ?? product.name[locale]}
            </span>
          </div>
        )}
        {product.status !== "available" && (
          <span className="kicker absolute left-0 top-3 bg-nc-court px-2.5 py-1 text-nc-paper">
            {statusLabel(product, dict)}
          </span>
        )}
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="kicker text-nc-mute">{product.brand}</p>
        )}
        <h3 className="mt-1 text-sm font-semibold leading-snug text-nc-ink">
          {product.name[locale]}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-nc-slate">
          {product.summary[locale]}
        </p>
        <p className="mt-3 text-sm font-semibold text-nc-court">
          {price ?? (
            <span className="text-nc-mute">{statusLabel(product, dict)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
