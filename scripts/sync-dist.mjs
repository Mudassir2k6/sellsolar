import fs from 'fs';
import path from 'path';

const root = process.cwd();
const outDir = path.join(root, 'out');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(outDir)) {
  console.error('[deploy] Missing out/ — run next build first.');
  process.exit(1);
}

// Cache and preserve previous chunks to prevent ChunkLoadError (404) for active tabs
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

// Restore previous chunks that are not overwritten by new build
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

// Explicitly ensure ALL public assets (favicons, manifests, headers, redirects) overwrite out/ and dist/
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

// Ensure auth/callback works with both trailing and non-trailing slash
const authCallbackHtml = path.join(distDir, 'auth', 'callback.html');
const authCallbackDir = path.join(distDir, 'auth', 'callback');
if (fs.existsSync(authCallbackHtml)) {
  fs.mkdirSync(authCallbackDir, { recursive: true });
  fs.copyFileSync(authCallbackHtml, path.join(authCallbackDir, 'index.html'));
}

// ============================================================================
// PERFORMANCE & SEO OPTIMIZATION: Eliminate Render-Blocking Resources & Universal Favicons
// ============================================================================
function optimizeHtmlDirectory(targetBaseDir) {
  if (!fs.existsSync(targetBaseDir)) return;

  const mediaDir = path.join(targetBaseDir, '_next', 'static', 'media');
  let primaryFontFile = null;
  if (fs.existsSync(mediaDir)) {
    const mediaFiles = fs.readdirSync(mediaDir);
    primaryFontFile = mediaFiles.find((f) => f.includes('.p.woff2')) || mediaFiles.find((f) => f.endsWith('.woff2'));
  }

  const cssDir = path.join(targetBaseDir, '_next', 'static', 'css');
  let fontCssFile = null;
  let fontCssContent = '';

  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    for (const f of cssFiles) {
      const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
      if (content.includes('@font-face') && content.length < 10000) {
        fontCssFile = f;
        fontCssContent = content;
      }
    }
  }

  const completeFaviconTags = [
    '<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any"/>',
    '<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico"/>',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>',
  ].join('');

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

        // 2. Inline small font CSS to eliminate render-blocking external stylesheet request
        if (fontCssFile && fontCssContent) {
          const fontLinkRegex = new RegExp(`<link[^>]*href=["']/_next/static/css/${fontCssFile}["'][^>]*>`, 'i');
          if (fontLinkRegex.test(html)) {
            const inlinedStyle = `<style data-font="plus-jakarta">${fontCssContent}</style>`;
            html = html.replace(fontLinkRegex, inlinedStyle);
            modified = true;
          }
        }

        // 3. Convert all render-blocking stylesheets to high-priority asynchronous preload (media="print" onload="this.media='all'")
        // Eliminates Render-Blocking Resources warning on Google PageSpeed & SEO Site Checkup
        const blockingCssRegex = /<link\s+rel="stylesheet"\s+href="(\/_next\/static\/css\/[^"]+\.css)"\s+data-precedence="next"\s*\/?>/gi;
        if (blockingCssRegex.test(html)) {
          html = html.replace(blockingCssRegex, (match, href) => {
            return `<link rel="preload" href="${href}" as="style" fetchpriority="high"/><link rel="stylesheet" href="${href}" media="print" onload="this.media='all'"/><noscript><link rel="stylesheet" href="${href}"/></noscript>`;
          });
          modified = true;
        }

        // 4. Ensure complete, audit-compliant favicon and apple-touch-icon references in <head>
        const faviconPattern = /<link\s+rel="icon"\s+href="\/favicon\.ico"\s*\/?>/i;
        if (faviconPattern.test(html)) {
          html = html.replace(faviconPattern, completeFaviconTags);
          modified = true;
        } else if (!html.includes('rel="icon"') && html.includes('<head>')) {
          html = html.replace('<head>', `<head>${completeFaviconTags}`);
          modified = true;
        }

        const appleTouchPattern = /<link\s+rel="apple-touch-icon"\s+href="\/apple-touch-icon\.png"\s*\/?>/i;
        if (appleTouchPattern.test(html)) {
          html = html.replace(appleTouchPattern, '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(fullPath, html, 'utf8');
        }
      }
    }
  }

  walk(targetBaseDir);
}

try {
  optimizeHtmlDirectory(outDir);
  optimizeHtmlDirectory(distDir);
  console.log('[perf] Optimized HTML files: Inlined font CSS, preloaded WOFF2 font & universal favicon links.');
} catch (perfErr) {
  console.warn('[perf] Note during HTML optimization:', perfErr.message);
}

console.log('[deploy] Synced out/ → dist/ for Cloudflare/Netlify publish compatibility.');
