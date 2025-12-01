import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatar-management.services.atlassian.com', 'secure.gravatar.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.atlassian.net',
      },
    ],
  },
  // Enable App Router features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
