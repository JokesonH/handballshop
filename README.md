# Northcourt — Canadian handball supply store

> **`Northcourt` is a placeholder name.** See "Before launch" below. It lives in
> `content/site.json` and appears nowhere else in the code.

A Canada-first handball store. Structure is modelled on
[handballshop.com](https://www.handballshop.com) (shoes → balls → apparel →
beach → protection → equipment), with two categories they do not have:
**Court & Club Equipment** — goals, nets, beach courts, line marking — and
**Resin**, both of which are the actual supply gaps in this country.

Phase 1 is a **static catalogue with no checkout**. Nothing is sourced yet, so
the site captures demand instead of pretending to take orders. Merch is the one
line that can transact early, because print-on-demand needs no supplier deal.

---

## Stack

Next.js 16 (App Router, static SSG) · React 19 · TypeScript · Tailwind CSS v4.
No database, no CMS, no runtime dependencies beyond next/react/react-dom.

Architecture is forked from the sibling `handballcanada` project — locale
routing, dictionary pattern and SEO plumbing are the same, deliberately.

> **Next.js 16 has breaking changes vs. most training data.** Read
> `node_modules/next/dist/docs/` before writing routing or metadata code.
> Note `proxy.ts` at the repo root — it replaces `middleware.ts`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export, currently 112 pages
```

---

## How it fits together

```
content/categories.json   THE TAXONOMY — drives nav, breadcrumbs, category
                          pages, subcategory rails, sitemap and static params.
                          Add a subcategory here and it appears everywhere
                          with no component change.
content/site.json         Brand name, merch config, the Fund commitment,
                          contact details, Formspree IDs.
content/products/<cat>/   One JSON per product.
dictionaries/{en,fr}.json UI strings.
lib/catalog.ts            Content loader + productHref().
lib/i18n.ts, lib/locales.ts, proxy.ts
                          Locale routing and Accept-Language redirect.
lib/seo.ts                Per-page hreflang cluster. Every route's
                          generateMetadata must call alternates(path).
```

### Bilingual EN/FR

Not optional. Quebec's Bill 96 requires French for commerce directed at Quebec
consumers, and handball's Canadian base is heavily Quebec. Every route exists
at `/en/…` and `/fr/…`; `/` redirects on `Accept-Language`, and `?lang=fr`
forces it for campaign links.

### Product status — how the catalogue is honest before inventory exists

Every product carries `status` and `fulfillment`. These decide what
`components/BuyPanel.tsx` renders:

| status / fulfillment | renders |
|---|---|
| `coming-soon` | "Notify me" email capture, no price |
| `enquire` or `freight` | Quote request form (goals, court packages) |
| `available` + `pod` | Shopify Buy Button (once configured) |
| `available` + `stock` | Falls back to enquiry — checkout not wired yet |

Nothing renders a dead "Add to cart". A category with no products shows an
honest empty state plus a capture form, not a blank grid.

### The one seam that touches money

`components/BuyPanel.tsx` is the **only** component that knows how an order is
placed. Swapping merch fulfilment (print-on-demand → held stock → headless
Shopify), or turning on real checkout for the main catalogue, is a change to
that one file.

---

## Before launch

Three things are deliberately unresolved and need your decision.

### 1. The brand name

`Northcourt` is a stand-in. **Do not name this "Handball Canada"** — that is
the national federation's legal name (see the sibling `handballcanada` repo).
A store under that name, next to a "10% to grow handball in Canada" promise,
reads as an official federation product with an endorsement that does not
exist. That is trademark and false-association exposure, and it burns the
relationship you would want if you ever do partner with them.

Set `brandName` and `merch.brand` in `content/site.json`.

The independence disclaimer in the footer stays until a real agreement exists.

### 2. The Fund basis

`content/site.json` → `fund.basis`, one of:

- `merch-sales` — 10% of merch revenue. **Current setting, and the
  recommendation:** merch is print-on-demand at your own markup, so you control
  that margin.
- `all-sales` — 10% of all revenue. At normal sporting-goods margins (25–40%
  gross) this is **25–40% of your entire gross profit**, before rent, shipping,
  payment fees or salary.
- `profit` — 10% of net profit.

The `/fund` page reads this value and states the basis in plain language.
Whatever it says has to be what actually happens: Competition Act s.74.01
treats an unsubstantiated donation claim as deceptive marketing, and a vague
"10% goes back to the sport" is exactly the claim that draws a complaint.

### 3. Wiring

Nothing below is connected yet; all are `null` in `content/site.json`.

- **Formspree IDs** — `forms.clubEnquiry`, `freightQuote`, `notifyMe`,
  `newsletter`. Unwired forms render a visible warning so they are never
  mistaken for working ones.
- **Contact details** — CASL requires a physical mailing address on commercial
  email, and payment processors require a contactable address.
- **Merch checkout** — see below.

---

## Phase 3: turning on merch checkout

Tapstitch is a **Shopify-native app** with no public API for headless or static
storefronts, so the route is Shopify's Buy Button embed:

1. Shopify Basic account; install the Tapstitch app; publish the merch products
2. Enable the **Buy Button** sales channel; copy the domain + storefront token
3. Set `merch.shopifyDomain` and `merch.storefrontToken` in `content/site.json`
4. Replace the placeholder block in `components/BuyPanel.tsx` with the embed

**Verify first:** Tapstitch's Canadian shipping rates and lead times, and
whether they print in or near North America. If merch ships from overseas on a
three-week lead time, a Canada-first store undercuts its own pitch.

---

## Roadmap

- **Phase 1 — Foundation** ✅ taxonomy, bilingual shell, design system, all routes
- **Phase 2 — Catalogue & brand** — populate products; `/about`, `/contact`,
  `/shipping`, `/returns`, `/warranty`, `/faq`, `/privacy`, `/terms`; wire
  Formspree. This is the state you show suppliers.
- **Phase 3 — Merch live** — Shopify + Tapstitch + Buy Button
- **Phase 4 — Guides & SEO** — `/guides`: ball size, shoe fit, beach court
  setup, resin rules, best shoes. No Canadian site ranks for any of these.
- **Phase 5 — Real commerce** — once inventory is secured: Shopify migration,
  provincial tax, freight rates, optional gated B2B club pricing

---

## Gotchas

- **Editing `content/*.json` needs a dev-server restart.** The loader reads via
  `fs` at module scope, which Next's dev compiler does not watch, so
  `generateStaticParams` keeps a stale list and new routes 404 until restart.
  Production builds are unaffected — they evaluate fresh.
- **Merch URLs are flat** (`/merch/<slug>`), not
  `/category/subcategory/<slug>`. Merch is our own line, not a gear category,
  so it sits outside the supplier taxonomy. Use `productHref()` from
  `lib/catalog.ts` rather than building product URLs by hand.
- **New routes must call `alternates()`** from `lib/seo.ts` in their
  `generateMetadata`. Setting `alternates` only in the layout — the obvious
  approach, and what the sibling `handballcanada` repo does — makes every page
  declare the *homepage* as its counterpart, so `/en/resin` claims its French
  equivalent is `/fr`. Google ignores clusters that don't reciprocate.
- **Seed products are placeholders.** Each carries a `todo` field. The shoe
  listing names a brand illustratively — **no distributor agreement exists**;
  do not publish brand photography, exact model names or pricing until one is
  signed.
