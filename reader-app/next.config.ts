import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // All non-static pages: no CDN caching (middleware handles auth)
        source: "/((?!_next/static|_next/image|favicon|icons|manifest|sw\\.js).*)",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
