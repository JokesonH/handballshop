# Commerce: Stripe Checkout + Gelato

Money and production are two different systems and they meet in exactly one
place. **Stripe takes the payment. Gelato prints and ships. Nothing is sent to
Gelato until Stripe confirms the charge.**

```
browser cart (localStorage)
      │  slugs + sizes + quantities. never prices.
      ▼
POST /api/checkout ─── re-prices from content/products ──▶ Stripe Checkout
                                                                │
                                        customer pays ──────────┘
                                                                │
                                     checkout.session.completed ▼
                                              POST /api/webhooks/stripe
                                                                │
                                            POST order.gelatoapis.com/v4/orders
```

## Why the browser never sends a price

`lib/cart.ts` stores only `{slug, size, qty}`. `resolveCart()` looks every line
up in `content/products` and recomputes the amount server-side, in both the
checkout route *and* again in the webhook. The worst a tampered localStorage
can do is get itself rejected — it cannot change what the customer is charged.

The same function refuses lines that would be wrong to bill for: unknown
product, not `available`, not `pod`, no price, a size we don't print, or a
quantity outside 1–10.

## Before this can take a real order

**1. Fill in the Gelato product UIDs.** `content/gelato.json` ships with
`uidBySize` all `null`, and checkout deliberately fails while they are. A UID
encodes garment, cut, size and colour in one string and cannot be guessed —
pull them from Gelato's catalog (`GET
https://product.gelatoapis.com/v3/catalogs/apparel/products`) or copy them out
of the dashboard.

This fails at `/api/checkout`, *before* the customer is charged, rather than in
the webhook after their money is gone. That ordering is deliberate.

**2. Add print files.** Each product needs `printFile` pointing at a
print-ready raster, and Gelato fetches it over HTTP at production time — so it
must be publicly reachable. The `design/*.svg` artwork is the master; export at
Gelato's required DPI and dimensions for the garment and put the result
somewhere served.

**3. Register the webhook.** In the Stripe dashboard, add an endpoint at
`https://<your-domain>/api/webhooks/stripe` listening for
`checkout.session.completed`. Copy the signing secret into
`STRIPE_WEBHOOK_SECRET`. Unsigned and badly-signed requests are rejected with
400 — anyone can POST to that URL, so the signature is the only thing
separating a real payment from a forged one.

**4. Sales tax.** `STRIPE_TAX_ENABLED` is `false`, which charges no tax at all.
That is wrong, but *visibly* wrong. Turning it on requires registering for
GST/HST and configuring Stripe Tax. Canada is 13 jurisdictions with different
rules; this is the part most worth not improvising.

## Idempotency, and the fact there's no database

Stripe retries any non-2xx, and can deliver the same event more than once. So
before creating anything the webhook reads `gelatoOrderId` off the
PaymentIntent and bails if it's already there; after a successful create it
writes it back. Gelato also receives `orderReferenceId = session.id`.

**The PaymentIntent is the order record.** There is no database in this project,
which is fine at this size and has real limits worth knowing:

- Two webhook deliveries arriving *simultaneously* could both pass the check
  before either writes back. Vanishingly unlikely at this volume, genuinely
  possible at scale.
- There's no order history page, and no way to answer "what did this customer
  order" except through the Stripe and Gelato dashboards.
- A failed Gelato call returns 500 so Stripe retries, but if it keeps failing
  the customer has paid and nothing is in production. **Watch for repeated
  `[stripe-webhook] FAILED` in the Vercel logs** — that is the failure mode
  that costs you a customer.

A real datastore is the fix for all three, and is the natural next step once
orders are regular.

## Testing without spending money

Use Stripe test keys and card `4242 4242 4242 4242`. For the webhook:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

Point `GELATO_API_KEY` at a Gelato test key while doing this, or the order is
real.
