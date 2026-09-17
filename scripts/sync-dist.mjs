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

// ============================================================================
// PERFORMANCE OPTIMIZATION: Eliminate Render-Blocking Resources & Accelerate LCP
// ============================================================================
function optimizeHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Locate media and css assets
  const mediaDir = path.join(distDir, '_next', 'static', 'media');
  let primaryFontFile = null;
  if (fs.existsSync(mediaDir)) {
    const mediaFiles = fs.readdirSync(mediaDir);
    // Find Next.js primary font subset (.p.woff2)
    primaryFontFile = mediaFiles.find((f) => f.includes('.p.woff2')) || mediaFiles.find((f) => f.endsWith('.woff2'));
  }

  const cssDir = path.join(distDir, '_next', 'static', 'css');
  let fontCssFile = null;
  let fontCssContent = '';
  let mainCssFile = null;

  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    for (const f of cssFiles) {
      const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
      if (content.includes('@font-face') && content.length < 10000) {
        fontCssFile = f;
        fontCssContent = content;
      } else if (content.length > 20000) {
        mainCssFile = f;
      }
    }
  }

  function processDirectory(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.html')) {
        let html = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // 1. Preload primary font subset to accelerate LCP
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

        // 3. Preload main stylesheet with fetchpriority="high" for immediate critical styling
        if (mainCssFile && !html.includes(`rel="preload" as="style" href="/_next/static/css/${mainCssFile}"`)) {
          const cssPreloadTag = `<link rel="preload" as="style" href="/_next/static/css/${mainCssFile}" fetchpriority="high"/>`;
          html = html.replace('<head>', `<head>${cssPreloadTag}`);
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(fullPath, html, 'utf8');
        }
      }
    }
  }

  processDirectory(dir);
}

try {
  optimizeHtmlFiles(distDir);
  console.log('[perf] Optimized HTML files: Inlined font CSS, preloaded primary WOFF2 font & high-priority stylesheet.');
} catch (perfErr) {
  console.warn('[perf] Note during HTML optimization:', perfErr.message);
}

console.log('[deploy] Synced out/ → dist/ for Cloudflare/Netlify publish compatibility.');
