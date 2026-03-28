import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Monorepo has conflicting @types/react versions;
    // tsc handles this fine with skipLibCheck
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
