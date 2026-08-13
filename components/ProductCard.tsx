import Image from "next/image";
import Link from "next/link";
import { partCode, productHref, type Product } from "@/lib/catalog";
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
  /* Convention: images[0] is the hanging product shot, images[1] is the
     design itself. The design reads far better at grid scale, so prefer it
     here and keep the hanging shot for the product page hero. */
  const image = product.images?.[1] ?? product.images?.[0];
  const isFreight = product.fulfillment === "freight";

  return (
    <Link href={href} className="plate plate-hover group flex flex-col">
      {/* Plate header — part code + status, like a parts bin label */}
      <div className="flex items-center justify-between gap-2 border-b border-ink px-3 py-1.5">
        <span className="code-sm text-graphite">{partCode(product)}</span>
        {product.status !== "available" ? (
          <span
            className={`code-sm ${isFreight ? "text-flag" : "text-graphite"}`}
          >
            {statusLabel(product, dict)}
          </span>
        ) : (
          <span className="code-sm text-resin-deep">
            {dict.status.available}
          </span>
        )}
      </div>

      <div className="relative aspect-[4/3] overflow-hidden border-b border-rule bg-bone-dim">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 92vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          /* No photograph yet — a blueprint placeholder, not a grey box.
             Reads as "drawing pending", which is true. */
          <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-bone-dim)_0_10px,var(--color-bone)_10px_20px)]">
            <span className="code bg-bone px-2 py-1 text-graphite">
              {product.brand ?? "FIG. PENDING"}
            </span>
          </div>
        )}
        {isFreight && <div className="hatch absolute inset-x-0 bottom-0 h-1.5" />}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {product.brand && (
          <p className="code-sm text-graphite">{product.brand}</p>
        )}
        <h3 className="display-title mt-1 text-lg leading-tight text-ink">
          {product.name[locale]}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">
          {product.summary[locale]}
        </p>

        <div className="mt-auto flex items-baseline justify-between gap-2 border-t border-rule pt-2.5">
          <span className="display-title text-xl text-ink">
            {price ?? (
              <span className="code text-graphite">
                {statusLabel(product, dict)}
              </span>
            )}
          </span>
          <span className="code-sm text-graphite transition-colors group-hover:text-resin-deep">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
