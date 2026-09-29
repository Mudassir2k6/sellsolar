import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('=== SellSolar Link & Route Audit ===');

// 1. Read sitemap.xml
const sitemapContent = fs.readFileSync(path.join(rootDir, 'public', 'sitemap.xml'), 'utf8');
const sitemapUrls = [];
const locRegex = /<loc>https:\/\/sellsolar\.pk([^<]*)<\/loc>/g;
let match;
while ((match = locRegex.exec(sitemapContent)) !== null) {
  let p = match[1] || '/';
  if (!p.startsWith('/')) p = '/' + p;
  sitemapUrls.push(p);
}
console.log(`Found ${sitemapUrls.length} URLs in sitemap.xml.`);

// 2. Read STATIC_SLUGS from app/[[...slug]]/page.jsx
const appCatchAll = fs.readFileSync(path.join(rootDir, 'app', '[[...slug]]', 'page.jsx'), 'utf8');
const slugMatches = appCatchAll.match(/\['([^']+)'\]/g) || [];
const staticPaths = ['/'];
slugMatches.forEach((m) => {
  const clean = m.replace(/[\['\]]/g, '');
  staticPaths.push('/' + clean);
});
console.log(`Found ${staticPaths.length} static slug paths in app/[[...slug]]/page.jsx.`);

// 3. Compare sitemap URLs with staticPaths
const missingInStatic = [];
for (const url of sitemapUrls) {
  const norm = url === '/' ? '/' : url.replace(/\/+$/, '');
  if (!staticPaths.includes(norm)) {
    missingInStatic.push(norm);
  }
}

if (missingInStatic.length > 0) {
  console.warn('⚠️  Sitemap URLs missing from static export STATIC_SLUGS:', missingInStatic);
} else {
  console.log('✅ All sitemap.xml URLs exist in STATIC_SLUGS!');
}

// 4. Scan src directory for all onNavigate and href links
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next' && file !== 'dist' && file !== 'out') {
        scanDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allSrcFiles = scanDirectory(path.join(rootDir, 'src')).concat(scanDirectory(path.join(rootDir, 'app')));
console.log(`Scanning ${allSrcFiles.length} source code files for navigation calls & hrefs...`);

const onNavTargets = new Set();
const hrefTargets = new Set();

const onNavRegex = /onNavigate\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
const navCallRegex = /handleNavigate\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
const hrefRegex = /href\s*=\s*['"](\/[^'"#?]*|https?:\/\/[^'"]+)['"]/g;

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = onNavRegex.exec(content)) !== null) {
    onNavTargets.add({ target: m[1], file: path.relative(rootDir, file) });
  }
  while ((m = navCallRegex.exec(content)) !== null) {
    onNavTargets.add({ target: m[1], file: path.relative(rootDir, file) });
  }
  while ((m = hrefRegex.exec(content)) !== null) {
    hrefTargets.add({ target: m[1], file: path.relative(rootDir, file) });
  }
}

console.log(`Found ${onNavTargets.size} unique onNavigate destinations.`);
console.log(`Found ${hrefTargets.size} unique href destinations.`);

// Validate onNavigate targets
const knownPageKeys = [
  'home', 'prices', 'calculator', 'verification', 'dealers', 'install',
  'login', 'post-ad', 'dashboard', 'admin', 'admin-dashboard', 'inbox',
  'password', 'forgot-password', 'reset-password', 'change-password',
  'about', 'careers', 'press', 'blog', 'buy-solar', 'sell-solar',
  'used-solar', 'solar-price', 'solar-inverter', 'solar-batteries',
  'solar-panels', 'solar-plates', 'solar-plate', 'how-it-works',
  'pricing', 'help', 'contact', 'safety', 'report-issue', 'report',
  'terms', 'privacy', 'cookies', 'disclaimer', 'listing-detail', 'today-prices',
  'solar-plates-price', 'load-calculator', 'tier-1-verification'
];

const unknownNavTargets = [];
for (const item of onNavTargets) {
  if (item.target.startsWith('custom:') || item.target.startsWith('/')) continue;
  if (!knownPageKeys.includes(item.target)) {
    unknownNavTargets.push(item);
  }
}

if (unknownNavTargets.length > 0) {
  console.warn('⚠️ Unknown onNavigate targets found:', unknownNavTargets);
} else {
  console.log('✅ All onNavigate destinations map to recognized pages!');
}

// Validate internal href targets
const internalHrefs = [...hrefTargets].filter((h) => h.target.startsWith('/'));
const brokenHrefs = [];
for (const h of internalHrefs) {
  const p = h.target === '/' ? '/' : h.target.replace(/\/+$/, '');
  // check if matches any static path or starts with /listing/ or /auth/
  const isValid =
    staticPaths.includes(p) ||
    p.startsWith('/listing/') ||
    p.startsWith('/auth/') ||
    p === '/404' ||
    p.startsWith('/images/') ||
    p.startsWith('/icons/') ||
    p.endsWith('.xml') ||
    p.endsWith('.txt') ||
    p.endsWith('.json') ||
    p.endsWith('.png') ||
    p.endsWith('.jpg') ||
    p.endsWith('.svg') ||
    p.endsWith('.ico');

  if (!isValid) {
    brokenHrefs.push(h);
  }
}

if (brokenHrefs.length > 0) {
  console.warn('⚠️ Potential broken internal hrefs:', brokenHrefs);
} else {
  console.log('✅ All internal href links are valid and map to existing routes or static assets!');
}

console.log('=== Audit Complete ===');
