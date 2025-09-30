import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: process.env.NODE_ENV === "development" ? 0 : 60, // No cache in dev, 1 minute in prod
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [25, 40, 60, 75, 100],
  },
  // Enable compression
  compress: true,
  // Disable static optimization in development for fresh data
  experimental: {
    ...(process.env.NODE_ENV === "development" && {
      staleTimes: {
        dynamic: 0,
        static: 0,
      },
    }),
  },
};

export default nextConfig;
