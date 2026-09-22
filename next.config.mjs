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
  transpilePackages: ['lucide-react'],
  serverExternalPackages: ['@supabase/supabase-js'],
  reactStrictMode: true,
  trailingSlash: false,
  outputFileTracingRoot: __dirname,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
