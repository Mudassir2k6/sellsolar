import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages / Netlify static hosting
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: false,
  // Keep tracing rooted in this app (parent folder also has a lockfile)
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
