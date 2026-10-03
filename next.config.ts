import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Turbopack aktif (default pada `next dev --turbopack` dan `next build`).
  turbopack: {
    resolveAlias: {
      // Buang polyfill legacy bawaan Next (lihat polyfills/modern-polyfills.js).
      '../build/polyfills/polyfill-module': './polyfills/modern-polyfills.js',
    },
  },
  experimental: {
    optimizePackageImports: ['react-icons/fi'],
    // Menyisipkan CSS langsung ke HTML agar tidak ada render-blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
