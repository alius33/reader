import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        // Proxy audio requests to R2 public bucket at the HTTP level
        source: "/api/audio/:path*",
        destination:
          "https://pub-52bbb41d6274422ca4ef5c93bf26d230.r2.dev/:path*",
      },
    ];
  },
};

export default withSerwist(nextConfig);
