# Images

**Upload whatever you have. The format doesn't matter.**

`next/image` re-encodes every image on request: AVIF for browsers that take it,
WebP for the rest, resized to the width actually being displayed and cached at
Vercel's edge. The file sitting in `public/uploads` is only ever the master —
visitors never download it.

The numbers from the first real upload, an 17.9 MB PNG:

| Served as | Size | vs. original |
|---|---|---|
| Original PNG | 17.91 MB | — |
| AVIF @1200w (product page) | 14 KB | ~1300× smaller |
| WebP @1200w (older browsers) | 18 KB | ~1000× smaller |
| AVIF @384w (grid card) | 3 KB | ~5400× smaller |

So: **don't spend time converting or compressing before upload.** A large PNG
straight out of a mockup renderer is fine and is actually preferable — more
source detail for the encoder to work with, and one master you can re-crop
later without generation loss.

## What's configured

`next.config.ts` → `images`:

- `formats: ["image/avif", "image/webp"]` — AVIF is tried first.
- `deviceSizes` / `imageSizes` — the widths Next will generate. Nothing is
  wider than the largest slot in the layout, so no 4K variant gets encoded for
  a card that renders at 380px.
- `minimumCacheTTL` — 30 days. Uploads are effectively immutable once the CMS
  commits them, so they can cache hard.

Components use `next/image` with `fill` inside an aspect-ratio container
(`components/ProductCard.tsx`, `components/ProductDetail.tsx`). The `sizes`
prop on each tells the browser how wide the image will actually render, which
is what lets it pick the small variant instead of the large one — if you add a
new image slot, set `sizes` or it will default to `100vw` and pull the widest
file every time.

## The one thing that would break this

Setting `output: "export"` in `next.config.ts`. Static export has no server, so
there's no optimizer: every image gets served at full original size, and that
17.9 MB PNG becomes a 17.9 MB download on every page view. If the site ever
needs to be a static export, the replacement is a build-time script that
pre-generates AVIF/WebP variants into `public/` and a plain `<picture>` element
with explicit `srcset`. Don't make that change casually.

## Practical guidance

- **Product photography / mockups** — PNG or JPEG, at least 1600px on the long
  edge. Bigger is fine.
- **Artwork with flat colour and hard edges** (the City Series prints) — PNG,
  so the master stays crisp. AVIF handles the flat areas well on output.
- **Anything with transparency** — PNG. AVIF and WebP both carry the alpha
  channel through.
- **Don't upload SVG** through the CMS media library. Next's optimizer passes
  SVG through unoptimized and it's an XSS vector when the file is
  user-supplied; the print artwork in `design/` is for printers, not the site.
