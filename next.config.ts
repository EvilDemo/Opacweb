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
    minimumCacheTTL: 60, // Consistent 1 minute cache across all environments
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [25, 40, 60, 75, 100],
  },
  // Enable compression
  compress: true,
  // Enable ISR with webhook revalidation for optimal performance
  // experimental: {
  //   staleTimes: {
  //     dynamic: 0, // Always fresh for dynamic content in development
  //     static: 0, // Always fresh for static content in development
  //   },
  // },
};

export default nextConfig;
