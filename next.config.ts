import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Automatic image format conversion.
   *
   * This is the whole answer to "what format should I upload?" — it doesn't
   * matter. Upload PNG, JPEG, whatever the CMS gives you; next/image
   * re-encodes on demand to AVIF (or WebP for older clients), resizes to the
   * width actually being displayed, and caches the result at the edge. The
   * original in public/uploads is only ever the master.
   *
   * Order matters: AVIF is tried first because it's roughly 50% smaller than
   * JPEG at the same quality, WebP second at roughly 30%.
   *
   * This only works because the site runs on Vercel's Node runtime. If it
   * ever moves to `output: "export"`, the optimizer is gone and every upload
   * gets served at full size — see docs/images.md before making that change.
   */
  images: {
    formats: ["image/avif", "image/webp"],
    // Widths Next will actually generate. Nothing here is wider than the
    // largest slot any image occupies in the layout, so we never encode a
    // 4K variant nobody requests.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    // Uploads are content-addressed by the CMS commit, so they can cache hard.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // /admin has no page of its own — public/admin/index.html is the Decap CMS
  // shell, served as a static file everywhere except the bare /admin path.
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
