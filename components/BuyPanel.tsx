import LeadForm from "@/components/LeadForm";
import type { Product, SiteConfig } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

type Props = {
  product: Product;
  site: SiteConfig;
  dict: Dictionary;
  locale: Locale;
};

/**
 * The single seam between the catalogue and money.
 *
 * Every purchase path in the store renders through here, so swapping merch
 * fulfilment (print-on-demand → held stock → headless Shopify) or turning on
 * real checkout for the main catalogue is a change to this one file. Nothing
 * else in the site knows how an order is placed.
 *
 * Today:
 *   enquire / freight → quote request form
 *   coming-soon       → notify-me capture
 *   available + pod    → Shopify Buy Button embed (Tapstitch fulfils)
 *   available + stock  → not wired yet; falls back to enquiry rather than
 *                        rendering a cart that cannot take money
 */
export default function BuyPanel({ product, site, dict, locale }: Props) {
  const price = formatPrice(product.price, locale);

  // --- Freight: goals, frames, court packages -------------------------
  if (product.status === "enquire" || product.fulfillment === "freight") {
    return (
      <div className="border border-nc-court bg-white p-6">
        <p className="kicker text-nc-resin-deep">{dict.status.enquire}</p>
        <h3 className="display-title mt-2 text-xl text-nc-court">
          {dict.status.freightTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-nc-slate">
          {dict.status.freightBody}
        </p>
        <div className="mt-5">
          <LeadForm
            formId={site.forms.freightQuote}
            subject={`Freight quote — ${product.name.en}`}
            fields={[
              { name: "email", label: dict.clubs.formEmail, type: "email", required: true },
              { name: "organisation", label: dict.clubs.formClub },
              { name: "province", label: dict.clubs.formProvince, required: true },
              { name: "details", label: dict.clubs.formNeed, type: "textarea" },
            ]}
            submitLabel={dict.status.freightCta}
            sentLabel={dict.clubs.formSent}
            errorLabel={dict.clubs.formError}
          />
        </div>
      </div>
    );
  }

  // --- Not sourced yet ------------------------------------------------
  if (product.status === "coming-soon") {
    return (
      <div className="border border-nc-line bg-white p-6">
        <p className="kicker text-nc-mute">{dict.status.comingSoon}</p>
        <h3 className="display-title mt-2 text-xl text-nc-court">
          {dict.status.notifyTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-nc-slate">
          {dict.status.notifyBody}
        </p>
        <div className="mt-5">
          <LeadForm
            compact
            formId={site.forms.notifyMe}
            subject={`Notify me — ${product.name.en}`}
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
    );
  }

  // --- Available ------------------------------------------------------
  return (
    <div className="border border-nc-court bg-white p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="display-title text-3xl text-nc-court">{price}</p>
        <p className="kicker text-nc-resin-deep">{dict.status.available}</p>
      </div>

      {product.fulfillment === "pod" && (
        <>
          <p className="mt-2 text-xs text-nc-slate">{dict.status.podNote}</p>
          <p className="kicker mt-4 inline-block bg-nc-resin-wash px-3 py-1.5 text-nc-resin-deep">
            {dict.merch.fundBadge}
          </p>
        </>
      )}

      {/*
        Shopify Buy Button mounts here once site.merch.shopifyDomain and
        storefrontToken are set. Until then this renders an honest
        placeholder rather than a dead "Add to cart" button.

        Wiring it up (Phase 3):
          1. Shopify Basic + Tapstitch app, publish the merch products
          2. Enable the Buy Button sales channel, copy domain + storefront token
          3. Fill both values in content/site.json → merch
          4. Replace this block with the Buy Button embed, client-side only
      */}
      <div className="mt-5">
        {site.merch.shopifyDomain && site.merch.storefrontToken ? (
          <div
            id={`buy-${product.slug}`}
            data-product-slug={product.slug}
            className="min-h-12"
          />
        ) : (
          <p className="border border-dashed border-nc-line px-4 py-3 text-xs text-nc-mute">
            Checkout not connected yet — set merch.shopifyDomain and
            merch.storefrontToken in content/site.json.
          </p>
        )}
      </div>
    </div>
  );
}
