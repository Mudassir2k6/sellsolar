const pages = ['/', '/prices', '/calculator', '/dealers', '/install', '/contact', '/about', '/blog', '/help', '/solar-price', '/solar-panels', '/solar-inverter', '/solar-batteries'];

async function checkSeo(path) {
  const url = 'https://sellsolar.pk' + path;
  const res = await fetch(url, { headers: {'User-Agent':'Googlebot/2.1'} });
  const html = await res.text();
  
  const title = (html.match(/<title>([^<]*)<\/title>/) || ['',''])[1] || 'MISSING';
  const descMatch = html.match(/name="description"[^>]+content="([^"]*)"/);
  const desc = descMatch ? descMatch[1] : 'MISSING';
  const canonicalMatch = html.match(/rel="canonical"[^>]+href="([^"]*)"/);
  const canonical = canonicalMatch ? canonicalMatch[1] : 'MISSING';
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim() : 'MISSING';
  const jsonLd = html.includes('application/ld+json');
  const og = html.includes('og:title');
  const tw = html.includes('twitter:card');
  
  const issues = [];
  if (title === 'MISSING') issues.push('Missing title');
  if (title.length > 60) issues.push('Title ' + title.length + 'chars > 60');
  if (desc === 'MISSING') issues.push('Missing meta description');
  if (desc !== 'MISSING' && desc.length > 160) issues.push('Desc ' + desc.length + 'chars > 160');
  if (canonical === 'MISSING') issues.push('Missing canonical');
  if (h1 === 'MISSING') issues.push('Missing H1');
  if (!jsonLd) issues.push('Missing JSON-LD schema');
  if (!og) issues.push('Missing OG tags');
  if (!tw) issues.push('Missing Twitter card');
  
  const status = issues.length === 0 ? '✅' : '⚠️';
  console.log(status + ' ' + path);
  console.log('   Title(' + title.length + '): ' + title.slice(0,58));
  if (desc !== 'MISSING') console.log('   Desc(' + desc.length + 'chars)');
  else console.log('   Desc: MISSING');
  console.log('   Canonical: ' + canonical);
  console.log('   H1: ' + h1.slice(0,60));
  console.log('   JSON-LD:' + (jsonLd?'YES':'NO') + ' | OG:' + (og?'YES':'NO') + ' | Twitter:' + (tw?'YES':'NO'));
  if (issues.length) console.log('   ISSUES: ' + issues.join(' | '));
  console.log('');
}

(async function() {
  console.log('=== SellSolar.pk Full SEO Audit ===\n');
  for (const p of pages) {
    await checkSeo(p);
  }
  console.log('=== DONE ===');
})();
