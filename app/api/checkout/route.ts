import { NextRequest, NextResponse } from "next/server";
import { getGelatoConfig, resolveProductUid } from "@/lib/gelato";
import { CartError, decodeCart, encodeCart, resolveCart } from "@/lib/cart";
import { getSite } from "@/lib/catalog";
import { stripe } from "@/lib/stripe";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

export const dynamic = "force-dynamic";

/**
 * Create a Stripe Checkout session from a browser cart.
 *
 * The browser sends slugs, sizes and quantities — never prices. Every amount
 * charged is recomputed here from content/products, so the worst a tampered
 * cart can do is get itself rejected.
 *
 * Product UIDs are resolved *before* charging, not in the webhook. If a
 * Gelato UID is missing we want to fail while the customer still has their
 * money, rather than take payment for something we can't produce.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const locale: Locale = isLocale(body?.locale) ? body.locale : "en";
    const lines = decodeCart(
      typeof body?.cart === "string" ? body.cart : JSON.stringify(body?.cart ?? [])
    );

    const cart = resolveCart(lines);
    const site = getSite();
    const config = getGelatoConfig();

    // Fail loudly now if we can't actually produce any line.
    for (const line of cart.lines) {
      resolveProductUid(line.product.gelatoGarment ?? "tee", line.size);
      if (!line.product.printFile) {
        throw new CartError(`${line.product.slug} has no print file configured`);
      }
    }

    const origin = request.nextUrl.origin;
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      currency: cart.currency.toLowerCase(),
      line_items: cart.lines.map((line) => ({
        quantity: line.qty,
        price_data: {
          currency: cart.currency.toLowerCase(),
          unit_amount: line.unitCents,
          product_data: {
            name: `${line.product.name[locale]} — ${line.size}`,
            images: line.product.images?.[0]
              ? [`${origin}${line.product.images[0]}`]
              : undefined,
          },
        },
      })),
      shipping_address_collection: {
        allowed_countries: Object.keys(config.shipping) as ("CA" | "US")[],
      },
      shipping_options: Object.entries(config.shipping).map(([, option]) => ({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: option.amountCents, currency: cart.currency.toLowerCase() },
          display_name: option.label,
        },
      })),
      // Stripe Tax handles the 13-jurisdiction Canadian problem, but only
      // once the business is registered — see docs/commerce.md.
      automatic_tax: { enabled: process.env.STRIPE_TAX_ENABLED === "true" },
      // The cart is replayed from here in the webhook. Kept compact because
      // Stripe caps metadata values at 500 characters.
      metadata: { cart: encodeCart(lines), locale },
      success_url: `${origin}/${locale}/order/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    // CartError means we're refusing to charge for something we can't
    // produce or sell — a missing Gelato UID, a missing print file, a
    // product that's not actually for sale. That's not a 500, but it must
    // never be silent: it's the exact class of "checkout is broken and
    // nobody noticed" bug, so it's logged the same as an unexpected error.
    const status = error instanceof CartError ? 400 : 500;
    console.error(`[checkout] ${status}`, message);
    return NextResponse.json({ error: message }, { status });
  }
}
