import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: false, // Disable compression to prevent SSE stream buffering
};

export default nextConfig;
