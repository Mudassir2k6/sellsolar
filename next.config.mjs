import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Static export for production build (Cloudflare Pages / Netlify / dist/ sync)
  ...(isProd ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  reactStrictMode: true,
  trailingSlash: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  webpack: (config, { isServer, dev }) => {
    // Consolidate bundle chunks to limit initial HTTP requests under 20 (SEO Site Checkup requirement)
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 4,
        minSize: 30000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
          shared: {
            name: 'shared',
            priority: 10,
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
