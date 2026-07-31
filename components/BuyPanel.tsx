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
 * Every purchase path renders through here, so swapping merch fulfilment
 * (print-on-demand → held stock → headless Shopify), or turning on real
 * checkout for the main catalogue, is a change to this one file. Nothing
 * else in the site knows how an order is placed.
 *
 *   enquire / freight → quote request
 *   coming-soon       → notify-me capture
 *   available + pod   → Shopify Buy Button embed
 *   available + stock → falls back to enquiry rather than rendering a cart
 *                       that cannot take money
 */
export default function BuyPanel({ product, site, dict, locale }: Props) {
  const price = formatPrice(product.price, locale);

  // --- Freight: goals, frames, court packages -------------------------
  if (product.status === "enquire" || product.fulfillment === "freight") {
    return (
      <div className="plate">
        <div className="hatch h-2" />
        <div className="p-6">
          <p className="code text-flag">{dict.status.enquire}</p>
          <h3 className="display-title mt-2 text-2xl text-ink">
            {dict.status.freightTitle}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {dict.status.freightBody}
          </p>
          <div className="mt-6">
            <LeadForm
              formId={site.forms.freightQuote}
              subject={`Freight quote — ${product.name.en}`}
              fields={[
                {
                  name: "email",
                  label: dict.clubs.formEmail,
                  type: "email",
                  required: true,
                },
                { name: "organisation", label: dict.clubs.formClub },
                {
                  name: "province",
                  label: dict.clubs.formProvince,
                  required: true,
                },
                {
                  name: "details",
                  label: dict.clubs.formNeed,
                  type: "textarea",
                },
              ]}
              submitLabel={dict.status.freightCta}
              sentLabel={dict.clubs.formSent}
              errorLabel={dict.clubs.formError}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Not sourced yet ------------------------------------------------
  if (product.status === "coming-soon") {
    return (
      <div className="plate p-6">
        <p className="code text-graphite">{dict.status.comingSoon}</p>
        <h3 className="display-title mt-2 text-2xl text-ink">
          {dict.status.notifyTitle}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {dict.status.notifyBody}
        </p>
        <div className="mt-6">
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
    <div className="plate">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink bg-resin px-6 py-4">
        <p className="display-title text-4xl text-ink">{price}</p>
        <p className="code text-ink/60">{dict.status.available}</p>
      </div>

      <div className="p-6">
        {product.fulfillment === "pod" && (
          <>
            <p className="code-sm text-graphite">{dict.status.podNote}</p>
            <p className="code mt-4 inline-block border border-ink bg-resin-wash px-3 py-1.5 text-ink">
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
            2. Enable the Buy Button channel, copy domain + storefront token
            3. Fill both values in content/site.json → merch
            4. Replace this block with the embed, client-side only
        */}
        <div className="mt-5">
          {site.merch.shopifyDomain && site.merch.storefrontToken ? (
            <div
              id={`buy-${product.slug}`}
              data-product-slug={product.slug}
              className="min-h-12"
            />
          ) : (
            <p className="code-sm border border-dashed border-graphite px-4 py-3 text-graphite">
              CHECKOUT NOT CONNECTED — SET merch.shopifyDomain +
              merch.storefrontToken
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
