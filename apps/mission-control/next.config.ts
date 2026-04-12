import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  compress: false, // Disable compression to prevent SSE stream buffering
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // agents/ subdirectory has its own deps — exclude from build
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
