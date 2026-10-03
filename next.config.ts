import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Turbopack aktif (default pada `next dev --turbopack` dan `next build`).
  turbopack: {},
  experimental: {
    optimizePackageImports: ['react-icons/fi'],
  },
};

export default nextConfig;
