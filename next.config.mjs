import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'dev';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  reactStrictMode: true,
  trailingSlash: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
