import fs from 'fs';
import path from 'path';

const root = process.cwd();
const outDir = path.join(root, 'out');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(outDir)) {
  console.error('[deploy] Missing out/ — run next build first.');
  process.exit(1);
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.cpSync(outDir, distDir, { recursive: true });

// Explicitly ensure _headers and _redirects are in dist/
const publicDir = path.join(root, 'public');
for (const specialFile of ['_headers', '_redirects']) {
  const src = path.join(publicDir, specialFile);
  const dest = path.join(distDir, specialFile);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Ensure auth/callback works with both trailing and non-trailing slash
const authCallbackHtml = path.join(distDir, 'auth', 'callback.html');
const authCallbackDir = path.join(distDir, 'auth', 'callback');
if (fs.existsSync(authCallbackHtml)) {
  fs.mkdirSync(authCallbackDir, { recursive: true });
  fs.copyFileSync(authCallbackHtml, path.join(authCallbackDir, 'index.html'));
}

console.log('[deploy] Synced out/ → dist/ for Cloudflare/Netlify publish compatibility.');
