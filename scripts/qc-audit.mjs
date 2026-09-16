import fs from 'node:fs';

const BASE_URL = 'https://sellsolar.pk';

const STATIC_ROUTES = [
  '/',
  '/prices',
  '/today-prices',
  '/calculator',
  '/load-calculator',
  '/dealers',
  '/install',
  '/installation',
  '/request-installation',
  '/login',
  '/post-ad',
  '/dashboard',
  '/admin',
  '/admin-dashboard',
  '/password',
  '/forgot-password',
  '/reset-password',
  '/change-password',
  '/about',
  '/about-us',
  '/careers',
  '/press',
  '/blog',
  '/buy-solar',
  '/sell-solar',
  '/used-solar',
  '/solar-price',
  '/solar-inverter',
  '/solar-batteries',
  '/solar-panels',
  '/how-it-works',
  '/pricing',
  '/help',
  '/help-center',
  '/contact',
  '/contact-us',
  '/safety',
  '/safety-tips',
  '/report-issue',
  '/report',
  '/terms',
  '/terms-of-service',
  '/privacy',
  '/privacy-policy',
  '/cookies',
  '/cookie-policy',
  '/disclaimer',
];

const STATIC_ASSETS = [
  '/robots.txt',
  '/sitemap.xml',
  '/site.webmanifest',
  '/og-image.jpg',
  '/favicon.ico',
  '/favicon.svg',
];

async function checkUrl(path) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'SellSolar-QC-Bot/1.0' }
    });
    const duration = Date.now() - start;
    const contentType = res.headers.get('content-type') || '';
    const location = res.headers.get('location') || '';
    
    let body = '';
    if (res.status === 200 && contentType.includes('text/html')) {
      body = await res.text();
    }

    const titleMatch = body.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    const hasJsonLd = body.includes('application/ld+json');

    // Extract all href links in page
    const hrefMatches = [...body.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);

    return {
      path,
      status: res.status,
      duration,
      contentType,
      location,
      title,
      hasJsonLd,
      hrefs: hrefMatches,
      bodyLength: body.length,
      ok: res.status >= 200 && res.status < 400
    };
  } catch (err) {
    return {
      path,
      status: 0,
      duration: Date.now() - start,
      error: err.message,
      ok: false
    };
  }
}

async function runQC() {
  console.log('🚀 Starting Comprehensive QC Audit on', BASE_URL);
  console.log('====================================================\n');

  const results = [];
  const discoveredHrefs = new Set();

  // 1. Audit Static Routes
  console.log('🔍 [1/4] Auditing all application routes...');
  for (const route of STATIC_ROUTES) {
    const res = await checkUrl(route);
    results.push(res);
    if (res.hrefs) {
      for (const h of res.hrefs) {
        if (h.startsWith('/') && !h.startsWith('//')) {
          discoveredHrefs.add(h.split('#')[0]);
        }
      }
    }
    const icon = res.ok ? '✅' : '❌';
    console.log(`  ${icon} ${res.status} [${res.duration}ms] ${route} -> ${res.title ? res.title.slice(0, 45) + '...' : (res.location || res.contentType)}`);
  }

  // 2. Audit Key Static Assets
  console.log('\n🔍 [2/4] Auditing core assets...');
  for (const asset of STATIC_ASSETS) {
    const res = await checkUrl(asset);
    results.push(res);
    const icon = res.ok ? '✅' : '❌';
    console.log(`  ${icon} ${res.status} [${res.duration}ms] ${asset} (${res.contentType})`);
  }

  // 3. Audit all discovered internal hrefs (links & button destinations)
  console.log('\n🔍 [3/4] Verifying all internal href targets from buttons and navigation...');
  const internalHrefs = [...discoveredHrefs].filter(h => !STATIC_ROUTES.includes(h) && !STATIC_ASSETS.includes(h) && h !== '');
  console.log(`Found ${internalHrefs.length} additional unique internal links to verify...`);

  for (const href of internalHrefs) {
    const res = await checkUrl(href);
    results.push(res);
    const icon = res.ok ? '✅' : '❌';
    console.log(`  ${icon} ${res.status} [${res.duration}ms] ${href}`);
  }

  // 4. Summary & Report
  console.log('\n====================================================');
  console.log('📊 QC Audit Summary Report:');
  const total = results.length;
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log(`Total URLs Audited: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed URLs:');
    for (const f of results.filter(r => !r.ok)) {
      console.log(`  - ${f.path} (Status: ${f.status}, Error: ${f.error || 'Non-200/300 status'})`);
    }
  } else {
    console.log('\n🎉 ALL ROUTES, BUTTON LINKS, REDIRECTS, AND ASSETS PASSED QC VERIFICATION WITH ZERO 404s!');
  }

  // Write detailed report to JSON
  fs.writeFileSync('public/qc-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    total,
    passed,
    failed,
    results: results.map(r => ({
      path: r.path,
      status: r.status,
      duration: r.duration,
      title: r.title,
      hasJsonLd: r.hasJsonLd,
      location: r.location,
      ok: r.ok,
      error: r.error
    }))
  }, null, 2));

  console.log('\nFull QC report saved to public/qc-report.json');
}

runQC();
