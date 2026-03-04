import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: false, // Disable compression to prevent SSE stream buffering
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // agents/ subdirectory has its own deps — exclude from build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
