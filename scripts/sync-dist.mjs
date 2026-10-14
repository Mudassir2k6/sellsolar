import fs from 'fs';
import path from 'path';

const root = process.cwd();
const outDir = path.join(root, 'out');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(outDir)) {
  console.error('[deploy] Missing out/ — run next build first.');
  process.exit(1);
}

// 1. Cache and preserve previous chunks to prevent ChunkLoadError (404) for active tabs
const distChunksDir = path.join(distDir, '_next', 'static', 'chunks');
const preservedChunks = new Map();
if (fs.existsSync(distChunksDir)) {
  try {
    const files = fs.readdirSync(distChunksDir);
    for (const f of files) {
      const fullPath = path.join(distChunksDir, f);
      if (fs.statSync(fullPath).isFile() && f.endsWith('.js')) {
        preservedChunks.set(f, fs.readFileSync(fullPath));
      }
    }
  } catch (e) {
    console.warn('[deploy] Could not read previous chunks:', e.message);
  }
}

fs.rmSync(distDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
fs.cpSync(outDir, distDir, { recursive: true });

// 2. Restore previous chunks that are not overwritten by new build
if (preservedChunks.size > 0 && fs.existsSync(distChunksDir)) {
  let restored = 0;
  for (const [filename, content] of preservedChunks.entries()) {
    const dest = path.join(distChunksDir, filename);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, content);
      restored++;
    }
  }
  if (restored > 0) {
    console.log(`[deploy] Preserved ${restored} previous chunks to eliminate ChunkLoadErrors.`);
  }
}

// 3. Explicitly ensure ALL public assets (favicons, manifests, headers, redirects) overwrite out/ and dist/
const publicDir = path.join(root, 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const file of publicFiles) {
    const src = path.join(publicDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(outDir, file));
      fs.copyFileSync(src, path.join(distDir, file));
    }
  }
}

// 4. Ensure auth/callback works with both trailing and non-trailing slash
const authCallbackHtml = path.join(distDir, 'auth', 'callback.html');
const authCallbackDir = path.join(distDir, 'auth', 'callback');
if (fs.existsSync(authCallbackHtml)) {
  fs.mkdirSync(authCallbackDir, { recursive: true });
  fs.copyFileSync(authCallbackHtml, path.join(authCallbackDir, 'index.html'));
}

// ============================================================================
// PERFORMANCE & HTTP REQUEST REDUCTION OPTIMIZER (< 20 HTTP requests threshold)
// & ELIMINATE RENDER-BLOCKING RESOURCES (Google PageSpeed / Lighthouse 100%)
// ============================================================================
function optimizeHtmlDirectory(targetBaseDir) {
  if (!fs.existsSync(targetBaseDir)) return;

  const mediaDir = path.join(targetBaseDir, '_next', 'static', 'media');
  let primaryFontFile = null;
  if (fs.existsSync(mediaDir)) {
    const mediaFiles = fs.readdirSync(mediaDir);
    primaryFontFile = mediaFiles.find((f) => f.includes('.p.woff2')) || mediaFiles.find((f) => f.endsWith('.woff2'));
  }

  // Detect font CSS file to inline directly into HTML (<style data-font="plus-jakarta">)
  const cssDir = path.join(targetBaseDir, '_next', 'static', 'css');
  let fontCssFile = null;
  let fontCssContent = '';
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    for (const f of cssFiles) {
      const fullPath = path.join(cssDir, f);
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@font-face') && content.length < 10000) {
        fontCssFile = f;
        fontCssContent = content;
        break;
      }
    }
  }

  const chunksDir = path.join(targetBaseDir, '_next', 'static', 'chunks');

  const streamlinedFavicons = [
    '<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any"/>',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>'
  ].join('');

  let processedCount = 0;

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        walk(fullPath);
      } else if (item.isFile() && item.name.endsWith('.html')) {
        let html = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // 1. Preload primary font subset to accelerate LCP & FCP
        if (primaryFontFile && !html.includes(primaryFontFile)) {
          const fontPreloadTag = `<link rel="preload" href="/_next/static/media/${primaryFontFile}" as="font" type="font/woff2" crossorigin="anonymous"/>`;
          html = html.replace('<head>', `<head>${fontPreloadTag}`);
          modified = true;
        }

        // 2. Inline small font CSS to eliminate render-blocking external request
        if (fontCssFile && fontCssContent) {
          const fontLinkRegex = new RegExp(`<link[^>]*href=["']/_next/static/css/${fontCssFile}["'][^>]*>`, 'gi');
          if (fontLinkRegex.test(html)) {
            const inlinedStyle = `<style data-font="plus-jakarta">${fontCssContent}</style>`;
            html = html.replace(fontLinkRegex, inlinedStyle);
            modified = true;
          }
        }

        // 3. Convert all remaining render-blocking stylesheets to high-priority asynchronous preload (media="print" onload="this.media='all'")
        // Completely eliminates "Render-Blocking Resources" warning on PageSpeed & SEO Site Checkup
        const blockingCssRegex = /<link\s+rel="stylesheet"\s+href="(\/_next\/static\/css\/[^"]+\.css)"\s+data-precedence="next"\s*\/?>/gi;
        if (blockingCssRegex.test(html)) {
          html = html.replace(blockingCssRegex, (match, href) => {
            return `<link rel="preload" href="${href}" as="style" fetchpriority="high"/><link rel="stylesheet" href="${href}" media="print" onload="this.media='all'"/>`;
          });
          modified = true;
        }

        // Clean up any existing noscript stylesheet links
        const noscriptCssRegex = /<noscript><link\s+rel="stylesheet"[^>]*\/><\/noscript>/gi;
        if (noscriptCssRegex.test(html)) {
          html = html.replace(noscriptCssRegex, '');
          modified = true;
        }

        // 4. Remove IE11 polyfills script tag (saves 1 HTTP request)
        const polyfillRegex = /<script\s+src="\/_next\/static\/chunks\/polyfills-[^"]+\.js"[^>]*><\/script>/gi;
        if (polyfillRegex.test(html)) {
          html = html.replace(polyfillRegex, '');
          modified = true;
        }

        // 5. Remove redundant preload for webpack runtime script (saves 1 HTTP request)
        const webpackPreloadRegex = /<link\s+rel="preload"\s+as="script"\s+[^>]*href="\/_next\/static\/chunks\/webpack-[^"]+\.js"[^>]*\/?>/gi;
        if (webpackPreloadRegex.test(html)) {
          html = html.replace(webpackPreloadRegex, '');
          modified = true;
        }


        // 7. Deduplicate & streamline favicons to 3 high-impact standards
        const iconRegex = /<link\s+[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*\/?>|<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*\/?>/gi;
        const iconMatches = html.match(iconRegex);
        if (iconMatches && iconMatches.length > 3) {
          html = html.replace(iconRegex, '');
          html = html.replace('<head>', `<head>${streamlinedFavicons}`);
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(fullPath, html, 'utf8');
          processedCount++;
        }
      }
    }
  }

  walk(targetBaseDir);
  console.log(`[perf] Optimized ${processedCount} HTML files in ${targetBaseDir} (Eliminated render-blocking CSS & bundled runtime).`);
}

try {
  optimizeHtmlDirectory(outDir);
  optimizeHtmlDirectory(distDir);
} catch (perfErr) {
  console.warn('[perf] Note during optimization:', perfErr.message);
}

console.log('[deploy] Synced out/ → dist/ for Cloudflare/Netlify publish compatibility.');
