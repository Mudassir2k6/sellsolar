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
console.log('[deploy] Synced out/ → dist/ for Cloudflare/Netlify publish compatibility.');
