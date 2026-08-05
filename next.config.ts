import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /admin has no page of its own — public/admin/index.html is the Decap CMS
  // shell, served as a static file everywhere except the bare /admin path.
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
